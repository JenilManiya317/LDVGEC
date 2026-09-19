import React, { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { useRouter } from '../../lib/router';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { CityStateSelect } from './CityStateSelect';
import {
  X,
  User,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Tractor,
  ShoppingBag,
  Bell,
  Lock,
  Check,
  Camera,
  LogOut,
  Sparkles,
  Calendar,
  Layers,
  Droplets
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, role, logout, updateProfile } = useAuth();
  const { navigate } = useRouter();

  const [activeTab, setActiveTab] = useState<'details' | 'farm' | 'security'>('details');
  const [savedNotice, setSavedNotice] = useState(false);

  // Editable Profile Form State
  const [formData, setFormData] = useState({
    name: user?.name || (role === 'farmer' ? 'Rudra Patel' : 'Aarav Sharma'),
    email: user?.email || (role === 'farmer' ? 'rudra.patel@agrisetu.in' : 'aarav.sharma@gmail.com'),
    phone: user?.phone || (role === 'farmer' ? '+91 98251 44321' : '+91 97234 88120'),
    location: user?.location || (role === 'farmer' ? 'Surat, Gujarat' : 'Ahmedabad, Gujarat'),
    avatar: user?.avatar || (role === 'farmer' ? '/images/farmer-portrait.jpg' : '/images/customer-greenhouse.png'),
    farmName: user?.farmName || 'Patel Organic Agro Fields',
    farmSize: user?.totalArea || '12.5 Acres',
    soilType: 'Black Clay Alluvial',
    irrigationType: 'Solar Micro-Drip',
    certId: 'NPOP-ORG-GJ-44910',
    deliveryAddress: 'B-402, Green Orchid Residency, SG Highway, Ahmedabad',
    notifications: true,
    mandiAlerts: true,
    weatherSms: true
  });

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name: formData.name,
      phone: formData.phone,
      location: formData.location,
      avatar: formData.avatar,
      farmName: formData.farmName,
      totalArea: formData.farmSize,
    });
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 1200);
  };

  const handleRoleSwitch = () => {
    onClose();
    if (role === 'farmer') {
      navigate('/customer/dashboard');
    } else {
      navigate('/farmer/dashboard');
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <GlassCard
          variant="elevated"
          className="p-6 sm:p-8 space-y-6 border border-white/30 shadow-2xl relative"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl glass-btn-secondary text-white hover:text-white cursor-pointer transition-all"
            aria-label="Close Profile"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Profile Header Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-white/20">
            <div className="relative group">
              <img
                src={formData.avatar}
                alt={formData.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-white/40 shadow-xl shadow-black/40"
              />
              <button
                type="button"
                onClick={() => alert('Photo updated with your active account avatar.')}
                className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-white/20 backdrop-blur-md text-white border border-white/40 hover:bg-white/30 transition-all cursor-pointer shadow-md"
                title="Change Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-center sm:text-left flex-1 space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full bg-white/20 border border-white/30 text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  {role === 'farmer' ? 'Verified Organic Farmer' : 'Verified Direct Consumer'}
                </span>
                <span className="text-xs font-semibold text-white/80 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-white" />
                  {formData.location}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {formData.name}
              </h2>
              <p className="text-xs text-white/80 font-medium flex items-center justify-center sm:justify-start gap-2">
                <Calendar className="w-3.5 h-3.5 text-white/70" />
                <span>AgriSetu Member since March 2024</span>
              </p>
            </div>
          </div>

          {/* Profile Navigation Tabs */}
          <div className="grid grid-cols-3 p-1 rounded-2xl bg-black/40 border border-white/20">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'details'
                  ? 'bg-white/25 text-white border border-white/35 shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Personal Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('farm')}
              className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'farm'
                  ? 'bg-white/25 text-white border border-white/35 shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {role === 'farmer' ? 'Farm & Land Specs' : 'Delivery & Market'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-white/25 text-white border border-white/35 shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Alerts & Security
            </button>
          </div>

          {/* Saved Notice Banner */}
          {savedNotice && (
            <div className="p-3.5 rounded-2xl bg-white/20 border border-white/40 text-white font-extrabold text-xs flex items-center justify-center gap-2 animate-in fade-in duration-150">
              <Check className="w-4 h-4 text-white" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          {/* Form Content Tabs */}
          <form onSubmit={handleSave} className="space-y-4">
            {/* TAB 1: Personal Details */}
            {activeTab === 'details' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-white/90 mb-1">
                      Full Legal Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-white absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full glass-input rounded-xl py-2.5 pl-10 pr-3 text-xs font-bold text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/90 mb-1">
                      Registered Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-white absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full glass-input rounded-xl py-2.5 pl-10 pr-3 text-xs font-bold text-white"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-white/90 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-white absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full glass-input rounded-xl py-2.5 pl-10 pr-3 text-xs font-bold text-white"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <CityStateSelect
                      value={formData.location}
                      onChange={(loc) => setFormData({ ...formData, location: loc })}
                      stateLabel="State"
                      districtLabel="City / District"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Farm & Land Specs OR Delivery & Market */}
            {activeTab === 'farm' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {role === 'farmer' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-white/90 mb-1">
                        Farm Estate Name
                      </label>
                      <input
                        type="text"
                        value={formData.farmName}
                        onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                        className="w-full glass-input rounded-xl py-2.5 px-3 text-xs font-bold text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-white/90 mb-1">
                        Total Cultivated Acreage
                      </label>
                      <input
                        type="text"
                        value={formData.farmSize}
                        onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })}
                        className="w-full glass-input rounded-xl py-2.5 px-3 text-xs font-bold text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-white/90 mb-1">
                        Primary Soil Profile
                      </label>
                      <input
                        type="text"
                        value={formData.soilType}
                        onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                        className="w-full glass-input rounded-xl py-2.5 px-3 text-xs font-bold text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-white/90 mb-1">
                        Irrigation Method
                      </label>
                      <input
                        type="text"
                        value={formData.irrigationType}
                        onChange={(e) => setFormData({ ...formData, irrigationType: e.target.value })}
                        className="w-full glass-input rounded-xl py-2.5 px-3 text-xs font-bold text-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-white/90 mb-1">
                        Organic Certification ID
                      </label>
                      <input
                        type="text"
                        value={formData.certId}
                        onChange={(e) => setFormData({ ...formData, certId: e.target.value })}
                        className="w-full glass-input rounded-xl py-2.5 px-3 text-xs font-bold text-white font-mono"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-white/90 mb-1">
                        Default Home Delivery Address
                      </label>
                      <textarea
                        rows={3}
                        value={formData.deliveryAddress}
                        onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                        className="w-full glass-input rounded-xl p-3 text-xs font-bold text-white leading-relaxed"
                      />
                    </div>
                    <div className="p-3.5 rounded-2xl bg-black/30 border border-white/20 text-xs space-y-2">
                      <div className="font-extrabold text-white flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-white" />
                        <span>Direct Farm Order Stats</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-white/80">
                        <div>Verified Deliveries: <strong className="text-white">12 Completed</strong></div>
                        <div>Favorite Farms: <strong className="text-white">Patel Organic</strong></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Alerts & Security */}
            {activeTab === 'security' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-2.5">
                  <div className="p-3 rounded-2xl bg-black/30 border border-white/20 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Daily APMC Mandi Price Alerts</div>
                      <div className="text-[10px] text-white/70">Receive morning commodity rate updates via SMS</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.mandiAlerts}
                      onChange={(e) => setFormData({ ...formData, mandiAlerts: e.target.checked })}
                      className="w-4 h-4 rounded accent-white cursor-pointer"
                    />
                  </div>

                  <div className="p-3 rounded-2xl bg-black/30 border border-white/20 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Severe Weather & Rain Warnings</div>
                      <div className="text-[10px] text-white/70">Real-time local satellite weather storm alerts</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.weatherSms}
                      onChange={(e) => setFormData({ ...formData, weatherSms: e.target.checked })}
                      className="w-4 h-4 rounded accent-white cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold text-white/90 mb-1">
                    Update Account Security Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-white absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      placeholder="Enter new password (optional)"
                      className="w-full glass-input rounded-xl py-2.5 pl-10 pr-3 text-xs font-bold text-white placeholder-white/50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t border-white/20 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRoleSwitch}
                  className="py-2.5 px-3.5 rounded-xl glass-btn-secondary text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {role === 'farmer' ? (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5 text-white" />
                      <span>Switch to Customer Market</span>
                    </>
                  ) : (
                    <>
                      <Tractor className="w-3.5 h-3.5 text-white" />
                      <span>Switch to Farmer Station</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="py-2.5 px-3 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-white font-bold text-xs border border-rose-500/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>

              <GlassButton
                id="save-profile-btn"
                variant="primary"
                size="sm"
                type="submit"
                icon={<Check className="w-4 h-4" />}
              >
                Save Profile
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};
