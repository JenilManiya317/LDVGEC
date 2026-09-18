import React, { useState } from 'react';
import {
  Sprout,
  ShoppingCart,
  Search,
  PackageCheck,
  Star,
  LogOut,
  Menu,
  X,
  MapPin,
  User
} from 'lucide-react';
import { useRouter } from '../../lib/router';
import { useAuth } from '../../lib/auth';
import { useCart } from '../../lib/cart';
import { UserProfileModal } from '../common/UserProfileModal';

export const CustomerNavbar: React.FC = () => {
  const { path, navigate } = useRouter();
  const { user, logout } = useAuth();
  const { items } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const totalCartCount = items.reduce((sum, i) => sum + i.quantityKg, 0);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { label: 'Marketplace', icon: Search, route: '/customer/dashboard' },
    { label: 'Browse Crops', icon: Sprout, route: '/customer/browse-crops' },
    { label: 'Order Tracking', icon: PackageCheck, route: '/customer/order-tracking' },
    { label: 'Reviews & Feedback', icon: Star, route: '/customer/feedback' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full px-4 sm:px-8 py-3.5 transition-all duration-300">
        <div className="max-w-7xl mx-auto glass-surface-elevated rounded-2xl px-6 py-3.5 flex items-center justify-between border border-white/20">
          {/* Left: Brand Logo */}
          <div
            id="customer-logo-btn"
            onClick={() => navigate('/customer/dashboard')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform border border-white/30">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white">
                AGRI<span className="text-white">SETU</span>
              </span>
              <span className="block text-[10px] font-bold tracking-widest uppercase text-white/70 -mt-0.5">
                Direct Farm Market
              </span>
            </div>
          </div>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = path === link.route;
              return (
                <button
                  key={link.label}
                  id={`customer-nav-${link.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  onClick={() => navigate(link.route)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${isActive
                    ? 'text-white glass-surface border border-white/40 shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                >
                  <Icon className={`w-4 h-4 text-white`} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Cart, Profile & Sign Out */}
          <div className="flex items-center gap-3">
            {/* Direct Shopping Cart Trigger */}
            <button
              id="nav-cart-btn"
              onClick={() => navigate('/customer/cart')}
              className="relative p-2.5 rounded-xl glass-surface-subtle text-white hover:text-white transition-all border border-white/25 shadow-xs hover:shadow-md cursor-pointer group active:scale-95"
              aria-label="View Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 text-white group-hover:scale-105 transition-transform" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-white text-slate-950 text-[10px] font-black rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center shadow-md animate-pulse">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Customer Profile Badge (Clickable to open profile modal) */}
            <button
              id="customer-profile-card-btn"
              onClick={() => setProfileModalOpen(true)}
              className="hidden sm:flex items-center gap-2.5 pl-2 py-1 pr-2.5 rounded-xl glass-surface-subtle hover:bg-white/15 border border-white/20 transition-all cursor-pointer group select-none"
              title="View Customer Profile"
            >
              <img
                src={user?.avatar || '/images/customer-greenhouse.png'}
                alt="Customer Profile"
                className="w-8 h-8 rounded-lg object-cover border border-white/30 shadow-xs group-hover:scale-105 transition-transform"
              />
              <div className="text-left leading-tight hidden lg:block">
                <span className="text-xs font-bold text-white block group-hover:underline">
                  {user?.name || 'Aarav Sharma'}
                </span>
                <span className="text-[10px] text-white/80 flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5 text-white" />
                  {user?.location || 'Ahmedabad'}
                </span>
              </div>
            </button>

            {/* Sign Out */}
            <button
              id="customer-logout-btn"
              onClick={handleLogout}
              className="p-2 text-rose-300 hover:text-rose-200 hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl glass-btn-secondary text-white"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 glass-surface-elevated rounded-2xl p-4 border border-white/20 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.label}
                    onClick={() => {
                      navigate(link.route);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-white hover:bg-white/10"
                  >
                    <Icon className="w-4 h-4 text-white" />
                    <span>{link.label}</span>
                  </button>
                );
              })}
              <div className="pt-2 border-t border-white/20 flex items-center justify-between px-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setProfileModalOpen(true);
                  }}
                  className="flex items-center gap-2 text-left cursor-pointer"
                >
                  <img
                    src={user?.avatar || '/images/customer-greenhouse.png'}
                    alt=""
                    className="w-8 h-8 rounded-lg object-cover border border-white/30"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">{user?.name || 'Customer'}</span>
                    <span className="text-[10px] text-white/70">View Profile</span>
                  </div>
                </button>
                <button
                  onClick={handleLogout}
                  className="text-xs text-rose-300 font-bold px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-950/70"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </>
  );
};
