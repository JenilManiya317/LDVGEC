import React, { useState } from 'react';
import { useRouter } from '../../lib/router';
import { FarmerSidebar } from '../../components/layout/FarmerSidebar';
import { GlassCard } from '../../components/common/GlassCard';
import { GlassButton } from '../../components/common/GlassButton';
import { TrendingUp, Clock, MapPin, Search, PlusCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { MOCK_MARKET_PRICES } from '../../lib/mock-data';
import { MarketPriceItem } from '../../lib/types';

export const MarketPricePage: React.FC = () => {
  const { navigate } = useRouter();
  const [selectedCrop, setSelectedCrop] = useState<MarketPriceItem>(MOCK_MARKET_PRICES[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPrices = MOCK_MARKET_PRICES.filter(
    (p) =>
      p.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.marketLocation || p.mandiLocation || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen text-white">
      <FarmerSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-surface border border-white/20 text-white text-xs font-bold mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
              <span>APMC Wholesale Mandi Benchmarks</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Market Mandi Prices
            </h1>
            <p className="text-xs sm:text-sm text-white/80 font-medium">
              Live APMC mandi rates, daily price trends, and commodity movements.
            </p>
          </div>

          <GlassButton
            variant="primary"
            size="sm"
            onClick={() => navigate('/farmer/list-crop')}
            icon={<PlusCircle className="w-4 h-4 text-white" />}
          >
            List Crop for Sale
          </GlassButton>
        </div>

        {/* Selected Crop Price Chart Header */}
        <GlassCard variant="elevated" className="p-6 sm:p-8 border border-white/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/15 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-white/70">
                  Selected Mandi
                </span>
                <span className="text-xs text-white/90 font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-white" />
                  {selectedCrop.marketLocation || selectedCrop.mandiLocation}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                {selectedCrop.cropName}
              </h2>
            </div>

            <div className="flex items-baseline gap-3">
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                ₹{selectedCrop.currentPrice.toLocaleString('en-IN')}{' '}
                <span className="text-xs font-bold text-white/70">/ Quintal</span>
              </div>
              <div
                className={`flex items-center gap-1 text-xs font-black px-3 py-1 rounded-full border ${
                  selectedCrop.isPositive
                    ? 'glass-surface text-white border-white/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                }`}
              >
                {selectedCrop.isPositive ? (
                  <ArrowUpRight className="w-4 h-4 text-white" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-rose-300" />
                )}
                <span>
                  {selectedCrop.isPositive ? '+' : ''}
                  {selectedCrop.trendPercentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Clean Visual Trend Chart */}
          <div>
            <div className="flex items-center justify-between text-xs text-white/80 mb-3 font-semibold">
              <span>7-Day Price History (₹ per Quintal)</span>
              <span>Updated {selectedCrop.lastUpdated}</span>
            </div>

            <div className="h-44 flex items-end gap-3 sm:gap-6 pt-6 px-4 bg-transparent rounded-2xl border border-white/20">
              {selectedCrop.priceHistory.map((item, idx) => {
                const min = Math.min(...selectedCrop.priceHistory.map((p) => p.price)) - 100;
                const max = Math.max(...selectedCrop.priceHistory.map((p) => p.price)) + 100;
                const range = max - min || 1;
                const heightPercent = Math.max(15, Math.min(100, ((item.price - min) / range) * 100));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group/bar relative">
                    <div
                      className="w-full bg-white/80 hover:bg-white rounded-t-lg transition-all cursor-pointer shadow-lg"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[10px] font-bold text-white/80">{item.day}</span>
                    <div className="absolute -top-8 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-slate-900 border border-white/30 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg pointer-events-none whitespace-nowrap z-10">
                      ₹{item.price.toLocaleString('en-IN')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </GlassCard>

        {/* Commodity Market Table */}
        <GlassCard variant="elevated" className="p-6 sm:p-8 space-y-4 border border-white/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/15">
            <span className="text-xs font-extrabold uppercase tracking-wider text-white">
              Live Mandi Price Directory
            </span>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-white/60 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search crop or mandi..."
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
                  <th className="pb-3">Mandi Location</th>
                  <th className="pb-3 text-right">Current Price</th>
                  <th className="pb-3 text-right">24h Trend</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 font-medium text-white">
                {filteredPrices.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedCrop(p)}
                    className={`hover:bg-white/10 transition-colors cursor-pointer ${
                      selectedCrop.id === p.id ? 'glass-surface font-bold' : ''
                    }`}
                  >
                    <td className="py-3.5 font-bold text-white">{p.cropName}</td>
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
                        }}
                        className="text-xs font-bold text-white underline hover:text-white/80 cursor-pointer"
                      >
                        Inspect Trend
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </main>
    </div>
  );
};
