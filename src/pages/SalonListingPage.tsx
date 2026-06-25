import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apifyService, getApifyUsage } from '../services/apifyService';
import { Salon, SearchFilters } from '../types';
import { SalonCard } from '../components/SalonCard';
import { Search, SlidersHorizontal, Info, RefreshCw, AlertTriangle } from 'lucide-react';

export const SalonListingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL params initialization
  const initialLocation = searchParams.get('location') || '';
  const initialCategory = searchParams.get('category') || '';

  // Filter States
  const [location, setLocation] = useState<string>(initialLocation);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('rating'); // 'rating' | 'reviews' | 'name'
  
  // Data States
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<any>(null);

  const categories = [
    { id: '', name: 'All Services' },
    { id: 'hair', name: 'Hair' },
    { id: 'skin', name: 'Skin Care' },
    { id: 'nails', name: 'Nails' },
    { id: 'makeup', name: 'Makeup' },
    { id: 'massage', name: 'Massage' }
  ];

  const fetchSalonsData = async () => {
    setLoading(true);
    setError(null);
    setUsage(getApifyUsage());

    const filters: SearchFilters = {
      location: location || 'Mumbai',
      services: selectedCategory ? [selectedCategory] : undefined,
      minRating: minRating > 0 ? minRating : undefined,
      maxResults: 12
    };

    try {
      const results = await apifyService.searchSalons(filters);
      setSalons(results);
    } catch (err: any) {
      console.error(err);
      setError("We encountered an issue connecting to the live salon scraper. Displaying our elite pre-verified Mumbai salons instead.");
      // Fallback local search
      const mockRes = apifyService.searchMockSalons(filters);
      setSalons(mockRes);
    } finally {
      setLoading(false);
    }
  };

  // Sync states from URL search parameters
  useEffect(() => {
    const loc = searchParams.get('location') || '';
    const cat = searchParams.get('category') || '';
    setLocation(loc);
    setSelectedCategory(cat);
  }, [searchParams]);

  // Trigger search when local filters change
  useEffect(() => {
    fetchSalonsData();
  }, [location, selectedCategory, minRating]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ location, category: selectedCategory });
  };

  // Sorting Handler
  const sortedSalons = [...salons].sort((a, b) => {
    if (sortBy === 'rating') {
      return b.rating - a.rating;
    } else if (sortBy === 'reviews') {
      return b.reviewsCount - a.reviewsCount;
    } else {
      return a.name.localeCompare(b.name);
    }
  });

  return (
    <div className="bg-[#F4F5ED] min-h-screen py-10 px-4 md:px-8 text-[#222017]" id="salon-listing-page">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Title and stats heading */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Mumbai Salon Finder</h1>
            <p className="text-xs text-slate-500">
              Live Google Maps ratings and queue registration in your favorite Mumbai hotspots.
            </p>
          </div>
          
          {/* Apify usage info */}
          {usage && (
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 flex items-center space-x-2 text-[11px] text-slate-500 shadow-sm font-mono self-start md:self-auto">
              <Info className="w-4 h-4 text-[#D6531F] flex-shrink-0" />
              <div>
                Scraper: <span className="font-bold text-charcoal">{usage.callsLimit - usage.callsUsed}</span> calls remaining this month. Resets <span className="font-semibold text-[#D6531F]">{usage.resetDate}</span>
              </div>
            </div>
          )}
        </div>

        {/* Big Search Form Widget */}
        <form 
          onSubmit={handleSearchSubmit}
          className="bg-white rounded-2xl border border-slate-100 p-4 shadow-md flex flex-col md:flex-row items-stretch gap-4"
        >
          <div className="flex-1 flex items-center space-x-2 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
            <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter neighborhood (e.g. Bandra, Juhu, Andheri)"
              className="w-full bg-transparent text-sm text-charcoal outline-none placeholder-slate-400 font-medium"
            />
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold text-slate-500 flex items-center space-x-1 flex-shrink-0">
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <span>Filters</span>
            </span>

            {/* Rating Filter dropdown */}
            <select
              value={minRating}
              onChange={(e) => setMinRating(parseFloat(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-700 font-semibold outline-none focus:border-[#D6531F] transition-colors cursor-pointer"
            >
              <option value="0">Any Rating</option>
              <option value="4.0">4.0+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>

            {/* Sort order dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-700 font-semibold outline-none focus:border-[#D6531F] transition-colors cursor-pointer"
            >
              <option value="rating">Top Rated</option>
              <option value="reviews">Most Reviewed</option>
              <option value="name">A - Z</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-[#D6531F] hover:bg-opacity-95 text-[#F4F5ED] font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md shadow-[#D6531F]/15 flex items-center justify-center space-x-2"
          >
            <span>Search Neighborhood</span>
          </button>
        </form>

        {/* Category Tabs list */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-burgundy border-burgundy text-[#F4F5ED] shadow-md shadow-burgundy/10'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Errors view if relevant */}
        {error && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3 text-xs text-amber-800">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <span className="font-bold">Notice:</span>
              <p className="leading-relaxed text-slate-600">{error}</p>
            </div>
          </div>
        )}

        {/* Results grid container */}
        {loading ? (
          <div className="space-y-6">
            <div className="flex items-center justify-center space-x-2 py-20 text-slate-400 text-xs font-mono">
              <RefreshCw className="w-5 h-5 text-[#D6531F] animate-spin" />
              <span>Scraping live results from Google Maps...</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white border border-slate-100 rounded-2xl p-4 h-80 animate-pulse space-y-4">
                  <div className="aspect-[4/3] bg-slate-100 rounded-xl" />
                  <div className="h-4 bg-slate-100 rounded w-2/3" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          </div>
        ) : sortedSalons.length === 0 ? (
          <div className="text-center py-24 bg-white border border-slate-100 rounded-3xl space-y-4">
            <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-charcoal">No Salons Match Your Filters</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              We couldn't locate any matching salons near "{location}". Try typing a broader neighborhood like "Bandra" or searching with "Any Rating".
            </p>
            <button
              onClick={() => {
                setLocation('Mumbai');
                setSelectedCategory('');
                setMinRating(0);
                setSearchParams({});
              }}
              className="bg-[#D6531F] hover:bg-opacity-95 text-white py-2 px-4 rounded-xl text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-xs font-mono text-slate-400">
              Showing <span className="font-bold text-charcoal">{sortedSalons.length}</span> luxury locations near "{location}"
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedSalons.map((salon) => (
                <SalonCard key={salon.id} salon={salon} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
