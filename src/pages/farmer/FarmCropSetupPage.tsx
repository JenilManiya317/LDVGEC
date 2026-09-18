import React, { useState } from 'react';
import { useRouter } from '../../lib/router';
import { FarmerSidebar } from '../../components/layout/FarmerSidebar';
import { GlassCard } from '../../components/common/GlassCard';
import { GlassButton } from '../../components/common/GlassButton';
import { Sprout, Check, ArrowRight, ArrowLeft, Trees, Sparkles, CheckCircle2, ShieldCheck, Droplets } from 'lucide-react';

export const FarmCropSetupPage: React.FC = () => {
  const { navigate } = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states based on agricultural dataset parameters
  const [farmData, setFarmData] = useState({
    farmName: 'Patel Organic Farms',
    totalArea: '12.5',
    state: 'Gujarat',
    district: 'Surat',
    soilType: 'Loamy Alluvial Soil',
    irrigationType: 'Drip Micro-irrigation',
    location: 'Navsari Road, Surat rural'
  });

  const [cropData, setCropData] = useState({
    crop: 'Tomato',
    variety: 'Abhinav Hybrid (F1)',
    season: 'Kharif',
    sowingDate: '2026-06-15',
    expectedHarvestDate: '2026-11-20',
    area: '3.5',
    soilPh: '6.8',
    moistureTarget: '72'
  });

  const areaNum = parseFloat(cropData.area) || 3.5;
  const estYieldQtl = (areaNum * 24.2).toFixed(1);
  const waterReqLitres = Math.round(areaNum * 2200);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => {
      navigate('/farmer/dashboard');
    }, 1500);
  };

  return (
    <div className="flex min-h-screen text-white">
      <FarmerSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Farm & Crop Configuration
            </h1>
            <p className="text-xs sm:text-sm text-white/80 font-medium">
              Configure land plots, precision soil attributes, and compute projected yields.
            </p>
          </div>
          <button
            onClick={() => navigate('/farmer/dashboard')}
            className="text-xs font-bold text-white hover:text-white glass-surface px-3 py-1.5 rounded-xl border border-white/20 cursor-pointer"
          >
            Cancel
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { num: 1, title: '1. Farm Profile' },
            { num: 2, title: '2. Crop & Soil' },
            { num: 3, title: '3. Verification' }
          ].map((s) => (
            <div
              key={s.num}
              className={`p-3 rounded-2xl glass-surface text-center border transition-all ${step === s.num
                  ? 'border-white bg-white text-slate-950 shadow-md font-extrabold'
                  : step > s.num
                    ? 'border-white/40 text-white'
                    : 'border-white/20 text-white/50'
                }`}
            >
              <span className="text-xs font-bold">
                {step > s.num ? '✓ ' : ''}{s.title}
              </span>
            </div>
          ))}
        </div>

        {/* STEP 1: FARM DETAILS */}
        {step === 1 && (
          <GlassCard variant="elevated" className="p-6 sm:p-8 space-y-6 animate-in fade-in duration-200 border border-white/20">
            <h3 className="text-lg font-black text-white">Farm Infrastructure</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-white/80 mb-1">Farm / Estate Name</label>
                <input
                  type="text"
                  value={farmData.farmName}
                  onChange={(e) => setFarmData({ ...farmData, farmName: e.target.value })}
                  className="w-full glass-input px-4 py-2.5 rounded-2xl text-xs font-bold text-white placeholder-white/60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/80 mb-1">Total Land Area (Acres)</label>
                <input
                  type="number"
                  step="0.1"
                  value={farmData.totalArea}
                  onChange={(e) => setFarmData({ ...farmData, totalArea: e.target.value })}
                  className="w-full glass-input px-4 py-2.5 rounded-2xl text-xs font-bold text-white placeholder-white/60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/80 mb-1">State & Region</label>
                <input
                  type="text"
                  value={farmData.state}
                  onChange={(e) => setFarmData({ ...farmData, state: e.target.value })}
                  className="w-full glass-input px-4 py-2.5 rounded-2xl text-xs font-bold text-white placeholder-white/60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/80 mb-1">District / Mandi Zone</label>
                <input
                  type="text"
                  value={farmData.district}
                  onChange={(e) => setFarmData({ ...farmData, district: e.target.value })}
                  className="w-full glass-input px-4 py-2.5 rounded-2xl text-xs font-bold text-white placeholder-white/60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/80 mb-1">Primary Soil Classification</label>
                <select
                  value={farmData.soilType}
                  onChange={(e) => setFarmData({ ...farmData, soilType: e.target.value })}
                  className="w-full glass-input px-4 py-2.5 rounded-2xl text-xs font-bold cursor-pointer text-white bg-slate-900"
                >
                  <option value="Loamy Alluvial Soil" className="bg-slate-900 text-white">Loamy Alluvial Soil</option>
                  <option value="Black Cotton Soil (Vertisol)" className="bg-slate-900 text-white">Black Cotton Soil (Vertisol)</option>
                  <option value="Red Laterite Soil" className="bg-slate-900 text-white">Red Laterite Soil</option>
                  <option value="Sandy Loam" className="bg-slate-900 text-white">Sandy Loam</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/80 mb-1">Irrigation Method</label>
                <select
                  value={farmData.irrigationType}
                  onChange={(e) => setFarmData({ ...farmData, irrigationType: e.target.value })}
                  className="w-full glass-input px-4 py-2.5 rounded-2xl text-xs font-bold cursor-pointer text-white bg-slate-900"
                >
                  <option value="Drip Micro-irrigation" className="bg-slate-900 text-white">Drip Micro-irrigation (90% Efficiency)</option>
                  <option value="Sprinkler System" className="bg-slate-900 text-white">Sprinkler System</option>
                  <option value="Furrow Canal Irrigation" className="bg-slate-900 text-white">Furrow Canal Irrigation</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/15">
              <GlassButton
                variant="primary"
                onClick={() => setStep(2)}
                icon={<ArrowRight className="w-4 h-4 text-white" />}
              >
                Continue to Crop Details
              </GlassButton>
            </div>
          </GlassCard>
        )}

        {/* STEP 2: CROP & SOIL CALCULATION */}
        {step === 2 && (
          <GlassCard variant="elevated" className="p-6 sm:p-8 space-y-6 animate-in fade-in duration-200 border border-white/20">
            <h3 className="text-lg font-black text-white">Active Crop Parameters</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-white/80 mb-1">Crop Type</label>
                <select
                  value={cropData.crop}
                  onChange={(e) => setCropData({ ...cropData, crop: e.target.value })}
                  className="w-full glass-input px-4 py-2.5 rounded-2xl text-xs font-bold cursor-pointer text-white bg-slate-900"
                >
                  <option value="Tomato" className="bg-slate-900 text-white">Tomato (Hybrid F1)</option>
                  <option value="Potato" className="bg-slate-900 text-white">Potato (Kufri Jyoti)</option>
                  <option value="Wheat" className="bg-slate-900 text-white">Wheat (Sharbati Golden)</option>
                  <option value="Cotton" className="bg-slate-900 text-white">Cotton (Bt Certified)</option>
                  <option value="Onion" className="bg-slate-900 text-white">Red Onion (Nashik Special)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/80 mb-1">Cultivated Plot Area (Acres)</label>
                <input
                  type="number"
                  step="0.1"
                  value={cropData.area}
                  onChange={(e) => setCropData({ ...cropData, area: e.target.value })}
                  className="w-full glass-input px-4 py-2.5 rounded-2xl text-xs font-bold text-white placeholder-white/60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/80 mb-1">Sowing Date</label>
                <input
                  type="date"
                  value={cropData.sowingDate}
                  onChange={(e) => setCropData({ ...cropData, sowingDate: e.target.value })}
                  className="w-full glass-input px-4 py-2.5 rounded-2xl text-xs font-bold text-white placeholder-white/60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/80 mb-1">Target Soil pH</label>
                <input
                  type="number"
                  step="0.1"
                  value={cropData.soilPh}
                  onChange={(e) => setCropData({ ...cropData, soilPh: e.target.value })}
                  className="w-full glass-input px-4 py-2.5 rounded-2xl text-xs font-bold text-white placeholder-white/60"
                />
              </div>
            </div>

            {/* Live Real-time Agricultural Calculations Card */}
            <div className="p-4 rounded-2xl glass-surface border border-white/20">
              <span className="text-xs font-bold text-white block mb-2">
                Live Precision Agricultural Projections
              </span>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2.5 rounded-xl glass-surface-subtle">
                  <span className="text-[10px] text-white/70 font-bold block">Estimated Production</span>
                  <span className="text-sm font-black text-white">{estYieldQtl} Quintals</span>
                </div>
                <div className="p-2.5 rounded-xl glass-surface-subtle">
                  <span className="text-[10px] text-white/70 font-bold block">Weekly Water Demand</span>
                  <span className="text-sm font-black text-white">{waterReqLitres.toLocaleString()} L</span>
                </div>
                <div className="p-2.5 rounded-xl glass-surface-subtle">
                  <span className="text-[10px] text-white/70 font-bold block">NPK Requirement</span>
                  <span className="text-sm font-black text-white">19:19:19 + Vermi</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-white/15">
              <GlassButton
                variant="outline"
                onClick={() => setStep(1)}
                icon={<ArrowLeft className="w-4 h-4 text-white" />}
              >
                Back
              </GlassButton>
              <GlassButton
                variant="primary"
                onClick={() => setStep(3)}
                icon={<ArrowRight className="w-4 h-4 text-white" />}
              >
                Review & Confirm
              </GlassButton>
            </div>
          </GlassCard>
        )}

        {/* STEP 3: REVIEW & CONFIRM */}
        {step === 3 && (
          <GlassCard variant="elevated" className="p-6 sm:p-8 space-y-6 animate-in fade-in duration-200 border border-white/20">
            <h3 className="text-lg font-black text-white">Review & Save Configuration</h3>

            {savedSuccess ? (
              <div className="p-6 rounded-2xl glass-surface border border-white text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-white text-slate-950 flex items-center justify-center mx-auto shadow-md font-black">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">Field Configuration Saved!</h4>
                <p className="text-xs text-white/80">Redirecting to Farmer Dashboard...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl glass-surface-subtle border border-white/20 space-y-2">
                    <span className="text-[10px] font-bold uppercase text-white block">Farm Details</span>
                    <div className="flex justify-between"><span className="text-white/70">Name:</span> <span className="font-bold text-white">{farmData.farmName}</span></div>
                    <div className="flex justify-between"><span className="text-white/70">Location:</span> <span className="font-bold text-white">{farmData.district}, {farmData.state}</span></div>
                    <div className="flex justify-between"><span className="text-white/70">Soil:</span> <span className="font-bold text-white">{farmData.soilType}</span></div>
                  </div>

                  <div className="p-4 rounded-2xl glass-surface-subtle border border-white/20 space-y-2">
                    <span className="text-[10px] font-bold uppercase text-white block">Crop Parameters</span>
                    <div className="flex justify-between"><span className="text-white/70">Crop:</span> <span className="font-bold text-white">{cropData.crop} ({cropData.area} Acres)</span></div>
                    <div className="flex justify-between"><span className="text-white/70">Expected Yield:</span> <span className="font-bold text-white">{estYieldQtl} Quintals</span></div>
                    <div className="flex justify-between"><span className="text-white/70">Soil pH Target:</span> <span className="font-bold text-white">{cropData.soilPh} (Neutral)</span></div>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-white/15">
                  <GlassButton
                    variant="outline"
                    onClick={() => setStep(2)}
                    icon={<ArrowLeft className="w-4 h-4 text-white" />}
                  >
                    Back
                  </GlassButton>
                  <GlassButton
                    variant="primary"
                    onClick={handleSave}
                    icon={<CheckCircle2 className="w-4 h-4 text-white" />}
                  >
                    Confirm & Save Crop Plot
                  </GlassButton>
                </div>
              </>
            )}
          </GlassCard>
        )}
      </main>
    </div>
  );
};
