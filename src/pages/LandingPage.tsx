import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { dbService } from '../services/dbService';
import { Salon } from '../types';
import { SalonCard } from '../components/SalonCard';
import { Search, Sparkles, Compass, ShieldCheck, Zap, UserCheck, Calendar } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState<string>('');
  const [serviceCategory, setServiceCategory] = useState<string>('');
  const [trendingSalons, setTrendingSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load trending salons (first 4 items from Mumbai seed database)
    const loadTrending = async () => {
      try {
        const data = await dbService.fetchSalons({ location: 'Mumbai', maxResults: 4 });
        setTrendingSalons(data);
      } catch (err) {
        console.error("Failed to load trending salons:", err);
      } finally {
        setLoading(false);
      }
    };
    loadTrending();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/salons?location=${encodeURIComponent(location)}&category=${encodeURIComponent(serviceCategory)}`);
  };

  const categories = [
    { id: 'hair', name: 'Hair styling', img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=400', count: '120+ Salons' },
    { id: 'skin', name: 'Skin Care', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400', count: '85+ Salons' },
    { id: 'nails', name: 'Nail Artistry', img: 'https://images.unsplash.com/photo-1604654894610-df4906b197ae?auto=format&fit=crop&q=80&w=400', count: '45+ Salons' },
    { id: 'makeup', name: 'Bridal & Makeup', img: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=400', count: '60+ Salons' },
    { id: 'massage', name: 'Therapeutic Massage', img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=400', count: '30+ Salons' },
    { id: 'bridal', name: 'Pre-Bridal Packages', img: 'https://images.unsplash.com/photo-1595853035070-59a39fe84de3?auto=format&fit=crop&q=80&w=400', count: '50+ Salons' }
  ];

  const valueProps = [
    {
      icon: <Compass className="w-6 h-6 text-[#D6531F]" />,
      title: "Real Google Maps Data",
      desc: "Instant discovery fueled by actual live Google Maps reviews, ratings, and physical locations in Mumbai."
    },
    {
      icon: <Sparkles className="w-6 h-6 text-[#D6531F]" />,
      title: "Groq AI Recommendations",
      desc: "Get personalized, instant style consultations and salon matching based on your look and facial geometry."
    },
    {
      icon: <Calendar className="w-6 h-6 text-[#D6531F]" />,
      title: "Dynamic Smart Queues",
      desc: "Reserve slots, track live wait times, and check-in smoothly with our unique secure QR Code passes."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#D6531F]" />,
      title: "Verified Partnerships",
      desc: "Claimed salons are completely vetted by Jalwaa AI, offering premium service guarantees and active OTP support."
    }
  ];

  return (
    <div className="bg-[#F4F5ED] min-h-screen text-[#222017]" id="landing-page">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-burgundy via-burgundy/95 to-charcoal text-[#F4F5ED] py-20 px-6 md:px-12 flex flex-col items-center justify-center overflow-hidden">
        
        {/* Visual accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D6531F] opacity-10 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#F7B32B] opacity-10 blur-3xl rounded-full" />

        <div className="max-w-4xl text-center space-y-6 z-10">
          <div className="inline-flex items-center space-x-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-[#F7B32B] uppercase tracking-wider font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Beauty Discovery</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1] max-w-3xl mx-auto">
            Discover Mumbai's <span className="text-[#F7B32B]">Premier</span> Salons & Spa Lounges
          </h1>
          
          <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
            Real Google Maps integrations, interactive AI style consultations, and secure QR queue management. Tailored exclusively for elite aesthetic seekers in Mumbai.
          </p>

          {/* Search bar widget */}
          <form 
            onSubmit={handleSearchSubmit}
            className="bg-white p-2.5 rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-stretch gap-2 max-w-3xl mx-auto mt-8 border border-white/15"
          >
            <div className="flex-1 flex items-center space-x-2 px-4 py-2 border-b md:border-b-0 md:border-r border-slate-100">
              <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Where in Mumbai? (e.g. Bandra West)"
                className="w-full bg-transparent text-sm text-charcoal outline-none placeholder-slate-400 font-medium"
              />
            </div>

            <div className="flex-1 flex items-center space-x-2 px-4 py-2">
              <input
                type="text"
                value={serviceCategory}
                onChange={(e) => setServiceCategory(e.target.value)}
                placeholder="Service or Style (e.g. Balayage)"
                className="w-full bg-transparent text-sm text-charcoal outline-none placeholder-slate-400 font-medium"
              />
            </div>

            <button
              type="submit"
              className="bg-[#D6531F] hover:bg-opacity-95 text-[#F4F5ED] font-bold text-sm px-6 py-3 rounded-xl md:rounded-full transition-all flex items-center justify-center space-x-2 shadow-lg shadow-[#D6531F]/25"
            >
              <span>Find Salons</span>
            </button>
          </form>

        </div>
      </section>

      {/* Service categories grid */}
      <section className="max-w-7xl mx-auto py-16 px-6 md:px-12 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Luxury Treatment Categories</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Choose your signature treatment level and connect with specialized stylists who elevate your presence.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/salons?category=${cat.id}`}
              className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-[#D6531F]/30 transition-all group flex flex-col items-center text-center p-3"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border border-slate-100">
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" referrerPolicy="no-referrer" />
              </div>
              <h3 className="font-bold text-xs text-charcoal group-hover:text-[#D6531F] transition-colors">{cat.name}</h3>
              <span className="text-[10px] text-slate-400 font-mono mt-1">{cat.count}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Groq AI style expert Promo Banner */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-16">
        <div className="bg-gradient-to-r from-burgundy to-charcoal rounded-3xl p-8 md:p-12 text-[#F4F5ED] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#D6531F] opacity-15 blur-3xl rounded-full" />
          
          <div className="space-y-4 max-w-xl z-10 text-center md:text-left">
            <span className="bg-[#F7B32B]/10 text-[#F7B32B] font-mono text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md">
              AI-Powered Style advisor
            </span>
            <h3 className="text-2xl md:text-3.5xl font-black tracking-tight leading-none">
              Not Sure What Look Suits You Best?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Consult our advanced Groq AI model (llama-3.3-70b). Upload a selfie or describe your hair type and skin tone, and receive direct personalized cuts, facial treatments, and the exact Mumbai salons to deliver them.
            </p>
          </div>

          <Link
            to="/ai-recommendations"
            className="bg-[#F7B32B] hover:bg-opacity-95 text-charcoal font-bold px-6 py-3.5 rounded-xl text-xs flex items-center space-x-2 transition-all flex-shrink-0 shadow-lg shadow-[#F7B32B]/15 z-10"
          >
            <Sparkles className="w-4 h-4 text-charcoal" />
            <span>Consult Style Muse</span>
          </Link>
        </div>
      </section>

      {/* Trending Salons list */}
      <section className="max-w-7xl mx-auto py-12 px-6 md:px-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="text-2.5xl font-bold tracking-tight">Trending Salons in Mumbai</h2>
            <p className="text-xs text-slate-500">
              Popular hotspots with verified service structures and highest customer ratings.
            </p>
          </div>
          <Link
            to="/salons"
            className="text-xs text-[#D6531F] font-bold hover:underline flex items-center space-x-1"
          >
            <span>View all Mumbai salons</span>
            <span>→</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white border border-slate-100 rounded-2xl p-4 h-72 animate-pulse space-y-4">
                <div className="aspect-[4/3] bg-slate-100 rounded-xl" />
                <div className="h-4 bg-slate-100 rounded w-2/3" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingSalons.map((salon) => (
              <SalonCard key={salon.id} salon={salon} />
            ))}
          </div>
        )}
      </section>

      {/* Why Jalwaa section */}
      <section className="bg-white py-16 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2.5xl font-bold tracking-tight">Why Book Through Jalwaa AI?</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              We redefine the grooming booking standard by merging convenience, verification, and AI technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {valueProps.map((prop, i) => (
              <div key={i} className="space-y-3 p-4 hover:bg-[#F4F5ED]/30 rounded-2xl transition-all">
                <div className="p-3 bg-[#D6531F]/10 rounded-xl w-fit">
                  {prop.icon}
                </div>
                <h3 className="font-bold text-sm text-charcoal">{prop.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{prop.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};
