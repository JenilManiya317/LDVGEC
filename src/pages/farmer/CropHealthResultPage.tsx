import React from 'react';
import { useRouter } from '../../lib/router';
import { FarmerSidebar } from '../../components/layout/FarmerSidebar';
import { GlassCard } from '../../components/common/GlassCard';
import { GlassButton } from '../../components/common/GlassButton';
import { AnimatedCounter } from '../../components/common/AnimatedCounter';
import {
  AlertTriangle,
  ShieldCheck,
  Droplet,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { MOCK_CROP_HEALTH_ANALYSIS } from '../../lib/mock-data';

export const CropHealthResultPage: React.FC = () => {
  const { navigate } = useRouter();
  
  const analysis = React.useMemo(() => {
    try {
      const saved = localStorage.getItem('farmwise_last_crop_health');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...MOCK_CROP_HEALTH_ANALYSIS,
          ...parsed,
          diseaseDetected: parsed.diseaseDetected || parsed.disease_detected || parsed.disease || MOCK_CROP_HEALTH_ANALYSIS.diseaseDetected,
          confidenceScore: parsed.confidenceScore || parsed.confidence_score || parsed.confidence || MOCK_CROP_HEALTH_ANALYSIS.confidenceScore,
          severity: parsed.severity || MOCK_CROP_HEALTH_ANALYSIS.severity,
          treatment: {
            ...MOCK_CROP_HEALTH_ANALYSIS.treatment,
            ...(parsed.treatment || {})
          }
        };
      }
    } catch {
      // fallback
    }
    return MOCK_CROP_HEALTH_ANALYSIS;
  }, []);

  return (
    <div className="flex min-h-screen text-white">
      <FarmerSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
        {/* Navigation back and header */}
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/farmer/crop-health')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-white/80 mb-1 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
              <span>Back to Scanner</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Crop Diagnostic Report
            </h1>
          </div>

          <GlassButton
            variant="secondary"
            size="sm"
            onClick={() => navigate('/farmer/crop-health')}
          >
            Scan New Sample
          </GlassButton>
        </div>

        {/* Top Summary Banner */}
        <GlassCard variant="elevated" className="p-6 sm:p-7 border-l-4 border-amber-400 border border-white/20">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {analysis.severity} Severity Detected
                </span>
                <span className="text-xs text-white/70 font-semibold">
                  Sample: {analysis.cropName} Foliage
                </span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {analysis.diseaseDetected}
              </h2>
              <p className="text-xs text-white/90 max-w-xl font-medium">
                Identified fungal spore lesions on lower leaf surfaces causing localized chlorophyll necrosis. Immediate biological intervention recommended.
              </p>
            </div>

            {/* Circular / Score Gauge */}
            <div className="p-4 rounded-2xl glass-surface-subtle text-center min-w-[140px] border border-white/30 shadow-md">
              <div className="text-3xl font-black text-white tracking-tight">
                <AnimatedCounter value={analysis.confidenceScore} suffix="%" duration={1000} />
              </div>
              <div className="text-[11px] font-bold text-white/80 mt-0.5">
                AI Confidence Score
              </div>
              <div className="text-[10px] text-white font-extrabold mt-1">High Accuracy</div>
            </div>
          </div>
        </GlassCard>

        {/* Diagnosis & Recommendations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Detailed Symptoms & Organic Treatment */}
          <GlassCard variant="elevated" className="lg:col-span-7 p-6 space-y-5 border border-white/20">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-white/90 flex items-center gap-1.5 mb-3">
                <ShieldCheck className="w-4 h-4 text-white" />
                Biological Treatment Protocol
              </span>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl glass-surface border border-white/20">
                  <div className="text-xs font-bold text-white/80 mb-1">
                    Organic Spray Prescription:
                  </div>
                  <div className="text-sm font-extrabold text-white">
                    {analysis.treatment.organicSolution}
                  </div>
                  <div className="text-xs text-white/90 mt-2 flex items-center gap-2">
                    <span className="font-bold text-white">Dosage:</span> {analysis.treatment.dosage}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl glass-surface-subtle border border-white/20">
                    <span className="text-white/70 text-[10px] font-bold block">Application Frequency</span>
                    <span className="font-extrabold text-white">{analysis.treatment.frequency}</span>
                  </div>
                  <div className="p-3 rounded-xl glass-surface-subtle border border-white/20">
                    <span className="text-white/70 text-[10px] font-bold block">Expected Recovery</span>
                    <span className="font-extrabold text-white">{analysis.treatment.expectedRecoveryDays} Days</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/15">
              <span className="text-xs font-extrabold uppercase tracking-wider text-white/90 block mb-3">
                Preventative Measures
              </span>
              <ul className="space-y-2 text-xs font-medium text-white/90">
                {(analysis.preventativeMeasures || []).map((measure: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
                    <span>{measure}</span>
                  </li>
                ))}
              </ul>
            </div>
          </GlassCard>

          {/* Action Schedule & Field Advisory */}
          <GlassCard variant="elevated" className="lg:col-span-5 p-6 flex flex-col justify-between space-y-4 border border-white/20">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-white/90 flex items-center gap-1.5 mb-3">
                <Calendar className="w-4 h-4 text-white" />
                Scheduled Field Actions
              </span>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl glass-surface-subtle border border-white/20">
                  <span className="text-white font-bold block">Day 1 (Today):</span>
                  <p className="text-white/90 mt-0.5">Apply foliar neem extract 3000 ppm in late afternoon after 4:00 PM.</p>
                </div>
                <div className="p-3.5 rounded-2xl glass-surface-subtle border border-white/20">
                  <span className="text-white font-bold block">Day 3:</span>
                  <p className="text-white/90 mt-0.5">Inspect Sector A underleaves for spore arrest; trim affected lower branches.</p>
                </div>
                <div className="p-3.5 rounded-2xl glass-surface-subtle border border-white/20">
                  <span className="text-white font-bold block">Day 7:</span>
                  <p className="text-white/90 mt-0.5">Repeat scan to verify full chlorophyll recovery.</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/15">
              <GlassButton
                variant="primary"
                className="w-full"
                onClick={() => navigate('/farmer/todays-instructions')}
              >
                Add Action to Today's Tasks
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
};
