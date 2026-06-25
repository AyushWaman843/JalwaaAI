import { Booking, Salon, SearchFilters } from '../types';
import { supabase } from '../context/AuthContext';
import { apifyService } from './apifyService';
import { MUMBAI_SALONS_SEED } from '../data/mumbaiSalons';

// Local storage key for offline bookings
const BOOKINGS_KEY = 'jalwaa_local_bookings';

const getLocalBookings = (): Booking[] => {
  const data = localStorage.getItem(BOOKINGS_KEY);
  if (data) {
    try { return JSON.parse(data); } catch { return []; }
  }
  return [];
};

const saveLocalBookings = (bookings: Booking[]) => {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
};

export const dbService = {
  // Fetch salons (Apify first, fallback to seed)
  fetchSalons: async (filters: SearchFilters): Promise<Salon[]> => {
    return await apifyService.searchSalons(filters);
  },

  // Create booking
  createBooking: async (
    data: Omit<Booking, 'id' | 'createdAt' | 'status' | 'qrCode' | 'queueNumber'>
  ): Promise<Booking> => {
    const bookingId = `bk_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=222017&data=${encodeURIComponent(bookingId)}`;
    
    // Calculate live queue number for the day
    const localBookings = getLocalBookings();
    const sameDaySalonBookings = localBookings.filter(b => b.salonId === data.salonId && b.date === data.date);
    const queueNumber = sameDaySalonBookings.length + 1;

    const newBooking: Booking = {
      ...data,
      id: bookingId,
      status: 'pending',
      qrCode: qrCodeUrl,
      queueNumber,
      createdAt: new Date().toISOString()
    };

    // 1. Try Supabase
    if (supabase) {
      try {
        const { data: dbData, error } = await supabase
          .from('bookings')
          .insert([{
            id: bookingId,
            user_id: data.userId,
            salon_id: data.salonId,
            service: data.service,
            date: data.date,
            time: data.time,
            status: 'pending',
            price: data.price,
            qr_code: qrCodeUrl
          }])
          .select();

        if (error) throw error;
        console.log("Successfully recorded booking in Supabase:", dbData);
      } catch (err: any) {
        console.warn("Supabase booking insert failed, saving locally:", err.message);
      }
    }

    // Always keep standard copy in local bookings so that the live preview and queues are robust!
    const allBookings = [newBooking, ...localBookings];
    saveLocalBookings(allBookings);

    return newBooking;
  },

  // Fetch individual user bookings
  fetchUserBookings: async (userId: string): Promise<Booking[]> => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', userId);

        if (error) throw error;
        
        // Map Supabase columns back to camelCase Booking interface
        if (data && data.length > 0) {
          return data.map((b: any) => ({
            id: b.id,
            userId: b.user_id,
            userEmail: b.user_email || 'customer@example.com',
            userName: b.user_name || 'Valued Client',
            userPhone: b.user_phone || '+91 99999 88888',
            salonId: b.salon_id,
            salonName: b.salon_name || 'Mumbai Elite Salon',
            service: b.service,
            date: b.date,
            time: b.time,
            status: b.status,
            price: b.price,
            qrCode: b.qr_code,
            createdAt: b.created_at
          }));
        }
      } catch (err: any) {
        console.warn("Supabase select bookings failed, reading from local bookings:", err.message);
      }
    }

    const localBookings = getLocalBookings();
    return localBookings.filter(b => b.userId === userId);
  },

  // Update booking status (Check-in -> In Service -> Completed)
  updateBookingStatus: async (bookingId: string, status: Booking['status']): Promise<boolean> => {
    let success = false;
    
    // 1. Update Supabase if available
    if (supabase) {
      try {
        const { error } = await supabase
          .from('bookings')
          .update({ status })
          .eq('id', bookingId);

        if (!error) success = true;
      } catch (err: any) {
        console.warn("Supabase update booking failed, fallback to local database update.", err.message);
      }
    }

    // 2. Update localStorage bookings
    const bookings = getLocalBookings();
    const updated = bookings.map(b => b.id === bookingId ? { ...b, status } : b);
    saveLocalBookings(updated);
    
    // If we updated local, count as success
    if (bookings.some(b => b.id === bookingId)) {
      success = true;
    }
    
    return success;
  },

  // Get live salon queue
  fetchLiveQueue: async (salonId: string): Promise<Booking[]> => {
    const todayStr = new Date().toISOString().split('T')[0];
    const bookings = getLocalBookings();
    
    // Get all bookings for this salon today that are NOT complete or cancelled
    return bookings
      .filter(b => b.salonId === salonId && b.date === todayStr && b.status !== 'completed' && b.status !== 'cancelled')
      .sort((a, b) => (a.queueNumber || 0) - (b.queueNumber || 0));
  },

  // Update salon details locally or in Supabase
  updateSalonDetails: async (salonId: string, updates: Partial<Salon>): Promise<void> => {
    // Save locally
    localStorage.setItem(`salon_updates_${salonId}`, JSON.stringify(updates));

    if (supabase) {
      try {
        const { error } = await supabase
          .from('salons')
          .upsert([{
            id: salonId,
            ...updates
          }]);
        if (error) throw error;
      } catch (err: any) {
        console.warn("Supabase salon update failed, details updated locally:", err.message);
      }
    }
  }
};
