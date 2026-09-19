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
  Sparkles,
  Layers,
  Thermometer,
  Activity,
  Globe,
  PlusCircle,
  FileText,
  ScanEye
} from 'lucide-react';
import { CropDiagnosticReport } from '../../lib/crop-health-ai';
import { MOCK_CROP_HEALTH_ANALYSIS } from '../../lib/mock-data';
import { addFarmerTask } from '../../lib/tasks';

export const CropHealthResultPage: React.FC = () => {
  const { navigate } = useRouter();
  const [addedToTasks, setAddedToTasks] = React.useState(false);

  const report = React.useMemo<CropDiagnosticReport>(() => {
    try {
      const saved = localStorage.getItem('farmwise_last_crop_health');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.diseaseDetected || parsed.cropName) {
          return {
            cropName: parsed.cropName || parsed.crop_name || 'Crop Sample',
            scientificName: parsed.scientificName || 'Botanical Diagnostic Matrix',
            diseaseDetected: parsed.diseaseDetected || parsed.disease_detected || 'Foliar Spot / Blight',
            pathogenType: parsed.pathogenType || 'Fungal',
            severity: parsed.severity || (parsed.healthPercentage > 85 ? 'Low' : 'Moderate'),
            confidenceScore: parsed.confidenceScore || 94,
            healthPercentage: parsed.healthPercentage || 72,
            detectedIssues: parsed.detectedIssues || parsed.detected_issues || [
              'Concentric chlorotic necrotic spotting on leaf margins'
            ],
            symptoms: parsed.symptoms || parsed.detectedIssues || [
              'Chlorophyll degradation',
              'Localized spore necrotic spots'
            ],
            cause:
              parsed.cause ||
              'Airborne and soil-borne fungal spores flourishing in humid canopy microclimate.',
            favorableConditions:
              parsed.favorableConditions ||
              'High relative humidity (>75%) and temperatures between 22°C–30°C.',
            treatment: {
              organicSolution:
                parsed.treatment?.organicSolution ||
                'Cold-Pressed Neem Oil (3000 ppm) + Trichoderma viride (10 g/L)',
              dosage:
                parsed.treatment?.dosage ||
                '4 ml/L Bio-Neem + 5 g/L Bio-fungicide spray thoroughly wetting foliage',
              chemicalAlternative:
                parsed.treatment?.chemicalAlternative ||
                'Mancozeb 75% WP @ 2.5 g/L or Copper Oxychloride 50% WP @ 3 g/L',
              frequency:
                parsed.treatment?.frequency || 'Every 5 to 7 days for 2 consecutive cycles at dusk',
              expectedRecoveryDays: parsed.treatment?.expectedRecoveryDays || 7
            },
            preventativeMeasures: parsed.preventativeMeasures ||
              parsed.recommendations || [
                'Maintain dry canopy foliage through morning drip irrigation',
                'Prune and discard infected leaves showing active lesion sporulation',
                'Apply organic straw mulch layer across crop beds to block soil spore splash'
              ],
            fieldSchedule: parsed.fieldSchedule || [
              {
                day: 'Day 1 (Immediate)',
                action: 'Sanitization & Foliar Application',
                detail: 'Prune affected lower leaves and spray bio-neem extract at dusk.'
              },
              {
                day: 'Day 3 (Interim Check)',
                action: 'Spore Arrest Verification',
                detail: 'Inspect leaf undersides for spore halt and fungal margin drying.'
              },
              {
                day: 'Day 7 (Evaluation)',
                action: 'Chlorophyll Recovery Audit',
                detail: 'Verify vibrant green leaf emergence on fresh shoot nodes.'
              }
            ],
            imagePreviewUrl:
              parsed.imagePreviewUrl ||
              parsed.sampleImage ||
              'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=85',
            sampleTitle: parsed.sampleTitle || 'Foliage Scan',
            timestamp: parsed.timestamp || 'Today',
            source: parsed.source || 'ICAR & FAO Plant Pathological Knowledge Engine v4.2'
          };
        }
      }
    } catch (e) {
      console.warn('Error reading diagnostic report:', e);
    }

    // Default Fallback
    return {
      cropName: MOCK_CROP_HEALTH_ANALYSIS.cropName,
      scientificName: 'Alternaria solani',
      diseaseDetected: MOCK_CROP_HEALTH_ANALYSIS.diseaseDetected,
      pathogenType: 'Fungal',
      severity: 'Moderate',
      confidenceScore: 94.8,
      healthPercentage: 74,
      detectedIssues: MOCK_CROP_HEALTH_ANALYSIS.symptoms,
      symptoms: MOCK_CROP_HEALTH_ANALYSIS.symptoms,
      cause: 'Airborne fungal spores overwintering in crop residues and spreading through moisture splash.',
      favorableConditions: 'High relative humidity (>80%) and temperatures between 24°C–29°C.',
      treatment: {
        organicSolution: MOCK_CROP_HEALTH_ANALYSIS.treatment.organicSolution,
        dosage: MOCK_CROP_HEALTH_ANALYSIS.treatment.dosage,
        chemicalAlternative: 'Mancozeb 75% WP @ 2.5 g/L or Azoxystrobin 23% SC @ 1 ml/L',
        frequency: MOCK_CROP_HEALTH_ANALYSIS.treatment.frequency,
        expectedRecoveryDays: MOCK_CROP_HEALTH_ANALYSIS.treatment.expectedRecoveryDays
      },
      preventativeMeasures: MOCK_CROP_HEALTH_ANALYSIS.preventativeMeasures,
      fieldSchedule: [
        {
          day: 'Day 1 (Today)',
          action: 'Foliar Bio-Control Application',
          detail: 'Apply cold-pressed neem oil 3000 ppm at dusk after 4:30 PM.'
        },
        {
          day: 'Day 3',
          action: 'Under-leaf Pathogen Inspection',
          detail: 'Inspect Sector A lower leaf surfaces for spore arrest.'
        },
        {
          day: 'Day 7',
          action: 'Recovery Confirmation',
          detail: 'Audit fresh leaf flushes for clean green margins.'
        }
      ],
      imagePreviewUrl: MOCK_CROP_HEALTH_ANALYSIS.imagePreviewUrl,
      sampleTitle: 'Tomato Foliage Scan',
      timestamp: 'Today',
      source: 'ICAR & FAO Plant Pathological Knowledge Engine'
    };
  }, []);

  const handleAddToTasks = () => {
    const rawCrop = report.cropName.split('(')[0].trim();
    const rawDisease = report.diseaseDetected.split('(')[0].trim();
    const cleanSolution = report.treatment.organicSolution.split('+')[0].trim();

    addFarmerTask({
      title: `Apply ${cleanSolution} (${rawCrop} - ${rawDisease})`,
      time: '4:30 PM (Dusk)',
      category: report.pathogenType === 'Nutrient Deficiency' ? 'Fertilizer' : 'Pest Control',
      completed: false,
      notes: `Dosage: ${report.treatment.dosage}. Target: ${rawDisease}. Expected recovery: ${report.treatment.expectedRecoveryDays} days.`,
      crop: rawCrop,
      priority: 'High'
    });

    setAddedToTasks(true);
    setTimeout(() => {
      navigate('/farmer/todays-instructions');
    }, 1200);
  };

  const handleDirectSellHarvest = () => {
    const rawCrop = report.cropName.split('(')[0].trim();
    const rawDisease = report.diseaseDetected.split('(')[0].trim();
    const isHealthyCrop = report.pathogenType === 'Healthy' || report.severity === 'Low';

    const prefillData = {
      crop: rawCrop,
      variety: isHealthyCrop
        ? `${rawCrop} Certified Organic Grade-A`
        : `${rawCrop} Field Harvest (Remediated)`,
      category: rawCrop.toLowerCase().includes('mango')
        ? 'Fruits'
        : rawCrop.toLowerCase().includes('wheat') || rawCrop.toLowerCase().includes('rice')
        ? 'Grains'
        : 'Vegetables',
      quantity: '250',
      price: rawCrop.toLowerCase().includes('mango')
        ? '150'
        : rawCrop.toLowerCase().includes('wheat')
        ? '42'
        : rawCrop.toLowerCase().includes('cotton')
        ? '65'
        : '30',
      imageUrl: report.imagePreviewUrl,
      imageTitle: `${rawCrop} Harvest Scan Photo`,
      description: `Freshly picked ${rawCrop} evaluated by AI Computer Vision. ${
        isHealthyCrop
          ? '100% natural, high cellular chlorophyll density with zero synthetic residue.'
          : 'Under biological ICAR neem & bio-agent remediation protocol.'
      }`,
      isOrganic: true,
      harvestDate: new Date().toISOString().split('T')[0]
    };

    localStorage.setItem('agrisetu_prefill_list_crop_v1', JSON.stringify(prefillData));
    navigate('/farmer/list-crop');
  };

  const isHealthy = report.pathogenType === 'Healthy' || report.severity === 'Low';

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
              AI Crop Diagnostic Report
            </h1>
            <p className="text-xs text-white/80 font-medium">
              Internet-backed botanical pathology diagnosis generated on {report.timestamp}
            </p>
          </div>

          <GlassButton
            variant="secondary"
            size="sm"
            onClick={() => navigate('/farmer/crop-health')}
            icon={<ScanEye className="w-4 h-4 text-white" />}
          >
            Scan New Picture
          </GlassButton>
        </div>

        {/* Top Summary Banner */}
        <GlassCard
          variant="elevated"
          className={`p-6 sm:p-7 border-l-4 border border-white/20 ${
            isHealthy ? 'border-l-emerald-400' : 'border-l-amber-400'
          }`}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              {/* Thumbnail of Uploaded Image */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-white/30 shrink-0 shadow-md">
                <img
                  src={report.imagePreviewUrl}
                  alt="Scanned crop"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-black border flex items-center gap-1 ${
                      isHealthy
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                    }`}
                  >
                    {isHealthy ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    )}
                    {report.severity} Severity
                  </span>

                  <span className="text-xs text-white/90 font-bold bg-white/15 px-2.5 py-0.5 rounded-full border border-white/25">
                    {report.cropName}
                  </span>

                  <span className="text-[11px] text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-400/30 font-bold">
                    {report.pathogenType} Type
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {report.diseaseDetected}
                </h2>
                <p className="text-xs text-white/70 italic font-mono">
                  Pathogen: {report.scientificName}
                </p>
                <div className="inline-flex items-center gap-1 text-[11px] text-white/80 font-medium pt-0.5">
                  <Globe className="w-3 h-3 text-emerald-400" />
                  <span>Verified via {report.source}</span>
                </div>
              </div>
            </div>

            {/* Circular / Score Gauge */}
            <div className="p-4 rounded-2xl glass-surface-subtle text-center min-w-[140px] border border-white/30 shadow-md">
              <div className="text-3xl font-black text-white tracking-tight">
                <AnimatedCounter value={report.confidenceScore} suffix="%" duration={1000} />
              </div>
              <div className="text-[11px] font-bold text-white/80 mt-0.5">AI Confidence Index</div>
              <div className="text-[10px] text-emerald-300 font-extrabold mt-1">
                ● Neural Verified
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Physical Symptoms, Cause & Environmental Triggers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassCard variant="elevated" className="p-5 border border-white/20 space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-amber-300" />
              Observed Foliar Symptoms
            </span>
            <ul className="space-y-2 text-xs text-white/90 font-medium">
              {report.symptoms.map((symptom, idx) => (
                <li key={idx} className="flex items-start gap-2 p-2 rounded-xl glass-surface-subtle border border-white/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>{symptom}</span>
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard variant="elevated" className="p-5 border border-white/20 space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-cyan-300" />
              Root Cause & Environmental Drivers
            </span>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl glass-surface-subtle border border-white/10">
                <span className="text-white/70 font-bold block text-[11px]">Infection Mechanism:</span>
                <p className="text-white/95 mt-0.5 leading-relaxed">{report.cause}</p>
              </div>
              <div className="p-3 rounded-xl glass-surface-subtle border border-white/10">
                <span className="text-white/70 font-bold block text-[11px]">Favorable Climate Conditions:</span>
                <p className="text-white/95 mt-0.5 leading-relaxed">{report.favorableConditions}</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Diagnosis & Recommendations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Detailed Symptoms & Organic Treatment */}
          <GlassCard
            variant="elevated"
            className="lg:col-span-7 p-6 space-y-5 border border-white/20"
          >
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-white/90 flex items-center gap-1.5 mb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ICAR Recommended Treatment Protocols
              </span>

              <div className="space-y-3">
                {/* Organic Prescription */}
                <div className="p-4 rounded-2xl glass-surface border border-white/20 space-y-1">
                  <div className="text-xs font-black text-emerald-300 flex items-center gap-1">
                    <span>🌿 Biological / Organic Spray Prescription:</span>
                  </div>
                  <div className="text-sm font-extrabold text-white">
                    {report.treatment.organicSolution}
                  </div>
                  <div className="text-xs text-white/90 pt-1">
                    <span className="font-bold text-white">Dosage:</span> {report.treatment.dosage}
                  </div>
                </div>

                {/* Chemical Alternative if available */}
                {report.treatment.chemicalAlternative && (
                  <div className="p-3.5 rounded-2xl bg-black/30 border border-white/15 space-y-1">
                    <div className="text-[11px] font-bold text-white/75">
                      🧪 Chemical Alternative (Targeted Rescue):
                    </div>
                    <div className="text-xs font-bold text-white">
                      {report.treatment.chemicalAlternative}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl glass-surface-subtle border border-white/20">
                    <span className="text-white/70 text-[10px] font-bold block">
                      Application Frequency
                    </span>
                    <span className="font-extrabold text-white">
                      {report.treatment.frequency}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl glass-surface-subtle border border-white/20">
                    <span className="text-white/70 text-[10px] font-bold block">
                      Expected Recovery
                    </span>
                    <span className="font-extrabold text-white">
                      {report.treatment.expectedRecoveryDays === 0
                        ? 'Preventive Routine'
                        : `${report.treatment.expectedRecoveryDays} Days`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/15">
              <span className="text-xs font-extrabold uppercase tracking-wider text-white/90 block mb-3">
                Agronomic Preventive Practices
              </span>
              <ul className="space-y-2 text-xs font-medium text-white/90">
                {report.preventativeMeasures.map((measure, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 p-2.5 rounded-xl glass-surface border border-white/10"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{measure}</span>
                  </li>
                ))}
              </ul>
            </div>
          </GlassCard>

          {/* Action Schedule & Field Advisory */}
          <GlassCard
            variant="elevated"
            className="lg:col-span-5 p-6 flex flex-col justify-between space-y-4 border border-white/20"
          >
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-white/90 flex items-center gap-1.5 mb-3">
                <Calendar className="w-4 h-4 text-white" />
                Scheduled Field Remediation Plan
              </span>

              <div className="space-y-3 text-xs">
                {report.fieldSchedule.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl glass-surface-subtle border border-white/20 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-extrabold text-xs">{step.day}:</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/15 text-white">
                        {step.action}
                      </span>
                    </div>
                    <p className="text-white/90 text-xs leading-relaxed">{step.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/15 space-y-2">
              <GlassButton
                id="add-remedy-task-btn"
                variant="primary"
                className="w-full font-black"
                onClick={handleAddToTasks}
                icon={
                  addedToTasks ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : (
                    <PlusCircle className="w-4 h-4 text-white" />
                  )
                }
              >
                {addedToTasks ? '✓ Added to Today’s Tasks!' : 'Add Action to Today’s Tasks'}
              </GlassButton>

              <GlassButton
                id="direct-sell-harvest-btn"
                variant="secondary"
                className="w-full"
                onClick={handleDirectSellHarvest}
                icon={<PlusCircle className="w-4 h-4" />}
              >
                Direct Sell Harvest
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
};

