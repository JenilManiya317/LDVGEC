import React, { useState } from 'react';
import { useRouter } from '../../lib/router';
import { useAuth } from '../../lib/auth';
import {
  Sprout,
  ArrowLeft,
  User,
  Mail,
  MapPin,
  Lock,
  Phone,
  ArrowRight,
  Leaf,
  Droplets,
  PackageCheck,
  LogIn,
  UserPlus
} from 'lucide-react';

export const FarmerRegisterPage: React.FC = () => {
  const { navigate } = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: 'Surat, Gujarat',
    password: '',
    farmName: '',
    totalArea: '10'
  });

  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Please fill out all required fields including password.');
      return;
    }
    setError('');
    const res = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      location: formData.location,
      role: 'farmer'
    });
    if (res.success) {
      navigate('/farmer/dashboard');
    } else {
      setError(res.error || 'Registration failed. Please check your details.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-8 text-white">
      {/* Top Header */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between mb-4">
        <button
          onClick={() => navigate('/choose-user')}
          className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-white glass-btn-secondary px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
          <span>Back to Role Selection</span>
        </button>

        <span className="text-sm font-extrabold text-white">
          Farmer Portal
        </span>
      </div>

      {/* Main Glass Card */}
      <div className="max-w-5xl mx-auto w-full my-auto py-4">
        <div className="glass-surface-elevated rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-white/25 shadow-2xl">
          {/* Left Hero Section with 3 Feature Pills */}
          <div className="lg:col-span-5 relative min-h-[350px] lg:min-h-[580px] flex flex-col justify-end p-6 sm:p-8 overflow-hidden">
            <img
              src="/images/tractor.jpg"
              alt="Agricultural Tractor in Field"
              className="absolute inset-0 w-full h-full object-cover brightness-[0.75] contrast-[1.1] scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

            <div className="relative z-10 space-y-3 max-w-sm">
              <div className="glass-feature-pill p-3 rounded-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 text-white flex items-center justify-center shrink-0">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-black text-white">0% Platform Fee</div>
                  <div className="text-[10px] text-white/80 font-medium">Keep 100% of your crop earnings</div>
                </div>
              </div>

              <div className="glass-feature-pill p-3 rounded-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 text-white flex items-center justify-center shrink-0">
                  <Droplets className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-black text-white">AI Crop Health</div>
                  <div className="text-[10px] text-white/80 font-medium">Early pest & disease diagnosis</div>
                </div>
              </div>

              <div className="glass-feature-pill p-3 rounded-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 text-white flex items-center justify-center shrink-0">
                  <PackageCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-black text-white">Mandi Pricing</div>
                  <div className="text-[10px] text-white/80 font-medium">Live APMC benchmark rates</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Section */}
          <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center glass-surface-subtle">
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-lg mb-2 border border-white/30">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Create Farmer Account
              </h2>
            </div>

            {/* Tab Switcher: Log In / Sign Up */}
            <div className="grid grid-cols-2 p-1.5 rounded-2xl glass-surface mb-5 border border-white/20">
              <button
                type="button"
                onClick={() => navigate('/farmer/login')}
                className="py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-white" />
                <span>Log In</span>
              </button>
              <button
                type="button"
                className="py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 bg-white text-slate-950 shadow-md transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Sign Up</span>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-white text-xs font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-white/80 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-white absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rudra Patel"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full glass-input rounded-2xl py-2.5 pl-10 pr-3 text-xs font-bold text-white placeholder-white/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/80 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-white absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="rudra@agrisetu.in"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full glass-input rounded-2xl py-2.5 pl-10 pr-3 text-xs font-bold text-white placeholder-white/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/80 mb-1">Mobile Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-white absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98251 44321"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full glass-input rounded-2xl py-2.5 pl-10 pr-3 text-xs font-bold text-white placeholder-white/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/80 mb-1">Farm Location</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-white absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Surat, Gujarat"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full glass-input rounded-2xl py-2.5 pl-10 pr-3 text-xs font-bold text-white placeholder-white/60"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/80 mb-1">Account Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-white absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Create secure password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full glass-input rounded-2xl py-2.5 pl-10 pr-3 text-xs font-bold text-white placeholder-white/60"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl glass-btn-primary text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all duration-300"
                >
                  <span>Complete Farmer Registration</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-white/70 py-2">
        AgriSetu © 2026. Dedicated to Indian Agriculture.
      </div>
    </div>
  );
};
