import React, { useState, useEffect } from 'react';
import { useRouter } from '../../lib/router';
import { CustomerNavbar } from '../../components/layout/CustomerNavbar';
import { GlassCard } from '../../components/common/GlassCard';
import { GlassButton } from '../../components/common/GlassButton';
import { useCart } from '../../lib/cart';
import {
  Truck,
  MessageSquare,
  Phone
} from 'lucide-react';
import { api } from '../../lib/api';

const ORDER_STATUS_LABELS = [
  { label: 'Order Received', desc: 'Logged on farmer harvest terminal' },
  { label: 'Payment Confirmed', desc: 'Secure direct payment confirmed' },
  { label: 'Farmer Harvest Scheduled', desc: 'Crop harvested fresh from plot' },
  { label: 'Aerated Packaging Complete', desc: 'Packed in organic ventilated crates' },
  { label: 'Out for Doorstep Delivery', desc: 'In transit via direct delivery' },
  { label: 'Delivered', desc: 'Arrived at your doorstep in fresh condition' }
];

export const OrderTrackingPage: React.FC = () => {
  const { navigate } = useRouter();
  const { currentOrder, activeOrder, updateOrderStatus } = useCart();
  const [contactOpen, setContactOpen] = useState(false);
  const [liveStatusIndex, setLiveStatusIndex] = useState<number>(activeOrder.currentStatusIndex ?? 1);

  // Sync with backend order status
  useEffect(() => {
    let isCancelled = false;
    const fetchLiveStatus = async () => {
      const orderId = activeOrder.id || currentOrder.id;
      if (orderId) {
        try {
          const res = await api.orders.get(orderId);
          if (!isCancelled && res.data && res.data.current_status_index !== undefined) {
            setLiveStatusIndex(res.data.current_status_index);
            updateOrderStatus(res.data.current_status_index);
          }
        } catch (err) {
          console.warn('Live order status fallback:', err);
        }
      }
    };

    fetchLiveStatus();
    const interval = setInterval(fetchLiveStatus, 5000);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [activeOrder.id, currentOrder.id]);

  const timelineSteps = ORDER_STATUS_LABELS.map((item, idx) => {
    let status: 'completed' | 'current' | 'upcoming' = 'upcoming';
    if (idx < liveStatusIndex) {
      status = 'completed';
    } else if (idx === liveStatusIndex) {
      status = 'current';
    }
    return {
      label: item.label,
      desc: item.desc,
      status,
      time: idx <= liveStatusIndex ? 'Verified' : 'Pending'
    };
  });

  return (
    <div className="flex flex-col min-h-screen">
      <CustomerNavbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-8 pt-24 pb-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 border border-white/30 text-white text-xs font-bold mb-2">
              <Truck className="w-3.5 h-3.5 text-white" />
              <span>Live Delivery Dispatch</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Real-Time Order Tracking
            </h1>
            <p className="text-xs sm:text-sm text-white/80 font-medium">
              Live updates from the farm gate directly to your doorstep.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={() => setContactOpen(true)}
              icon={<Phone className="w-4 h-4 text-white" />}
            >
              Contact Farmer
            </GlassButton>
            <GlassButton
              variant="primary"
              size="sm"
              onClick={() => navigate('/customer/feedback')}
              icon={<MessageSquare className="w-4 h-4" />}
            >
              Rate Produce
            </GlassButton>
          </div>
        </div>

        {/* Order Details Header */}
        <GlassCard variant="elevated" className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
            <div>
              <span className="text-white/70 font-semibold block text-[10px] uppercase">Order ID</span>
              <span className="font-mono font-extrabold text-white text-xs">
                {currentOrder.id}
              </span>
            </div>

            <div>
              <span className="text-white/70 font-semibold block text-[10px] uppercase">Order Date</span>
              <span className="font-bold text-white">
                {currentOrder.orderDate}
              </span>
            </div>

            <div>
              <span className="text-white/70 font-semibold block text-[10px] uppercase">Total Amount</span>
              <span className="font-black text-white text-sm">
                ₹{currentOrder.total.toLocaleString('en-IN')}
              </span>
            </div>

            <div>
              <span className="text-white/70 font-semibold block text-[10px] uppercase">Payment</span>
              <span className="font-bold text-white bg-white/15 border border-white/30 px-2 py-0.5 rounded-md inline-block">
                {currentOrder.paymentStatus}
              </span>
            </div>

            <div>
              <span className="text-white/70 font-semibold block text-[10px] uppercase">Grower</span>
              <span className="font-bold text-white truncate block">
                {currentOrder.farmerName}
              </span>
            </div>

            <div>
              <span className="text-white/70 font-semibold block text-[10px] uppercase">Destination</span>
              <span className="font-bold text-white truncate block" title={currentOrder.deliveryAddress}>
                {currentOrder.deliveryAddress.split(',')[0]}
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Visual Timeline Tracking Card */}
        <GlassCard variant="elevated" className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/20">
            <h3 className="text-base font-black text-white">
              Harvest & Transit Timeline
            </h3>
            <span className="text-xs font-bold text-white bg-white/20 px-3 py-1 rounded-full border border-white/30">
              Live Status: Out for Delivery
            </span>
          </div>

          <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-white/30">
            {timelineSteps.map((step, idx) => {
              const isCompleted = step.status === 'completed';
              const isCurrent = step.status === 'current';

              return (
                <div key={idx} className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  {/* Timeline Pin */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-1 w-4 h-4 rounded-full border-2 border-black/80 shadow-xs flex items-center justify-center ${
                      isCompleted
                        ? 'bg-white text-black font-black'
                        : isCurrent
                          ? 'bg-amber-400 text-black font-black animate-pulse'
                          : 'bg-black/50 text-transparent border-white/40'
                    }`}
                  >
                    {isCompleted && <span className="text-[9px] font-bold">✓</span>}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-white">
                        {step.label}
                      </h4>
                      {isCurrent && (
                        <span className="text-[10px] font-extrabold bg-amber-500/20 border border-amber-400/30 text-amber-200 px-2 py-0.5 rounded-full">
                          In Transit
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/80 mt-0.5 font-medium">{step.desc}</p>
                  </div>

                  <span className="text-[11px] font-bold text-white bg-black/40 px-2.5 py-1 rounded-lg border border-white/20 shrink-0">
                    {step.time}
                  </span>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Contact Farmer Modal */}
        {contactOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <GlassCard variant="elevated" className="max-w-md w-full p-6 space-y-4 border-white/30">
              <h3 className="text-lg font-black text-white">Direct Farmer Line</h3>
              <p className="text-xs text-white/80">
                Contacting grower <strong className="text-white">{currentOrder.farmerName}</strong> regarding order <strong className="text-white">{currentOrder.id}</strong>.
              </p>
              <div className="p-4 rounded-xl bg-black/40 border border-white/20 text-xs space-y-1">
                <div className="font-bold text-white/80">Farmer Phone Number:</div>
                <div className="text-base font-black text-white">+91 98251 44321</div>
              </div>
              <div className="flex justify-end pt-2">
                <GlassButton variant="secondary" size="sm" onClick={() => setContactOpen(false)}>
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
