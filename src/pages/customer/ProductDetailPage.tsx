import React, { useState, useEffect } from 'react';
import { useRouter } from '../../lib/router';
import { CustomerNavbar } from '../../components/layout/CustomerNavbar';
import { GlassCard } from '../../components/common/GlassCard';
import { GlassButton } from '../../components/common/GlassButton';
import { useCart } from '../../lib/cart';
import {
  Star,
  MapPin,
  Check,
  Plus,
  Minus,
  ShoppingCart,
  Zap,
  ArrowLeft,
  Phone,
  ShieldCheck,
  Truck,
  Leaf
} from 'lucide-react';
import { MOCK_PRODUCTS } from '../../lib/mock-data';
import { ProductItem } from '../../lib/types';
import { api } from '../../lib/api';
import { findProductById } from '../../lib/marketplace';

export const ProductDetailPage: React.FC = () => {
  const { path, params, navigate } = useRouter();
  const { addItem } = useCart();

  const pathParts = path.split('/');
  const rawId = params.productId || pathParts[pathParts.length - 1];
  const initialProduct = findProductById(rawId) || MOCK_PRODUCTS.find((p) => p.id === rawId) || MOCK_PRODUCTS[0];
  const [product, setProduct] = useState<ProductItem>(initialProduct);

  useEffect(() => {
    let isCancelled = false;
    const fetchSingleListing = async () => {
      if (rawId) {
        try {
          const res = await api.marketplace.getListing(rawId);
          if (!isCancelled && res.data) {
            const d = res.data;
            setProduct({
              id: String(d.id || rawId),
              name: d.crop_name || d.name || initialProduct.name,
              category: d.category || initialProduct.category || 'Vegetables',
              pricePerKg: d.price_per_kg ?? initialProduct.pricePerKg ?? 30,
              unit: d.unit || initialProduct.unit || 'kg',
              imageUrl: d.image_url || initialProduct.imageUrl,
              farmerId: String(d.farmer_id || initialProduct.farmerId || '1'),
              farmerName: d.farmer_name || initialProduct.farmerName || 'Rudra Patel',
              farmName: d.farm_name || initialProduct.farmName || 'Patel Organic Farms',
              location: d.farmer_location || initialProduct.location || 'Surat, Gujarat',
              farmerAvatar: d.farmer_avatar || initialProduct.farmerAvatar || '/images/farmer-portrait.jpg',
              rating: d.farmer_rating || initialProduct.rating || 4.9,
              reviewsCount: d.farmer_reviews_count || initialProduct.reviewsCount || 12,
              availableStockKg: d.available_stock_kg ?? initialProduct.availableStockKg ?? 200,
              quantityAvailableKg: d.available_stock_kg ?? initialProduct.availableStockKg ?? 200,
              description: d.description || initialProduct.description || '',
              variety: d.variety || initialProduct.variety || 'Hybrid Fresh Pick',
              isOrganic: d.is_organic !== undefined ? Boolean(d.is_organic) : initialProduct.isOrganic,
              harvestDate: d.harvest_date || initialProduct.harvestDate || 'Today',
              farmerPhone: d.farmer_phone || initialProduct.farmerPhone || '+91 98251 44321',
            });
          }
        } catch (err) {
          console.warn('Single listing fetch fallback:', err);
        }
      }
    };

    fetchSingleListing();
    return () => {
      isCancelled = true;
    };
  }, [rawId]);

  const [quantity, setQuantity] = useState(5);
  const [addedNotice, setAddedNotice] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const totalPrice = quantity * product.pricePerKg;

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2200);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    navigate('/customer/checkout');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <CustomerNavbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-8 pt-24 pb-8 space-y-6">
        {/* Back navigation */}
        <button
          onClick={() => navigate('/customer/browse-crops')}
          className="inline-flex items-center gap-2 text-xs font-bold text-white bg-white/15 hover:bg-white/25 px-3.5 py-1.5 rounded-xl transition-all border border-white/20 cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-white" />
          <span>Back to Marketplace</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* PRODUCT MAIN DETAILS */}
          <div className="lg:col-span-8">
            <GlassCard variant="elevated" className="p-6 sm:p-8 space-y-6">
              {/* Product Visual */}
              <div className="relative rounded-2xl overflow-hidden aspect-16/10 bg-slate-900 border border-white/20 shadow-xs">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.isOrganic && (
                  <span className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-xs font-extrabold px-3 py-1 rounded-xl shadow-md flex items-center gap-1.5 border border-white/30">
                    <Leaf className="w-3.5 h-3.5 text-white" />
                    100% Certified Organic
                  </span>
                )}
              </div>

              {/* Title, Subtitle, Price, Rating */}
              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {product.name}
                  </h1>
                  <div className="text-3xl font-black text-white tracking-tight">
                    ₹{product.pricePerKg}{' '}
                    <span className="text-xs font-bold text-white/70">/ {product.unit}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm font-bold text-white/90">
                  {product.variety} • Fresh Field Harvest
                </p>

                <div className="flex items-center gap-4 mt-3 text-xs text-white/80">
                  <div className="flex items-center gap-1 text-white font-extrabold">
                    <Star className="w-4 h-4 fill-white text-white" />
                    <span>{product.rating} ({product.reviewsCount} verified reviews)</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1 text-white/90 font-bold">
                    <MapPin className="w-3.5 h-3.5 text-white" />
                    <span>{product.location}</span>
                  </div>
                </div>
              </div>

              {/* Interactive Quantity Selector & Price Preview */}
              <div className="p-4 rounded-2xl bg-black/30 border border-white/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-white">Order Quantity:</span>
                  <div className="flex items-center gap-3 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-1 rounded-lg hover:bg-white/20 text-white cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-12 text-center text-sm font-black text-white">
                      {quantity} kg
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-1 rounded-lg hover:bg-white/20 text-white cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-white/20 text-xs">
                  <span className="text-white/80 font-semibold">Subtotal ({quantity} kg):</span>
                  <span className="text-base font-black text-white">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <GlassButton
                  id="add-to-cart-btn"
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-1/2"
                  onClick={handleAddToCart}
                  icon={addedNotice ? <Check className="w-5 h-5 text-white" /> : <ShoppingCart className="w-5 h-5" />}
                >
                  {addedNotice ? 'Added to Cart!' : 'Add to Cart'}
                </GlassButton>

                <GlassButton
                  id="buy-now-btn"
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-1/2"
                  onClick={handleBuyNow}
                  icon={<Zap className="w-5 h-5" />}
                >
                  Direct Checkout
                </GlassButton>
              </div>
            </GlassCard>
          </div>

          {/* FARMER PROFILE CARD & ASSURANCES */}
          <div className="lg:col-span-4 space-y-6">
            <GlassCard variant="elevated" className="p-6 space-y-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-white block mb-2">
                Cultivated By
              </span>

              <div className="flex items-center gap-3">
                <img
                  src={product.farmerAvatar}
                  alt={product.farmerName}
                  className="w-14 h-14 rounded-2xl object-cover border border-white/30 shadow-xs"
                />
                <div>
                  <h3 className="text-sm font-black text-white">{product.farmerName}</h3>
                  <p className="text-xs text-white/80 font-medium">{product.farmName}</p>
                  <div className="flex items-center gap-1 text-[11px] text-white font-bold mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-white" />
                    <span>Verified Lead Grower</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs text-white/80 pt-3 border-t border-white/20">
                <div className="flex justify-between">
                  <span className="text-white/70">Farm Location:</span>
                  <span className="font-bold text-white">{product.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Harvest Date:</span>
                  <span className="font-bold text-white">{product.harvestDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Soil & Bio Treatment:</span>
                  <span className="font-bold text-white">Neem Extract 3000 ppm</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setContactModalOpen(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20 shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-white" />
                  <span>Contact Farmer Directly</span>
                </button>
              </div>
            </GlassCard>

            {/* Freshness & Logistics Badge */}
            <GlassCard variant="elevated" className="p-5 space-y-3">
              <div className="flex items-center gap-3 text-xs">
                <div className="w-8 h-8 rounded-xl bg-white/15 text-white border border-white/25 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">Express Direct Dispatch</span>
                  <span className="text-white/70 text-[11px]">Dispatched within 6 hours of harvest</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="w-8 h-8 rounded-xl bg-white/15 text-white border border-white/25 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">100% Quality Replacement</span>
                  <span className="text-white/70 text-[11px]">Residue tested before packaging</span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Contact Farmer Modal */}
        {contactModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <GlassCard variant="elevated" className="max-w-md w-full p-6 space-y-4 border-white/30">
              <h3 className="text-lg font-black text-white">Direct Farmer Contact</h3>
              <p className="text-xs text-white/80">
                You are contacting <strong className="text-white">{product.farmerName}</strong> at <strong className="text-white">{product.farmName}</strong> in {product.location}.
              </p>
              <div className="p-4 rounded-xl bg-black/40 border border-white/20 text-xs space-y-1">
                <div className="font-bold text-white/80">Farmer Direct Line:</div>
                <div className="text-base font-black text-white">{product.farmerPhone || '+91 98251 44321'}</div>
              </div>
              <div className="flex justify-end pt-2">
                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setContactModalOpen(false)}
                >
                  Close
                </GlassButton>
              </div>
            </GlassCard>
          </div>
        )}
      </main>
    </div>
  );
};
