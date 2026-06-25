import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dbService } from '../services/dbService';
import { Booking } from '../types';
import { CheckCircle2, Ticket, Calendar, Clock, Sparkles, MessageCircle, ArrowLeft, RefreshCw, Smartphone } from 'lucide-react';

export const BookingSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [whatsappLink, setWhatsappLink] = useState<string>('');

  useEffect(() => {
    const fetchBooking = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // Read local storage database
        const localList = JSON.parse(localStorage.getItem('jalwaa_local_bookings') || '[]');
        const found = localList.find((b: Booking) => b.id === id);
        
        if (found) {
          setBooking(found);
          
          // Get saved whatsapp deep link
          const waUrl = sessionStorage.getItem(`wa_booking_${id}`);
          if (waUrl) {
            setWhatsappLink(waUrl);
          } else {
            // Build fallback
            const cleanPhone = found.userPhone.replace(/[^\d+]/g, '');
            const fallbackMsg = `Hello! Your premium salon booking at ${found.salonName} is CONFIRMED.\n\n` +
              `📅 Date: ${found.date}\n` +
              `🕒 Time: ${found.time}\n` +
              `🎫 Ticket ID: ${found.id}\n\n` +
              `Show this pass at reception desk to check-in!`;
            setWhatsappLink(`https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(fallbackMsg)}`);
          }
        }
      } catch (err) {
        console.error("Failed to fetch booking result:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400 font-mono text-xs">
        <RefreshCw className="w-5 h-5 text-[#D6531F] animate-spin mb-2" />
        <span>Generating secure queue ticket...</span>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-md mx-auto text-center py-24 px-6 space-y-4">
        <h2 className="text-xl font-bold">Booking Not Found</h2>
        <p className="text-xs text-slate-500">The requested reservation ID could not be loaded.</p>
        <Link to="/" className="bg-[#D6531F] text-white px-4 py-2 rounded-xl text-xs font-bold">Go Home</Link>
      </div>
    );
  }

  // Calculate estimated wait time (approx 15-20 mins per queue item)
  const waitMinutes = (booking.queueNumber || 1) * 15;

  return (
    <div className="bg-[#F4F5ED] min-h-screen py-12 px-4 text-[#222017]" id="booking-success-page">
      <div className="max-w-xl mx-auto bg-white border border-slate-100 shadow-xl rounded-3xl overflow-hidden" id="success-pass-container">
        
        {/* Colorful receipt header */}
        <div className="bg-gradient-to-r from-burgundy via-[#D6531F] to-[#F7B32B] p-8 text-center text-white space-y-3 relative">
          <div className="mx-auto bg-white/20 backdrop-blur-md rounded-full w-12 h-12 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-[#F7B32B]" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">Reservation Confirmed!</h2>
          <p className="text-xs text-white/80 max-w-sm mx-auto leading-relaxed">
            Your booking pass at <span className="font-bold text-white underline">{booking.salonName}</span> is registered in the live queue.
          </p>
        </div>

        {/* Dynamic Pass body with QR */}
        <div className="p-8 space-y-6">
          
          {/* QR code card */}
          <div className="border border-slate-100 bg-slate-50 rounded-2xl p-6 text-center space-y-4 shadow-inner">
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm w-44 h-44 mx-auto flex items-center justify-center">
              <img 
                src={booking.qrCode} 
                alt="Verification QR Pass" 
                className="w-full h-full object-contain"
                id="booking-success-qr"
              />
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-mono font-black uppercase tracking-widest">Digital Queue Ticket</span>
              <div className="text-sm font-bold text-charcoal">{booking.id}</div>
            </div>

            {/* Live Queue number display */}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-200/50 pt-4">
              <div className="text-center space-y-0.5 border-r border-slate-200/50">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Your Queue Position</span>
                <div className="text-2xl font-black text-[#D6531F]">#{booking.queueNumber || 1}</div>
              </div>
              <div className="text-center space-y-0.5">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Estimated Wait</span>
                <div className="text-2xl font-black text-burgundy">{waitMinutes} mins</div>
              </div>
            </div>
          </div>

          {/* Booking receipt meta */}
          <div className="space-y-3 border-b border-slate-100 pb-5 text-xs">
            <div className="flex justify-between font-medium">
              <span className="text-slate-400 flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Selected Date</span>
              </span>
              <span className="text-charcoal font-bold">{booking.date}</span>
            </div>

            <div className="flex justify-between font-medium">
              <span className="text-slate-400 flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Appointment Slot</span>
              </span>
              <span className="text-charcoal font-bold">{booking.time}</span>
            </div>

            <div className="flex justify-between font-medium">
              <span className="text-slate-400 flex items-center space-x-1.5">
                <Ticket className="w-4 h-4 text-slate-400" />
                <span>Treatments</span>
              </span>
              <span className="text-charcoal font-bold text-right truncate max-w-[200px]">{booking.service}</span>
            </div>

            <div className="flex justify-between font-bold pt-2 border-t border-slate-100/50 text-sm">
              <span>Total Bill (incl. taxes)</span>
              <span className="font-mono text-[#D6531F]">₹{booking.price}</span>
            </div>
          </div>

          {/* Interactive buttons */}
          <div className="space-y-3 pt-2">
            
            {/* WhatsApp deep link action button */}
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/15 transition-all cursor-pointer"
                id="btn-whatsapp-confirmation"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Open Pass on WhatsApp</span>
              </a>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/dashboard"
                className="bg-slate-900 hover:bg-black text-[#F4F5ED] text-center py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 shadow-md"
              >
                <Smartphone className="w-4 h-4" />
                <span>My Active Passes</span>
              </Link>
              <Link
                to="/salons"
                className="border border-slate-200 hover:border-charcoal text-slate-600 hover:text-charcoal text-center py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Directory</span>
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
