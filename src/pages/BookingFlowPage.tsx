import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apifyService } from '../services/apifyService';
import { dbService } from '../services/dbService';
import { smsService } from '../services/smsService';
import { Salon, Service, Booking } from '../types';
import { Calendar, Clock, CreditCard, ChevronLeft, ArrowRight, User, Mail, Phone, AlertCircle, Sparkles, Receipt, RefreshCw } from 'lucide-react';

export const BookingFlowPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [salon, setSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [targetServices, setTargetServices] = useState<Service[]>([]);

  // Selection state
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  // Contact details state (initialized or manual fallback)
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  
  const [paymentMethod, setPaymentMethod] = useState<'salon' | 'upi' | 'card'>('salon');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    // Fill in logged-in user profile automatically
    if (user) {
      setCustomerName(user.name);
      setCustomerEmail(user.email);
      setCustomerPhone(user.phone || '');
    }
  }, [user]);

  useEffect(() => {
    const loadBookingData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const salonObj = await apifyService.getSalonById(id);
        setSalon(salonObj);

        // Map selected query parameter services
        const selectedIds = searchParams.get('services')?.split(',') || [];
        if (salonObj) {
          const matched = salonObj.services.filter(s => selectedIds.includes(s.id));
          // If no matching query services found, default to first service
          setTargetServices(matched.length > 0 ? matched : [salonObj.services[0]]);
        }
      } catch (err) {
        console.error("Failed to compile booking details:", err);
      } finally {
        setLoading(false);
      }
    };
    loadBookingData();

    // Default booking date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  }, [id, searchParams]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400 font-mono text-xs">
        <RefreshCw className="w-6 h-6 text-[#D6531F] animate-spin mb-2" />
        <span>Loading checkout terminal...</span>
      </div>
    );
  }

  if (!salon || targetServices.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-24 px-6 space-y-4 text-charcoal">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold">Checkout Error</h2>
        <p className="text-xs text-slate-500">
          The requested salon or services configuration is empty.
        </p>
        <Link to="/salons" className="inline-block bg-[#D6531F] text-white px-4 py-2 rounded-xl text-xs font-bold">
          Search Salons
        </Link>
      </div>
    );
  }

  // Generate date selectors (next 7 days)
  const getDates = () => {
    const dates = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push({
        isoString: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        dayNum: d.getDate(),
        month: d.toLocaleDateString('en-IN', { month: 'short' })
      });
    }
    return dates;
  };

  // Time Slots (30 min increments, 10 AM to 8:30 PM)
  const timeSlots = [
    "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
    "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
    "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM",
    "07:00 PM", "07:30 PM", "08:00 PM"
  ];

  // Price calculations
  const subtotal = targetServices.reduce((sum, s) => sum + s.price, 0);
  const gst = Math.round(subtotal * 0.18);
  const platformFee = 30;
  const totalDue = subtotal + gst + platformFee;

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!selectedDate) {
      setValidationError("Please select a date for your visit.");
      return;
    }
    if (!selectedTime) {
      setValidationError("Please pick an appointment time slot.");
      return;
    }
    if (!customerName || !customerPhone || !customerEmail) {
      setValidationError("Please fill out your contact verification details.");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Create a guest session ID if user is not authenticated
      const userId = user?.id || `usr_gst_${Math.random().toString(36).substring(2, 9)}`;
      
      const newBooking = await dbService.createBooking({
        userId,
        userEmail: customerEmail,
        userName: customerName,
        userPhone: customerPhone,
        salonId: salon.id,
        salonName: salon.name,
        service: targetServices.map(s => s.name).join(', '),
        date: selectedDate,
        time: selectedTime,
        price: totalDue
      });

      // 2. Trigger instant booking WhatsApp confirmation link optionally!
      const directConfirmationUrl = smsService.sendBookingConfirmation(
        customerPhone,
        newBooking.id,
        salon.name,
        targetServices.map(s => s.name).join(', '),
        selectedTime,
        selectedDate
      );

      // Save WhatsApp Confirmation URL globally in session so we can offer it as a gorgeous button!
      sessionStorage.setItem(`wa_booking_${newBooking.id}`, directConfirmationUrl);

      // Navigate to booking success page!
      navigate(`/booking-success/${newBooking.id}`);
    } catch (err: any) {
      setValidationError(err.message || "An unexpected database error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F4F5ED] min-h-screen py-8 text-[#222017]" id="booking-flow-page">
      <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-6">
        
        {/* Back navigation header */}
        <Link
          to={`/salon/${salon.id}`}
          className="inline-flex items-center space-x-1.5 text-xs text-slate-500 font-bold font-mono hover:text-[#D6531F] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Salon Details</span>
        </Link>

        {/* Validation notifications */}
        {validationError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs flex items-start space-x-2.5">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Master Row Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Grid Columns - Selections & Information */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Step 1: Select Date */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-charcoal flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-[#D6531F]" />
                <span>1. Select Visit Date</span>
              </h3>
              
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {getDates().map((date) => {
                  const isSelected = selectedDate === date.isoString;
                  return (
                    <button
                      key={date.isoString}
                      onClick={() => setSelectedDate(date.isoString)}
                      className={`border p-3 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#D6531F] bg-[#D6531F]/5 text-[#D6531F] font-bold shadow-sm'
                          : 'border-slate-100 hover:border-slate-300 bg-slate-50 hover:bg-white text-slate-500'
                      }`}
                    >
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">{date.dayName}</span>
                      <span className="text-base font-black tracking-tight">{date.dayNum}</span>
                      <span className="text-[9px] font-semibold">{date.month}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Time Slots */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-charcoal flex items-center space-x-2">
                <Clock className="w-5 h-5 text-[#D6531F]" />
                <span>2. Pick Available Slot</span>
              </h3>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-56 overflow-y-auto pr-1">
                {timeSlots.map((time) => {
                  const isSelected = selectedTime === time;
                  return (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`border py-2 px-1 rounded-xl text-center text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-burgundy border-burgundy text-white shadow-sm font-bold'
                          : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Contact Details Form */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-charcoal flex items-center space-x-2">
                <User className="w-5 h-5 text-[#D6531F]" />
                <span>3. Customer Contact Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ria Sen"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#D6531F] font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">WhatsApp Mobile Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#D6531F] font-medium"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-500">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. ria.sen@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#D6531F] font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Step 4: Payment Profile Selector */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-charcoal flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-[#D6531F]" />
                <span>4. Choose Payment Profile</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('salon')}
                  className={`border p-4 rounded-xl text-left space-y-1 transition-all cursor-pointer ${
                    paymentMethod === 'salon'
                      ? 'border-[#D6531F] bg-[#D6531F]/5 text-charcoal'
                      : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-xs">Pay at Salon (Check-in)</div>
                  <div className="text-[10px] text-slate-400">Cash/UPI at the front desk</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`border p-4 rounded-xl text-left space-y-1 transition-all cursor-pointer ${
                    paymentMethod === 'upi'
                      ? 'border-[#D6531F] bg-[#D6531F]/5 text-charcoal'
                      : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-xs">Instant UPI Pay</div>
                  <div className="text-[10px] text-slate-400">Google Pay / PhonePe / Paytm</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`border p-4 rounded-xl text-left space-y-1 transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-[#D6531F] bg-[#D6531F]/5 text-charcoal'
                      : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-xs">Credit/Debit Card</div>
                  <div className="text-[10px] text-slate-400">Secure Visa, Mastercard, RuPay</div>
                </button>
              </div>
            </div>

          </div>

          {/* Right Columns - Receipt Checkout Basket */}
          <div className="space-y-6 lg:sticky lg:top-24">
            
            {/* Treatment breakdown receipt */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
              
              <div className="border-b border-slate-100 pb-4 space-y-2">
                <h4 className="text-sm font-bold text-charcoal flex items-center space-x-1.5">
                  <Receipt className="w-4 h-4 text-[#D6531F]" />
                  <span>Fare Summary</span>
                </h4>
                <div className="text-xs font-bold text-charcoal truncate">{salon.name}</div>
                <div className="text-[10px] text-slate-400 font-mono leading-relaxed">{salon.address}</div>
              </div>

              {/* Services details list */}
              <div className="space-y-3">
                {targetServices.map(s => (
                  <div key={s.id} className="flex justify-between text-xs text-slate-600 font-medium">
                    <span className="truncate max-w-[170px]">{s.name}</span>
                    <span className="font-mono">₹{s.price}</span>
                  </div>
                ))}

                <div className="border-t border-dashed border-slate-100 pt-3 space-y-2 text-xs text-slate-500 font-medium">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono text-charcoal">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18% Service Tax)</span>
                    <span className="font-mono text-charcoal">₹{gst}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Convenience Fee</span>
                    <span className="font-mono text-charcoal">₹{platformFee}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 flex justify-between text-base font-black text-charcoal">
                  <span>Grand Total:</span>
                  <span className="font-mono text-[#D6531F]">₹{totalDue}</span>
                </div>
              </div>

              <button
                onClick={handleCreateBooking}
                disabled={submitting}
                className="w-full bg-gradient-to-r from-burgundy via-[#D6531F] to-amber hover:opacity-95 text-white py-3 rounded-xl font-bold text-xs shadow-lg shadow-burgundy/10 transition-all flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Confirm Booking Pass</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-[10px] text-slate-400 text-center leading-normal">
                By booking, you agree to show up at your allocated queue time. Rescheduling is completely free via your client pass.
              </p>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
