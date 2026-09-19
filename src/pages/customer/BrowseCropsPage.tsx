import React, { useState, useEffect } from 'react';
import { useRouter } from '../../lib/router';
import { CustomerNavbar } from '../../components/layout/CustomerNavbar';
import { GlassCard } from '../../components/common/GlassCard';
import { useCart } from '../../lib/cart';
import { Search, MapPin, Star, ShoppingCart, Check, Sparkles } from 'lucide-react';
import { MOCK_PRODUCTS } from '../../lib/mock-data';
import { ProductItem } from '../../lib/types';
import { api } from '../../lib/api';

export const BrowseCropsPage: React.FC = () => {
  const { navigate } = useRouter();
  const { addItem } = useCart();
  const [productsList, setProductsList] = useState<ProductItem[]>(MOCK_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState<number>(150);
  const [addedId, setAddedId] = useState<string | null>(null);

  const categories = ['All', 'Vegetables', 'Fruits', 'Grains', 'Organic'];

  useEffect(() => {
    let isCancelled = false;
    const fetchListings = async () => {
      try {
        const catParam = selectedCategory === 'All' || selectedCategory === 'Organic' ? '' : selectedCategory;
        const res = await api.marketplace.listings(catParam, searchQuery);
        if (!isCancelled && res.data?.listings && res.data.listings.length > 0) {
          const backendProducts: ProductItem[] = res.data.listings.map((row: any) => ({
            id: String(row.id),
            name: row.crop_name || row.name || 'Produce',
            category: row.category || 'Vegetables',
            pricePerKg: row.price_per_kg ?? 30,
            unit: row.unit || 'kg',
            imageUrl: row.image_url || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=85',
            farmerId: String(row.farmer_id || '1'),
            farmerName: row.farmer_name || 'Rudra Patel',
            farmName: row.farm_name || 'Patel Organic Farms',
            location: row.farmer_location || 'Surat, Gujarat',
            farmerAvatar: row.farmer_avatar || '/images/farmer-portrait.jpg',
            rating: row.farmer_rating || 4.9,
            reviewsCount: row.farmer_reviews_count || 12,
            availableStockKg: row.available_stock_kg ?? 200,
            quantityAvailableKg: row.available_stock_kg ?? 200,
            description: row.description || '',
            variety: row.variety || 'Hybrid Fresh Pick',
            isOrganic: Boolean(row.is_organic),
            harvestDate: row.harvest_date || 'Today',
          }));
          // Merge with mock products ensuring no duplicates
          const combined = [...backendProducts];
          for (const mp of MOCK_PRODUCTS) {
            if (!combined.some(p => p.name.toLowerCase() === mp.name.toLowerCase())) {
              combined.push(mp);
            }
          }
          setProductsList(combined);
        }
      } catch (err) {
        console.warn('Marketplace listings fetch fallback:', err);
      }
    };

    fetchListings();
    return () => {
      isCancelled = true;
    };
  }, [selectedCategory, searchQuery]);

  const filtered = productsList.filter((prod) => {
    const matchesCategory =
      selectedCategory === 'All'
        ? true
        : selectedCategory === 'Organic'
          ? prod.isOrganic
          : prod.category === selectedCategory;

    const matchesPrice = prod.pricePerKg <= maxPrice;

    const query = searchQuery.toLowerCase();
    const matchesQuery =
      prod.name.toLowerCase().includes(query) ||
      prod.farmerName.toLowerCase().includes(query) ||
      prod.location.toLowerCase().includes(query);

    return matchesCategory && matchesPrice && matchesQuery;
  });

  const handleQuickAdd = (prod: any, e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(prod, 1);
    setAddedId(prod.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="flex flex-col min-h-screen text-white">
      <CustomerNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 pt-24 pb-8 space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-surface border border-white/20 text-white text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Direct Harvest Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Browse Farm Harvests
          </h1>
          <p className="text-xs sm:text-sm text-white/80 font-medium">
            Discover fresh organic crops directly sourced from local farmers.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <GlassCard variant="elevated" className="p-5 sm:p-6 space-y-4 border border-white/20">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-white/60 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                id="crop-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by crop name, farmer, or city..."
                className="w-full glass-input rounded-xl py-2.5 pl-11 pr-4 text-xs font-bold text-white placeholder:text-white/40"
              />
            </div>

            {/* Live Price Range Slider */}
            <div className="flex items-center gap-3 w-full md:w-64 glass-surface-subtle p-2.5 rounded-xl border border-white/20">
              <span className="text-[11px] font-bold text-white/80 shrink-0">Max ₹{maxPrice}/kg</span>
              <input
                type="range"
                min="20"
                max="150"
                step="5"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-white cursor-pointer"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/15">
            <span className="text-xs font-bold text-white/90 mr-1">Category:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${selectedCategory === cat
                    ? 'bg-white text-slate-950 shadow-md font-extrabold border-white'
                    : 'glass-surface hover:bg-white/15 text-white/80 border-white/20'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Results grid */}
        {filtered.length === 0 ? (
          <GlassCard variant="elevated" className="p-12 text-center border border-white/20">
            <p className="text-sm font-bold text-white">No crops found matching your filters.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setMaxPrice(150);
              }}
              className="text-xs text-white underline hover:text-white/80 mt-2 font-bold cursor-pointer"
            >
              Reset all filters
            </button>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((prod) => (
              <GlassCard
                key={prod.id}
                variant="interactive"
                onClick={() => navigate(`/customer/product/${prod.id}`)}
                className="p-5 flex flex-col justify-between group border border-white/20"
              >
                <div>
                  <div className="relative w-full h-44 rounded-xl overflow-hidden mb-3.5 border border-white/20">
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {prod.isOrganic && (
                      <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-white text-slate-950 text-[10px] font-extrabold shadow-sm">
                        Organic
                      </span>
                    )}
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-bold shadow-sm flex items-center gap-1 border border-white/30">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      {prod.rating}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-base font-extrabold text-white group-hover:text-white/80 transition-colors">
                        {prod.name}
                      </h3>
                      <div className="text-right">
                        <span className="text-lg font-black text-white">₹{prod.pricePerKg}</span>
                        <span className="text-[10px] text-white/70 font-medium">/ kg</span>
                      </div>
                    </div>
                    <p className="text-xs text-white/80 font-medium">{prod.variety}</p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-white/70">
                    <div className="flex items-center gap-2">
                      <img src={prod.farmerAvatar} alt="" className="w-5 h-5 rounded-full object-cover border border-white/30" />
                      <span className="font-bold text-white text-[11px] truncate max-w-[120px]">
                        {prod.farmerName}
                      </span>
                    </div>
                    <span className="text-[10px] font-medium text-white/80 flex items-center gap-0.5">
                      <MapPin className="w-3 h-3 text-white" />
                      {prod.location}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white/90">
                    Stock: {prod.quantityAvailableKg} kg
                  </span>
                  <button
                    onClick={(e) => handleQuickAdd(prod, e)}
                    className="px-3.5 py-1.5 rounded-xl glass-btn-primary text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    {addedId === prod.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>Added!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-3.5 h-3.5 text-white" />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
