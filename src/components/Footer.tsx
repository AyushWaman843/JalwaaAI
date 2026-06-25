import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Phone, Mail, Instagram, Facebook, Globe, Twitter } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#222017] text-[#F4F5ED] border-t border-slate-900 pt-16 pb-8 px-6 md:px-12" id="main-footer">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-white/10 pb-12">
        
        {/* Column 1: Brand Pitch */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-black bg-gradient-to-r from-white via-[#F7B32B] to-[#D6531F] bg-clip-text text-transparent">
              Jalwaa AI
            </span>
          </Link>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            Mumbai's luxury beauty and salon ecosystem. Powered by Google Maps scraping to give you authentic salons and real-time smart queuing bookings.
          </p>
          {/* Social icons */}
          <div className="flex items-center space-x-3 text-slate-400">
            <a href="#" className="hover:text-[#F7B32B] transition-colors"><Instagram className="w-4 h-4" /></a>
            <a href="#" className="hover:text-[#F7B32B] transition-colors"><Facebook className="w-4 h-4" /></a>
            <a href="#" className="hover:text-[#F7B32B] transition-colors"><Twitter className="w-4 h-4" /></a>
            <a href="#" className="hover:text-[#F7B32B] transition-colors"><Globe className="w-4 h-4" /></a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-[#F7B32B] uppercase tracking-wider font-mono">Explore</h4>
          <div className="flex flex-col space-y-2 text-xs text-slate-400">
            <Link to="/salons" className="hover:text-white transition-colors">Find Salons in Mumbai</Link>
            <Link to="/ai-recommendations" className="hover:text-white transition-colors">AI Style Consultations</Link>
            <Link to="/partner" className="hover:text-white transition-colors">Partner Register</Link>
            <Link to="/dashboard" className="hover:text-white transition-colors">My Appointments Pass</Link>
          </div>
        </div>

        {/* Column 3: Top Hotspots */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-[#F7B32B] uppercase tracking-wider font-mono">Locations</h4>
          <div className="flex flex-col space-y-2 text-xs text-slate-400">
            <span className="hover:text-white transition-colors cursor-pointer">Bandra West, Mumbai</span>
            <span className="hover:text-white transition-colors cursor-pointer">Juhu & Gulmohar Road</span>
            <span className="hover:text-white transition-colors cursor-pointer">Andheri West & Link Rd</span>
            <span className="hover:text-white transition-colors cursor-pointer">Colaba & Fort South</span>
          </div>
        </div>

        {/* Column 4: Contact & Help */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-[#F7B32B] uppercase tracking-wider font-mono">Contact Support</h4>
          <div className="flex flex-col space-y-2 text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-[#D6531F] flex-shrink-0" />
              <span>BKC Elite Tower, Bandra, Mumbai, MH</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-[#D6531F] flex-shrink-0" />
              <span>+91 22 4555 9090</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-[#D6531F] flex-shrink-0" />
              <span>support@jalwaa.ai</span>
            </div>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono">
        <span>© {new Date().getFullYear()} Jalwaa AI Technologies. All rights reserved.</span>
        <div className="flex space-x-4 mt-4 sm:mt-0">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms of Service</a>
          <a href="#" className="hover:underline">Security Hub</a>
        </div>
      </div>
    </footer>
  );
};
