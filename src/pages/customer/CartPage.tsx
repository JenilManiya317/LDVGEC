import React from 'react';
import { useRouter } from '../../lib/router';
import { CustomerNavbar } from '../../components/layout/CustomerNavbar';
import { GlassCard } from '../../components/common/GlassCard';
import { GlassButton } from '../../components/common/GlassButton';
import { useCart } from '../../lib/cart';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const CartPage: React.FC = () => {
  const { navigate } = useRouter();
  const { items, updateQuantity, removeFromCart, subtotal, deliveryFee, total } = useCart();

  return (
    <div className="flex flex-col min-h-screen">
      <CustomerNavbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-8 pt-24 pb-8 space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 border border-white/30 text-white text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Farm Fresh Basket</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-xs sm:text-sm text-white/80 font-medium">
            Review your direct harvest items and proceed to secure checkout.
          </p>
        </div>

        {items.length === 0 ? (
          <GlassCard variant="elevated" className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/15 border border-white/30 flex items-center justify-center mx-auto text-white">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-white">Your basket is empty</h3>
            <p className="text-xs text-white/80 max-w-sm mx-auto font-medium">
              Explore freshly harvested produce directly from local verified growers.
            </p>
            <GlassButton
              variant="primary"
              size="sm"
              onClick={() => navigate('/customer/browse-crops')}
            >
              Browse Crops
            </GlassButton>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-7 space-y-3">
              {items.map((item) => {
                const itemTotal = item.product.pricePerKg * item.quantityKg;
                return (
                  <GlassCard
                    key={item.product.id}
                    variant="elevated"
                    className="p-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-xl object-cover border border-white/30 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-black text-white truncate">
                          {item.product.name}
                        </h4>
                        <div className="text-xs text-white/80 font-medium">
                          ₹{item.product.pricePerKg} / {item.product.unit} • {item.product.farmerName}
                        </div>
                        <div className="text-sm font-black text-white mt-0.5">
                          ₹{itemTotal.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    {/* Quantity Stepper & Delete */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center bg-black/40 border border-white/20 rounded-xl p-0.5">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantityKg - 1)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white hover:bg-white/20 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-10 text-center text-xs font-black text-white">
                          {item.quantityKg} kg
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantityKg + 1)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white hover:bg-white/20 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </GlassCard>
                );
              })}
            </div>

            {/* Order Summary Card */}
            <div className="lg:col-span-5">
              <GlassCard variant="elevated" className="p-6 space-y-4 sticky top-24">
                <h3 className="text-base font-black text-white pb-3 border-b border-white/20">
                  Order Summary
                </h3>

                <div className="space-y-2 text-xs font-medium text-white/80">
                  <div className="flex justify-between">
                    <span className="text-white/70">Items Subtotal:</span>
                    <span className="font-bold text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Direct Express Delivery:</span>
                    <span className="font-bold text-white">₹{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>Middleman Commission:</span>
                    <span className="font-bold">₹0 (Direct Farm)</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/20 flex justify-between items-baseline">
                  <span className="text-sm font-black text-white">Total Amount:</span>
                  <span className="text-2xl font-black text-white">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="pt-2">
                  <GlassButton
                    id="checkout-btn"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={() => navigate('/customer/checkout')}
                    icon={<ArrowRight className="w-4 h-4" />}
                  >
                    Proceed to Checkout
                  </GlassButton>
                </div>

                <div className="text-[11px] text-white/70 text-center flex items-center justify-center gap-1.5 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  <span>Residue-free guarantee with instant refund policy</span>
                </div>
              </GlassCard>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
