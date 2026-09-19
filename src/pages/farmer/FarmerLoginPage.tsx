import React, { useState } from 'react';
import { useRouter } from '../../lib/router';
import { useAuth } from '../../lib/auth';
import {
  Sprout,
  ArrowLeft,
  User,
  Lock,
  ArrowRight,
  Leaf,
  Droplets,
  PackageCheck,
  Check,
  LogIn,
  UserPlus
} from 'lucide-react';
import { DEMO_FARMER } from '../../lib/mock-data';

export const FarmerLoginPage: React.FC = () => {
  const { navigate } = useRouter();
  const { loginWithCredentials, loginAsDemoFarmer } = useAuth();

  const [identifier, setIdentifier] = useState(DEMO_FARMER.email);
  const [password, setPassword] = useState('demo1234');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    const res = await loginWithCredentials(identifier, password);
    if (res.success) {
      navigate('/farmer/dashboard');
    } else {
      setError(res.error || 'Login failed.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-8 text-white">
      {/* Top Header */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between mb-4">
        <button
          id="farmer-login-back-btn"
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
          {/* Left Hero Section with Farmer in Agricultural Field and 3 Feature Pills */}
          <div className="lg:col-span-6 relative min-h-[380px] lg:min-h-[560px] flex flex-col justify-end p-6 sm:p-8 overflow-hidden">
            <img
              src="/images/tractor.jpg"
              alt="Agricultural Tractor in Field"
              className="absolute inset-0 w-full h-full object-cover brightness-[0.75] contrast-[1.1] scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

            {/* 3 Translucent Feature Pills */}
            <div className="relative z-10 space-y-3 max-w-sm">
              <div className="glass-feature-pill p-3 rounded-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 text-white flex items-center justify-center shrink-0">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-black text-white">Direct Harvest Sales</div>
                  <div className="text-[10px] text-white/80 font-medium">Sell directly to retail consumers</div>
                </div>
              </div>

              <div className="glass-feature-pill p-3 rounded-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 text-white flex items-center justify-center shrink-0">
                  <Droplets className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-black text-white">AI Vision Doctor</div>
                  <div className="text-[10px] text-white/80 font-medium">Instant leaf scan disease detection</div>
                </div>
              </div>

              <div className="glass-feature-pill p-3 rounded-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 text-white flex items-center justify-center shrink-0">
                  <PackageCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-black text-white">Live Mandi Prices</div>
                  <div className="text-[10px] text-white/80 font-medium">Daily APMC market trends & forecasts</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Section */}
          <div className="lg:col-span-6 p-8 sm:p-10 flex flex-col justify-center glass-surface-subtle">
            {/* Header Brand */}
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-lg mb-2 border border-white/30">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-black tracking-widest uppercase text-white flex items-center gap-1">
                AGRI<span className="text-white">SETU</span>
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight mt-1">
                Farmer Workspace
              </h2>
            </div>

            {/* Tab Switcher: Log In / Sign Up */}
            <div className="grid grid-cols-2 p-1.5 rounded-2xl glass-surface mb-6 border border-white/20">
              <button
                type="button"
                className="py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 bg-white text-slate-950 shadow-md transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/farmer/register')}
                className="py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-white" />
                <span>Sign Up</span>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-white text-xs font-bold">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email / Mobile Input */}
              <div>
                <label className="block text-[11px] font-bold text-white/80 mb-1.5">Email or Mobile Number</label>
                <div className="relative">
                  <User className="w-4 h-4 text-white absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. rudra@agrisetu.in"
                    className="w-full glass-input rounded-2xl py-3 pl-11 pr-4 text-xs font-bold text-white placeholder-white/60"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-[11px] font-bold text-white/80 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-white absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full glass-input rounded-2xl py-3 pl-11 pr-4 text-xs font-bold text-white placeholder-white/60"
                  />
                </div>
              </div>

              {/* Remember me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-white/80 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded accent-white cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => alert('Demo Password: "demo1234" (Pre-filled for demonstration)')}
                  className="text-white hover:text-white/80 font-bold hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  id="farmer-login-btn"
                  className="w-full py-3.5 px-6 rounded-2xl glass-btn-primary text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer select-none"
                >
                  <span>Log In to Farmer Station</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Instant Demo Access Button */}
              <div className="pt-3 text-center">
                <button
                  type="button"
                  onClick={() => {
                    loginAsDemoFarmer();
                    navigate('/farmer/dashboard');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl glass-btn-secondary text-white font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>⚡ Quick Farmer Demo Access</span>
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
