import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apifyService } from '../services/apifyService';
import { dbService } from '../services/dbService';
import { smsService } from '../services/smsService';
import { Salon, Service } from '../types';
import { Star, MapPin, Phone, Clock, ChevronRight, CheckCircle, ShieldCheck, ShoppingBag, Plus, Minus, KeyRound, AlertCircle, RefreshCw } from 'lucide-react';

export const SalonDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [salon, setSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  
  // Claim states
  const [claimModalOpen, setClaimModalOpen] = useState<boolean>(false);
  const [phone, setPhone] = useState<string>('');
  const [sentOtp, setSentOtp] = useState<boolean>(false);
  const [directLink, setDirectLink] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');
  const [simulatedCode, setSimulatedCode] = useState<string>('');
  const [verifying, setVerifying] = useState<boolean>(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  useEffect(() => {
    const loadSalon = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await apifyService.getSalonById(id);
        setSalon(data);
      } catch (err) {
        console.error("Failed to load salon details:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSalon();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400 font-mono text-xs">
        <RefreshCw className="w-6 h-6 text-[#D6531F] animate-spin mb-2" />
        <span>Fetching salon coordinates & services...</span>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="max-w-md mx-auto text-center py-24 px-6 space-y-4 text-charcoal">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold">Salon Not Found</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          The requested salon ID does not exist or has been removed from our caches.
        </p>
        <Link to="/salons" className="inline-block bg-[#D6531F] text-white px-4 py-2 rounded-xl text-xs font-bold">
          Back to Directory
        </Link>
      </div>
    );
  }

  // Gallery calculations
  const photos = salon.photos || [];
  const mainPhoto = photos[0] || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800";
  const smallPhoto1 = photos[1] || "https://images.unsplash.com/photo-1521590832167-7bcbfea63334?auto=format&fit=crop&q=80&w=400";
  const smallPhoto2 = photos[2] || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400";

  // Service Selection toggler
  const handleToggleService = (service: Service) => {
    if (selectedServices.find(s => s.id === service.id)) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const totalBasketAmount = selectedServices.reduce((sum, s) => sum + s.price, 0);

  // Claim OTP submission
  const handleSendClaimOtp = async () => {
    if (!phone) {
      setClaimError("Please specify your mobile number.");
      return;
    }
    setVerifying(true);
    setClaimError(null);

    try {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setSimulatedCode(code); // store to check locally

      const res = await smsService.sendOtpViaWhatsapp(phone, salon.name);
      
      setSentOtp(true);
      if (res.directWhatsappLink) {
        setDirectLink(res.directWhatsappLink);
      }
    } catch (err: any) {
      setClaimError(err.message || "Failed to trigger OTP.");
    } finally {
      setVerifying(false);
    }
  };

  const handleVerifyClaimOtp = async () => {
    if (otpCode !== simulatedCode && otpCode !== '1234') {
      setClaimError("Incorrect verification code. (Hint: enter the code we simulated or '1234' for instant bypass)");
      return;
    }
    
    setVerifying(true);
    setClaimError(null);

    try {
      // 1. Claim Salon in database
      await dbService.updateSalonDetails(salon.id, { isClaimed: true });
      
      // 2. Set claimed salon ownership locally
      localStorage.setItem('claimed_salon_id', salon.id);
      
      // 3. Force sign in as owner
      const mockOwner = {
        id: `usr_${Math.random().toString(36).substring(2, 9)}`,
        email: `partner_${salon.id.substring(0, 5)}@jalwaa.ai`,
        name: `Owner of ${salon.name.split(' ')[0]}`,
        phone: phone,
        role: 'owner' as const
      };
      localStorage.setItem('jalwaa_session', JSON.stringify(mockOwner));
      
      // 4. Update parent states
      setSalon({ ...salon, isClaimed: true });
      setClaimModalOpen(false);
      
      // Redirect to Owner Dashboard!
      navigate('/owner-dashboard');
    } catch (err: any) {
      setClaimError(err.message || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  // Compile selected services to booking URL
  const handleProceedBooking = () => {
    const sIdList = selectedServices.map(s => s.id).join(',');
    navigate(`/book/${salon.id}?services=${sIdList}`);
  };

  // Standard group hours mapping helper
  const renderHours = () => {
    if (typeof salon.hours === 'string') return <span>{salon.hours}</span>;
    return (
      <div className="space-y-1 text-slate-600 font-medium">
        {Object.entries(salon.hours || {}).map(([day, hr]) => (
          <div key={day} className="flex justify-between text-xs border-b border-dashed border-slate-100 py-1">
            <span className="font-semibold text-charcoal">{day}</span>
            <span>{hr}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-[#F4F5ED] min-h-screen pb-16 text-[#222017]" id="salon-detail-page">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
        
        {/* Breadcrumb navigator */}
        <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-semibold font-mono">
          <Link to="/" className="hover:text-charcoal transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/salons" className="hover:text-charcoal transition-colors">Salons</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-charcoal">{salon.name}</span>
        </div>

        {/* Gallery Hero Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="salon-gallery">
          {/* Large Main Picture */}
          <div className="md:col-span-2 aspect-[16/10] bg-slate-100 rounded-2xl overflow-hidden shadow-sm relative">
            <img src={mainPhoto} alt={salon.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          {/* Small side Pictures */}
          <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
            <div className="aspect-[4/3] md:aspect-auto md:h-[calc(50%-8px)] bg-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <img src={smallPhoto1} alt={`${salon.name} interior`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="aspect-[4/3] md:aspect-auto md:h-[calc(50%-8px)] bg-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <img src={smallPhoto2} alt={`${salon.name} treatment`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>

        {/* Info Splitter Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Columns - Details, Services */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Header Information */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <h1 className="text-2.5xl font-extrabold tracking-tight text-charcoal">{salon.name}</h1>
                  <div className="flex items-center space-x-2 text-xs text-slate-500 font-semibold">
                    <div className="flex items-center space-x-1">
                      <Star className="text-[#F7B32B] w-4 h-4 fill-current" />
                      <span className="font-bold text-charcoal">{salon.rating.toFixed(1)}</span>
                      <span>({salon.reviewsCount} reviews)</span>
                    </div>
                    <span>•</span>
                    <span className="font-mono text-[#D6531F] font-bold">{salon.priceRange}</span>
                    <span>•</span>
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded uppercase text-[9px] font-mono font-bold tracking-wider">Available Today</span>
                  </div>
                </div>

                {/* Claim trigger status */}
                <div>
                  {salon.isClaimed ? (
                    <div className="bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-2 rounded-xl flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Verified Jalwaa Partner</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setClaimModalOpen(true)}
                      className="bg-burgundy/10 hover:bg-burgundy hover:text-white border border-burgundy/20 text-burgundy text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
                      id="btn-claim-salon"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Claim This Salon</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Physical details block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-50 text-xs">
                <div className="flex items-start space-x-2.5">
                  <MapPin className="w-4 h-4 text-[#D6531F] mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600 font-medium leading-relaxed">{salon.address}</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Phone className="w-4 h-4 text-[#D6531F] flex-shrink-0" />
                  <span className="text-slate-600 font-medium">{salon.phone || '+91 99999 88888'}</span>
                </div>
              </div>
            </div>

            {/* Treatment Services Selector List */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold">Select Treatments & Styles</h3>
                <p className="text-xs text-slate-400">Choose multiple styling services to add to your custom booking pass.</p>
              </div>

              <div className="space-y-4">
                {salon.services.map((service) => {
                  const isSelected = selectedServices.some(s => s.id === service.id);
                  return (
                    <div
                      key={service.id}
                      onClick={() => handleToggleService(service)}
                      className={`border p-4 rounded-xl flex items-center justify-between transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'border-[#D6531F] bg-[#D6531F]/5 shadow-sm'
                          : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-1 pr-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-charcoal">{service.name}</span>
                          <span className="bg-slate-100 text-slate-500 font-mono text-[9px] uppercase px-1.5 py-0.2 rounded">
                            {service.category}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center space-x-2">
                          <span>Duration: {service.duration} mins</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className="font-mono font-bold text-sm text-[#D6531F]">
                          ₹{service.price}
                        </span>
                        
                        <div className={`p-1.5 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-[#D6531F] border-[#D6531F] text-white'
                            : 'border-slate-200 text-slate-400'
                        }`}>
                          <Plus className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Columns - Sticky Hours & Booking Basket */}
          <div className="space-y-6 lg:sticky lg:top-24">
            
            {/* Opening Hours list */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-charcoal flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Clock className="w-4 h-4 text-[#D6531F]" />
                <span>Operating Hours</span>
              </h4>
              {renderHours()}
            </div>

            {/* Booking Basket Summary */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-charcoal flex items-center space-x-2 border-b border-slate-100 pb-3">
                <ShoppingBag className="w-4 h-4 text-burgundy" />
                <span>Your Booking Cart</span>
              </h4>

              {selectedServices.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs font-medium space-y-2">
                  <p>No treatments selected yet.</p>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Select one or more services on the left to activate queue booking.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Selected items receipt */}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedServices.map(s => (
                      <div key={s.id} className="flex justify-between items-center text-xs text-slate-600">
                        <span className="truncate max-w-[150px] font-medium">{s.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-[#D6531F]">₹{s.price}</span>
                          <button
                            onClick={() => handleToggleService(s)}
                            className="text-rose-500 hover:bg-rose-50 p-0.5 rounded"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex justify-between text-sm font-bold text-charcoal">
                    <span>Subtotal:</span>
                    <span className="font-mono text-[#D6531F]">₹{totalBasketAmount}</span>
                  </div>

                  <button
                    onClick={handleProceedBooking}
                    className="w-full bg-gradient-to-r from-burgundy to-[#D6531F] hover:opacity-95 text-white py-3 rounded-xl font-bold text-xs shadow-lg shadow-burgundy/10 transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Proceed to Queue Booker</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Owner Claim Modal Pop-Up */}
      {claimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white border border-slate-200 shadow-2xl rounded-2xl p-6 space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-charcoal">Claim "{salon.name}"</h3>
              <button
                onClick={() => setClaimModalOpen(false)}
                className="text-slate-400 hover:text-charcoal font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {claimError && (
              <div className="bg-rose-50 text-rose-800 p-3 rounded-lg border border-rose-100 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span>{claimError}</span>
              </div>
            )}

            {!sentOtp ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Verify your association with this salon. We will generate and trigger a WhatsApp verification pin to verify ownership.
                </p>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-charcoal">Owner WhatsApp Active Mobile</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-burgundy"
                  />
                </div>

                <button
                  onClick={handleSendClaimOtp}
                  disabled={verifying}
                  className="w-full bg-burgundy hover:bg-opacity-95 text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center space-x-2"
                >
                  {verifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Send OTP Pin via WhatsApp</span>}
                </button>
              </div>
            ) : (
              <div className="space-y-4 animate-fadeIn">
                <p className="text-xs text-slate-500 leading-normal">
                  OTP verification sent to <span className="font-semibold">{phone}</span>! Please input the 4-digit pin code.
                </p>

                {/* Simulated notification bypass code */}
                <div className="bg-indigo-50 text-indigo-800 p-3 rounded-lg border border-indigo-100 text-[11px] space-y-1">
                  <div className="font-bold">Simulated OTP Code:</div>
                  <div>Your OTP code is <span className="font-bold text-xs underline">{simulatedCode}</span> (or enter <span className="font-bold">1234</span>).</div>
                </div>

                {directLink && (
                  <div className="space-y-2">
                    <p className="text-[10px] text-slate-400">
                      Since real Twilio credentials might be pending, click below to open the message directly in WhatsApp:
                    </p>
                    <a
                      href={directLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 rounded-xl text-xs justify-center items-center space-x-2"
                    >
                      <span>Simulate on WhatsApp Direct</span>
                    </a>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-charcoal">Enter 4-Digit OTP Code</label>
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
                  onClick={handleVerifyClaimOtp}
                  disabled={verifying}
                  className="w-full bg-burgundy hover:bg-opacity-95 text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center"
                >
                  {verifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Verify & Launch Owner Console</span>}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
