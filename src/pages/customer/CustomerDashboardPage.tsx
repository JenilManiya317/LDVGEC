import React, { useState, useEffect } from 'react';
import { useRouter } from '../../lib/router';
import { useAuth } from '../../lib/auth';
import { useCart } from '../../lib/cart';
import { CustomerNavbar } from '../../components/layout/CustomerNavbar';
import { GlassCard } from '../../components/common/GlassCard';
import { GlassButton } from '../../components/common/GlassButton';
import {
  MapPin,
  Star,
  Search,
  Store,
  ShoppingCart,
  Check
} from 'lucide-react';
import { MOCK_PRODUCTS } from '../../lib/mock-data';
import { ProductItem } from '../../lib/types';
import { api } from '../../lib/api';
import { getMergedProducts } from '../../lib/marketplace';

export const CustomerDashboardPage: React.FC = () => {
  const { navigate } = useRouter();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [productsList, setProductsList] = useState<ProductItem[]>(() => getMergedProducts());
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  const categories = ['All', 'Vegetables', 'Fruits', 'Grains', 'Pulses', 'Organic'];

  useEffect(() => {
    let isCancelled = false;
    const fetchListings = async () => {
      try {
        const catParam = activeCategory === 'All' || activeCategory === 'Organic' ? '' : activeCategory;
        const res = await api.marketplace.listings(catParam);
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
          setProductsList(getMergedProducts(backendProducts));
        } else if (!isCancelled) {
          setProductsList(getMergedProducts());
        }
      } catch (err) {
        console.warn('Dashboard listings fallback:', err);
        if (!isCancelled) {
          setProductsList(getMergedProducts());
        }
      }
    };

    fetchListings();
    return () => {
      isCancelled = true;
    };
  }, [activeCategory]);

  const filteredProducts =
    activeCategory === 'All'
      ? productsList
      : activeCategory === 'Organic'
        ? productsList.filter((p) => p.isOrganic)
        : productsList.filter((p) => p.category === activeCategory);

  const handleQuickAdd = (product: ProductItem, e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, 1);
    setAddedNotice(product.name);
    setTimeout(() => setAddedNotice(null), 1800);
  };

  return (
    <div className="flex flex-col min-h-screen text-white">
      <CustomerNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 pt-24 pb-8 space-y-8">
        {/* Added to cart toast notice */}
        {addedNotice && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl glass-surface-elevated border border-white/40 flex items-center gap-3 shadow-2xl animate-in slide-in-from-bottom-2 duration-200">
            <div className="w-8 h-8 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-md font-bold">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Added 1 kg {addedNotice} to Cart</span>
              <button
                onClick={() => navigate('/customer/cart')}
                className="text-[11px] font-extrabold text-white hover:underline cursor-pointer"
              >
                Proceed to Checkout →
              </button>
            </div>
          </div>
        )}

        {/* Top Header */}
        <GlassCard variant="elevated" className="p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-white/20">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80'}
              alt="Customer Profile"
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border border-white/30 shadow-md"
            />
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full glass-surface border border-white/20 text-white text-xs font-bold mb-1">
                <Store className="w-3.5 h-3.5 text-white" />
                <span>Verified Direct Farm Network</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Welcome, {user?.name?.split(' ')[0] || 'Customer'}!
              </h1>
              <p className="text-xs sm:text-sm text-white/80 font-medium">
                Farm-fresh, residue-free harvest delivered directly from regional growers.
              </p>
            </div>
          </div>

          <GlassButton
            variant="primary"
            size="md"
            onClick={() => navigate('/customer/browse-crops')}
            icon={<Search className="w-4 h-4 text-white" />}
          >
            Explore Catalog
          </GlassButton>
        </GlassCard>

        {/* Categories Pills */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-extrabold text-white">Categories</h2>
            <span className="text-xs text-white/70 font-medium">Zero intermediaries, 100% farm fresh</span>
          </div>

          <div className="flex overflow-x-auto gap-2 pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                id={`cat-btn-${cat.toLowerCase()}`}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${activeCategory === cat
                    ? 'bg-white text-slate-950 shadow-lg border-white font-extrabold'
                    : 'glass-surface hover:bg-white/15 text-white/80 border-white/20'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-white tracking-tight">
              Fresh Harvests from Verified Farmers
            </h2>
            <span className="text-xs font-bold text-white/90">
              Showing {filteredProducts.length} listings
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <GlassCard
                key={product.id}
                variant="interactive"
                onClick={() => navigate(`/customer/product/${product.id}`)}
                className="p-5 flex flex-col justify-between group border border-white/20"
              >
                <div>
                  {/* Image with badges */}
                  <div className="relative w-full h-48 rounded-xl overflow-hidden mb-4 border border-white/20">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.isOrganic && (
                      <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-white text-slate-950 text-[10px] font-extrabold shadow-sm">
                        Organic
                      </span>
                    )}
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-bold shadow-sm flex items-center gap-1 border border-white/30">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      {product.rating}
                    </span>
                  </div>

                  {/* Title and details */}
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-base font-extrabold text-white group-hover:text-white/80 transition-colors">
                        {product.name}
                      </h3>
                      <div className="text-right">
                        <span className="text-lg font-black text-white">
                          ₹{product.pricePerKg}
                        </span>
                        <span className="text-[10px] text-white/70 block font-medium">/ kg</span>
                      </div>
                    </div>
                    <p className="text-xs text-white/80 font-medium">
                      {product.variety}
                    </p>
                  </div>

                  {/* Farmer profile micro bar */}
                  <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-white/70">
                    <div className="flex items-center gap-2">
                      <img
                        src={product.farmerAvatar}
                        alt=""
                        className="w-5 h-5 rounded-full object-cover border border-white/30"
                      />
                      <span className="font-bold text-white text-[11px] truncate max-w-[120px]">
                        {product.farmerName}
                      </span>
                    </div>
                    <span className="text-[10px] font-medium text-white/80 flex items-center gap-0.5">
                      <MapPin className="w-3 h-3 text-white" />
                      {product.location}
                    </span>
                  </div>
                </div>

                {/* Quick Add to Cart Action */}
                <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white/90">
                    Stock: {product.quantityAvailableKg} kg
                  </span>
                  <button
                    onClick={(e) => handleQuickAdd(product, e)}
                    className="px-3.5 py-1.5 rounded-xl glass-btn-primary text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 text-white" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
