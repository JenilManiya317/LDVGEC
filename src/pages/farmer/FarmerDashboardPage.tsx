import React, { useState, useEffect } from 'react';
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
  ArrowUpRight,
  Navigation,
  RefreshCw,
  Cpu,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import {
  MOCK_WEATHER,
  MOCK_MARKET_PRICES,
  MOCK_TODAYS_TASKS,
  MOCK_CROPS_DATASET
} from '../../lib/mock-data';
import { UserProfileModal } from '../../components/common/UserProfileModal';
import { api } from '../../lib/api';
import { predictYieldLocally, formatBackendYieldPrediction, YieldPredictionOutput } from '../../lib/ml';

export const FarmerDashboardPage: React.FC = () => {
  const { navigate } = useRouter();
  const { user } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const [weather, setWeather] = useState(MOCK_WEATHER);
  const [weatherLocation, setWeatherLocation] = useState(user?.location || 'Surat, Gujarat');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [marketPrices, setMarketPrices] = useState(MOCK_MARKET_PRICES);

  // Live Backend & AI Prediction status
  const [backendStatus, setBackendStatus] = useState<{ online: boolean; model: string }>({
    online: true,
    model: 'RandomForest ML Pipeline',
  });
  const [simCrop, setSimCrop] = useState('Tomato');
  const [simArea, setSimArea] = useState(3.5);
  const [isSimPredicting, setIsSimPredicting] = useState(false);
  const [simPrediction, setSimPrediction] = useState<YieldPredictionOutput>(() =>
    predictYieldLocally({
      crop: 'Tomato',
      season: 'Kharif',
      state: 'Gujarat',
      areaAcres: 3.5,
      soilPh: 6.8,
      soilMoisture: 65,
    })
  );

  // Interactive task completion state
  const [tasks, setTasks] = useState(MOCK_TODAYS_TASKS);
  const [activeCropIndex, setActiveCropIndex] = useState(0);


  const fetchWeather = async (lat?: number, lon?: number) => {
    try {
      let state = 'Gujarat';
      let location = 'Surat';
      if (user?.location) {
        const parts = user.location.split(',');
        if (parts.length > 1) {
          location = parts[0].trim();
          state = parts[1].trim();
        } else {
          location = user.location.trim();
        }
      }

      const wRes = await api.weather.current(state, location, lat, lon);
      if (wRes.data) {
        setWeather(prev => ({
          ...prev,
          temperature: wRes.data.temperature ?? prev.temperature,
          condition: wRes.data.condition || prev.condition,
          humidity: wRes.data.humidity ?? prev.humidity,
          windSpeed: wRes.data.windSpeed ?? prev.windSpeed,
          rainChance: wRes.data.rainChance ?? prev.rainChance,
          soilMoisture: wRes.data.soilMoisture ?? prev.soilMoisture,
          soilTemperature: wRes.data.soilTemperature ?? prev.soilTemperature,
          evapotranspiration: wRes.data.evapotranspiration ?? prev.evapotranspiration,
        }));
        if (wRes.data.location) {
          setWeatherLocation(wRes.data.location);
        }
      }
    } catch (err) {
      console.warn('Dashboard weather fetch error:', err);
    }
  };

  const handleGpsDetect = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setIsGpsActive(true);
        setGpsLoading(false);
        await fetchWeather(lat, lon);
      },
      () => {
        setGpsLoading(false);
      },
      { timeout: 8000 }
    );
  };

  const fetchSimPrediction = async (crop: string, area: number) => {
    setIsSimPredicting(true);
    try {
      const res = await api.predict.yield({
        Crop: crop,
        Season: 'Kharif',
        State: user?.location?.split(',')[1]?.trim() || 'Gujarat',
        Area: Math.max(0.1, area) * 0.404686,
        Annual_Rainfall: 1000,
        Fertilizer: area * 120,
        Pesticide: area * 15,
        Temperature_C: weather.temperature || 28,
        Humidity_Percent: weather.humidity || 65,
        Soil_Type: 'Loamy',
        Soil_pH: 6.8,
        Soil_Moisture_Percent: weather.soilMoisture || 60,
        Irrigation_Type: 'Drip',
      });

      if (res.data?.predicted_yield !== undefined) {
        const formatted = formatBackendYieldPrediction(res.data, area, crop);
        setSimPrediction(formatted);
        setBackendStatus({ online: true, model: res.data.model_used || 'RandomForest Regressor' });
      } else {
        const local = predictYieldLocally({
          crop,
          season: 'Kharif',
          state: 'Gujarat',
          areaAcres: area,
          soilPh: 6.8,
          soilMoisture: weather.soilMoisture || 60,
          irrigationType: 'Drip',
        });
        setSimPrediction(local);
      }
    } catch (err) {
      console.warn('Dashboard simulation fallback to local:', err);
      const local = predictYieldLocally({
        crop,
        season: 'Kharif',
        state: 'Gujarat',
        areaAcres: area,
        soilPh: 6.8,
        soilMoisture: weather.soilMoisture || 60,
        irrigationType: 'Drip',
      });
      setSimPrediction(local);
      setBackendStatus({ online: false, model: 'Edge Agronomic Engine' });
    } finally {
      setIsSimPredicting(false);
    }
  };

  useEffect(() => {
    fetchSimPrediction(simCrop, simArea);
  }, [simCrop, simArea]);

  useEffect(() => {
    let isCancelled = false;
    const fetchDashboardData = async () => {
      try {
        await fetchWeather();
        const [mRes, modelInfoRes] = await Promise.all([
          api.market.prices('', 10),
          api.predict.modelInfo()
        ]);

        if (!isCancelled) {
          if (mRes.data?.prices && mRes.data.prices.length > 0) {
            setMarketPrices(mRes.data.prices);
          }
          if (modelInfoRes.data?.model_name) {
            setBackendStatus({
              online: true,
              model: `${modelInfoRes.data.model_name} Pipeline`,
            });
          }
        }
      } catch (err) {
        console.warn('Dashboard backend telemetry fallback:', err);
      }
    };

    fetchDashboardData();
    return () => {
      isCancelled = true;
    };
  }, [user?.location]);



  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.length - completedCount;

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const selectedCropPrice = marketPrices[activeCropIndex % marketPrices.length] || MOCK_MARKET_PRICES[0];

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
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-white bg-white/15 px-2.5 py-0.5 rounded-full border border-white/30">
                  Organic Certified Farm
                </span>
                <span className="text-xs text-white/80 font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-white" />
                  {user?.location || 'Surat, Gujarat'}
                </span>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                  backendStatus.online
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${backendStatus.online ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
                  {backendStatus.model}
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

        {/* INTERACTIVE AI CROP YIELD & MARKET SIMULATOR */}
        <GlassCard variant="elevated" className="p-6 border border-white/20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/15">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-amber-300" />
                  Live AI Yield & Revenue Simulator
                </span>
                <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded-full text-white font-bold border border-white/20">
                  Real-time ML Model Inference
                </span>
              </div>
              <h3 className="text-lg font-black text-white mt-0.5">
                Multi-Feature Agronomic Harvest Predictor
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-extrabold px-3 py-1 rounded-xl border flex items-center gap-1.5 ${
                isSimPredicting
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
              }`}>
                <Sparkles className={`w-3.5 h-3.5 ${isSimPredicting ? 'animate-spin text-amber-300' : 'text-emerald-300'}`} />
                <span>{isSimPredicting ? 'Computing Inference...' : `${simPrediction.modelUsed}`}</span>
              </span>
              <GlassButton
                variant="outline"
                size="sm"
                onClick={() => navigate('/farmer/farm-crop-setup')}
                className="text-xs"
              >
                Deep Diagnostics
              </GlassButton>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Controls: Crop & Acreage */}
            <div className="lg:col-span-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-white/80 block mb-2">Select Active Crop Matrix</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {['Tomato', 'Wheat', 'Cotton', 'Rice', 'Potato'].map((crop) => (
                    <button
                      key={crop}
                      onClick={() => setSimCrop(crop)}
                      className={`px-2 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        simCrop === crop
                          ? 'bg-white text-slate-950 font-black shadow-md border-white'
                          : 'bg-black/30 text-white/80 hover:text-white border-white/20 hover:bg-white/10'
                      }`}
                    >
                      {crop}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-white mb-1">
                  <span>Cultivation Acreage</span>
                  <span className="text-emerald-300 font-black">{simArea} Acres</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="20"
                  step="0.5"
                  value={simArea}
                  onChange={(e) => setSimArea(parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer h-2 bg-black/40 rounded-lg border border-white/20"
                />
                <div className="flex justify-between text-[10px] text-white/60 font-semibold mt-1">
                  <span>0.5 Ac</span>
                  <span>5 Ac</span>
                  <span>10 Ac</span>
                  <span>20 Ac</span>
                </div>
              </div>
            </div>

            {/* Right Predictions Display */}
            <div className="lg:col-span-7 grid grid-cols-3 gap-3 text-center">
              <div className="p-4 rounded-2xl bg-black/30 border border-white/20 space-y-1">
                <span className="text-[11px] font-bold text-white/70 block">Yield Productivity</span>
                <div className="text-2xl font-black text-white">
                  <AnimatedCounter value={simPrediction.yieldPerAcreQtl} decimals={1} duration={500} />
                  <span className="text-xs font-bold text-white/70 ml-1">Qtl/Ac</span>
                </div>
                <span className="text-[10px] text-emerald-300 font-bold block">Optimized Soil Telemetry</span>
              </div>

              <div className="p-4 rounded-2xl bg-black/30 border border-white/20 space-y-1">
                <span className="text-[11px] font-bold text-white/70 block">Total Production</span>
                <div className="text-2xl font-black text-white">
                  <AnimatedCounter value={simPrediction.totalProductionQtl} decimals={1} duration={600} />
                  <span className="text-xs font-bold text-white/70 ml-1">Qtl</span>
                </div>
                <span className="text-[10px] text-white/60 block">Est. for {simArea} Acres</span>
              </div>

              <div className="p-4 rounded-2xl bg-black/30 border border-white/20 space-y-1">
                <span className="text-[11px] font-bold text-white/70 block">Projected Mandi Value</span>
                <div className="text-2xl font-black text-emerald-300">
                  ₹<AnimatedCounter value={simPrediction.estimatedRevenueInr} duration={700} />
                </div>
                <span className="text-[10px] text-white/60 block">Current APMC Spot Rates</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Middle Section: Weather & Mandi Live Rates */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* WEATHER TODAY */}
          <GlassCard variant="elevated" className="lg:col-span-5 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <CloudSun className="w-4 h-4 text-amber-300" />
                  Live Agro-Weather
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-white bg-white/15 px-2.5 py-0.5 rounded-full border border-white/30 truncate max-w-[170px]" title={weatherLocation}>
                    📍 {weatherLocation}
                  </span>
                  <button
                    onClick={handleGpsDetect}
                    disabled={gpsLoading}
                    title="Detect live GPS location"
                    className={`p-1 rounded-full border transition-all cursor-pointer ${
                      isGpsActive
                        ? 'bg-emerald-500/30 border-emerald-400/40 text-emerald-200'
                        : 'bg-white/15 border-white/30 hover:bg-white/30 text-white'
                    }`}
                  >
                    {gpsLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Navigation className={`w-3.5 h-3.5 ${isGpsActive ? 'fill-emerald-300' : ''}`} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between my-2">
                <div>
                  <div className="text-4xl font-black text-white tracking-tight">
                    <AnimatedCounter value={weather.temperature} suffix="°C" duration={700} />
                  </div>
                  <div className="text-xs font-bold text-white/80 mt-1">
                    {weather.condition} • Soil Moisture {weather.soilMoisture ?? 50}%
                  </div>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-400/30 shadow-xs">
                  <CloudSun className="w-9 h-9" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-4 border-t border-white/20 text-xs">
                <div className="p-2.5 rounded-xl glass-surface-subtle border border-white/20">
                  <span className="text-[10px] font-bold text-white/70 block">Humidity</span>
                  <span className="font-extrabold text-white">{weather.humidity}%</span>
                </div>
                <div className="p-2.5 rounded-xl glass-surface-subtle border border-white/20">
                  <span className="text-[10px] font-bold text-white/70 block">Wind Speed</span>
                  <span className="font-extrabold text-white">{weather.windSpeed} km/h</span>
                </div>
                <div className="p-2.5 rounded-xl glass-surface-subtle border border-white/20">
                  <span className="text-[10px] font-bold text-white/70 block">Rain Probability</span>
                  <span className="font-extrabold text-white">{weather.rainChance}%</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/farmer/weather-advisory')}
              className="mt-5 text-xs font-bold text-white hover:text-white/80 flex items-center justify-between pt-3 border-t border-white/20 cursor-pointer group"
            >
              <span>View 7-Day Precision Agronomic Advisory</span>
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
