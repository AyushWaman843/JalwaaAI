import { Salon, SearchFilters, ApifyUsage, Service } from '../types';
import { MUMBAI_SALONS_SEED } from '../data/mumbaiSalons';

const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const MONTHLY_LIMIT = 1000;

// Helper to get current month string
const getCurrentMonthKey = () => {
  const d = new Date();
  return `apify_usage_${d.getFullYear()}_${d.getMonth() + 1}`;
};

// Check and update usage limits
export const getApifyUsage = (): ApifyUsage => {
  const monthKey = getCurrentMonthKey();
  const resetDate = new Date();
  resetDate.setMonth(resetDate.getMonth() + 1);
  resetDate.setDate(1);
  resetDate.setHours(0, 0, 0, 0);

  const used = localStorage.getItem(monthKey);
  const callsUsed = used ? parseInt(used, 10) : 0;

  return {
    callsUsed,
    callsLimit: MONTHLY_LIMIT,
    resetDate: resetDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  };
};

const incrementApifyUsage = () => {
  const monthKey = getCurrentMonthKey();
  const current = getApifyUsage();
  localStorage.setItem(monthKey, (current.callsUsed + 1).toString());
};

// Helper to attach premium realistic services to new salons
export const generateDefaultServices = (salonName: string): Service[] => {
  const isPremium = salonName.toLowerCase().includes('luxury') || salonName.toLowerCase().includes('biguine') || salonName.toLowerCase().includes('truefitt');
  const multiplier = isPremium ? 1.8 : 1.0;

  return [
    { id: `s_h1_${Math.random()}`, name: "Signature Haircut & Style Wash", price: Math.round(600 * multiplier), duration: 40, category: "hair" },
    { id: `s_h2_${Math.random()}`, name: "Advanced Keratin Care Therapy", price: Math.round(3500 * multiplier), duration: 120, category: "hair" },
    { id: `s_s1_${Math.random()}`, name: "Insta-Glow Collagen Facial", price: Math.round(1800 * multiplier), duration: 60, category: "skin" },
    { id: `s_n1_${Math.random()}`, name: "Luxury Gel Mani-Pedi Ritual", price: Math.round(1200 * multiplier), duration: 75, category: "nails" },
    { id: `s_m1_${Math.random()}`, name: "Red-Carpet Glam Makeup", price: Math.round(4500 * multiplier), duration: 90, category: "makeup" },
    { id: `s_ms1_${Math.random()}`, name: "Stress Relief Head & Shoulder Therapy", price: Math.round(1000 * multiplier), duration: 30, category: "massage" }
  ];
};

