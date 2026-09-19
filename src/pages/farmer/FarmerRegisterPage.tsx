import React, { useState } from 'react';
import { useRouter } from '../../lib/router';
import { useAuth } from '../../lib/auth';
import { CityStateSelect } from '../../components/common/CityStateSelect';
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
  UserPlus,
  Camera,
  Check,
  Sparkles
} from 'lucide-react';

import { OtpVerificationModal } from '../../components/auth/OtpVerificationModal';

const PRESET_FARMER_AVATARS = [
  '/images/farmer-portrait.jpg',
  'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
];

export const FarmerRegisterPage: React.FC = () => {
  const { navigate } = useRouter();
  const { register, sendOtp } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: 'Surat, Gujarat',
    password: '',
    confirmPassword: '',
    avatar: PRESET_FARMER_AVATARS[0],
    farmName: '',
    totalArea: '10'
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingInlineOtp, setIsSendingInlineOtp] = useState(false);

  const handleInlineVerifyClick = async () => {
    if (!formData.email || !formData.email.includes('@')) {
      setError('Please enter a valid email address first.');
      return;
    }
    setError('');
    setIsSendingInlineOtp(true);
    try {
      const res = await sendOtp(formData.email);
      if (res.success) {
        setShowOtpModal(true);
      } else {
        setError(res.error || 'Failed to send OTP code.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setIsSendingInlineOtp(false);
    }
  };


  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormData(prev => ({ ...prev, avatar: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Please fill out all required fields including password.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!isEmailVerified) {
      setError('Email verification required! Please enter the 6-digit OTP code sent to your email.');
      setIsLoading(true);
      try {
        await sendOtp(formData.email);
        setShowOtpModal(true);
      } catch (err: any) {
        setError(err.message || 'Failed to send OTP code.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      const res = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        location: formData.location,
        avatar: formData.avatar,
        role: 'farmer'
      });
      if (res.success) {
        navigate('/farmer/dashboard');
      } else {
        setError(res.error || 'Registration failed. Please try again.');
      }
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
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
          <div className="lg:col-span-7 p-6 sm:p-9 flex flex-col justify-center glass-surface-subtle overflow-y-auto">
            <div className="flex flex-col items-center text-center mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-lg mb-1.5 border border-white/30">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Create Farmer Account
              </h2>
            </div>

            {/* Tab Switcher: Log In / Sign Up */}
            <div className="grid grid-cols-2 p-1.5 rounded-2xl glass-surface mb-4 border border-white/20">
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

            {/* Photo Avatar Change Section */}
            <div className="mb-4 p-3 rounded-2xl glass-surface border border-white/20 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group shrink-0">
                <img
                  src={formData.avatar}
                  alt="Farmer Profile Preview"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white/40 shadow-lg group-hover:opacity-90 transition-opacity"
                />
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-5 h-5 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1.5">
                <div className="flex items-center justify-center sm:justify-between">
                  <span className="text-xs font-bold text-white">Profile Photo</span>
                  <label className="text-[11px] font-bold text-emerald-300 hover:text-emerald-200 cursor-pointer underline ml-2">
                    Upload Custom
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {/* Preset Avatars Row */}
                <div className="flex items-center justify-center sm:justify-start gap-2 pt-0.5">
                  <span className="text-[10px] text-white/70">Presets:</span>
                  {PRESET_FARMER_AVATARS.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, avatar: url }))}
                      className={`w-7 h-7 rounded-lg overflow-hidden border transition-transform cursor-pointer hover:scale-110 ${
                        formData.avatar === url ? 'border-white scale-105 shadow-xs' : 'border-white/20 opacity-70'
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-3.5 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-white text-xs font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3" autoComplete="off">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-white/80 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-white absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="farmer_reg_name"
                      autoComplete="off"
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
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-white absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                    <input
                      type="email"
                      name="farmer_reg_email"
                      autoComplete="off"
                      required
                      placeholder="rudra@agrisetu.in"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        setIsEmailVerified(false);
                      }}
                      className="w-full glass-input rounded-2xl py-2.5 pl-10 pr-24 text-xs font-bold text-white placeholder-white/60"
                    />
                    {isEmailVerified ? (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[11px] font-extrabold flex items-center gap-1 shadow-xs">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={isSendingInlineOtp || !formData.email.includes('@')}
                        onClick={handleInlineVerifyClick}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white text-[11px] font-extrabold transition-all cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        {isSendingInlineOtp ? (
                          <span>Sending...</span>
                        ) : (
                          <span>Verify</span>
                        )}
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-emerald-300/80 mt-1 font-semibold flex items-center gap-1">
                    <span>📩 OTP sent to email — please check Inbox & Spam / Junk folder</span>
                  </p>
                </div>



                <div>
                  <label className="block text-[11px] font-bold text-white/80 mb-1">Mobile Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-white absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      name="farmer_reg_phone"
                      autoComplete="off"
                      required
                      placeholder="+91 98251 44321"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full glass-input rounded-2xl py-2.5 pl-10 pr-3 text-xs font-bold text-white placeholder-white/60"
                    />
                  </div>
                </div>

                <CityStateSelect
                  value={formData.location}
                  onChange={(loc) => setFormData({ ...formData, location: loc })}
                  stateLabel="Farm State"
                  districtLabel="Farm District / Mandi Zone"
                  className="sm:col-span-2"
                />
              </div>

              {/* Password and Password Confirmation Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-white/80 mb-1">Account Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-white absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      name="farmer_reg_password"
                      autoComplete="new-password"
                      required
                      placeholder="Create password (min 6 chars)"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full glass-input rounded-2xl py-2.5 pl-10 pr-3 text-xs font-bold text-white placeholder-white/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/80 mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-white absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      name="farmer_reg_confirm_password"
                      autoComplete="new-password"
                      required
                      placeholder="Re-type password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className={`w-full glass-input rounded-2xl py-2.5 pl-10 pr-3 text-xs font-bold text-white placeholder-white/60 ${
                        formData.confirmPassword && formData.password !== formData.confirmPassword
                          ? 'border-rose-400 bg-rose-950/20'
                          : formData.confirmPassword && formData.password === formData.confirmPassword
                          ? 'border-emerald-400 bg-emerald-950/20'
                          : ''
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-2xl glass-btn-primary text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 disabled:opacity-60"
                >
                  <span>{isLoading ? 'Creating Farmer Station...' : 'Complete Farmer Registration'}</span>
                  {!isLoading && <ArrowRight className="w-4 h-4 text-white" />}
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

      {/* OTP Verification Modal */}
      <OtpVerificationModal
        email={formData.email}
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onSuccess={() => {
          setIsEmailVerified(true);
          setShowOtpModal(false);
          setError('');
        }}
      />
    </div>
  );
};




