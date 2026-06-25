import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/dbService';
import { Booking } from '../types';
import { Calendar, Clock, Ticket, User, Save, Sparkles, Smartphone, CheckCircle, RefreshCw, ChevronDown, ChevronUp, AlertCircle, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CustomerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);

  // Profile management state
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [preferences, setPreferences] = useState<string>('');
  const [profileSuccess, setProfileSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      setPreferences(user.preferences?.join(', ') || 'Balayage hair styling, Face glow rituals');
    }
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await dbService.fetchUserBookings(user.id);
      setBookings(data);
      if (data.length > 0) {
        setExpandedBookingId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to load customer dashboard bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(false);

    if (user) {
      const updatedProfile = {
        ...user,
        name,
        phone,
        preferences: preferences.split(',').map(s => s.trim()).filter(Boolean)
      };
      localStorage.setItem('jalwaa_session', JSON.stringify(updatedProfile));
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    }
  };

  // State Simulator Action for checkout demonstration
  const handleSimulateStatus = async (bookingId: string, currentStatus: Booking['status']) => {
    let nextStatus: Booking['status'] = 'pending';
    if (currentStatus === 'pending') nextStatus = 'checked_in';
    else if (currentStatus === 'checked_in') nextStatus = 'in_service';
    else if (currentStatus === 'in_service') nextStatus = 'completed';
    else return;

    await dbService.updateBookingStatus(bookingId, nextStatus);
    fetchBookings();
  };

  // Split active and historic
  const activeBookings = bookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled');
  const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

  const visibleBookings = activeTab === 'active' ? activeBookings : pastBookings;

  return (
    <div className="bg-[#F4F5ED] min-h-screen py-10 px-4 md:px-8 text-[#222017]" id="customer-dashboard">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Dashboard heading block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight">Style Explorer Pass</h1>
            <p className="text-xs text-slate-500">
              Manage your digital check-in queue cards and personal grooming profile.
            </p>
          </div>
          <Link
            to="/ai-recommendations"
            className="bg-[#D6531F] hover:bg-opacity-95 text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 self-start md:self-auto shadow-md"
          >
            <Sparkles className="w-4 h-4 text-[#F7B32B] animate-pulse" />
            <span>Consult AI Stylist</span>
          </Link>
        </div>

        {/* Outer Split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Column 1 & 2: Active Tickets viewport */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Queue pass tab bars */}
            <div className="flex border-b border-slate-200 text-xs font-bold">
              <button
                onClick={() => setActiveTab('active')}
                className={`pb-3 px-4 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'active' ? 'border-[#D6531F] text-[#D6531F]' : 'border-transparent text-slate-400 hover:text-charcoal'
                }`}
              >
                Active Queue Passes ({activeBookings.length})
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`pb-3 px-4 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'past' ? 'border-[#D6531F] text-[#D6531F]' : 'border-transparent text-slate-400 hover:text-charcoal'
                }`}
              >
                Grooming History ({pastBookings.length})
              </button>
            </div>

            {loading ? (
              <div className="py-16 text-center text-slate-400 text-xs font-mono flex items-center justify-center space-x-2 bg-white rounded-2xl border border-slate-100">
                <RefreshCw className="w-4 h-4 text-[#D6531F] animate-spin" />
                <span>Loading your queue credentials...</span>
              </div>
            ) : visibleBookings.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center space-y-4">
                <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                  <Ticket className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm">No Appointments Listed</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-normal">
                  {activeTab === 'active' 
                    ? "You don't have any active check-in slots scheduled. Explore our Mumbai directories to lock in a style session."
                    : "No past salon booking records in this account profile yet."}
                </p>
                <Link to="/salons" className="inline-block bg-burgundy text-white px-4 py-2 rounded-xl text-xs font-semibold">
                  Book Salon Now
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {visibleBookings.map((b) => {
                  const isExpanded = b.id === expandedBookingId;
                  const waitTime = (b.queueNumber || 1) * 15;
                  
                  return (
                    <div
                      key={b.id}
                      className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden"
                      id={`booking-card-${b.id}`}
                    >
                      {/* Condensed Header */}
                      <div
                        onClick={() => setExpandedBookingId(isExpanded ? null : b.id)}
                        className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors select-none"
                      >
                        <div className="space-y-1 pr-4">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className="font-bold text-sm text-charcoal">{b.salonName}</span>
                            <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded ${
                              b.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                              b.status === 'in_service' ? 'bg-purple-100 text-purple-800 animate-pulse' :
                              b.status === 'checked_in' ? 'bg-indigo-100 text-indigo-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {b.status.replace('_', ' ')}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-3 text-xs text-slate-400 font-medium">
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{b.date}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{b.time}</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className="font-mono font-bold text-xs text-[#D6531F]">₹{b.price}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </div>

                      {/* Expanded QR Pass detail panel */}
                      {isExpanded && (
                        <div className="border-t border-slate-100 bg-slate-50/50 p-6 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
                          
                          {/* QR and Queue stats card */}
                          <div className="bg-white border border-slate-100 p-4 rounded-xl text-center space-y-3 shadow-inner md:col-span-1">
                            <div className="w-32 h-32 mx-auto border border-slate-100 rounded-lg p-2 bg-white flex items-center justify-center">
                              <img src={b.qrCode} alt="Grooming QR Pass" className="w-full h-full object-contain" />
                            </div>
                            <div>
                              <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Position in Queue</span>
                              <span className="text-xl font-black text-[#D6531F]">#{b.queueNumber || 1}</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">Approx {waitTime} mins wait</span>
                            </div>
                          </div>

                          {/* Steps and detail logs */}
                          <div className="md:col-span-2 space-y-4 flex flex-col justify-between">
                            
                            <div className="space-y-3">
                              <div className="text-xs text-slate-500 space-y-1.5 font-medium">
                                <div className="flex justify-between">
                                  <span>Ticket ID:</span>
                                  <span className="font-mono font-bold text-charcoal">{b.id}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Treatments:</span>
                                  <span className="font-bold text-charcoal truncate max-w-[200px]">{b.service}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>WhatsApp:</span>
                                  <span className="font-bold text-charcoal">{b.userPhone}</span>
                                </div>
                              </div>

                              {/* Progress Status workflow lines */}
                              <div className="pt-3 border-t border-slate-100">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 font-mono">Live Tracker Steps</span>
                                <div className="grid grid-cols-4 gap-1.5 text-[9px] text-center font-mono font-bold">
                                  <div className={`py-1 rounded ${b.status === 'pending' || b.status === 'checked_in' || b.status === 'in_service' || b.status === 'completed' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-400'}`}>PENDING</div>
                                  <div className={`py-1 rounded ${b.status === 'checked_in' || b.status === 'in_service' || b.status === 'completed' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-400'}`}>CHECKED IN</div>
                                  <div className={`py-1 rounded ${b.status === 'in_service' || b.status === 'completed' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-400'}`}>IN SERVICE</div>
                                  <div className={`py-1 rounded ${b.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}>COMPLETED</div>
                                </div>
                              </div>
                            </div>

                            {/* State Transition Demonstration Simulator Action */}
                            {b.status !== 'completed' && (
                              <button
                                onClick={() => handleSimulateStatus(b.id, b.status)}
                                className="mt-3 inline-flex self-start bg-slate-900 hover:bg-black text-[#F4F5ED] py-1.5 px-3.5 rounded-xl text-[10px] font-bold tracking-tight items-center space-x-1 transition-all shadow cursor-pointer"
                                id={`btn-simulate-status-${b.id}`}
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Simulate Next Queue Status Step</span>
                              </button>
                            )}

                          </div>

                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Column 3: Edit Profile Panel */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-charcoal flex items-center space-x-2 border-b border-slate-100 pb-3">
              <User className="w-5 h-5 text-burgundy" />
              <span>Style Explorer Profile</span>
            </h3>

            {profileSuccess && (
              <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-lg border border-emerald-100 text-xs font-medium">
                Preferences updated successfully!
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Explorer Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-burgundy font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">WhatsApp Mobile</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-burgundy font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Favorite Styles (Comma Separated)</label>
                <textarea
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-burgundy font-semibold resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#D6531F] hover:bg-opacity-95 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow"
              >
                <Save className="w-4 h-4" />
                <span>Save Style Preferences</span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