export const apifyService = {
  searchSalons: async (filters: SearchFilters): Promise<Salon[]> => {
    const queryKey = `apify_cache_${JSON.stringify(filters)}`;
    const cached = localStorage.getItem(queryKey);

    // 1. Check local Cache first (30-day TTL)
    if (cached) {
      try {
        const { timestamp, data } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL_MS) {
          console.log("Serving search results from local 30-day TTL cache.", data);
          return data;
        }
      } catch (e) {
        localStorage.removeItem(queryKey);
      }
    }

    // Check usage limits
    const usage = getApifyUsage();
    if (usage.callsUsed >= usage.callsLimit) {
      console.warn("Apify usage limit reached. Falling back to mock database search.");
      return apifyService.searchMockSalons(filters);
    }

    try {
      // Call Express Proxy to execute Apify
      const response = await fetch('/api/apify/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `salons in ${filters.location || "Mumbai"}`,
          limit: filters.maxResults || 10
        })
      });

      if (!response.ok) {
        throw new Error("Proxy request complete with status: " + response.status);
      }

      const resData = await response.json();
      
      let finalSalons: Salon[] = [];

      if (resData.source === 'apify' && Array.isArray(resData.data)) {
        incrementApifyUsage();
        
        // Map Apify Google Maps items to Salon type
        finalSalons = resData.data.map((item: any, idx: number) => {
          const hoursMap: Record<string, string> = {};
          if (Array.isArray(item.openingHours)) {
            item.openingHours.forEach((h: any) => {
              if (h.day && h.hours) {
                hoursMap[h.day] = h.hours;
              }
            });
          }

          const fallbackPhotos = [
            "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1521590832167-7bcbfea63334?auto=format&fit=crop&q=80&w=600",
            "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600"
          ];

          const mapped: Salon = {
            id: item.placeId || `apify_${Math.random().toString(36).substring(2, 9)}`,
            placeId: item.placeId || '',
            name: item.title || 'Elite Salon',
            address: item.address || 'Mumbai, Maharashtra',
            rating: typeof item.totalScore === 'number' ? item.totalScore : 4.2,
            reviewsCount: typeof item.reviewsCount === 'number' ? item.reviewsCount : Math.floor(Math.random() * 150) + 10,
            phone: item.phone || '+91 99999 88888',
            photos: Array.isArray(item.imageUrls) && item.imageUrls.length > 0 ? item.imageUrls : [item.imageUrl || fallbackPhotos[idx % fallbackPhotos.length]],
            hours: Object.keys(hoursMap).length > 0 ? hoursMap : { "Monday - Sunday": "10:00 AM - 08:30 PM" },
            isClaimed: Math.random() > 0.5, // Randomized unclaimed status
            distance: `${(Math.random() * 4 + 0.5).toFixed(1)} km`,
            priceRange: Math.random() > 0.6 ? '₹₹₹' : Math.random() > 0.3 ? '₹₹' : '₹',
            services: generateDefaultServices(item.title || ''),
            featuredServices: ["Haircut", "Facial Glow", "Nail Therapy"]
          };
          return mapped;
        });

        // Store in cache
        localStorage.setItem(queryKey, JSON.stringify({
          timestamp: Date.now(),
          data: finalSalons
        }));

        return finalSalons;
      } else {
        // Falling back if proxy returned mock source or empty
        return apifyService.searchMockSalons(filters);
      }
    } catch (e) {
      console.log("Apify search redirect, serving offline mock data.", e);
      return apifyService.searchMockSalons(filters);
    }
  },

  searchMockSalons: (filters: SearchFilters): Salon[] => {
    let filtered = [...MUMBAI_SALONS_SEED];

    // Filter by location query (simple substring)
    if (filters.location && 
        filters.location.trim() !== '' && 
        filters.location.toLowerCase() !== 'mumbai') {
      const loc = filters.location.toLowerCase().trim();
      filtered = filtered.filter(s => 
        s.address.toLowerCase().includes(loc) || 
        s.name.toLowerCase().includes(loc)
      );
    }

    // Filter by services
    if (filters.services && filters.services.length > 0) {
      filtered = filtered.filter(s => 
        s.services.some(srv => filters.services!.includes(srv.category))
      );
    }

    // Filter by rating
    if (filters.minRating) {
      filtered = filtered.filter(s => s.rating >= filters.minRating!);
    }

    // Simple sorting or matching
    return filtered.slice(0, filters.maxResults || 10);
  },

  getSalonById: async (id: string): Promise<Salon | null> => {
    // Check our cache database and updates list first
    const localEdits = JSON.parse(localStorage.getItem(`salon_updates_${id}`) || 'null');
    
    // Check locally saved cache
    const caches = Object.keys(localStorage).filter(k => k.startsWith('apify_cache_'));
    for (const key of caches) {
      try {
        const parsed = JSON.parse(localStorage.getItem(key) || '');
        const found = parsed.data?.find((s: Salon) => s.id === id);
        if (found) {
          return localEdits ? { ...found, ...localEdits } : found;
        }
      } catch {}
    }

    // Check seed data
    const seedFound = MUMBAI_SALONS_SEED.find(s => s.id === id);
    if (seedFound) {
      return localEdits ? { ...seedFound, ...localEdits } : seedFound;
    }

    return null;
  }
};
