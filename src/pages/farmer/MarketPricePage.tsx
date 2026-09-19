import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from '../../lib/router';
import { FarmerSidebar } from '../../components/layout/FarmerSidebar';
import { GlassCard } from '../../components/common/GlassCard';
import { GlassButton } from '../../components/common/GlassButton';
import {
  TrendingUp,
  Clock,
  MapPin,
  Search,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  BarChart2,
  Activity,
  RefreshCw,
  Calendar,
  Layers
} from 'lucide-react';
import { MOCK_MARKET_PRICES } from '../../lib/mock-data';
import { MarketPriceItem } from '../../lib/types';
import { api } from '../../lib/api';

type TimeframeOption = '7D' | '15D' | '1M' | '3M' | '6M' | '1Y';
type ChartViewType = 'area' | 'bar';

interface PricePoint {
  label: string;
  fullDate: string;
  price: number;
}

// Generate dynamic historical data points based on timeframe and base price
function generateDynamicPriceHistory(
  basePrice: number,
  timeframe: TimeframeOption,
  trendFactor: number = 1
): PricePoint[] {
  const pointsCount = timeframe === '7D' ? 7 : timeframe === '15D' ? 15 : timeframe === '1M' ? 30 : timeframe === '3M' ? 24 : timeframe === '6M' ? 26 : 36;
  const now = new Date();
  const history: PricePoint[] = [];

  let currentVal = basePrice * (1 - (trendFactor * 0.04));

  for (let i = pointsCount - 1; i >= 0; i--) {
    const d = new Date(now);
    if (timeframe === '7D' || timeframe === '15D' || timeframe === '1M') {
      d.setDate(d.getDate() - i);
    } else if (timeframe === '3M' || timeframe === '6M') {
      d.setDate(d.getDate() - i * 4);
    } else {
      d.setDate(d.getDate() - i * 10);
    }

    // Semi-random walk with positive or negative drift
    const stepVolatility = (basePrice * 0.018) * (Math.sin(i * 0.8) + (Math.random() - 0.48));
    currentVal = Math.max(basePrice * 0.7, currentVal + stepVolatility);

    let label = '';
    if (timeframe === '7D') {
      label = d.toLocaleDateString('en-US', { weekday: 'short' });
    } else if (timeframe === '15D' || timeframe === '1M') {
      label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }

    history.push({
      label,
      fullDate: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      price: Math.round(i === 0 ? basePrice : currentVal)
    });
  }

  return history;
}

