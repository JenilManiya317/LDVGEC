import React, { useState } from 'react';
import { useRouter } from '../../lib/router';
import { FarmerSidebar } from '../../components/layout/FarmerSidebar';
import { GlassCard } from '../../components/common/GlassCard';
import { GlassButton } from '../../components/common/GlassButton';
import { ScanEye, UploadCloud, Image as ImageIcon, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

export const CropHealthPage: React.FC = () => {
  const { navigate } = useRouter();

  const sampleImages = [
    {
      id: 'tomato',
      title: 'Tomato Foliage (Sector A)',
      url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=85',
      note: 'Early lesion signs detected on lower stems'
    },
    {
      id: 'potato',
      title: 'Potato Leaf Sample (Plot B)',
      url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=85',
      note: 'Healthy foliage baseline'
    },
    {
      id: 'cotton',
      title: 'Cotton Boll & Leaves',
      url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=85',
      note: 'Minor leaf curling near vein edges'
    }
  ];

  const [selectedImage, setSelectedImage] = useState<string>(sampleImages[0].url);
  const [selectedTitle, setSelectedTitle] = useState<string>(sampleImages[0].title);
  const [analyzing, setAnalyzing] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
      setSelectedTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleAnalyze = () => {
    setAnalyzing(true);
    setScanProgress(15);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            setAnalyzing(false);
            navigate('/farmer/crop-health/result');
          }, 300);
          return 100;
        }
        return prev + 25;
      });
    }, 280);
  };

  return (
    <div className="flex min-h-screen text-white">
      <FarmerSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-surface border border-white/20 text-white text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>AI Computer Vision Diagnostic Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            AI Crop Health Scanner
          </h1>
          <p className="text-xs sm:text-sm text-white/80 font-medium">
            Upload field leaf or fruit photos to detect pathogens, nutrient stress, and biological remedies in seconds.
          </p>
        </div>

        <GlassCard variant="elevated" className="p-6 sm:p-8 space-y-6 border border-white/20">
          {/* Sample Selector for Instant Testing */}
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-white/80 block mb-3">
              Select Field Sample or Upload Photo
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {sampleImages.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setSelectedImage(s.url);
                    setSelectedTitle(s.title);
                  }}
                  className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${selectedImage === s.url
                      ? 'glass-surface border-white shadow-md'
                      : 'glass-surface-subtle border-white/15 hover:border-white/40'
                    }`}
                >
                  <img src={s.url} alt="" className="w-10 h-10 rounded-xl object-cover border border-white/30" />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate">{s.title}</span>
                    <span className="text-[10px] text-white/70 truncate block">{s.note}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upload Dropzone */}
          <div className="border-2 border-dashed border-white/30 hover:border-white/60 rounded-3xl p-6 text-center transition-all glass-surface-subtle">
            <div className="max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl glass-surface text-white flex items-center justify-center mx-auto border border-white/20 shadow-xs">
                <UploadCloud className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Upload high-res crop photo</h4>
                <p className="text-[11px] text-white/70 mt-0.5">Supports JPG, PNG, WebP up to 15MB</p>
              </div>
              <label className="inline-block">
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold glass-surface hover:bg-white/15 text-white border border-white/30 shadow-xs cursor-pointer transition-all">
                  <ImageIcon className="w-4 h-4 text-white" />
                  Choose from Device
                </span>
              </label>
            </div>
          </div>

          {/* Active Preview & Scan Area */}
          <div className="p-4 rounded-2xl glass-surface-subtle border border-white/20">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="relative w-40 h-40 rounded-2xl overflow-hidden shrink-0 border border-white/30 shadow-lg">
                <img src={selectedImage} alt="Crop Foliage" className="w-full h-full object-cover" />

                {/* Laser Scanning Animation Overlay */}
                {analyzing && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-2xs">
                    <div className="w-full h-1 bg-white shadow-[0_0_20px_#ffffff] animate-scan" />
                    <div className="absolute inset-2 border-2 border-white/70 rounded-xl animate-pulse" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold glass-surface text-white border border-white/20">
                  {analyzing ? 'Processing Neural Vision Model...' : 'Ready for Diagnosis'}
                </div>
                <h4 className="text-base font-extrabold text-white">{selectedTitle}</h4>
                <p className="text-xs text-white/80 leading-relaxed">
                  Evaluates cellular chlorophyll density, fungal spore patterns (Alternaria solani), pest puncture marks, and moisture turgor against 50,000+ benchmark crops.
                </p>

                {analyzing && (
                  <div className="pt-2">
                    <div className="flex justify-between text-[11px] font-bold text-white mb-1">
                      <span>Feature Extraction Matrix</span>
                      <span>{scanProgress}%</span>
                    </div>
                    <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-white/20">
                      <div className="bg-white h-full rounded-full transition-all duration-300" style={{ width: `${scanProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="flex justify-end pt-2">
            <GlassButton
              id="analyze-crop-btn"
              variant="primary"
              size="lg"
              onClick={handleAnalyze}
              disabled={analyzing}
              icon={<ScanEye className="w-5 h-5 text-white" />}
            >
              {analyzing ? `Analyzing Crop Matrix (${scanProgress}%)...` : 'Run AI Diagnostic Scan'}
            </GlassButton>
          </div>
        </GlassCard>
      </main>
    </div>
  );
};
