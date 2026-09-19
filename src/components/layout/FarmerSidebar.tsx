import React, { useState } from 'react';
import {
  LayoutDashboard,
  Sprout,
  ScanEye,
  CloudSun,
  CheckSquare,
  CalendarDays,
  TrendingUp,
  PlusCircle,
  ShoppingBag,
  Store,
  LogOut,
  Menu,
  X,
  MapPin,
  Sparkles,
  User
} from 'lucide-react';
import { useRouter } from '../../lib/router';
import { useAuth } from '../../lib/auth';
import { UserProfileModal } from '../common/UserProfileModal';

export const FarmerSidebar: React.FC = () => {
  const { path, navigate } = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const menuItems = [
    { label: 'Overview', icon: LayoutDashboard, route: '/farmer/dashboard' },
    { label: 'Crops & Fields', icon: Sprout, route: '/farmer/farm-crop-setup' },
    { label: 'AI Crop Health', icon: ScanEye, route: '/farmer/crop-health', badge: 'AI' },
    { label: "Today's Tasks", icon: CheckSquare, route: '/farmer/todays-instructions' },
    { label: 'Weather & Advisory', icon: CloudSun, route: '/farmer/weather-advisory' },
    { label: 'Work Timetable', icon: CalendarDays, route: '/farmer/timetable' },
    { label: 'Market Prices', icon: TrendingUp, route: '/farmer/market-price' },
    { label: 'Direct Sell Crop', icon: PlusCircle, route: '/farmer/list-crop' },
    { label: 'Seller Hub & Orders', icon: ShoppingBag, route: '/farmer/seller-hub', badge: 'Orders' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between text-white">
      <div>
        {/* Brand Header */}
        <div
          onClick={() => navigate('/farmer/dashboard')}
          className="flex items-center gap-3 p-3.5 mb-2 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform border border-white/30">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white">
              AGRI<span className="text-white">SETU</span>
            </span>
            <span className="block text-[10px] font-bold text-white/70 uppercase tracking-wider -mt-0.5">
              Farmer Station
            </span>
          </div>
        </div>

        {/* Farmer Profile Card (Clickable to open profile modal) */}
        <div
          id="farmer-sidebar-profile-card"
          onClick={() => setProfileModalOpen(true)}
          className="mx-2 mb-4 p-3 rounded-2xl glass-surface-subtle hover:bg-white/15 flex items-center gap-3 border border-white/20 shadow-xs cursor-pointer group transition-all"
          title="Click to view & edit farmer profile"
        >
          <img
            src={user?.avatar || '/images/farmer-portrait.jpg'}
            alt="Farmer Profile"
            className="w-10 h-10 rounded-xl object-cover border border-white/30 shadow-xs group-hover:scale-105 transition-transform"
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-white truncate group-hover:underline flex items-center justify-between">
              <span>{user?.name || 'Rudra Patel'}</span>
              <span className="text-[10px] text-white/60 font-normal">Edit</span>
            </div>
            <div className="text-[11px] text-white/80 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-white shrink-0" />
              <span className="truncate">{user?.location || 'Surat, Gujarat'}</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5 px-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = path === item.route;

            return (
              <button
                key={item.label}
                id={`farmer-nav-${item.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => {
                  navigate(item.route);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'glass-surface text-white border border-white/40 shadow-md font-extrabold'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 text-white`} />
                  <span className="truncate text-white">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md font-extrabold bg-white/20 text-white border border-white/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="p-2 border-t border-white/15">
        <button
          id="farmer-logout-btn"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between p-3.5 glass-surface-elevated border-b border-white/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-green-600 flex items-center justify-center text-white">
            <Sprout className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-white text-sm">AgriSetu Station</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl glass-btn-secondary text-white cursor-pointer"
          aria-label="Toggle Farmer Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs flex">
          <div className="w-72 h-full glass-surface-elevated p-3 border-r border-white/20 shadow-2xl animate-in slide-in-from-left duration-200 overflow-y-auto">
            {navContent}
          </div>
          <div className="flex-1" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Desktop Sticky Fixed Sidebar on Left Side */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0 p-4 z-40">
        <div className="glass-surface-elevated h-full rounded-3xl p-2.5 flex flex-col justify-between overflow-y-auto">
          {navContent}
        </div>
      </aside>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </>
  );
};
