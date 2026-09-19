import React, { useState, useEffect, useCallback } from 'react';
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
  ShieldCheck,
  MapPin,
  Navigation,
  Thermometer,
  SunMedium,
  Gauge,
  Waves,
  RefreshCw
} from 'lucide-react';
import { MOCK_WEATHER, MOCK_ADVISORY } from '../../lib/mock-data';
import { api } from '../../lib/api';
import { WeatherData } from '../../lib/types';
import { CityStateSelect } from '../../components/common/CityStateSelect';
import { getDistrictsForState } from '../../lib/geo-data';

export const WeatherAdvisoryPage: React.FC = () => {
  const { navigate } = useRouter();
  const [activeTab, setActiveTab] = useState<'irrigation' | 'fertilizer' | 'pest' | 'harvest'>('irrigation');
  const [weatherData, setWeatherData] = useState<WeatherData>({
    ...MOCK_WEATHER,
    soilTemperature: 26.5,
    apparentTemperature: 29,
    evapotranspiration: 4.1,
    uvIndex: 6.8,
    precipitation: 0.0,
    location: 'Surat, Gujarat',
    source: 'open-meteo'
  });
  const [advisoryData, setAdvisoryData] = useState(MOCK_ADVISORY);

  // Geolocation & station state
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat?: number; lon?: number }>({});
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [selectedSeason, setSelectedSeason] = useState('Kharif');
  const [stationState, setStationState] = useState('Gujarat');
  const [stationDistrict, setStationDistrict] = useState('Surat');

  const handleManualStateChange = (newState: string) => {
    setStationState(newState);
    setIsGpsActive(false);
    const districts = getDistrictsForState(newState);
    const newDistrict = districts[0] || '';
    setStationDistrict(newDistrict);
    fetchWeatherData(undefined, undefined, newState, newDistrict);
  };

  const handleManualDistrictChange = (newDistrict: string) => {
    setStationDistrict(newDistrict);
    setIsGpsActive(false);
    fetchWeatherData(undefined, undefined, stationState, newDistrict);
  };

  const fetchWeatherData = useCallback(async (lat?: number, lon?: number, state: string = 'Gujarat', location: string = 'Surat') => {
    try {
      const [currentRes, forecastRes, advRes] = await Promise.all([
        api.weather.current(state, location, lat, lon),
        api.weather.forecast(state, 7, lat, lon),
        api.weather.advisory(state, selectedCrop, selectedSeason, lat, lon)
      ]);

      if (currentRes.data) {
        setWeatherData((prev) => ({
          ...prev,
          temperature: currentRes.data.temperature ?? prev.temperature,
          apparentTemperature: currentRes.data.apparentTemperature ?? (currentRes.data.temperature || prev.temperature),
          condition: currentRes.data.condition || prev.condition,
          humidity: currentRes.data.humidity ?? prev.humidity,
          windSpeed: currentRes.data.windSpeed ?? prev.windSpeed,
          rainChance: currentRes.data.rainChance ?? prev.rainChance,
          soilMoisture: currentRes.data.soilMoisture ?? prev.soilMoisture,
          soilTemperature: currentRes.data.soilTemperature ?? prev.soilTemperature,
          evapotranspiration: currentRes.data.evapotranspiration ?? prev.evapotranspiration,
          uvIndex: currentRes.data.uvIndex ?? prev.uvIndex,
          precipitation: currentRes.data.precipitation ?? prev.precipitation,
          location: currentRes.data.location || (lat && lon ? `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E` : prev.location),
          source: currentRes.data.source || 'open-meteo',
          forecast: (forecastRes.data?.forecast && forecastRes.data.forecast.length > 0)
            ? forecastRes.data.forecast
            : (currentRes.data.forecast || prev.forecast),
        }));
      }

      if (advRes.data?.advisory) {
        setAdvisoryData((prev) => ({
          ...prev,
          ...advRes.data.advisory,
        }));
      }
    } catch (err) {
      console.warn('Weather fetch error:', err);
    }
  }, [selectedCrop, selectedSeason]);

  // Initial load
  useEffect(() => {
    fetchWeatherData(undefined, undefined, 'Gujarat', 'Surat');
  }, [fetchWeatherData]);

  // HTML5 Geolocation handler
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setCurrentCoords({ lat, lon });
        setIsGpsActive(true);
        setGpsLoading(false);
        fetchWeatherData(lat, lon);
      },
      (err) => {
        setGpsLoading(false);
        let msg = 'Unable to retrieve your location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission denied. Please allow location access in your browser settings.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'GPS location information is currently unavailable.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Please retry.';
        }
        setGpsError(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const advisory = advisoryData[activeTab] || MOCK_ADVISORY[activeTab];

  // Soil moisture health assessment
  const soilMoistureVal = weatherData.soilMoisture ?? 50;
  const getSoilMoistureStatus = (val: number) => {
    if (val < 35) return { label: 'Deficit (Irrigate)', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40', status: 'dry' };
    if (val > 78) return { label: 'Saturated (High)', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40', status: 'wet' };
    return { label: 'Optimal Field Capacity', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', status: 'optimal' };
  };
  const moistureStatus = getSoilMoistureStatus(soilMoistureVal);

  return (
    <div className="flex min-h-screen text-white">
      <FarmerSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
        {/* HEADER SECTION WITH GPS LOCATION ACTION */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-surface text-white text-xs font-bold mb-2 border border-white/20">
              <CloudSun className="w-3.5 h-3.5 text-amber-300" />
              <span>Meteorological & Agronomic Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Weather & Precision Advisory
            </h1>
            <p className="text-xs sm:text-sm text-white/80 font-medium">
              Real-time agro-met telemetry powered by Open-Meteo & OpenWeatherMap.
            </p>
          </div>

          {/* GPS & MANUAL CITY/STATE SELECTION CONTROLS */}
          <div className="flex flex-col sm:items-end gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleUseCurrentLocation}
                disabled={gpsLoading}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-extrabold shadow-lg transition-all cursor-pointer border ${
                  isGpsActive
                    ? 'bg-emerald-500/30 hover:bg-emerald-500/40 text-emerald-200 border-emerald-400/40'
                    : 'bg-white/15 hover:bg-white/25 text-white border-white/30 hover:scale-[1.02]'
                }`}
              >
                {gpsLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Navigation className={`w-4 h-4 ${isGpsActive ? 'text-emerald-300 fill-emerald-300' : 'text-white'}`} />
                )}
                <span>{gpsLoading ? 'Detecting...' : isGpsActive ? '📍 GPS Active' : '📍 Auto GPS'}</span>
              </button>

              <CityStateSelect
                selectedState={stationState}
                selectedDistrict={stationDistrict}
                onStateChange={handleManualStateChange}
                onDistrictChange={handleManualDistrictChange}
                layout="row-inline"
                showLabels={false}
                showIcons={false}
                selectClassName="py-1.5 px-3 text-xs rounded-xl bg-slate-900/90 border-white/30"
              />
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-white/80">
              <MapPin className="w-3 h-3 text-amber-300 shrink-0" />
              <span className="font-semibold text-white">{weatherData.location || 'Surat, Gujarat'}</span>
              <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/70 uppercase">
                {weatherData.source || 'Open-Meteo'}
              </span>
            </div>

            {gpsError && (
              <div className="text-[11px] text-rose-300 bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-500/30 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{gpsError}</span>
              </div>
            )}
          </div>
        </div>

        {/* PRIMARY WEATHER & TELEMETRY GLASS CARD */}
        <GlassCard variant="elevated" className="p-6 sm:p-8 border border-white/20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Primary temperature & condition */}
            <div className="lg:col-span-5 flex items-center gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-xl shrink-0">
                <CloudSun className="w-12 h-12 sm:w-14 sm:h-14" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-white/80">
                    Live Field Sensor
                  </span>
                  {isGpsActive && (
                    <span className="text-[9px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 px-1.5 py-0.2 rounded-full font-bold">
                      GPS LOCKED
                    </span>
                  )}
                </div>
                <div className="text-5xl sm:text-6xl font-black text-white tracking-tight mt-1 flex items-baseline gap-1">
                  <AnimatedCounter value={weatherData.temperature} suffix="°C" duration={800} />
                </div>
                <div className="text-sm font-bold text-white mt-1">
                  {weatherData.condition}
                  {weatherData.apparentTemperature && (
                    <span className="text-xs font-normal text-white/70 ml-2">
                      (Feels {weatherData.apparentTemperature}°C)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* General atmospheric metrics */}
            <div className="lg:col-span-7 grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl glass-surface-subtle border border-white/20 text-center">
                <Droplets className="w-4 h-4 text-blue-300 mx-auto mb-1" />
                <span className="text-[11px] font-bold text-white/80 block">Humidity</span>
                <span className="text-base font-black text-white">{weatherData.humidity}%</span>
              </div>

              <div className="p-3.5 rounded-2xl glass-surface-subtle border border-white/20 text-center">
                <Wind className="w-4 h-4 text-emerald-300 mx-auto mb-1" />
                <span className="text-[11px] font-bold text-white/80 block">Wind Speed</span>
                <span className="text-base font-black text-white">{weatherData.windSpeed} km/h</span>
              </div>

              <div className="p-3.5 rounded-2xl glass-surface-subtle border border-white/20 text-center">
                <Umbrella className="w-4 h-4 text-indigo-300 mx-auto mb-1" />
                <span className="text-[11px] font-bold text-white/80 block">Rain Chance</span>
                <span className="text-base font-black text-white">{weatherData.rainChance}%</span>
              </div>
            </div>
          </div>

          {/* DEDICATED AGRICULTURAL TELEMETRY INDICATORS */}
          <div className="mt-6 pt-6 border-t border-white/15">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                <Sprout className="w-4 h-4 text-emerald-400" />
                <span>Agricultural Indicators (0-7cm Root Zone Telemetry)</span>
              </div>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${moistureStatus.color}`}>
                {moistureStatus.label}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Soil Moisture 0-7cm */}
              <div className="p-3.5 rounded-2xl bg-black/25 border border-white/20">
                <div className="flex items-center justify-between text-white/80 text-[11px] font-bold mb-1">
                  <span className="flex items-center gap-1">
                    <Waves className="w-3.5 h-3.5 text-cyan-300" />
                    Soil Moisture (0-7cm)
                  </span>
                </div>
                <div className="text-2xl font-black text-white">
                  <AnimatedCounter value={soilMoistureVal} decimals={1} suffix="%" duration={600} />
                </div>
                <div className="text-[10px] text-white/70 mt-0.5">Volumetric root moisture</div>
              </div>

              {/* Soil Temperature 0-7cm */}
              <div className="p-3.5 rounded-2xl bg-black/25 border border-white/20">
                <div className="flex items-center justify-between text-white/80 text-[11px] font-bold mb-1">
                  <span className="flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-amber-300" />
                    Soil Temp (0-7cm)
                  </span>
                </div>
                <div className="text-2xl font-black text-white">
                  {weatherData.soilTemperature ?? 26}°C
                </div>
                <div className="text-[10px] text-white/70 mt-0.5">Optimal for microbial uptake</div>
              </div>

              {/* FAO Evapotranspiration (ET0) */}
              <div className="p-3.5 rounded-2xl bg-black/25 border border-white/20">
                <div className="flex items-center justify-between text-white/80 text-[11px] font-bold mb-1">
                  <span className="flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5 text-purple-300" />
                    Evapotranspiration (ET₀)
                  </span>
                </div>
                <div className="text-2xl font-black text-white">
                  {weatherData.evapotranspiration ?? 4.0} <span className="text-xs font-normal text-white/70">mm/day</span>
                </div>
                <div className="text-[10px] text-white/70 mt-0.5">Crop water demand loss</div>
              </div>

              {/* UV Index Max */}
              <div className="p-3.5 rounded-2xl bg-black/25 border border-white/20">
                <div className="flex items-center justify-between text-white/80 text-[11px] font-bold mb-1">
                  <span className="flex items-center gap-1">
                    <SunMedium className="w-3.5 h-3.5 text-yellow-300" />
                    Max UV Index
                  </span>
                </div>
                <div className="text-2xl font-black text-white">
                  {weatherData.uvIndex ?? 6.5}
                </div>
                <div className="text-[10px] text-white/70 mt-0.5">
                  {(weatherData.uvIndex ?? 6) > 7 ? 'High radiation risk' : 'Moderate solar flux'}
                </div>
              </div>
            </div>
          </div>

          {/* 7-DAY AGRONOMIC FORECAST */}
          <div className="mt-6 pt-6 border-t border-white/15">
            <div className="text-xs font-bold text-white/80 mb-3 uppercase tracking-wider flex items-center justify-between">
              <span>7-Day Agronomic Forecast</span>
              <span className="text-[11px] text-white/60 font-normal">Real-time Open-Meteo model</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-center text-xs">
              {(weatherData.forecast || []).slice(0, 7).map((f, i) => (
                <div key={i} className="p-3 rounded-2xl glass-surface-subtle border border-white/20 flex flex-col justify-between">
                  <div>
                    <div className="font-extrabold text-white">{f.day}</div>
                    <div className="text-lg font-black text-white my-1">
                      {f.tempMax ? `${f.tempMax}°` : `${f.temp}°`}
                      {f.tempMin !== undefined && (
                        <span className="text-xs font-medium text-white/60 ml-1">/ {f.tempMin}°</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1 mt-1">
                    <div className="text-[11px] font-semibold text-white/90 truncate">{f.condition}</div>
                    <div className="flex items-center justify-center gap-1 text-[10px] text-cyan-200">
                      <Droplets className="w-2.5 h-2.5" />
                      <span>{f.rainChance ?? 0}%</span>
                      {f.precipitationSum !== undefined && f.precipitationSum > 0 && (
                        <span className="text-[9px] text-white/70">({f.precipitationSum}mm)</span>
                      )}
                    </div>
                    {f.uvIndex !== undefined && (
                      <div className="text-[9px] text-amber-200">UV: {f.uvIndex}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* PRECISION INTERVENTIONS & AGRONOMIC ADVISORY */}
        <GlassCard variant="elevated" className="p-6 sm:p-8 space-y-6 border border-white/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/15">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-white/80">
                  Precision Agronomic Directives
                </span>
                <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded-full border border-white/20 font-bold">
                  Target: {selectedCrop} • {selectedSeason}
                </span>
              </div>
              <h3 className="text-lg font-black text-white mt-0.5">
                Targeted Field Interventions
              </h3>
            </div>

            {/* Interactive Category Selector */}
            <div className="flex items-center gap-1.5 glass-surface p-1.5 rounded-2xl border border-white/20 flex-wrap">
              {(['irrigation', 'fertilizer', 'pest', 'harvest'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                    activeTab === tab
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
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span className="text-sm font-black text-white">{advisory.title}</span>
              </div>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                advisory.priority === 'High'
                  ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                  : 'bg-white/20 text-white border border-white/30'
              }`}>
                {advisory.priority || 'Normal'} Priority
              </span>
            </div>

            <p className="text-xs text-white/90 leading-relaxed font-medium">
              {advisory.description}
            </p>

            {/* Action Protocol Box */}
            <div className="p-4 rounded-2xl glass-surface border border-white/20 space-y-1.5 bg-black/20">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-bold text-white/80">Action Protocol:</span>
              </div>
              <p className="text-xs text-white font-bold pl-5">
                {advisory.action || advisory.water}
              </p>
            </div>

            {/* Extra Agronomic Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {advisory.timing && (
                <div className="p-3 rounded-xl glass-surface border border-white/15 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-200 font-bold mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Application Window</span>
                  </div>
                  <p className="text-[11px] text-white/80">{advisory.timing}</p>
                </div>
              )}

              {advisory.pestControl && (
                <div className="p-3 rounded-xl glass-surface border border-white/15 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-200 font-bold mb-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Bio-Protection</span>
                  </div>
                  <p className="text-[11px] text-white/80">{advisory.pestControl}</p>
                </div>
              )}

              {advisory.expertTip && (
                <div className="p-3 rounded-xl glass-surface border border-white/15 text-xs">
                  <div className="flex items-center gap-1.5 text-cyan-200 font-bold mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Agronomist Note</span>
                  </div>
                  <p className="text-[11px] text-white/80">{advisory.expertTip}</p>
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </main>
    </div>
  );
};
