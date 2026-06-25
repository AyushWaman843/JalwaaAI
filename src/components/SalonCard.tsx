import React from 'react';
import { Salon } from '../types';
import { Star, MapPin, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SalonCardProps {
  salon: Salon;
}

export const SalonCard: React.FC<SalonCardProps> = ({ salon }) => {
  // Select first photo or fallback
  const displayPhoto = salon.photos?.[0] || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600";
  
  return (
    <div 
      className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group h-full"
      id={`salon-card-${salon.id}`}
    >
      {/* Photo cover with zoom */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={displayPhoto}
          alt={salon.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Badges layer */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
          {/* Claim status */}
          {salon.isClaimed ? (
            <span className="bg-emerald-500/90 text-white backdrop-blur-md font-mono text-[10px] uppercase font-bold px-2 py-1 rounded-md shadow-sm flex items-center space-x-1">
              <CheckCircle className="w-3 h-3" />
              <span>Verified Partner</span>
            </span>
          ) : (
            <span className="bg-[#F7B32B] text-charcoal backdrop-blur-md font-mono text-[10px] uppercase font-bold px-2 py-1 rounded-md shadow-sm flex items-center space-x-1">
              <AlertTriangle className="w-3 h-3 text-charcoal animate-pulse" />
              <span>Unclaimed Salon</span>
            </span>
          )}

          {/* Available today indicator */}
          <span className="bg-burgundy/90 text-white backdrop-blur-md font-mono text-[9px] uppercase font-bold px-2 py-1 rounded-md shadow-sm">
            Available Today
          </span>
        </div>
      </div>

      {/* Content wrapper */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        
        <div className="space-y-2">
          {/* Rating, Reviews and Price */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center space-x-1">
              <Star className="text-[#F7B32B] w-4 h-4 fill-current" />
              <span className="font-bold text-charcoal">{salon.rating.toFixed(1)}</span>
              <span className="text-[10px]">({salon.reviewsCount} reviews)</span>
            </div>
            <span className="font-mono font-bold text-[#D6531F] bg-[#D6531F]/5 px-2 py-0.5 rounded-md">
              {salon.priceRange || '₹₹'}
            </span>
          </div>

          {/* Salon Name */}
          <h3 className="text-base font-bold text-charcoal leading-snug group-hover:text-[#D6531F] transition-colors">
            {salon.name}
          </h3>

          {/* Location & Distance */}
          <div className="flex items-start space-x-1 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-[#D6531F] flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2 leading-relaxed flex-1">
              {salon.address}
            </span>
          </div>

          {/* Distance Indicator if available */}
          {salon.distance && (
            <div className="text-[10px] text-slate-400 font-mono flex items-center space-x-1">
              <span>Estimated distance:</span>
              <span className="font-semibold text-charcoal">{salon.distance}</span>
            </div>
          )}

          {/* Top services badges */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            {(salon.featuredServices || salon.services.map(s => s.name).slice(0, 3)).map((tag, i) => (
              <span 
                key={i} 
                className="bg-slate-50 border border-slate-100 text-[10px] text-slate-600 px-2 py-0.5 rounded-full font-medium"
              >
                {typeof tag === 'string' ? tag : tag.name}
              </span>
            ))}
          </div>
        </div>

        {/* Buttons footer */}
        <div className="grid grid-cols-2 gap-2 pt-4 mt-4 border-t border-slate-50">
          <Link
            to={`/salon/${salon.id}`}
            className="border border-slate-200 hover:border-charcoal text-charcoal text-center py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1"
          >
            <span>View Details</span>
          </Link>
          <Link
            to={`/book/${salon.id}`}
            className="bg-[#D6531F] hover:bg-opacity-95 text-white text-center py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 shadow-md shadow-[#D6531F]/10 hover:shadow-lg"
          >
            <span>Book Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
};
