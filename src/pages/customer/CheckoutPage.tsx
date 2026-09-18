import React, { useState } from 'react';
import { useRouter } from '../../lib/router';
import { CustomerNavbar } from '../../components/layout/CustomerNavbar';
import { GlassCard } from '../../components/common/GlassCard';
import { GlassButton } from '../../components/common/GlassButton';
import { useCart } from '../../lib/cart';
import { useAuth } from '../../lib/auth';
import { Check, Truck, Store, CreditCard, Banknote, QrCode, Sparkles } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { navigate } = useRouter();
  const { user } = useAuth();
  const { subtotal, deliveryFee, total, placeOrder } = useCart();

  const [address, setAddress] = useState({
    name: user?.name || 'Aarav Sharma',
    phone: user?.phone || '+91 97234 88120',
    address: 'B-402, Green Orchid Residency, SG Highway',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380054'
  });

  const [deliveryMethod, setDeliveryMethod] = useState<'Standard Delivery' | 'Farmer Pickup'>('Standard Delivery');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Cash on Delivery'>('UPI');
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    placeOrder({
      address,
      deliveryMethod,
      paymentMethod
    });
    setOrderPlaced(true);
    setTimeout(() => {
      navigate('/customer/order-tracking');
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <CustomerNavbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-8 pt-24 pb-8 space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 border border-white/30 text-white text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Direct Farm-to-Doorstep Dispatch</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Checkout & Order Dispatch
          </h1>
          <p className="text-xs sm:text-sm text-white/80 font-medium">
            Complete your order with direct farmer payment and live tracking.
          </p>
        </div>

        {orderPlaced ? (
          <GlassCard variant="elevated" className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/15 border border-white/40 text-white flex items-center justify-center mx-auto text-3xl shadow-lg">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white">
              Order Dispatched Successfully!
            </h2>
            <p className="text-xs sm:text-sm text-white/80 max-w-md mx-auto">
              Your order is recorded and routed to farmer Patel Organic Farms. Opening live tracking timeline...
            </p>
          </GlassCard>
        ) : (
          <form onSubmit={handlePlaceOrder} className="space-y-6">
            {/* STEP 1: Delivery Address */}
            <GlassCard variant="elevated" className="p-6 sm:p-8 space-y-4">
              <div className="border-b border-white/20 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-white">
                    1. Delivery Destination
                  </h3>
                  <p className="text-xs text-white/70 font-medium">Doorstep address for fresh temperature-controlled delivery.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/90 mb-1">
                    Recipient Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={address.name}
                    onChange={(e) => setAddress({ ...address, name: e.target.value })}
                    className="w-full glass-input rounded-xl py-2.5 px-3.5 text-xs font-bold text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/90 mb-1">
                    Contact Mobile Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    className="w-full glass-input rounded-xl py-2.5 px-3.5 text-xs font-bold text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-white/90 mb-1">
                    Street Address & Apartment
                  </label>
                  <input
                    type="text"
                    required
                    value={address.address}
                    onChange={(e) => setAddress({ ...address, address: e.target.value })}
                    className="w-full glass-input rounded-xl py-2.5 px-3.5 text-xs font-bold text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/90 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full glass-input rounded-xl py-2.5 px-3.5 text-xs font-bold text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/90 mb-1">
                    Postal PIN Code
                  </label>
                  <input
                    type="text"
                    required
                    value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                    className="w-full glass-input rounded-xl py-2.5 px-3.5 text-xs font-bold text-white"
                  />
                </div>
              </div>
            </GlassCard>

            {/* STEP 2: Delivery & Payment Methods */}
            <GlassCard variant="elevated" className="p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-base font-black text-white mb-3">
                  2. Delivery & Payment
                </h3>

                {/* Delivery Method Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  <div
                    onClick={() => setDeliveryMethod('Standard Delivery')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                      deliveryMethod === 'Standard Delivery'
                        ? 'bg-white/20 border-white shadow-md'
                        : 'bg-black/30 border-white/20 hover:border-white/40'
                    }`}
                  >
                    <Truck className="w-5 h-5 text-white shrink-0" />
                    <div>
                      <div className="text-xs font-black text-white">Direct Express Delivery (₹40)</div>
                      <div className="text-[11px] text-white/70">Delivered within 6-12 hours</div>
                    </div>
                  </div>

                  <div
                    onClick={() => setDeliveryMethod('Farmer Pickup')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                      deliveryMethod === 'Farmer Pickup'
                        ? 'bg-white/20 border-white shadow-md'
                        : 'bg-black/30 border-white/20 hover:border-white/40'
                    }`}
                  >
                    <Store className="w-5 h-5 text-white shrink-0" />
                    <div>
                      <div className="text-xs font-black text-white">Direct Farm Gate Pickup (Free)</div>
                      <div className="text-[11px] text-white/70">Pickup from farmer estate</div>
                    </div>
                  </div>
                </div>

                {/* Payment Option Selector */}
                <span className="text-xs font-bold text-white/90 block mb-2">Select Payment Method:</span>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                    { id: 'Card', label: 'Debit / Card', icon: CreditCard },
                    { id: 'Cash on Delivery', label: 'Cash On Delivery', icon: Banknote }
                  ].map((p) => {
                    const Icon = p.icon;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setPaymentMethod(p.id as any)}
                        className={`p-3.5 rounded-2xl border text-center cursor-pointer transition-all ${
                          paymentMethod === p.id
                            ? 'bg-white/20 border-white shadow-md'
                            : 'bg-black/30 border-white/20 hover:border-white/40'
                        }`}
                      >
                        <Icon className="w-5 h-5 mx-auto mb-1 text-white" />
                        <span className="text-xs font-bold text-white">{p.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Bill Summary */}
              <div className="p-4 rounded-2xl bg-black/30 border border-white/20 space-y-2 text-xs">
                <div className="flex justify-between font-medium text-white/80">
                  <span>Produce Subtotal:</span>
                  <span className="font-bold text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-medium text-white/80">
                  <span>Logistics / Delivery:</span>
                  <span className="font-bold text-white">₹{deliveryMethod === 'Farmer Pickup' ? 0 : deliveryFee}</span>
                </div>
                <div className="pt-2 border-t border-white/20 flex justify-between text-sm font-black text-white">
                  <span>Grand Total:</span>
                  <span className="text-white text-lg font-black">
                    ₹{(deliveryMethod === 'Farmer Pickup' ? subtotal : total).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <GlassButton
                  id="place-order-submit-btn"
                  variant="primary"
                  size="lg"
                  type="submit"
                  className="w-full"
                >
                  Confirm & Place Order
                </GlassButton>
              </div>
            </GlassCard>
          </form>
        )}
      </main>
    </div>
  );
};
