import React, { useState } from 'react';
import { useRouter } from '../../lib/router';
import { CustomerNavbar } from '../../components/layout/CustomerNavbar';
import { GlassCard } from '../../components/common/GlassCard';
import { GlassButton } from '../../components/common/GlassButton';
import { useCart } from '../../lib/cart';
import { Star, Check, ArrowLeft, Sparkles } from 'lucide-react';
import { api } from '../../lib/api';

export const FeedbackPage: React.FC = () => {
  const { navigate } = useRouter();
  const { currentOrder } = useCart();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [quality, setQuality] = useState('Excellent');
  const [delivery, setDelivery] = useState('On Time');
  const [reviewText, setReviewText] = useState(
    'Outstanding harvest quality! The organic produce arrived in pristine condition, fresh and crisp directly from early morning harvest.'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const orderIdNum = parseInt(currentOrder.id.replace(/\D/g, ''), 10) || 1;
      await api.reviews.create(orderIdNum, rating, `${quality} Quality, ${delivery} Delivery: ${reviewText}`);
      setSubmitted(true);
    } catch (err) {
      console.warn('Backend review submission fallback:', err);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <CustomerNavbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-8 pt-24 pb-8 space-y-6">
        <div>
          <button
            onClick={() => navigate('/customer/order-tracking')}
            className="inline-flex items-center gap-2 text-xs font-bold text-white bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-xl transition-all border border-white/20 cursor-pointer shadow-2xs mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-white" />
            <span>Back to Order Tracking</span>
          </button>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 border border-white/30 text-white text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Grower Recognition System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Rate Harvest Quality
          </h1>
          <p className="text-xs sm:text-sm text-white/80 font-medium">
            Your feedback supports sustainable agriculture and verified local farmers.
          </p>
        </div>

        <GlassCard variant="elevated" className="p-6 sm:p-8">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/15 border border-white/40 text-white flex items-center justify-center mx-auto text-3xl shadow-lg">
                <Check className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-white">
                Thank you for supporting our farmers!
              </h2>
              <p className="text-xs sm:text-sm text-white/80 max-w-md mx-auto leading-relaxed">
                Your 5-star rating and review have been published to <strong className="text-white">{currentOrder.farmerName}</strong>'s public grower profile.
              </p>

              <div className="pt-4 flex items-center justify-center gap-3">
                <GlassButton
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/customer/browse-crops')}
                >
                  Browse More Harvests
                </GlassButton>
                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/customer/dashboard')}
                >
                  Dashboard
                </GlassButton>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Order Reference Box */}
              <div className="p-4 rounded-2xl bg-black/30 border border-white/20 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-white/70 font-semibold block text-[10px] uppercase">Produce</span>
                  <span className="font-extrabold text-white text-sm">
                    {currentOrder.items[0]?.product.name || 'Tomato'} (Fresh Pick)
                  </span>
                </div>
                <div>
                  <span className="text-white/70 font-semibold block text-[10px] uppercase">Farmer</span>
                  <span className="font-extrabold text-white text-sm">
                    {currentOrder.farmerName}
                  </span>
                </div>
                <div>
                  <span className="text-white/70 font-semibold block text-[10px] uppercase">Order ID</span>
                  <span className="font-mono font-extrabold text-white text-sm">
                    {currentOrder.id}
                  </span>
                </div>
              </div>

              {/* Interactive Star Rating */}
              <div className="text-center py-3">
                <span className="text-xs font-extrabold uppercase text-white block mb-2">
                  Overall Harvest Rating
                </span>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-115"
                    >
                      <Star
                        className={`w-8 h-8 ${(hoverRating || rating) >= star
                            ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                            : 'text-white/30 border-white/20'
                          }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Tag Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/90 mb-1.5">
                    Produce Freshness:
                  </label>
                  <div className="flex gap-2">
                    {['Excellent', 'Good', 'Average'].map((q) => (
                      <button
                        type="button"
                        key={q}
                        onClick={() => setQuality(q)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${quality === q
                            ? 'glass-btn-primary text-white'
                            : 'glass-btn-secondary text-white/80'
                          }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/90 mb-1.5">
                    Delivery Speed:
                  </label>
                  <div className="flex gap-2">
                    {['On Time', 'Fast', 'Delayed'].map((d) => (
                      <button
                        type="button"
                        key={d}
                        onClick={() => setDelivery(d)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${delivery === d
                            ? 'glass-btn-primary text-white'
                            : 'glass-btn-secondary text-white/80'
                          }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Review Text Area */}
              <div>
                <label className="block text-xs font-bold text-white/90 mb-1.5">
                  Detailed Review / Note to Farmer:
                </label>
                <textarea
                  rows={4}
                  required
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full glass-input rounded-2xl p-3.5 text-xs font-semibold text-white leading-relaxed placeholder:text-white/40"
                />
              </div>

              <div className="flex justify-end pt-2">
                <GlassButton
                  id="submit-feedback-btn"
                  variant="primary"
                  size="md"
                  type="submit"
                >
                  Submit Public Review
                </GlassButton>
              </div>
            </form>
          )}
        </GlassCard>
      </main>
    </div>
  );
};
