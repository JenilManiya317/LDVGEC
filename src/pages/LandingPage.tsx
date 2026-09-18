import React, { useState } from 'react';
import { useRouter } from '../lib/router';
import { Navbar } from '../components/layout/Navbar';
import { GlassCard } from '../components/common/GlassCard';
import { GlassButton } from '../components/common/GlassButton';
import { AnimatedCounter } from '../components/common/AnimatedCounter';
import {
  Users,
  HeartHandshake,
  Sprout,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  ScanEye,
  TrendingUp,
  Truck,
  CheckCircle2,
  Leaf,
  Droplets
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { navigate } = useRouter();
  const [activeFeatureTab, setActiveFeatureTab] = useState<'farmer' | 'customer' | 'ai'>('farmer');

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Main Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 pt-24 md:pt-28 pb-8 md:pb-16 flex flex-col justify-between">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4 md:pt-8">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-surface text-white text-xs font-bold border border-white/30 shadow-xs">
              <Sparkles className="w-4 h-4 text-white animate-spin" style={{ animationDuration: '6s' }} />
              <span>Next-Gen Agricultural Intelligence & Direct Marketplace</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
              Smarter Farms. <br />
              <span className="text-white drop-shadow-md">
                Direct Connections.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-white/90 max-w-xl font-medium leading-relaxed">
              Empowering farmers with AI diagnostics, precise crop scheduling, and fair mandi rates while delivering fresh, organic farm produce straight to conscious consumers.
            </p>

            {/* Single Clear Primary Flow */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <GlassButton
                id="hero-get-started-btn"
                size="lg"
                variant="primary"
                onClick={() => navigate('/choose-user')}
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Access Platform
              </GlassButton>
            </div>
          </div>

          {/* Right Hero Visual Showcase - Featuring the screenshot layout */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              <div className="glass-surface-elevated p-7 rounded-3xl relative overflow-hidden border border-white/20 shadow-2xl">
                <div className="space-y-4 text-center py-4">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold bg-white/15 text-white border border-white/30">
                    Sustainable Food Future
                  </span>
                  <div className="handwriting-font text-5xl sm:text-6xl text-white leading-tight font-bold drop-shadow-md">
                    Pure Food, <br />
                    Fair Prices
                  </div>
                  <p className="text-xs text-white/80 font-medium">
                    100% verified organic fields, computer vision crop analysis, and zero intermediary markups.
                  </p>
                </div>

                {/* 3 Translucent Feature Pills */}
                <div className="pt-4 border-t border-white/20 space-y-2">
                  <div className="glass-feature-pill p-2.5 rounded-xl flex items-center gap-3 text-xs">
                    <div className="w-7 h-7 rounded-lg bg-white/15 text-white flex items-center justify-center shrink-0 border border-white/20">
                      <Leaf className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="font-black text-white">0% Middlemen</span>
                      <span className="text-[10px] text-white/80">Direct Revenue</span>
                    </div>
                  </div>

                  <div className="glass-feature-pill p-2.5 rounded-xl flex items-center gap-3 text-xs">
                    <div className="w-7 h-7 rounded-lg bg-white/15 text-white flex items-center justify-center shrink-0 border border-white/20">
                      <Droplets className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="font-black text-white">&lt;24h Dispatch</span>
                      <span className="text-[10px] text-white/80">Fresh Picked</span>
                    </div>
                  </div>

                  <div className="glass-feature-pill p-2.5 rounded-xl flex items-center gap-3 text-xs">
                    <div className="w-7 h-7 rounded-lg bg-white/15 text-white flex items-center justify-center shrink-0 border border-white/20">
                      <ScanEye className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="font-black text-white">AI Health Scan</span>
                      <span className="text-[10px] text-white/80">Instant Diagnostic</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Dynamic Stats Counters */}
        <div id="about-section" className="mt-12 md:mt-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <GlassCard variant="elevated" className="p-5 text-center flex flex-col items-center justify-center">
              <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/30 text-white flex items-center justify-center mb-2 shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                <AnimatedCounter value={10850} suffix="+" duration={1200} />
              </div>
              <div className="text-xs font-bold text-white/80 mt-0.5">Active Farmers</div>
            </GlassCard>

            <GlassCard variant="elevated" className="p-5 text-center flex flex-col items-center justify-center">
              <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/30 text-white flex items-center justify-center mb-2 shadow-xs">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                <AnimatedCounter value={52400} suffix="+" duration={1400} />
              </div>
              <div className="text-xs font-bold text-white/80 mt-0.5">Happy Consumers</div>
            </GlassCard>

            <GlassCard variant="elevated" className="p-5 text-center flex flex-col items-center justify-center">
              <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/30 text-white flex items-center justify-center mb-2 shadow-xs">
                <Sprout className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                <AnimatedCounter value={120} suffix="+" duration={1000} />
              </div>
              <div className="text-xs font-bold text-white/80 mt-0.5">Crop Varieties</div>
            </GlassCard>

            <GlassCard variant="elevated" className="p-5 text-center flex flex-col items-center justify-center">
              <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/30 text-white flex items-center justify-center mb-2 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                <AnimatedCounter value={99.4} suffix="%" decimals={1} duration={1300} />
              </div>
              <div className="text-xs font-bold text-white/80 mt-0.5">Freshness Guarantee</div>
            </GlassCard>
          </div>
        </div>

        {/* Interactive Feature Deep Dive */}
        <section id="features-section" className="mt-16 md:mt-24">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              An Integrated Agricultural Ecosystem
            </h2>
            <p className="text-xs sm:text-sm text-white/80 mt-1 font-medium">
              Everything required to plan, diagnose, harvest, and sell produce with high precision.
            </p>
          </div>

          <GlassCard variant="elevated" className="p-6 sm:p-8">
            {/* Interactive Feature Tabs */}
            <div className="flex items-center justify-center gap-2 p-1.5 rounded-2xl bg-black/40 max-w-md mx-auto mb-8 border border-white/20">
              <button
                onClick={() => setActiveFeatureTab('farmer')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeFeatureTab === 'farmer'
                    ? 'bg-white/25 text-white border border-white/40 shadow-md'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Farmer Suite
              </button>
              <button
                onClick={() => setActiveFeatureTab('customer')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeFeatureTab === 'customer'
                    ? 'bg-white/25 text-white border border-white/40 shadow-md'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Direct Market
              </button>
              <button
                onClick={() => setActiveFeatureTab('ai')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeFeatureTab === 'ai'
                    ? 'bg-white/25 text-white border border-white/40 shadow-md'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                AI Diagnostics
              </button>
            </div>

            {/* Tab Content Display */}
            {activeFeatureTab === 'farmer' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-200">
                <div className="p-5 rounded-2xl glass-surface-subtle border border-white/20">
                  <div className="w-10 h-10 rounded-xl bg-white/15 text-white flex items-center justify-center mb-3 border border-white/20">
                    <Sprout className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Crop & Soil Intelligence</h3>
                  <p className="text-xs text-white/80 mt-1 leading-relaxed">
                    Compute NPK balance, moisture requirements, and seasonal sowing schedules tailored to local soil conditions.
                  </p>
                </div>
                <div className="p-5 rounded-2xl glass-surface-subtle border border-white/20">
                  <div className="w-10 h-10 rounded-xl bg-white/15 text-white flex items-center justify-center mb-3 border border-white/20">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">APMC Mandi Rate Tracker</h3>
                  <p className="text-xs text-white/80 mt-1 leading-relaxed">
                    Live pricing trends across Gujarat and national mandis so you always sell at the peak market rate.
                  </p>
                </div>
                <div className="p-5 rounded-2xl glass-surface-subtle border border-white/20">
                  <div className="w-10 h-10 rounded-xl bg-white/15 text-white flex items-center justify-center mb-3 border border-white/20">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Task Execution Assistant</h3>
                  <p className="text-xs text-white/80 mt-1 leading-relaxed">
                    Daily task calendar ensuring optimal irrigation, fertilizer application, and disease prevention.
                  </p>
                </div>
              </div>
            )}

            {activeFeatureTab === 'customer' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-200">
                <div className="p-5 rounded-2xl glass-surface-subtle border border-white/20">
                  <div className="w-10 h-10 rounded-xl bg-white/15 text-white flex items-center justify-center mb-3 border border-white/20">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Direct From Verified Farmers</h3>
                  <p className="text-xs text-white/80 mt-1 leading-relaxed">
                    Know exactly which local farmer grew your tomatoes, potatoes, or wheat with full batch transparency.
                  </p>
                </div>
                <div className="p-5 rounded-2xl glass-surface-subtle border border-white/20">
                  <div className="w-10 h-10 rounded-xl bg-white/15 text-white flex items-center justify-center mb-3 border border-white/20">
                    <Truck className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Harvest-to-Doorstep Dispatch</h3>
                  <p className="text-xs text-white/80 mt-1 leading-relaxed">
                    Harvested fresh on order day and dispatched within hours for peak nutritional density.
                  </p>
                </div>
                <div className="p-5 rounded-2xl glass-surface-subtle border border-white/20">
                  <div className="w-10 h-10 rounded-xl bg-white/15 text-white flex items-center justify-center mb-3 border border-white/20">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Certified Residue-Free</h3>
                  <p className="text-xs text-white/80 mt-1 leading-relaxed">
                    Strict organic standards, neem-based bio pest control, and verified soil health reports.
                  </p>
                </div>
              </div>
            )}

            {activeFeatureTab === 'ai' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-200">
                <div className="p-5 rounded-2xl glass-surface-subtle border border-white/20">
                  <div className="w-10 h-10 rounded-xl bg-white/15 text-white flex items-center justify-center mb-3 border border-white/20">
                    <ScanEye className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Instant Foliage Health Scan</h3>
                  <p className="text-xs text-white/80 mt-1 leading-relaxed">
                    Upload leaf photos for real-time computer vision detection of fungal, bacterial, or nutrient deficiency signs.
                  </p>
                </div>
                <div className="p-5 rounded-2xl glass-surface-subtle border border-white/20">
                  <div className="w-10 h-10 rounded-xl bg-white/15 text-white flex items-center justify-center mb-3 border border-white/20">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Biological Remedies</h3>
                  <p className="text-xs text-white/80 mt-1 leading-relaxed">
                    Organic-first spray formulations, dosage calculations, and recovery timetables to protect crops naturally.
                  </p>
                </div>
                <div className="p-5 rounded-2xl glass-surface-subtle border border-white/20">
                  <div className="w-10 h-10 rounded-xl bg-white/15 text-white flex items-center justify-center mb-3 border border-white/20">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Confidence Scoring</h3>
                  <p className="text-xs text-white/80 mt-1 leading-relaxed">
                    Deep neural net confidence breakdown with visual lesion highlighting for actionable field decisions.
                  </p>
                </div>
              </div>
            )}
          </GlassCard>
        </section>
      </main>

      {/* Clean Glass Footer */}
      <footer className="w-full py-8 text-center text-xs text-white/70 border-t border-white/20 mt-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-white">
            <Sprout className="w-4 h-4 text-white" />
            <span>AgriSetu © 2026. Empowering Indian Agriculture.</span>
          </div>
          <div className="text-white/80 font-medium">
            Smart Farming • AI Vision • Direct Marketplace
          </div>
        </div>
      </footer>
    </div>
  );
};
