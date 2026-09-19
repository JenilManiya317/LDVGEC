import React, { useState, useEffect } from 'react';
import { useRouter } from '../../lib/router';
import { useAuth } from '../../lib/auth';
import { useCart } from '../../lib/cart';
import { FarmerSidebar } from '../../components/layout/FarmerSidebar';
import { GlassCard } from '../../components/common/GlassCard';
import { GlassButton } from '../../components/common/GlassButton';
import {
  ShoppingBag,
  Store,
  PlusCircle,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ExternalLink,
  Trash2,
  Edit3,
  Check,
  Eye,
  DollarSign
} from 'lucide-react';
import { getCustomListings, getMergedProducts } from '../../lib/marketplace';
import { ProductItem, OrderItem } from '../../lib/types';
import { MOCK_ACTIVE_ORDER, MOCK_PRODUCTS } from '../../lib/mock-data';

const ORDER_STATUS_STEPS = [
  'Order Placed',
  'Payment Confirmed',
  'Farmer Accepted',
  'Harvested & Packed',
  'Out for Delivery',
  'Delivered'
];

export const SellerHubPage: React.FC = () => {
  const { navigate } = useRouter();
  const { user } = useAuth();
  const { activeOrder, updateOrderStatus } = useCart();

  const [activeTab, setActiveTab] = useState<'listings' | 'orders'>('listings');
  const [listedCrops, setListedCrops] = useState<ProductItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');

  // Load custom listings & orders on mount
  useEffect(() => {
    // 1. Get farmer's listed crops (all custom listings + default crops for this farmer)
    const custom = getCustomListings();
    if (custom.length > 0) {
      setListedCrops(custom);
    } else {
      // If no custom listings yet, display default mock products as the initial active inventory
      setListedCrops(MOCK_PRODUCTS.slice(0, 3));
    }

    // 2. Orders list (including active cart order + sample historical order)
    const mockOrder2: OrderItem = {
      id: 'ord_fw_9120',
      orderNumber: 'FW-2026-9120',
      date: 'September 17, 2026',
      items: [
        { product: MOCK_PRODUCTS[0], quantityKg: 25 },
        { product: MOCK_PRODUCTS[2], quantityKg: 10 },
      ],
      subtotal: 880,
      deliveryFee: 40,
      total: 920,
      paymentMethod: 'UPI',
      paymentStatus: 'Paid',
      deliveryAddress: {
        name: 'Priya Mehta',
        phone: '+91 98980 12345',
        address: '401, Nilkanth Heights, Adajan',
        city: 'Surat',
        state: 'Gujarat',
        pincode: '395009'
      },
      deliveryMethod: 'Standard Delivery',
      currentStatusIndex: 5, // Delivered
      farmerName: user?.name || 'Rudra Patel',
      farmerPhone: user?.phone || '+91 98251 44321'
    };

    setOrders([activeOrder, mockOrder2]);
  }, [activeOrder, user]);

  const handleUpdateOrderStatus = (orderId: string, newStatusIndex: number) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId ? { ...ord, currentStatusIndex: newStatusIndex } : ord
      )
    );
    if (activeOrder.id === orderId) {
      updateOrderStatus(newStatusIndex);
    }
  };

  const handleSavePrice = (cropId: string) => {
    const nextPrice = parseFloat(tempPrice);
    if (!isNaN(nextPrice) && nextPrice > 0) {
      const updated = listedCrops.map((c) =>
        c.id === cropId ? { ...c, pricePerKg: nextPrice } : c
      );
      setListedCrops(updated);
      try {
        localStorage.setItem('agrisetu_custom_listings_v1', JSON.stringify(updated));
      } catch (e) {
        console.warn('Error updating price in storage:', e);
      }
    }
    setEditingPriceId(null);
  };

  const handleDeleteListing = (cropId: string) => {
    if (window.confirm('Are you sure you want to remove this crop from the marketplace?')) {
      const updated = listedCrops.filter((c) => c.id !== cropId);
      setListedCrops(updated);
      try {
        localStorage.setItem('agrisetu_custom_listings_v1', JSON.stringify(updated));
      } catch (e) {
        console.warn('Error deleting listing:', e);
      }
    }
  };

  // Calculations for stats
  const totalStockKg = listedCrops.reduce((sum, c) => sum + (c.availableStockKg || 0), 0);
  const totalInventoryValue = listedCrops.reduce(
    (sum, c) => sum + (c.availableStockKg || 0) * c.pricePerKg,
    0
  );
  const totalOrdersValue = orders.reduce((sum, ord) => sum + ord.total, 0);
  const activeOrdersCount = orders.filter((o) => o.currentStatusIndex < 5).length;

  return (
    <div className="flex min-h-screen text-white">
      <FarmerSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-surface border border-white/20 text-white text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Farmer Direct Seller Interface</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Seller Hub & Orders Management
            </h1>
            <p className="text-xs sm:text-sm text-white/80 font-medium">
              Monitor active customer orders, update delivery status, and manage all your live marketplace crop listings.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <GlassButton
              id="view-marketplace-btn"
              variant="primary"
              size="sm"
              onClick={() => navigate('/customer/browse-crops')}
              icon={<Store className="w-4 h-4 text-white" />}
            >
              Browse Marketplace
            </GlassButton>

            <GlassButton
              id="list-crop-btn"
              variant="secondary"
              size="sm"
              onClick={() => navigate('/farmer/list-crop')}
              icon={<PlusCircle className="w-4 h-4 text-white" />}
            >
              List New Crop
            </GlassButton>
          </div>
        </div>

        {/* 4 Summary Stat Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassCard className="p-5 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                Live Listed Crops
              </span>
              <div className="w-8 h-8 rounded-xl bg-white/15 text-white flex items-center justify-center border border-white/25">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white">{listedCrops.length}</div>
            <div className="text-[11px] text-white/80 font-bold mt-1">
              {totalStockKg} kg Available Stock
            </div>
          </GlassCard>

          <GlassCard className="p-5 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                Active Orders
              </span>
              <div className="w-8 h-8 rounded-xl bg-white/15 text-white flex items-center justify-center border border-white/25">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white">{activeOrdersCount}</div>
            <div className="text-[11px] text-white/80 font-bold mt-1">
              {orders.length} Total Customer Orders
            </div>
          </GlassCard>

          <GlassCard className="p-5 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                Gross Direct Sales
              </span>
              <div className="w-8 h-8 rounded-xl bg-white/15 text-white flex items-center justify-center border border-white/25">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              ₹{totalOrdersValue.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-white/80 font-bold mt-1">100% Zero Commissions</div>
          </GlassCard>

          <GlassCard className="p-5 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                Inventory Value
              </span>
              <div className="w-8 h-8 rounded-xl bg-white/15 text-white flex items-center justify-center border border-white/25">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              ₹{totalInventoryValue.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-white/80 font-bold mt-1">Active Market Exposure</div>
          </GlassCard>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-white/20 pb-3">
          <button
            id="tab-listed-crops"
            onClick={() => setActiveTab('listings')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeTab === 'listings'
                ? 'bg-white text-slate-950 font-black shadow-lg border-white'
                : 'glass-surface hover:bg-white/15 text-white/80 border-white/20'
            }`}
          >
            My Listed Crops ({listedCrops.length})
          </button>

          <button
            id="tab-customer-orders"
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeTab === 'orders'
                ? 'bg-white text-slate-950 font-black shadow-lg border-white'
                : 'glass-surface hover:bg-white/15 text-white/80 border-white/20'
            }`}
          >
            Customer Orders ({orders.length})
          </button>
        </div>

        {/* TAB 1: LISTED CROPS INTERFACE */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white">Live Crops for Sale in Marketplace</h2>
              <button
                onClick={() => navigate('/farmer/list-crop')}
                className="text-xs font-extrabold text-white bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-xl border border-white/25 inline-flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Publish Another Crop</span>
              </button>
            </div>

            {listedCrops.length === 0 ? (
              <GlassCard className="p-12 text-center border border-white/20">
                <Package className="w-12 h-12 text-white/40 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">No active crop listings found</h3>
                <p className="text-xs text-white/70 mt-1 max-w-sm mx-auto">
                  Publish your freshly harvested produce directly to regional consumers with zero commission cut.
                </p>
                <div className="pt-4">
                  <GlassButton
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/farmer/list-crop')}
                    icon={<PlusCircle className="w-4 h-4" />}
                  >
                    List Harvested Crop Now
                  </GlassButton>
                </div>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listedCrops.map((crop) => (
                  <GlassCard
                    key={crop.id}
                    variant="elevated"
                    className="p-5 flex flex-col justify-between border border-white/20 space-y-4"
                  >
                    <div>
                      <div className="relative w-full h-44 rounded-xl overflow-hidden mb-3 border border-white/20">
                        <img
                          src={crop.imageUrl}
                          alt={crop.name}
                          className="w-full h-full object-cover"
                        />
                        {crop.isOrganic && (
                          <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-white text-slate-950 text-[10px] font-extrabold shadow-sm">
                            100% Organic
                          </span>
                        )}
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-sm flex items-center gap-1">
                          <Check className="w-3 h-3" /> Active on Market
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-baseline justify-between">
                          <h3 className="text-base font-extrabold text-white">{crop.name}</h3>
                          <div className="text-right">
                            {editingPriceId === crop.id ? (
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-bold text-white">₹</span>
                                <input
                                  type="number"
                                  min="1"
                                  value={tempPrice}
                                  onChange={(e) => setTempPrice(e.target.value)}
                                  className="w-16 glass-input rounded-lg px-2 py-0.5 text-xs font-bold text-white"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleSavePrice(crop.id)}
                                  className="p-1 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600"
                                  title="Save price"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span className="text-lg font-black text-white">
                                  ₹{crop.pricePerKg}
                                </span>
                                <span className="text-[10px] text-white/70">/ kg</span>
                                <button
                                  onClick={() => {
                                    setEditingPriceId(crop.id);
                                    setTempPrice(String(crop.pricePerKg));
                                  }}
                                  className="p-1 rounded-lg hover:bg-white/15 text-white/70 hover:text-white"
                                  title="Change price"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-white/80 font-medium">{crop.variety}</p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-white/15 space-y-1.5 text-xs text-white/80">
                        <div className="flex justify-between">
                          <span className="text-white/65">Stock Available:</span>
                          <span className="font-bold text-white">{crop.availableStockKg} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/65">Harvest Date:</span>
                          <span className="font-bold text-white">{crop.harvestDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/65">Dispatch Point:</span>
                          <span className="font-bold text-white truncate max-w-[140px]">
                            {crop.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/15 flex items-center justify-between gap-2">
                      <button
                        onClick={() => navigate(`/customer/product/${crop.id}`)}
                        className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View in Market</span>
                      </button>

                      <button
                        onClick={() => handleDeleteListing(crop.id)}
                        className="p-2 rounded-xl hover:bg-rose-900/40 text-rose-300 transition-all cursor-pointer"
                        title="Delete Listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CUSTOMER ORDERS INTERFACE */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white">Incoming Customer Orders</h2>
              <span className="text-xs text-white/70 font-medium">
                Real-time delivery progress & fulfillment tracker
              </span>
            </div>

            <div className="space-y-6">
              {orders.map((ord) => (
                <GlassCard
                  key={ord.id}
                  variant="elevated"
                  className="p-6 border border-white/20 space-y-5"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/15">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-white">{ord.orderNumber}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-extrabold">
                          {ord.paymentStatus} via {ord.paymentMethod}
                        </span>
                      </div>
                      <span className="text-xs text-white/70 font-medium">
                        Order Placed: {ord.date}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-2xl font-black text-white">
                        ₹{ord.total.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-white/70 block">
                        Includes ₹{ord.deliveryFee} delivery fee
                      </span>
                    </div>
                  </div>

                  {/* Customer Delivery Info & Ordered Produce */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Dispatch Address */}
                    <div className="p-4 rounded-2xl bg-black/30 border border-white/15 space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-white/70 block">
                        Buyer & Dispatch Address:
                      </span>
                      <div className="font-extrabold text-sm text-white">
                        {typeof ord.deliveryAddress === 'string'
                          ? ord.deliveryAddress
                          : ord.deliveryAddress.name}
                      </div>
                      {typeof ord.deliveryAddress !== 'string' && (
                        <>
                          <p className="text-xs text-white/80">
                            {ord.deliveryAddress.address}, {ord.deliveryAddress.city},{' '}
                            {ord.deliveryAddress.state} - {ord.deliveryAddress.pincode}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-white pt-1">
                            <Phone className="w-3.5 h-3.5 text-white" />
                            <span>{ord.deliveryAddress.phone}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Items Ordered List */}
                    <div className="p-4 rounded-2xl bg-black/30 border border-white/15 space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-white/70 block">
                        Harvest Items in Order:
                      </span>
                      <div className="space-y-2">
                        {ord.items.map((it, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs text-white font-medium"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-white/15 flex items-center justify-center font-black text-[10px]">
                                {idx + 1}
                              </span>
                              <span>{it.product.name}</span>
                            </div>
                            <span className="font-bold">
                              {it.quantityKg} kg × ₹{it.product.pricePerKg} = ₹
                              {it.quantityKg * it.product.pricePerKg}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Fulfillment Status Stepper */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white">
                        Delivery & Fulfillment Progression:
                      </span>
                      <span className="text-xs font-extrabold text-white bg-white/15 px-2.5 py-0.5 rounded-full border border-white/20">
                        Current: {ORDER_STATUS_STEPS[ord.currentStatusIndex]}
                      </span>
                    </div>

                    {/* Step pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                      {ORDER_STATUS_STEPS.map((stepName, stepIdx) => {
                        const isCompleted = stepIdx <= ord.currentStatusIndex;
                        const isCurrent = stepIdx === ord.currentStatusIndex;

                        return (
                          <button
                            key={stepName}
                            onClick={() => handleUpdateOrderStatus(ord.id, stepIdx)}
                            className={`p-2 rounded-xl text-[11px] font-bold text-left transition-all border cursor-pointer ${
                              isCurrent
                                ? 'bg-white text-slate-950 font-black shadow-md border-white'
                                : isCompleted
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 hover:bg-emerald-500/30'
                                : 'glass-surface hover:bg-white/10 text-white/60 border-white/15'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              {isCompleted ? (
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              ) : (
                                <Clock className="w-3.5 h-3.5 shrink-0" />
                              )}
                              <span>Step {stepIdx + 1}</span>
                            </div>
                            <div className="truncate">{stepName}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
