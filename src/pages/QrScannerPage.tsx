import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { Booking } from '../types';
import { Camera, Search, CheckCircle, ShieldAlert, Sparkles, User, Ticket, Smartphone, RefreshCw, KeyRound, Image, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

export const QrScannerPage: React.FC = () => {
  const [ticketId, setTicketId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [foundBooking, setFoundBooking] = useState<Booking | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [scanSuccess, setScanSuccess] = useState<boolean>(false);

  // Load the latest active booking ID from local storage so owners can test scanning instantly!
  const [demoTicketId, setDemoTicketId] = useState<string>('');

  useEffect(() => {
    const localBookings = JSON.parse(localStorage.getItem('jalwaa_local_bookings') || '[]');
    const active = localBookings.find((b: Booking) => b.status === 'pending' || b.status === 'checked_in' || b.status === 'in_service');
    if (active) {
      setDemoTicketId(active.id);
    }
  }, []);

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;

    setLoading(true);
    setSearchError(null);
    setFoundBooking(null);
    setScanSuccess(false);

    try {
      const localList = JSON.parse(localStorage.getItem('jalwaa_local_bookings') || '[]');
      const matched = localList.find((b: Booking) => b.id.toUpperCase() === searchQuery.trim().toUpperCase());

      if (matched) {
        setFoundBooking(matched);
      } else {
        setSearchError("No active booking found matching this Ticket ID.");
      }
    } catch (err) {
      setSearchError("An error occurred during verification query.");
    } finally {
      setLoading(false);
    }
  };

  // Triggers instant scan of our demo ticket ID
  const handleDemoInstantScan = () => {
    if (demoTicketId) {
      setSearchQuery(demoTicketId);
      // Simulate real laser scan delayed feedback
      setLoading(true);
      setTimeout(() => {
        const localList = JSON.parse(localStorage.getItem('jalwaa_local_bookings') || '[]');
        const matched = localList.find((b: Booking) => b.id === demoTicketId);
        if (matched) {
          setFoundBooking(matched);
          setScanSuccess(true);
          setTimeout(() => setScanSuccess(false), 3000);
        }
        setLoading(false);
      }, 1200);
    }
  };

  const handleUpdateStatus = async (status: Booking['status']) => {
    if (!foundBooking) return;
    setLoading(true);

    try {
      const ok = await dbService.updateBookingStatus(foundBooking.id, status);
      if (ok) {
        setFoundBooking({ ...foundBooking, status });
        setScanSuccess(true);
        setTimeout(() => setScanSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F4F5ED] min-h-screen py-10 px-4 md:px-8 text-[#222017]" id="qr-scanner-page">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight">Digital QR Scanner</h1>
            <p className="text-xs text-slate-500">
              Scan client passes to automate check-ins, treatment timers, and queue completions.
            </p>
          </div>
          <Link
            to="/owner-dashboard"
            className="text-xs font-bold text-burgundy hover:underline flex items-center space-x-1"
          >
            <span>← Back to Owner Console</span>
          </Link>
        </div>

        {/* Outer Split layout: camera vs results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Scanner view screen */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-charcoal">Live Camera Feed (Simulator)</h3>
            
            {/* Camera viewport simulation frame */}
            <div className="relative aspect-square bg-slate-900 rounded-2xl overflow-hidden flex flex-col items-center justify-center text-white border-2 border-slate-800">
              {/* Corner scanner targets */}
              <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-[#D6531F]" />
              <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-[#D6531F]" />
              <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-[#D6531F]" />
              <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-[#D6531F]" />

              {/* Glowing vertical laser scanner bar */}
              <div className="absolute inset-x-8 h-1 bg-[#D6531F] opacity-75 shadow-[0_0_12px_rgba(214,83,31,0.8)] rounded animate-laserTopDown" />

              <Camera className="w-12 h-12 text-slate-600 animate-pulse" />
              <span className="text-[10px] text-slate-500 font-mono mt-2 uppercase tracking-widest font-black">Scanning Active</span>

              {/* Instant Scan Demo Link helper for quick checkouts */}
              {demoTicketId ? (
                <button
                  type="button"
                  onClick={handleDemoInstantScan}
                  className="absolute bottom-6 bg-[#D6531F] hover:bg-opacity-95 text-white font-bold py-1.5 px-4 rounded-full text-[10px] shadow flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#F7B32B] animate-pulse" />
                  <span>Instant Demo Scan (Ticket {demoTicketId})</span>
                </button>
              ) : (
                <div className="absolute bottom-6 text-[9px] text-slate-500 font-mono bg-black/40 px-3 py-1 rounded">
                  No active customer passes registered today
                </div>
              )}
            </div>

            {/* Manual input lookup */}
            <form onSubmit={handleManualSearch} className="space-y-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Or Look up Ticket ID Manually</span>
              <div className="flex items-center space-x-2">
                <div className="flex-1 flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
                  <Ticket className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter Ticket ID (e.g. BK_X7V12Y)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent outline-none font-bold text-charcoal uppercase"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-burgundy hover:bg-opacity-95 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Scanner result panel */}
          <div className="space-y-6">
            
            {/* Success notification banner */}
            {scanSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-800 text-xs flex items-center space-x-2.5">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span>Ticket record check-in processed successfully!</span>
              </div>
            )}

            {/* Error lookups */}
            {searchError && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-800 text-xs flex items-start space-x-2.5">
                <ShieldAlert className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
                <span>{searchError}</span>
              </div>
            )}

            {/* Loading placeholder */}
            {loading ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center space-y-2 text-xs text-slate-400 font-mono">
                <RefreshCw className="w-6 h-6 text-[#D6531F] animate-spin mx-auto mb-2" />
                <span>Accessing local databases...</span>
              </div>
            ) : foundBooking ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6 animate-fadeIn">
                
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <h3 className="text-sm font-black text-charcoal uppercase tracking-wider font-mono">Scan Result Card</h3>
                  <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded ${
                    foundBooking.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                    foundBooking.status === 'in_service' ? 'bg-purple-100 text-purple-800' :
                    foundBooking.status === 'checked_in' ? 'bg-indigo-100 text-indigo-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {foundBooking.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Patient / customer card details */}
                <div className="space-y-4">
                  
                  <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="w-9 h-9 bg-burgundy rounded-full flex items-center justify-center text-white font-bold text-xs uppercase">
                      {foundBooking.userName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-charcoal">{foundBooking.userName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{foundBooking.userPhone}</div>
                    </div>
                  </div>

                  {/* Summary coordinates */}
                  <div className="space-y-2 text-xs text-slate-500 font-medium leading-relaxed">
                    <div className="flex justify-between">
                      <span>Service booked:</span>
                      <span className="font-bold text-charcoal text-right max-w-[180px] truncate">{foundBooking.service}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Queue Position:</span>
                      <span className="font-bold text-[#D6531F]">#{foundBooking.queueNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date / Time:</span>
                      <span className="font-bold text-charcoal">{foundBooking.date} at {foundBooking.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Status:</span>
                      <span className="font-bold text-slate-700">Pay at front desk (Cash/UPI)</span>
                    </div>
                  </div>

                  {/* State Update buttons triggers */}
                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    {foundBooking.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateStatus('checked_in')}
                        className="w-full bg-[#D6531F] hover:bg-opacity-95 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow"
                        id="btn-scan-check-in"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Confirm Front Desk Check-In</span>
                      </button>
                    )}

                    {foundBooking.status === 'checked_in' && (
                      <button
                        onClick={() => handleUpdateStatus('in_service')}
                        className="w-full bg-purple-600 hover:bg-opacity-95 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow"
                        id="btn-scan-start-service"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start Styling Treatment</span>
                      </button>
                    )}

                    {foundBooking.status === 'in_service' && (
                      <button
                        onClick={() => handleUpdateStatus('completed')}
                        className="w-full bg-emerald-600 hover:bg-opacity-95 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow"
                        id="btn-scan-complete"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Mark Treatment Completed</span>
                      </button>
                    )}

                    {foundBooking.status === 'completed' && (
                      <div className="bg-emerald-100 text-emerald-800 text-xs font-semibold p-3 rounded-xl text-center">
                        This client check-in pass has been completed!
                      </div>
                    )}
                  </div>

                </div>

              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center space-y-4">
                <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm">Scanner Ready</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-normal">
                  Hover a customer's printed or mobile QR booking pass in front of the camera, or enter their Ticket ID manually to query check-in coordinates.
                </p>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
