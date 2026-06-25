import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogOut, LayoutDashboard, Compass, Sparkles, Building2, ChevronDown } from 'lucide-react';
import { AuthModal } from './AuthModal';

export const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  const handleSignOut = async () => {
    await signOut();
    setDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Discover', path: '/salons', icon: <Compass className="w-4 h-4" /> },
    { name: 'AI Style expert', path: '/ai-recommendations', icon: <Sparkles className="w-4 h-4" /> },
    { name: 'Partner With Us', path: '/partner', icon: <Building2 className="w-4 h-4" /> },
  ];

  const activeClass = "text-[#D6531F] font-bold border-b-2 border-[#D6531F] pb-1";
  const inactiveClass = "text-charcoal hover:text-[#D6531F] transition-colors font-medium";

  return (
    <>
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-40 px-4 md:px-8 py-4 shadow-sm" id="main-navbar">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-black bg-gradient-to-r from-burgundy via-[#D6531F] to-[#F7B32B] bg-clip-text text-transparent tracking-tight">
              Jalwaa AI
            </span>
            <span className="bg-burgundy/10 text-burgundy text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded-md hidden sm:inline-block">
              Mumbai
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`${isActive ? activeClass : inactiveClass} flex items-center space-x-1.5 text-sm`}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 bg-slate-50 border border-slate-100 hover:bg-slate-100 rounded-full py-1.5 px-3 transition-all text-sm"
                  id="user-dropdown-btn"
                >
                  <div className="w-7 h-7 bg-burgundy rounded-full flex items-center justify-center text-white font-bold text-xs uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <span className="font-semibold text-charcoal max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {/* Dropdown popup */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-slate-50">
                      <div className="font-bold text-charcoal text-xs truncate">{user.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                      <span className="inline-block mt-1 bg-[#D6531F]/10 text-[#D6531F] text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      to={user.role === 'owner' ? '/owner-dashboard' : '/dashboard'}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-xs hover:bg-slate-50 text-slate-700 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#D6531F]" />
                      <span>{user.role === 'owner' ? 'Owner Console' : 'My Bookings'}</span>
                    </Link>

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-xs hover:bg-rose-50 text-rose-600 text-left transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="bg-burgundy hover:bg-opacity-95 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-burgundy/10"
                id="navbar-signin-btn"
              >
                Sign In / Sign Up
              </button>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 rounded-md text-charcoal hover:bg-slate-50"
              id="mobile-menu-trigger"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Full Screen overlay menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 p-4 space-y-4 animate-slideDown" id="mobile-menu-drawer">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 text-sm p-2 rounded-xl transition-all ${
                      isActive ? 'bg-[#D6531F]/10 text-[#D6531F] font-bold' : 'text-charcoal hover:bg-slate-50'
                    }`}
                  >
                    {link.icon}
                    <span>{link.name}</span>
                  </Link>
                );
              })}

              {/* Mobile Profile Actions */}
              <div className="pt-2 border-t border-slate-100">
                {user ? (
                  <div className="space-y-2">
                    <div className="px-2 py-1.5">
                      <div className="font-bold text-charcoal text-xs">{user.name}</div>
                      <div className="text-[10px] text-slate-400">{user.email}</div>
                    </div>

                    <Link
                      to={user.role === 'owner' ? '/owner-dashboard' : '/dashboard'}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-2 text-sm text-charcoal p-2 hover:bg-slate-50 rounded-xl"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#D6531F]" />
                      <span>{user.role === 'owner' ? 'Owner Dashboard' : 'Customer Dashboard'}</span>
                    </Link>

                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleSignOut();
                      }}
                      className="w-full flex items-center space-x-2 text-sm text-rose-600 p-2 hover:bg-rose-50 rounded-xl text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAuthModalOpen(true);
                    }}
                    className="w-full bg-[#D6531F] text-white py-2.5 rounded-xl font-semibold text-xs shadow-md"
                  >
                    Sign In / Sign Up
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Auth Modal Trigger */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};
