import React, { useState } from 'react';
import { useRouter } from '../../lib/router';
import { useAuth } from '../../lib/auth';
import { FarmerSidebar } from '../../components/layout/FarmerSidebar';
import { GlassCard } from '../../components/common/GlassCard';
import { GlassButton } from '../../components/common/GlassButton';
import { AnimatedCounter } from '../../components/common/AnimatedCounter';
import {
  Sprout,
  Trees,
  Clock,
  ShoppingBag,
  CloudSun,
  TrendingUp,
  Droplets,
  ScanEye,
  MapPin,
  ChevronRight,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';
import {
  MOCK_WEATHER,
  MOCK_MARKET_PRICES,
  MOCK_TODAYS_TASKS,
  MOCK_CROPS_DATASET
} from '../../lib/mock-data';
import { UserProfileModal } from '../../components/common/UserProfileModal';

export const FarmerDashboardPage: React.FC = () => {
  const { navigate } = useRouter();
  const { user } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  // Interactive task completion state
  const [tasks, setTasks] = useState(MOCK_TODAYS_TASKS);
  const [activeCropIndex, setActiveCropIndex] = useState(0);

  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.length - completedCount;

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const selectedCropPrice = MOCK_MARKET_PRICES[activeCropIndex % MOCK_MARKET_PRICES.length];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <FarmerSidebar />

      {/* Main Dashboard Space */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Top Header Card: Farmer Profile & Greeting */}
        <GlassCard variant="elevated" className="p-6 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div
            onClick={() => setProfileOpen(true)}
            className="flex items-center gap-4 cursor-pointer group"
            title="Click to view & edit farmer profile"
          >
            <div className="relative">
              <img
                src={user?.avatar || '/images/farmer-portrait.jpg'}
                alt="Farmer Avatar"
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-white/30 shadow-lg group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-white text-[10px] font-bold">
                ✓
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white bg-white/15 px-2.5 py-0.5 rounded-full border border-white/30">
                  Organic Certified Farm
                </span>
                <span className="text-xs text-white/80 font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-white" />
                  {user?.location || 'Surat, Gujarat'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1 group-hover:underline">
                Namaste, {user?.name?.split(' ')[0] || 'Rudra'}!
              </h1>
              <p className="text-xs text-white/80 font-medium">
                {pendingCount > 0
                  ? `You have ${pendingCount} high-priority field actions remaining today.`
                  : 'All scheduled field actions for today are complete!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-stretch md:self-auto justify-end">
            <GlassButton
              variant="primary"
              size="sm"
              onClick={() => navigate('/farmer/crop-health')}
              icon={<ScanEye className="w-4 h-4 text-white" />}
            >
              Scan Crop
            </GlassButton>
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={() => navigate('/farmer/list-crop')}
              icon={<ShoppingBag className="w-4 h-4 text-white" />}
            >
              Sell Crop
            </GlassButton>
          </div>
        </GlassCard>

        {/* 4 Animated Stat Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassCard
            variant="interactive"
            onClick={() => navigate('/farmer/farm-crop-setup')}
            className="p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                Active Crops
              </span>
              <div className="w-8 h-8 rounded-xl bg-white/15 text-white flex items-center justify-center border border-white/25">
                <Sprout className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-3xl font-black text-white tracking-tight">
              <AnimatedCounter value={5} duration={800} />
            </div>
            <div className="text-[11px] text-white/90 font-bold mt-1">
              All 5 plots healthy
            </div>
          </GlassCard>

          <GlassCard
            variant="interactive"
            onClick={() => navigate('/farmer/farm-crop-setup')}
            className="p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                Acreage
              </span>
              <div className="w-8 h-8 rounded-xl bg-white/15 text-white flex items-center justify-center border border-white/25">
                <Trees className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-3xl font-black text-white tracking-tight">
              <AnimatedCounter value={12.5} decimals={1} duration={900} />
            </div>
            <div className="text-[11px] text-white/80 font-bold mt-1">
              Acres Drip Irrigated
            </div>
          </GlassCard>

          <GlassCard
            variant="interactive"
            onClick={() => navigate('/farmer/todays-instructions')}
            className="p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                Today's Tasks
              </span>
              <div className="w-8 h-8 rounded-xl bg-white/15 text-white flex items-center justify-center border border-white/25">
                <Clock className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-3xl font-black text-white tracking-tight">
              {pendingCount} <span className="text-xs font-semibold text-white/70">/ {tasks.length}</span>
            </div>
            <div className="text-[11px] text-white/90 font-bold mt-1">
              {completedCount} Completed
            </div>
          </GlassCard>

          <GlassCard
            variant="interactive"
            onClick={() => navigate('/farmer/list-crop')}
            className="p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                Direct Orders
              </span>
              <div className="w-8 h-8 rounded-xl bg-white/15 text-white flex items-center justify-center border border-white/25">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-3xl font-black text-white tracking-tight">
              <AnimatedCounter value={3} duration={600} />
            </div>
            <div className="text-[11px] text-white/90 font-bold mt-1">
              Ready for dispatch
            </div>
          </GlassCard>
        </div>

        {/* Middle Section: Weather & Mandi Live Rates */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* WEATHER TODAY */}
          <GlassCard variant="elevated" className="lg:col-span-5 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <CloudSun className="w-4 h-4 text-white" />
                  Live Agro-Weather
                </span>
                <span className="text-[11px] font-bold text-white bg-white/15 px-2.5 py-0.5 rounded-full border border-white/30">
                  Surat Field Sensor
                </span>
              </div>

              <div className="flex items-center justify-between my-2">
                <div>
                  <div className="text-4xl font-black text-white tracking-tight">
                    <AnimatedCounter value={MOCK_WEATHER.temperature} suffix="°C" duration={700} />
                  </div>
                  <div className="text-xs font-bold text-white/80 mt-1">
                    {MOCK_WEATHER.condition} • Soil Moisture {MOCK_WEATHER.soilMoisture}%
                  </div>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white/15 text-white flex items-center justify-center border border-white/30 shadow-xs">
                  <CloudSun className="w-9 h-9" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-4 border-t border-white/20 text-xs">
                <div className="p-2.5 rounded-xl glass-surface-subtle border border-white/20">
                  <span className="text-[10px] font-bold text-white/70 block">Humidity</span>
                  <span className="font-extrabold text-white">{MOCK_WEATHER.humidity}%</span>
                </div>
                <div className="p-2.5 rounded-xl glass-surface-subtle border border-white/20">
                  <span className="text-[10px] font-bold text-white/70 block">Wind Speed</span>
                  <span className="font-extrabold text-white">{MOCK_WEATHER.windSpeed} km/h</span>
                </div>
                <div className="p-2.5 rounded-xl glass-surface-subtle border border-white/20">
                  <span className="text-[10px] font-bold text-white/70 block">Rain Probability</span>
                  <span className="font-extrabold text-white">{MOCK_WEATHER.rainChance}%</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/farmer/weather-advisory')}
              className="mt-5 text-xs font-bold text-white hover:text-white/80 flex items-center justify-between pt-3 border-t border-white/20 cursor-pointer group"
            >
              <span>View 5-Day Precision Farming Advisory</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-white" />
            </button>
          </GlassCard>

          {/* APMC MANDI PRICE TICKER & SPARKLINE */}
          <GlassCard variant="elevated" className="lg:col-span-7 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-white" />
                  Mandi Commodity Rates
                </span>
                {/* Crop Quick Switcher */}
                <div className="flex items-center gap-1">
                  {MOCK_MARKET_PRICES.slice(0, 3).map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveCropIndex(idx)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                        activeCropIndex === idx
                          ? 'bg-white/25 text-white shadow-md border border-white/40'
                          : 'bg-black/30 text-white/70 hover:text-white border border-white/20'
                      }`}
                    >
                      {item.cropName}
                    </button>
                  ))}
                </div>
              </div>

              <div className="my-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-base font-extrabold text-white">
                    {selectedCropPrice.cropName} <span className="text-xs font-normal text-white/70">({selectedCropPrice.marketLocation || selectedCropPrice.mandiLocation})</span>
                  </span>
                  <span className="text-xs font-extrabold text-white bg-white/20 border border-white/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5 text-white" />
                    +{selectedCropPrice.trendPercentage}%
                  </span>
                </div>
                <div className="text-3xl font-black text-white tracking-tight mt-1">
                  ₹{selectedCropPrice.currentPrice.toLocaleString('en-IN')}{' '}
                  <span className="text-xs font-bold text-white/70">/ Quintal</span>
                </div>
                <p className="text-xs text-white/80 font-medium mt-0.5">
                  Updated {selectedCropPrice.lastUpdated}. High regional procurement demand.
                </p>
              </div>

              {/* Interactive SVG Sparkline Chart */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-[11px] text-white/80 mb-1.5 font-bold">
                  <span>7-Day APMC Price Trend</span>
                  <span className="text-white">Bullish Movement</span>
                </div>
                <div className="flex items-end gap-2 h-14 pt-2 bg-black/30 rounded-2xl p-2.5 border border-white/20">
                  {selectedCropPrice.priceHistory.map((item, idx) => {
                    const minP = Math.min(...selectedCropPrice.priceHistory.map(p => p.price));
                    const maxP = Math.max(...selectedCropPrice.priceHistory.map(p => p.price));
                    const heightPercent = Math.max(20, Math.min(100, ((item.price - minP + 50) / (maxP - minP + 100)) * 100));

                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center gap-1 group/bar relative"
                      >
                        <div
                          className="w-full bg-white/40 hover:bg-white/70 rounded-t-lg transition-all cursor-pointer shadow-xs border-t border-x border-white/50"
                          style={{ height: `${heightPercent}%` }}
                        />
                        <span className="text-[9px] font-bold text-white/80">{item.day}</span>
                        {/* Tooltip on hover */}
                        <div className="absolute -top-7 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-black/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg border border-white/30 pointer-events-none whitespace-nowrap z-10">
                          ₹{item.price}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/farmer/market-price')}
              className="mt-5 text-xs font-bold text-white hover:text-white/80 flex items-center justify-between pt-3 border-t border-white/20 cursor-pointer group"
            >
              <span>Explore All National Commodity Rates</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-white" />
            </button>
          </GlassCard>
        </div>

        {/* Bottom Split: Live Interactive Tasks & Registered Crops Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* INTERACTIVE LIVE TASKS */}
          <GlassCard variant="elevated" className="lg:col-span-6 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-white" />
                Today's Field Tasks
              </span>
              <button
                onClick={() => navigate('/farmer/todays-instructions')}
                className="text-xs font-bold text-white hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            {/* Task Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs font-bold text-white/90 mb-1">
                <span>Completion Status</span>
                <span>{Math.round((completedCount / tasks.length) * 100)}%</span>
              </div>
              <div className="w-full bg-black/30 rounded-full h-2.5 overflow-hidden border border-white/20">
                <div
                  className="bg-white/80 h-full rounded-full transition-all duration-300 shadow-sm"
                  style={{ width: `${(completedCount / tasks.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Interactive Checkbox Items */}
            <div className="space-y-2.5">
              {tasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    task.completed
                      ? 'bg-white/5 border-white/10 opacity-70'
                      : 'bg-white/10 border-white/25 hover:border-white/50 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors ${
                      task.completed ? 'bg-white text-black font-black' : 'border border-white/40 text-transparent'
                    }`}>
                      ✓
                    </div>
                    <div className="min-w-0">
                      <div className={`text-xs font-bold truncate ${task.completed ? 'line-through text-white/50' : 'text-white'}`}>
                        {task.task}
                      </div>
                      <div className="text-[10px] text-white/70 flex items-center gap-1.5">
                        <span className="font-semibold text-white">{task.crop}</span>
                        <span>•</span>
                        <span>{task.timeSlot}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                    task.priority === 'High' ? 'bg-rose-950/80 text-white border border-rose-400/40' : 'bg-white/15 text-white border border-white/20'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* ACTIVE CROPS LIST */}
          <GlassCard variant="elevated" className="lg:col-span-6 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Sprout className="w-4 h-4 text-white" />
                Active Field Plots
              </span>
              <button
                onClick={() => navigate('/farmer/farm-crop-setup')}
                className="text-xs font-bold text-white hover:underline cursor-pointer"
              >
                Configure Plots
              </button>
            </div>

            <div className="space-y-3">
              {MOCK_CROPS_DATASET.slice(0, 3).map((crop) => (
                <div
                  key={crop.id}
                  onClick={() => navigate('/farmer/farm-crop-setup')}
                  className="p-3.5 rounded-2xl glass-surface-subtle hover:border-white/50 border border-white/20 flex items-center justify-between cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={crop.imageUrl}
                      alt={crop.name}
                      className="w-12 h-12 rounded-xl object-cover border border-white/30"
                    />
                    <div>
                      <div className="text-xs font-bold text-white group-hover:underline transition-colors">
                        {crop.name} <span className="text-white/70 font-normal">({crop.variety})</span>
                      </div>
                      <div className="text-[11px] text-white/80 flex items-center gap-2 mt-0.5">
                        <span>{crop.area} Acres</span>
                        <span>•</span>
                        <span className="text-white font-bold">{crop.cropHealthPercentage}% Health</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-white block">
                      {crop.production} Qtl Est.
                    </span>
                    <span className="text-[10px] text-white/70 font-medium">
                      Harvest in {crop.harvestMonth}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </main>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </div>
  );
};
