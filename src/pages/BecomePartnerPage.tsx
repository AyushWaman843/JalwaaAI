import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { smsService } from '../services/smsService';
import { dbService } from '../services/dbService';
import { generateDefaultServices } from '../services/apifyService';
import { Salon } from '../types';
import { Building2, Plus, CheckCircle2, ShieldCheck, KeyRound, Smartphone, AlertCircle, RefreshCw, MapPin, Sparkles } from 'lucide-react';

export const BecomePartnerPage: React.FC = () => {
  const navigate = useNavigate();

  // Onboarding Form fields
  const [salonName, setSalonName] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [primaryCategory, setPrimaryCategory] = useState<string>('hair');
  
  // OTP flow states
  const [sentOtp, setSentOtp] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>('');
  const [simulatedCode, setSimulatedCode] = useState<string>('');
  const [directLink, setDirectLink] = useState<string>('');
  const [verifying, setVerifying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const benefits = [
    {
      title: "Attract High-Value AI Leads",
      desc: "Get automatically matched to aesthetic seekers in Mumbai using our Groq AI Style consult algorithms."
    },
    {
      title: "Digital Queue Tickets",
      desc: "Eliminate long physical wait lines with secure QR check-in slots that streamline operations."
    },
    {
      title: "Real Google Maps Crawling",
      desc: "We parse live reviews to keep your ratings verified and display your premium partner badge."
    },
    {
      title: "Low Booking Fees",
      desc: "No monthly subscriptions or listing constraints. Only minor convenience fees per booked check-in."
    }
  ];

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salonName || !address || !phone) {
      setError("Please fill out all registration fields.");
      return;
    }
    setVerifying(true);
    setError(null);

    try {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setSimulatedCode(code); // Store locally to check

      const res = await smsService.sendOtpViaWhatsapp(phone, salonName);
      
      setSentOtp(true);
      if (res.directWhatsappLink) {
        setDirectLink(res.directWhatsappLink);
      }
    } catch (err: any) {
      setError(err.message || "Failed to trigger OTP.");
    } finally {
      setVerifying(false);
    }
  };

  const handleVerifyOnboarding = async () => {
    if (otpCode !== simulatedCode && otpCode !== '1234') {
      setError("Incorrect code. (Enter the simulated code or '1234')");
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const newSalonId = `s_owner_${Math.random().toString(36).substring(2, 9)}`;
      
      const newPartnerSalon: Salon = {
        id: newSalonId,
        name: salonName,
        address: address,
        rating: 4.8,
        reviewsCount: 1,
        phone: phone,
        photos: [
          "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800"
        ],
        hours: {
          "Monday - Friday": "10:00 AM - 08:30 PM",
          "Saturday - Sunday": "09:30 AM - 09:00 PM"
        },
        isClaimed: true,
        priceRange: '₹₹',
        distance: '0.1 km',
        services: generateDefaultServices(salonName)
      };

      // 1. Create salon entry in local databases
      await dbService.updateSalonDetails(newSalonId, newPartnerSalon);

      // Save list of user custom claimed salons
      const customSalons = JSON.parse(localStorage.getItem('jalwaa_custom_salons') || '[]');
      customSalons.push(newPartnerSalon);
      localStorage.setItem('jalwaa_custom_salons', JSON.stringify(customSalons));

      // 2. Set claimed ownership locally
      localStorage.setItem('claimed_salon_id', newSalonId);

      // 3. Force sign in session as owner
      const mockOwner = {
        id: `usr_${Math.random().toString(36).substring(2, 9)}`,
        email: `partner_${newSalonId.substring(0, 5)}@jalwaa.ai`,
        name: `Owner of ${salonName}`,
        phone: phone,
        role: 'owner' as const
      };
      localStorage.setItem('jalwaa_session', JSON.stringify(mockOwner));

      // Redirect directly to Owner dashboard!
      navigate('/owner-dashboard');
    } catch (err: any) {
      setError(err.message || "Failed to finalize registration.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="bg-[#F4F5ED] min-h-screen py-12 px-4 md:px-8 text-[#222017]" id="become-partner-page">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
        
        {/* Left marketing columns */}
        <div className="space-y-8 flex flex-col justify-center">
          <div className="space-y-3">
            <span className="bg-burgundy/10 text-burgundy font-mono text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md">
              Grow Your Salon Business
            </span>
            <h1 className="text-3.5xl md:text-5xl font-black tracking-tight leading-none">
              Partner with Jalwaa AI & Fill Your Chairs
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed max-w-lg font-medium">
              List your Mumbai salon on the city's most advanced digital grooming directory. Enjoy automated Google Maps discovery, live digital waitlines, and personalized AI client matching.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
            {benefits.map((b, i) => (
              <div key={i} className="space-y-1.5 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center space-x-1.5 text-burgundy">
                  <CheckCircle2 className="w-5 h-5 text-[#D6531F] flex-shrink-0" />
                  <h3 className="font-bold text-xs text-charcoal">{b.title}</h3>
                </div>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right form onboarding columns */}
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl flex flex-col justify-center">
          
          <div className="border-b border-slate-100 pb-4 mb-6 space-y-1.5">
            <h3 className="text-lg font-black text-charcoal flex items-center space-x-1.5">
              <Building2 className="w-5 h-5 text-burgundy" />
              <span>Register Your Mumbai Salon</span>
            </h3>
            <p className="text-xs text-slate-400">Complete the mobile OTP verification to launch your salon immediately.</p>
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-800 p-3 rounded-xl border border-rose-100 text-xs flex items-start space-x-2.5 mb-4">
              <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!sentOtp ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Official Salon Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elegance Hair Lounge"
                  value={salonName}
                  onChange={(e) => setSalonName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-burgundy font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 font-mono">WhatsApp Registered Mobile</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-burgundy font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Salon Physical Address (Mumbai)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hill Road, Bandra West, Mumbai"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-burgundy font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Primary Specialty</label>
                <select
                  value={primaryCategory}
                  onChange={(e) => setPrimaryCategory(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-xs outline-none focus:border-burgundy font-semibold"
                >
                  <option value="hair">Hair Styling & Academy</option>
                  <option value="skin">Skin Glow & Facial rituals</option>
                  <option value="nails">Luxury Nails & Artistry</option>
                  <option value="makeup">Bridal & Red-Carpet Makeup</option>
                  <option value="massage">Massage & Wellness spa</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={verifying}
                className="w-full bg-gradient-to-r from-burgundy to-[#D6531F] hover:opacity-95 text-white py-3 rounded-xl font-bold text-xs shadow-lg shadow-burgundy/10 transition-all flex items-center justify-center space-x-2"
              >
                {verifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Trigger WhatsApp OTP Code</span>}
              </button>
            </form>
          ) : (
            <div className="space-y-5 animate-fadeIn">
              
              <div className="bg-indigo-50 text-indigo-800 p-3 rounded-xl border border-indigo-100 text-xs space-y-1">
                <span className="font-bold">Simulated OTP Code:</span>
                <div>Your boarding verification PIN is <span className="font-bold text-sm underline">{simulatedCode}</span> (or enter <span className="font-bold">1234</span>).</div>
              </div>

              {directLink && (
                <div className="space-y-2">
                  <p className="text-[10px] text-slate-400">
                    If real Twilio credits are not active, click below to open the OTP message directly in WhatsApp:
                  </p>
                  <a
                    href={directLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 rounded-xl text-xs justify-center items-center space-x-2"
                  >
                    <span>Send OTP via WhatsApp Direct</span>
                  </a>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-charcoal">Enter 4-Digit Onboarding PIN</label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="Enter Code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-center outline-none focus:border-burgundy tracking-widest font-black"
                />
              </div>

              <button
                onClick={handleVerifyOnboarding}
                disabled={verifying}
                className="w-full bg-burgundy hover:bg-opacity-95 text-white py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center"
              >
                {verifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Verify & Launch Owner Dashboard</span>}
              </button>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
