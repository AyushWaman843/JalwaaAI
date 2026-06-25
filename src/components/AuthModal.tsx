import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User, Phone, CheckCircle2, ShieldAlert } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, signUp, signIn, error } = useAuth();
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  
  // Fields state
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [role, setRole] = useState<'customer' | 'owner'>('customer');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!name || !phone || !email || !password) {
          throw new Error("Please fill out all required registration fields.");
        }
        await signUp(email, name, phone, password, role);
        setSuccess(true);
      } else {
        if (!email || !password) {
          throw new Error("Please enter your email and password.");
        }
        await signIn(email, password);
        onClose();
      }
    } catch (err: any) {
      setLocalError(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/80 backdrop-blur-sm animate-fadeIn" id="auth-modal-overlay">
      <div className="relative w-full max-w-md bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden" id="auth-modal-container">
        
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-burgundy via-[#D6531F] to-amber p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/10 hover:bg-black/25 text-white transition-colors"
            id="auth-modal-close"
          >
            <X className="w-4 h-4" />
          </button>
          
          <h2 className="text-2xl font-bold tracking-tight">
            {isSignUp ? "Join Jalwaa AI" : "Welcome Back"}
          </h2>
          <p className="text-xs text-white/80 mt-1 font-mono">
            {isSignUp ? "Create a premium account to explore & book" : "Access your premium bookings & dynamic queue status"}
          </p>
        </div>

        {/* Content body */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-6 space-y-4">
              <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-charcoal">Account Registered Successfully</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                We have recorded your details. Since email verification is in development, you are automatically signed in! Enjoy our premium salon platform.
              </p>
              <button
                onClick={() => {
                  setSuccess(false);
                  onClose();
                }}
                className="w-full bg-[#D6531F] hover:bg-[#b04217] text-white py-2.5 rounded-xl font-medium transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Notifications / Errors */}
              {(localError || error) && (
                <div className="flex items-start space-x-2 bg-rose-50 text-rose-800 p-3 rounded-lg border border-rose-200 text-xs">
                  <ShieldAlert className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                  <span>{localError || error}</span>
                </div>
              )}

              {/* Form Input fields */}
              {isSignUp && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-charcoal flex items-center space-x-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Full Name</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ria Sen"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#D6531F] transition-colors bg-slate-50 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-charcoal flex items-center space-x-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Phone Number (WhatsApp Active)</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#D6531F] transition-colors bg-slate-50 focus:bg-white"
                    />
                  </div>

                  {/* Role toggle */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-charcoal">Account Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole('customer')}
                        className={`py-1.5 rounded-lg border text-xs font-medium transition-all ${
                          role === 'customer'
                            ? 'bg-[#D6531F]/10 border-[#D6531F] text-[#D6531F]'
                            : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        Style Explorer
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('owner')}
                        className={`py-1.5 rounded-lg border text-xs font-medium transition-all ${
                          role === 'owner'
                            ? 'bg-burgundy/10 border-burgundy text-burgundy'
                            : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        Salon Owner
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-charcoal flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#D6531F] transition-colors bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-charcoal flex items-center space-x-1">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Password</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#D6531F] transition-colors bg-slate-50 focus:bg-white"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-burgundy to-[#D6531F] hover:opacity-90 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-burgundy/20 transition-all flex items-center justify-center space-x-2 text-sm"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>{isSignUp ? "Create Free Account" : "Access Account"}</span>
                )}
              </button>

              {/* Toggle switcher */}
              <div className="text-center pt-2 text-xs text-slate-500">
                {isSignUp ? (
                  <span>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(false)}
                      className="text-[#D6531F] font-bold hover:underline"
                    >
                      Sign In
                    </button>
                  </span>
                ) : (
                  <span>
                    New to Jalwaa AI?{" "}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(true)}
                      className="text-[#D6531F] font-bold hover:underline"
                    >
                      Sign Up
                    </button>
                  </span>
                )}
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
};