export const MarketPricePage: React.FC = () => {
  const { navigate } = useRouter();
  const [pricesList, setPricesList] = useState<MarketPriceItem[]>(MOCK_MARKET_PRICES);
  const [selectedCrop, setSelectedCrop] = useState<MarketPriceItem>(MOCK_MARKET_PRICES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeframe, setTimeframe] = useState<TimeframeOption>('7D');
  const [chartView, setChartView] = useState<ChartViewType>('area');
  const [hoveredPoint, setHoveredPoint] = useState<PricePoint | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [simulationTick, setSimulationTick] = useState(0);

  useEffect(() => {
    let isCancelled = false;
    const fetchPrices = async () => {
      try {
        const res = await api.market.prices(searchQuery, 50);
        if (!isCancelled && res.data?.prices && res.data.prices.length > 0) {
          setPricesList(res.data.prices);
          if (!selectedCrop || !res.data.prices.some((p: any) => p.id === selectedCrop.id)) {
            setSelectedCrop(res.data.prices[0]);
          }
        }
      } catch (err) {
        console.warn('Market prices error:', err);
      }
    };

    fetchPrices();
    return () => {
      isCancelled = true;
    };
  }, [searchQuery]);

  // Compute dynamic price history points based on selected crop & timeframe
  const priceHistory: PricePoint[] = useMemo(() => {
    const trendFactor = selectedCrop.isPositive ? 1 : -1;
    return generateDynamicPriceHistory(selectedCrop.currentPrice, timeframe, trendFactor);
  }, [selectedCrop, timeframe, simulationTick]);

  const pricesOnly = priceHistory.map((p) => p.price);
  const minPrice = Math.min(...pricesOnly);
  const maxPrice = Math.max(...pricesOnly);
  const avgPrice = Math.round(pricesOnly.reduce((a, b) => a + b, 0) / pricesOnly.length);
  const startPrice = pricesOnly[0] || selectedCrop.currentPrice;
  const latestPrice = pricesOnly[pricesOnly.length - 1] || selectedCrop.currentPrice;
  const priceChange = latestPrice - startPrice;
  const percentageChange = ((priceChange / startPrice) * 100).toFixed(1);
  const isPeriodPositive = priceChange >= 0;

  // Build SVG path for dynamic smooth area and line chart
  const svgWidth = 800;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingTop = 20;
  const paddingBottom = 30;

  const priceRange = maxPrice - minPrice || 1;
  const chartHeight = svgHeight - paddingTop - paddingBottom;
  const chartWidth = svgWidth - paddingX * 2;

  const coordinates = priceHistory.map((p, idx) => {
    const x = paddingX + (idx / (priceHistory.length - 1 || 1)) * chartWidth;
    const normalizedY = (p.price - minPrice) / priceRange;
    const y = paddingTop + chartHeight - normalizedY * chartHeight;
    return { x, y, ...p };
  });

  // Generate smooth SVG curve path (Catmull-Rom or bezier)
  const linePathD = useMemo(() => {
    if (coordinates.length === 0) return '';
    let d = `M ${coordinates[0].x} ${coordinates[0].y}`;
    for (let i = 0; i < coordinates.length - 1; i++) {
      const p0 = coordinates[i === 0 ? i : i - 1];
      const p1 = coordinates[i];
      const p2 = coordinates[i + 1];
      const p3 = coordinates[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }, [coordinates]);

  const areaPathD = useMemo(() => {
    if (coordinates.length === 0) return '';
    const first = coordinates[0];
    const last = coordinates[coordinates.length - 1];
    const bottomY = svgHeight - paddingBottom;
    return `${linePathD} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
  }, [linePathD, coordinates, svgHeight, paddingBottom]);

  const filteredPrices = pricesList.filter(
    (p) =>
      p.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.marketLocation || p.mandiLocation || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSimulateUpdate = () => {
    setSimulationTick((prev) => prev + 1);
  };

  return (
    <div className="flex min-h-screen text-white">
      <FarmerSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-surface border border-white/20 text-white text-xs font-bold mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
              <span>Live Commodity Benchmarks & APMC Mandi Rates</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Market Prices
            </h1>
            <p className="text-xs sm:text-sm text-white/80 font-medium">
              Real-time APMC mandi price indices, multi-timeframe dynamic charts, and historical commodity trends.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <GlassButton
              variant="primary"
              size="sm"
              onClick={() => navigate('/farmer/list-crop')}
              icon={<PlusCircle className="w-4 h-4 text-white" />}
            >
              List Crop for Sale
            </GlassButton>
          </div>
        </div>

        {/* Quick Crop Selector Pills */}
        <div className="flex overflow-x-auto gap-2 pb-1.5 scrollbar-none">
          {pricesList.map((p) => {
            const isSelected = selectedCrop.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedCrop(p);
                  setHoveredPoint(null);
                  setHoveredIndex(null);
                }}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-white text-slate-950 shadow-lg font-black border-white'
                    : 'glass-surface hover:bg-white/15 text-white/85 border-white/20'
                }`}
              >
                <span>{p.cropName}</span>
                <span
                  className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${
                    isSelected
                      ? 'bg-slate-900 text-white'
                      : p.isPositive
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  ₹{p.currentPrice}
                </span>
              </button>
            );
          })}
        </div>

        {/* MAIN DYNAMIC MARKET PRICE GRAPH CARD */}
        <GlassCard variant="elevated" className="p-6 sm:p-8 border border-white/20 space-y-6">
          {/* Header with Crop Meta & Current Price */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/15">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-extrabold uppercase tracking-wider text-white/70">
                  APMC Benchmark Mandi
                </span>
                <span className="text-xs text-white/90 font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-white" />
                  {selectedCrop.marketLocation || selectedCrop.mandiLocation}
                </span>
                <span className="text-[11px] text-white/60">• Updated {selectedCrop.lastUpdated}</span>
              </div>

              <div className="flex items-baseline gap-3 mt-1">
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {selectedCrop.cropName}
                </h2>
                <span className="text-xs text-white/80 font-bold bg-white/15 px-2.5 py-0.5 rounded-full border border-white/20">
                  Spot Grade-A
                </span>
              </div>
            </div>

            {/* Current Price & Trend Badge */}
            <div className="flex items-baseline gap-3">
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                ₹{selectedCrop.currentPrice.toLocaleString('en-IN')}{' '}
                <span className="text-xs font-bold text-white/70">/ Quintal</span>
              </div>
              <div
                className={`flex items-center gap-1 text-xs font-black px-3 py-1.5 rounded-full border shadow-sm ${
                  isPeriodPositive
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                }`}
              >
                {isPeriodPositive ? (
                  <ArrowUpRight className="w-4 h-4 text-emerald-300" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-rose-300" />
                )}
                <span>
                  {isPeriodPositive ? '+' : ''}
                  {percentageChange}% ({timeframe})
                </span>
              </div>
            </div>
          </div>

          {/* Timeframe & Chart Type Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/20">
              {(['7D', '15D', '1M', '3M', '6M', '1Y'] as TimeframeOption[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => {
                    setTimeframe(tf);
                    setHoveredPoint(null);
                    setHoveredIndex(null);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    timeframe === tf
                      ? 'bg-white text-slate-950 shadow-md'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/20">
                <button
                  onClick={() => setChartView('area')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    chartView === 'area'
                      ? 'bg-white text-slate-950 shadow-md'
                      : 'text-white/70 hover:text-white'
                  }`}
                  title="Spline Line Chart"
                >
                  <Activity className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setChartView('bar')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    chartView === 'bar'
                      ? 'bg-white text-slate-950 shadow-md'
                      : 'text-white/70 hover:text-white'
                  }`}
                  title="Histogram Bar Chart"
                >
                  <BarChart2 className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleSimulateUpdate}
                className="px-2.5 py-1.5 rounded-xl glass-surface hover:bg-white/15 text-white/80 hover:text-white border border-white/20 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Refresh and simulate live market tick"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Simulate Tick</span>
              </button>
            </div>
          </div>

          {/* DYNAMIC INTERACTIVE CHART CANVAS */}
          <div className="relative p-4 rounded-2xl bg-black/40 border border-white/20">
            {/* Live Hover Tooltip */}
            {hoveredPoint && (
              <div className="absolute top-4 left-6 z-20 px-3.5 py-2 rounded-xl glass-surface-elevated border border-white/40 shadow-2xl animate-in fade-in duration-150">
                <div className="text-[10px] font-bold text-white/70">{hoveredPoint.fullDate}</div>
                <div className="text-base font-black text-white">
                  ₹{hoveredPoint.price.toLocaleString('en-IN')}{' '}
                  <span className="text-[10px] font-normal text-white/70">/ Quintal</span>
                </div>
                <div className="text-[10px] text-white/90 font-semibold">
                  Equivalent to ₹{(hoveredPoint.price / 100).toFixed(1)} / kg
                </div>
              </div>
            )}

            {chartView === 'area' ? (
              <div className="w-full overflow-hidden">
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="w-full h-56 sm:h-64 select-none overflow-visible"
                >
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="white" stopOpacity="0.35" />
                      <stop offset="70%" stopColor="white" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="white" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  {[0.2, 0.5, 0.8].map((pct, idx) => {
                    const gridY = paddingTop + chartHeight * pct;
                    const val = Math.round(maxPrice - pct * priceRange);
                    return (
                      <g key={idx}>
                        <line
                          x1={paddingX}
                          y1={gridY}
                          x2={svgWidth - paddingX}
                          y2={gridY}
                          stroke="rgba(255, 255, 255, 0.12)"
                          strokeDasharray="4 4"
                        />
                        <text
                          x={paddingX - 6}
                          y={gridY + 3}
                          fill="rgba(255, 255, 255, 0.5)"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="end"
                        >
                          ₹{val}
                        </text>
                      </g>
                    );
                  })}

                  {/* Filled Area */}
                  <path d={areaPathD} fill="url(#chartGradient)" />

                  {/* Line Path */}
                  <path
                    d={linePathD}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Interactive Points */}
                  {coordinates.map((pt, idx) => {
                    const isHovered = hoveredIndex === idx;
                    return (
                      <g
                        key={idx}
                        className="cursor-pointer"
                        onMouseEnter={() => {
                          setHoveredPoint(pt);
                          setHoveredIndex(idx);
                        }}
                        onMouseLeave={() => {
                          setHoveredPoint(null);
                          setHoveredIndex(null);
                        }}
                      >
                        {/* Hover vertical guide line */}
                        {isHovered && (
                          <line
                            x1={pt.x}
                            y1={paddingTop}
                            x2={pt.x}
                            y2={svgHeight - paddingBottom}
                            stroke="rgba(255, 255, 255, 0.5)"
                            strokeDasharray="2 2"
                            strokeWidth="1.5"
                          />
                        )}

                        {/* Outer Glow on hover */}
                        {isHovered && (
                          <circle cx={pt.x} cy={pt.y} r="8" fill="rgba(255, 255, 255, 0.4)" />
                        )}

                        {/* Point Circle */}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? 5 : 3.5}
                          fill={isHovered ? '#ffffff' : '#e2e8f0'}
                          stroke="#020617"
                          strokeWidth="2"
                          className="transition-all duration-150"
                        />

                        {/* Invisible larger hover hit area */}
                        <circle cx={pt.x} cy={pt.y} r="18" fill="transparent" />
                      </g>
                    );
                  })}

                  {/* X-axis Labels */}
                  {coordinates
                    .filter((_, idx) => {
                      if (timeframe === '7D') return true;
                      if (timeframe === '15D') return idx % 2 === 0;
                      if (timeframe === '1M') return idx % 5 === 0;
                      return idx % 4 === 0;
                    })
                    .map((pt, idx) => (
                      <text
                        key={idx}
                        x={pt.x}
                        y={svgHeight - paddingBottom + 18}
                        fill="rgba(255, 255, 255, 0.75)"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {pt.label}
                      </text>
                    ))}
                </svg>
              </div>
            ) : (
              /* BAR HISTOGRAM VIEW */
              <div className="h-56 sm:h-64 flex items-end gap-1 sm:gap-2 pt-8 px-2">
                {priceHistory.map((item, idx) => {
                  const range = maxPrice - minPrice || 1;
                  const heightPercent = Math.max(15, Math.min(100, ((item.price - minPrice) / range) * 100));
                  const isHovered = hoveredIndex === idx;

                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center gap-1.5 group/bar relative cursor-pointer"
                      onMouseEnter={() => {
                        setHoveredPoint(item);
                        setHoveredIndex(idx);
                      }}
                      onMouseLeave={() => {
                        setHoveredPoint(null);
                        setHoveredIndex(null);
                      }}
                    >
                      <div
                        className={`w-full rounded-t-lg transition-all ${
                          isHovered ? 'bg-white shadow-xl scale-y-105' : 'bg-white/70 hover:bg-white/90'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                      <span className="text-[9px] font-bold text-white/70 truncate max-w-[40px]">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Key Metric Statistics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-xl glass-surface-subtle border border-white/15">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/60 block">
                Period High
              </span>
              <span className="text-base sm:text-lg font-black text-white">
                ₹{maxPrice.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="p-3.5 rounded-xl glass-surface-subtle border border-white/15">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/60 block">
                Period Low
              </span>
              <span className="text-base sm:text-lg font-black text-white">
                ₹{minPrice.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="p-3.5 rounded-xl glass-surface-subtle border border-white/15">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/60 block">
                Average Price
              </span>
              <span className="text-base sm:text-lg font-black text-white">
                ₹{avgPrice.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="p-3.5 rounded-xl glass-surface-subtle border border-white/15">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/60 block">
                Price Volatility
              </span>
              <span className="text-base sm:text-lg font-black text-white">
                {selectedCrop.isPositive ? 'Bullish (+)' : 'Moderate (~)'}
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Commodity Market Price Directory Table */}
        <GlassCard variant="elevated" className="p-6 sm:p-8 space-y-4 border border-white/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/15">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
                Regional APMC Market Directory
              </h3>
              <p className="text-xs text-white/70 font-medium">Click any commodity row to dynamically plot its price curve above.</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-white/60 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search crop or APMC mandi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl glass-input text-xs font-semibold text-white placeholder-white/60"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/15 text-white/70 font-bold uppercase text-[10px]">
                  <th className="pb-3">Commodity</th>
                  <th className="pb-3">APMC Mandi Location</th>
                  <th className="pb-3 text-right">Current Price</th>
                  <th className="pb-3 text-right">24h Trend</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 font-medium text-white">
                {filteredPrices.map((p) => {
                  const isSelected = selectedCrop.id === p.id;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => {
                        setSelectedCrop(p);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`hover:bg-white/10 transition-colors cursor-pointer ${
                        isSelected ? 'glass-surface font-bold' : ''
                      }`}
                    >
                      <td className="py-3.5 font-bold text-white flex items-center gap-2">
                        {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                        <span>{p.cropName}</span>
                      </td>
                      <td className="py-3.5 text-white/80">{p.mandiLocation || p.marketLocation}</td>
                      <td className="py-3.5 text-right font-black text-white">
                        ₹{p.currentPrice.toLocaleString('en-IN')}{' '}
                        <span className="text-[10px] font-normal text-white/70">/ Qtl</span>
                      </td>
                      <td className="py-3.5 text-right">
                        <span
                          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md font-bold text-[11px] border ${
                            p.isPositive
                              ? 'glass-surface text-white border-white/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                          }`}
                        >
                          {p.isPositive ? '+' : ''}
                          {p.trendPercentage}%
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCrop(p);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="text-xs font-bold text-white underline hover:text-white/80 cursor-pointer"
                        >
                          Plot Chart
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </main>
    </div>
  );
};
