import React, { useState, useRef } from 'react';
import { useRouter } from '../../lib/router';
import { useAuth } from '../../lib/auth';
import { FarmerSidebar } from '../../components/layout/FarmerSidebar';
import { GlassCard } from '../../components/common/GlassCard';
import { GlassButton } from '../../components/common/GlassButton';
import { CityStateSelect } from '../../components/common/CityStateSelect';
import {
  PlusCircle,
  Check,
  Sparkles,
  Upload,
  Image as ImageIcon,
  X,
  ShoppingCart,
  ArrowRight,
  TrendingUp,
  Tag,
  DollarSign,
  ShieldCheck,
  MapPin
} from 'lucide-react';
import { api } from '../../lib/api';
import { saveCustomListing } from '../../lib/marketplace';
import { ProductItem } from '../../lib/types';

// Preset high quality crop photos for quick 1-click selection
const SAMPLE_CROP_IMAGES = [
  { name: 'Tomato', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=85' },
  { name: 'Potato', url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=85' },
  { name: 'Red Onion', url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=85' },
  { name: 'Golden Wheat', url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=85' },
  { name: 'Basmati Rice', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=85' },
  { name: 'Capsicum', url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=800&q=85' },
  { name: 'Mango', url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=85' },
  { name: 'Spinach', url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=85' },
];

export const ListCropPage: React.FC = () => {
  const { navigate } = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [published, setPublished] = useState(false);
  const [publishedItem, setPublishedItem] = useState<ProductItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    crop: 'Tomato',
    variety: 'Abhinav Hybrid Grade-A Organic',
    category: 'Vegetables' as 'Vegetables' | 'Fruits' | 'Grains' | 'Pulses' | 'Organic',
    quantity: '250',
    price: '28',
    location: user?.location || 'Surat, Gujarat',
    availability: 'Immediate Stock (Harvested This Morning)',
    harvestDate: new Date().toISOString().split('T')[0],
    description: 'Freshly harvested produce directly from farm soil. 100% natural and residue free.',
    isOrganic: true,
  });

  // Image upload state
  const [imageUrl, setImageUrl] = useState<string>(
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=85'
  );
  const [imageFileName, setImageFileName] = useState<string>('sample-tomato.jpg');
  const [isCustomUploaded, setIsCustomUploaded] = useState<boolean>(false);

  const qty = parseFloat(formData.quantity) || 0;
  const unitPrice = parseFloat(formData.price) || 0;
  const projectedRevenue = qty * unitPrice;

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
        setImageFileName(file.name);
        setIsCustomUploaded(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleSelectPresetImage = (sample: { name: string; url: string }) => {
    setImageUrl(sample.url);
    setImageFileName(`${sample.name.toLowerCase()}.jpg`);
    setIsCustomUploaded(false);
  };

  // Quick price adjustment helper
  const adjustPrice = (delta: number) => {
    const current = parseFloat(formData.price) || 0;
    const next = Math.max(1, current + delta);
    setFormData({ ...formData, price: String(next) });
  };

  const setBenchmarkPrice = (targetPrice: number) => {
    setFormData({ ...formData, price: String(targetPrice) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newListingId = `listing_${Date.now()}`;
    const newProduct: ProductItem = {
      id: newListingId,
      name: `${formData.crop}`,
      category: formData.category,
      pricePerKg: unitPrice,
      unit: 'kg',
      imageUrl: imageUrl,
      farmerId: user?.id || 'farmer_01',
      farmerName: user?.name || 'Rudra Patel',
      farmName: user?.farmName || 'Patel Organic Farms',
      location: formData.location || user?.location || 'Surat, Gujarat',
      farmerAvatar: user?.avatar || 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=400&q=80',
      rating: 5.0,
      reviewsCount: 1,
      availableStockKg: qty,
      quantityAvailableKg: qty,
      description: formData.description || `${formData.variety} harvested fresh from ${formData.location}. 100% natural, direct dispatch.`,
      variety: formData.variety,
      isOrganic: formData.isOrganic,
      harvestDate: formData.harvestDate ? `Harvested ${formData.harvestDate}` : 'Harvested Today',
      farmerPhone: user?.phone || '+91 98251 44321',
    };

    try {
      // 1. Save directly to client-side persistent marketplace store
      saveCustomListing(newProduct);

      // 2. Also attempt backend API creation if running
      await api.marketplace.createListing({
        crop_name: formData.crop,
        variety: formData.variety,
        available_stock_kg: qty,
        price_per_kg: unitPrice,
        unit: 'kg',
        is_organic: formData.isOrganic,
        harvest_date: formData.harvestDate,
        category: formData.category,
        description: newProduct.description,
        image_url: imageUrl,
      }).catch((err) => {
        console.warn('Backend listing fallback, saved locally:', err);
      });

      setPublishedItem(newProduct);
      setPublished(true);
    } catch (err) {
      console.warn('Listing submission error:', err);
      // Ensure product is saved locally regardless
      saveCustomListing(newProduct);
      setPublishedItem(newProduct);
      setPublished(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setPublished(false);
    setPublishedItem(null);
    setFormData({
      crop: '',
      variety: '',
      category: 'Vegetables',
      quantity: '100',
      price: '30',
      location: user?.location || 'Surat, Gujarat',
      availability: 'Immediate Stock',
      harvestDate: new Date().toISOString().split('T')[0],
      description: '',
      isOrganic: true,
    });
    setImageUrl(SAMPLE_CROP_IMAGES[0].url);
    setIsCustomUploaded(false);
  };

  return (
    <div className="flex min-h-screen text-white">
      <FarmerSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-surface border border-white/20 text-white text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Direct Marketplace Publishing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            List Harvested Crop for Sale
          </h1>
          <p className="text-xs sm:text-sm text-white/80 font-medium">
            Publish freshly harvested produce directly to regional consumers with 0% commission.
          </p>
        </div>

        <GlassCard variant="elevated" className="p-6 sm:p-8 border border-white/20">
          {published && publishedItem ? (
            <div className="space-y-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 flex items-center justify-center mx-auto shadow-lg">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-white">
                  Crop Successfully Published!
                </h3>
                <p className="text-xs sm:text-sm text-white/80 max-w-md mx-auto leading-relaxed">
                  Your listing for <strong className="text-white">{publishedItem.availableStockKg} kg of {publishedItem.name}</strong> at ₹{publishedItem.pricePerKg}/kg is now live on the Direct AgriSetu Marketplace.
                </p>
              </div>

              {/* Live Preview of the Published Crop Card */}
              <div className="max-w-md mx-auto p-4 rounded-2xl glass-surface border border-white/25 shadow-xl space-y-3">
                <div className="relative w-full h-44 rounded-xl overflow-hidden border border-white/20">
                  <img
                    src={publishedItem.imageUrl}
                    alt={publishedItem.name}
                    className="w-full h-full object-cover"
                  />
                  {publishedItem.isOrganic && (
                    <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-white text-slate-950 text-[10px] font-extrabold shadow-sm">
                      100% Organic
                    </span>
                  )}
                  <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-sm flex items-center gap-1">
                    <Check className="w-3 h-3" /> Live in Marketplace
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <h4 className="text-base font-extrabold text-white">{publishedItem.name}</h4>
                    <p className="text-xs text-white/70 font-medium">{publishedItem.variety}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-white">₹{publishedItem.pricePerKg}</span>
                    <span className="text-[10px] text-white/70 font-medium"> / kg</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs text-white/80">
                  <span className="font-semibold">Stock: {publishedItem.availableStockKg} kg</span>
                  <span className="flex items-center gap-1 text-[11px] text-white/70">
                    <MapPin className="w-3 h-3 text-white" />
                    {publishedItem.location}
                  </span>
                </div>
              </div>

              {/* Direct Navigation Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <GlassButton
                  id="go-to-marketplace-btn"
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto font-black shadow-lg"
                  onClick={() => navigate('/customer/browse-crops')}
                  icon={<ShoppingCart className="w-4 h-4 text-white" />}
                >
                  Go to Marketplace Directly
                </GlassButton>

                <GlassButton
                  variant="secondary"
                  size="md"
                  className="w-full sm:w-auto"
                  onClick={handleResetForm}
                  icon={<PlusCircle className="w-4 h-4 text-white" />}
                >
                  List Another Crop
                </GlassButton>

                <GlassButton
                  variant="ghost"
                  size="md"
                  className="w-full sm:w-auto"
                  onClick={() => navigate('/farmer/dashboard')}
                >
                  Return to Dashboard
                </GlassButton>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* CROP IMAGE UPLOAD SECTION */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-white/90">
                    Crop Visual & Photo Upload
                  </label>
                  <span className="text-[11px] text-white/60 font-medium">
                    High quality photos increase buyer engagement by 4×
                  </span>
                </div>

                {/* Upload & Preview Container */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                  {/* Image Preview Box */}
                  <div className="sm:col-span-4 relative rounded-2xl overflow-hidden aspect-4/3 bg-black/40 border border-white/20 flex flex-col items-center justify-center group shadow-md">
                    {imageUrl ? (
                      <>
                        <img
                          src={imageUrl}
                          alt="Crop preview"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-2.5">
                          <div className="flex justify-end">
                            {isCustomUploaded && (
                              <button
                                type="button"
                                onClick={() => {
                                  setImageUrl(SAMPLE_CROP_IMAGES[0].url);
                                  setIsCustomUploaded(false);
                                }}
                                className="p-1 rounded-full bg-black/60 hover:bg-red-500/80 text-white transition-colors cursor-pointer"
                                title="Reset to sample photo"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <div>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-white border border-white/30">
                              {isCustomUploaded ? 'Custom Upload' : 'Selected Photo'}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-4">
                        <ImageIcon className="w-8 h-8 text-white/40 mx-auto mb-2" />
                        <span className="text-xs text-white/60">No image chosen</span>
                      </div>
                    )}
                  </div>

                  {/* Dropzone & File Picker */}
                  <div className="sm:col-span-8 space-y-3">
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center ${isDragging
                        ? 'border-white bg-white/20 scale-[1.01]'
                        : 'border-white/25 hover:border-white/50 bg-white/5 hover:bg-white/10'
                        }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <div className="w-10 h-10 rounded-full bg-white/15 border border-white/30 flex items-center justify-center text-white mb-2 shadow-inner">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-white block">
                        Click to Browse or Drag & Drop Crop Photo
                      </span>
                      <span className="text-[10px] text-white/60 mt-0.5 font-medium">
                        Supports JPG, PNG, WEBP up to 10MB
                      </span>
                    </div>

                    {/* Quick Preset Selector */}
                    <div>
                      <span className="text-[11px] font-bold text-white/75 block mb-1.5">
                        Or pick a verified sample crop image:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {SAMPLE_CROP_IMAGES.map((sample) => (
                          <button
                            key={sample.name}
                            type="button"
                            onClick={() => handleSelectPresetImage(sample)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${imageUrl === sample.url && !isCustomUploaded
                              ? 'bg-white text-slate-950 border-white shadow-sm'
                              : 'bg-white/10 hover:bg-white/20 text-white/80 border-white/15'
                              }`}
                          >
                            {sample.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CROP DETAILS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/15">
                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">
                    Crop Commodity
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.crop}
                    onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                    className="w-full glass-input rounded-xl py-2.5 px-3.5 text-xs font-bold text-white placeholder-white/60"
                    placeholder="e.g. Tomato, Potato, Wheat"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">
                    Produce Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full glass-input rounded-xl py-2.5 px-3.5 text-xs font-bold text-white bg-slate-900/80 cursor-pointer"
                  >
                    <option value="Vegetables" className="bg-slate-900 text-white">Vegetables</option>
                    <option value="Fruits" className="bg-slate-900 text-white">Fruits</option>
                    <option value="Grains" className="bg-slate-900 text-white">Grains</option>
                    <option value="Pulses" className="bg-slate-900 text-white">Pulses</option>
                    <option value="Organic" className="bg-slate-900 text-white">Organic Specials</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-white/80 mb-1">
                    Variety & Quality Grade
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.variety}
                    onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                    className="w-full glass-input rounded-xl py-2.5 px-3.5 text-xs font-bold text-white placeholder-white/60"
                    placeholder="e.g. Abhinav Hybrid Grade-A Organic"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">
                    Available Stock Quantity (kg)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full glass-input rounded-xl py-2.5 px-3.5 text-xs font-bold text-white placeholder-white/60"
                  />
                </div>

                {/* PRICE ADJUSTMENT SECTION WITH INTERACTIVE BUTTONS */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-white/80">
                      Direct Consumer Price (₹ per kg)
                    </label>
                    <span className="text-[10px] text-white/60 font-medium">0% commission</span>
                  </div>

                  {/* Input with Quick +/- and Preset Change Buttons */}
                  <div className="space-y-2">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/70 font-black text-sm">
                        ₹
                      </div>
                      <input
                        id="crop-price-input"
                        type="number"
                        required
                        min="1"
                        step="0.5"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full glass-input rounded-xl py-2.5 pl-8 pr-12 text-xs font-black text-white placeholder-white/60"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-white/60 text-xs font-bold">
                        / kg
                      </div>
                    </div>

                    {/* Price Adjustment Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-white/60 mr-1">Adjust:</span>
                      <button
                        type="button"
                        onClick={() => adjustPrice(-10)}
                        className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold border border-white/15 transition-all cursor-pointer active:scale-95"
                        title="Decrease price by ₹10"
                      >
                        -₹10
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustPrice(-5)}
                        className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold border border-white/15 transition-all cursor-pointer active:scale-95"
                        title="Decrease price by ₹5"
                      >
                        -₹5
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustPrice(-1)}
                        className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold border border-white/15 transition-all cursor-pointer active:scale-95"
                        title="Decrease price by ₹1"
                      >
                        -₹1
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustPrice(+1)}
                        className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold border border-white/15 transition-all cursor-pointer active:scale-95"
                        title="Increase price by ₹1"
                      >
                        +₹1
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustPrice(+5)}
                        className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold border border-white/15 transition-all cursor-pointer active:scale-95"
                        title="Increase price by ₹5"
                      >
                        +₹5
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustPrice(+10)}
                        className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold border border-white/15 transition-all cursor-pointer active:scale-95"
                        title="Increase price by ₹10"
                      >
                        +₹10
                      </button>
                    </div>

                    {/* Mandi Rate Benchmark Match Button */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setBenchmarkPrice(28)}
                        className="text-[10px] font-bold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-md border border-white/20 inline-flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <TrendingUp className="w-3 h-3 text-white" />
                        <span>Match APMC Mandi Benchmark (₹28/kg)</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">
                    Harvest Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.harvestDate}
                    onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                    className="w-full glass-input rounded-xl py-2.5 px-3.5 text-xs font-bold text-white placeholder-white/60"
                  />
                </div>

                <div className="sm:col-span-2">
                  <CityStateSelect
                    value={formData.location}
                    onChange={(loc) => setFormData({ ...formData, location: loc })}
                    stateLabel="Farm State"
                    districtLabel="Dispatch District / Mandi"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-white/80 mb-1">
                    Produce Description & Freshness Notes
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full glass-input rounded-xl py-2 px-3.5 text-xs font-medium text-white placeholder-white/60"
                    placeholder="e.g. Crisp, vine-ripened organic tomatoes plucked this dawn. Free of synthetic chemicals."
                  />
                </div>
              </div>

              {/* Dynamic Direct Revenue Calculator Card */}
              <div className="p-4 rounded-2xl glass-surface border border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
                <div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-white" />
                    <span className="text-xs font-extrabold text-white block">
                      Projected Direct Farmer Revenue
                    </span>
                  </div>
                  <span className="text-[11px] text-white/70 font-medium">
                    {qty} kg × ₹{unitPrice}/kg • 100% credited directly with 0 middleman cut
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  ₹{projectedRevenue.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Submit / Publish Action */}
              <div className="flex items-center justify-between pt-3 border-t border-white/15">
                <button
                  type="button"
                  onClick={() => navigate('/farmer/dashboard')}
                  className="text-xs font-bold text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <GlassButton
                  id="submit-list-crop-btn"
                  variant="primary"
                  size="md"
                  type="submit"
                  disabled={isSubmitting}
                  icon={isSubmitting ? undefined : <PlusCircle className="w-4 h-4 text-white" />}
                >
                  {isSubmitting ? 'Publishing Produce...' : 'Publish Crop Listing'}
                </GlassButton>
              </div>
            </form>
          )}
        </GlassCard>
      </main>
    </div>
  );
};
