import React, { useState, useEffect } from 'react';
import { useRouter } from '../../lib/router';
import { FarmerSidebar } from '../../components/layout/FarmerSidebar';
import { GlassCard } from '../../components/common/GlassCard';
import { GlassButton } from '../../components/common/GlassButton';
import { AnimatedCounter } from '../../components/common/AnimatedCounter';
import {
  CloudSun,
  Droplets,
  Wind,
  Umbrella,
  Sprout,
  AlertCircle,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { MOCK_WEATHER, MOCK_ADVISORY } from '../../lib/mock-data';
import { api } from '../../lib/api';

export const WeatherAdvisoryPage: React.FC = () => {
  const { navigate } = useRouter();
  const [activeTab, setActiveTab] = useState<'irrigation' | 'fertilizer' | 'pest' | 'harvest'>('irrigation');
  const [weatherData, setWeatherData] = useState(MOCK_WEATHER);
  const [advisoryData, setAdvisoryData] = useState(MOCK_ADVISORY);

  useEffect(() => {
    let isCancelled = false;
    const fetchWeather = async () => {
      try {
        const [currentRes, forecastRes, advRes] = await Promise.all([
          api.weather.current('Gujarat', 'Surat'),
          api.weather.forecast('Gujarat', 5),
          api.weather.advisory('Gujarat', 'Tomato', 'Kharif')
        ]);

        if (!isCancelled) {
          if (currentRes.data) {
            setWeatherData((prev) => ({
              ...prev,
              temperature: currentRes.data.temperature || prev.temperature,
              condition: currentRes.data.condition || prev.condition,
              humidity: currentRes.data.humidity ?? prev.humidity,
              windSpeed: currentRes.data.windSpeed ?? prev.windSpeed,
              rainChance: currentRes.data.rainChance ?? prev.rainChance,
              forecast: forecastRes.data?.forecast || prev.forecast,
            }));
          }
          if (advRes.data?.advisory) {
            setAdvisoryData((prev) => ({
              ...prev,
              ...advRes.data.advisory,
            }));
          }
        }
      } catch (err) {
        console.warn('Weather fetch error:', err);
      }
    };

    fetchWeather();
    return () => {
      isCancelled = true;
    };
  }, []);

  const advisory = advisoryData[activeTab] || MOCK_ADVISORY[activeTab];

  return (
    <div className="flex min-h-screen text-white">
      <FarmerSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-surface text-white text-xs font-bold mb-2 border border-white/20">
            <CloudSun className="w-3.5 h-3.5 text-white" />
            <span>Meteorological & Agronomic Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Weather & Farming Advisory
          </h1>
          <p className="text-xs sm:text-sm text-white/80 font-medium">
            Real-time agro-met telemetry and customized intervention plans.
          </p>
        </div>

        {/* WEATHER GLASS CARD */}
        <GlassCard variant="elevated" className="p-6 sm:p-8 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Primary temperature readout */}
            <div className="md:col-span-6 flex items-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-lg">
                <CloudSun className="w-12 h-12" />
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-white/80">
                  Current Field Station
                </span>
                <div className="text-5xl font-black text-white tracking-tight mt-1">
                  <AnimatedCounter value={weatherData.temperature} suffix="°C" duration={800} />
                </div>
                <div className="text-sm font-bold text-white mt-0.5">
                  {weatherData.condition}
                </div>
              </div>
            </div>

            {/* 3 Metric pills */}
            <div className="md:col-span-6 grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl glass-surface-subtle border border-white/20 text-center">
                <Droplets className="w-4 h-4 text-blue-300 mx-auto mb-1" />
                <span className="text-[11px] font-bold text-white/80 block">Humidity</span>
                <span className="text-base font-black text-white">{weatherData.humidity}%</span>
              </div>

              <div className="p-3.5 rounded-2xl glass-surface-subtle border border-white/20 text-center">
                <Wind className="w-4 h-4 text-white mx-auto mb-1" />
                <span className="text-[11px] font-bold text-white/80 block">Wind</span>
                <span className="text-base font-black text-white">{weatherData.windSpeed} km/h</span>
              </div>

              <div className="p-3.5 rounded-2xl glass-surface-subtle border border-white/20 text-center">
                <Umbrella className="w-4 h-4 text-white mx-auto mb-1" />
                <span className="text-[11px] font-bold text-white/80 block">Rain Chance</span>
                <span className="text-base font-black text-white">{weatherData.rainChance}%</span>
              </div>
            </div>
          </div>

          {/* 5-Day forecast row */}
          <div className="mt-6 pt-6 border-t border-white/15">
            <div className="text-xs font-bold text-white/80 mb-3 uppercase tracking-wider">
              5-Day Agronomic Forecast
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              {weatherData.forecast.map((f, i) => (
                <div key={i} className="p-3 rounded-2xl glass-surface-subtle border border-white/20">
                  <div className="font-bold text-white">{f.day}</div>
                  <div className="text-base font-black text-white my-1">{f.temp}°C</div>
                  <div className="text-[11px] font-medium text-white/80 truncate">{f.condition}</div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* ADVISORY CATEGORY TABS & ACTIONABLE GUIDANCE */}
        <GlassCard variant="elevated" className="p-6 sm:p-8 space-y-6 border border-white/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/15">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-white/80">
                Agronomic Recommendations
              </span>
              <h3 className="text-lg font-black text-white">
                Precision Interventions
              </h3>
            </div>

            {/* Interactive Category Selector */}
            <div className="flex items-center gap-1.5 glass-surface p-1.5 rounded-2xl border border-white/20">
              {(['irrigation', 'fertilizer', 'pest', 'harvest'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${activeTab === tab
                      ? 'bg-white text-slate-950 shadow-md font-extrabold'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Active Advisory Details */}
          <div className="p-5 rounded-2xl glass-surface-subtle border border-white/20 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-white">{advisory.title}</span>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${advisory.priority === 'High' ? 'bg-rose-950 text-rose-300 border border-rose-500/40' : 'bg-white/20 text-white border border-white/30'
                }`}>
                {advisory.priority} Priority
              </span>
            </div>

            <p className="text-xs text-white/90 leading-relaxed font-medium">
              {advisory.description}
            </p>

            <div className="p-4 rounded-2xl glass-surface border border-white/20 space-y-1.5">
              <span className="text-[11px] font-bold text-white/80 block">Action Protocol:</span>
              <p className="text-xs text-white font-bold">{advisory.action}</p>
            </div>
          </div>
        </GlassCard>
      </main>
    </div>
  );
};
