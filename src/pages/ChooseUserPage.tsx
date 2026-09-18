import React from 'react';
import { useRouter } from '../lib/router';
import { Navbar } from '../components/layout/Navbar';
import { GlassCard } from '../components/common/GlassCard';
import {
  Tractor,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Check
} from 'lucide-react';

export const ChooseUserPage: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <div className="flex flex-col min-h-screen text-white">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 pt-24 md:pt-28 pb-8 md:pb-12 flex flex-col justify-center">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-surface text-white text-xs font-bold border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Select Workspace</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            How would you like to use AgriSetu?
          </h1>
          <p className="text-xs sm:text-sm text-white/80 font-medium">
            Choose your persona to access specialized tools, dashboards, and direct marketplace.
          </p>
        </div>

        {/* Dual Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* FARMER CARD */}
          <GlassCard
            variant="elevated"
            className="p-6 sm:p-7 border border-white/25 flex flex-col justify-between group overflow-hidden"
          >
            <div>
              {/* Farmer Portrait Showcase for Farmer Card */}
              <div className="relative rounded-2xl overflow-hidden aspect-16/9 mb-5 border border-white/25 shadow-md">
                <img
                  src="/images/farmer-portrait.jpg"
                  alt="Indian Farmer in Wheat Field"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center border border-white/30">
                      <Tractor className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-black text-white drop-shadow-md">Farmer Portal</span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/30">
                    Producer Suite
                  </span>
                </div>
              </div>

              <h2 className="text-2xl font-black text-white tracking-tight mb-2">
                I am a Farmer
              </h2>
              <p className="text-xs text-white/80 font-medium leading-relaxed mb-5">
                Manage farm acreage, run AI crop disease scans, track live mandi commodity prices, and list harvests directly for consumers.
              </p>

              <div className="space-y-2 pt-3 border-t border-white/15">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <div className="w-4 h-4 rounded-full bg-white/15 text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>AI Crop Health Vision Diagnostics</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <div className="w-4 h-4 rounded-full bg-white/15 text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>Live APMC Mandi Rates & Forecasts</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <div className="w-4 h-4 rounded-full bg-white/15 text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>Direct-to-Consumer Crop Listing</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-white/15 space-y-2.5">
              <button
                onClick={() => navigate('/farmer/login')}
                className="w-full py-3 px-4 rounded-2xl glass-btn-primary text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Farmer Log In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/farmer/register')}
                className="w-full py-2.5 px-4 rounded-2xl glass-btn-secondary text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>New Farmer? Sign Up / Register</span>
              </button>
            </div>
          </GlassCard>

          {/* CUSTOMER CARD */}
          <GlassCard
            variant="elevated"
            className="p-6 sm:p-7 border border-white/25 flex flex-col justify-between group overflow-hidden"
          >
            <div>
              {/* Customer Grower Portrait Showcase for Customer Card */}
              <div className="relative rounded-2xl overflow-hidden aspect-16/9 mb-5 border border-white/25 shadow-md">
                <img
                  src="/images/customer-greenhouse.png"
                  alt="Grower in Greenhouse with Tablet"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center border border-white/30">
                      <ShoppingBag className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-black text-white drop-shadow-md">Customer Portal</span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/30">
                    Direct Market
                  </span>
                </div>
              </div>

              <h2 className="text-2xl font-black text-white tracking-tight mb-2">
                I am a Customer
              </h2>
              <p className="text-xs text-white/80 font-medium leading-relaxed mb-5">
                Purchase farm-fresh, residue-free produce directly from verified growers with doorstep dispatch and transparent batch tracking.
              </p>

              <div className="space-y-2 pt-3 border-t border-white/15">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <div className="w-4 h-4 rounded-full bg-white/15 text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>100% Direct Farm Fresh Produce</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <div className="w-4 h-4 rounded-full bg-white/15 text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>Fair Pricing with Zero Intermediary</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <div className="w-4 h-4 rounded-full bg-white/15 text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>Live Farm-to-Doorstep Tracking</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-white/15 space-y-2.5">
              <button
                onClick={() => navigate('/customer/login')}
                className="w-full py-3 px-4 rounded-2xl glass-btn-primary text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Customer Log In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/customer/register')}
                className="w-full py-2.5 px-4 rounded-2xl glass-btn-secondary text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>New Customer? Sign Up / Register</span>
              </button>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
};
