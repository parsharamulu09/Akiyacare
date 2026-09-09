import React, { useState } from 'react';
import {
  X,
  Mic,
  MicOff,
  Stethoscope,
  AlertTriangle,
  Heart,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  ChevronDown,
  Info
} from 'lucide-react';
import { TriageInput, TriageResult } from '../../types';
import { TranslationDict } from '../../utils/teluguTranslations';
import { apiClient } from '../../services/apiClient';
import { offlineSyncEngine } from '../../services/offlineSync';

interface TriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSos: (symptoms: string, dangerSigns: string[]) => void;
  onBookAppointment: (specialist?: string) => void;
  t: TranslationDict;
  language: 'en' | 'te';
  patientId?: string;
  patientName?: string;
}

export const TriageModal: React.FC<TriageModalProps> = ({
  isOpen,
  onClose,
  onOpenSos,
  onBookAppointment,
  t,
  language,
  patientId = 'pat-1',
  patientName = 'Ravi Kumar'
}) => {
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('2 hours');
  const [severity, setSeverity] = useState(7);
  const [age, setAge] = useState(48);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [heartRate, setHeartRate] = useState<number | ''>(88);
  const [spO2, setSpO2] = useState<number | ''>(96);
  const [systolicBP, setSystolicBP] = useState<number | ''>(135);
  const [diastolicBP, setDiastolicBP] = useState<number | ''>(86);
  const [selectedConditions, setSelectedConditions] = useState<string[]>(['Hypertension']);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);

  if (!isOpen) return null;

  // Preset Symptoms for quick testing
  const presets = [
    {
      label: 'Severe Chest Pain & Sweating (RED Emergency)',
      text: language === 'te'
        ? 'తీవ్రమైన గుండె నొప్పి, ఛాతీలో బరువు, చెమటలు, ఊపిరి ఆడకపోవడం'
        : 'Severe crushing chest pain radiating to left arm, heavy sweating and acute shortness of breath',
      sev: 9,
      duration: '45 minutes',
      hr: 112,
      spo2: 92
    },
    {
      label: 'High Fever 3 Days + Rigors (YELLOW / PHC)',
      text: language === 'te'
        ? '3 రోజులుగా తీవ్ర జ్వరం, చలి, వణుకు, ఒళ్లు నొప్పులు'
        : 'High fever for 3 days with chills, rigors and generalized body ache',
      sev: 6,
      duration: '3 days',
      hr: 98,
      spo2: 97
    },
    {
      label: 'Pediatric Lethargy & Vomiting (ORANGE / CHC)',
      text: language === 'te'
        ? 'చిన్నారి నీరసం, ఆహారం తీసుకోకపోవడం, విరేచనాలు, వాంతులు'
        : 'Child lethargy, unable to feed, persistent vomiting and sunken eyes',
      sev: 8,
      duration: '1 day',
      hr: 125,
      spo2: 95
    },
    {
      label: 'Mild Cold & Dry Cough (GREEN / Home)',
      text: language === 'te'
        ? 'తేలికపాటి జలుబు, పొడి దగ్గు, గొంతు గరగర'
        : 'Mild runny nose, occasional dry cough and slight scratchy throat',
      sev: 3,
      duration: '2 days',
      hr: 74,
      spo2: 99
    }
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setSymptoms(p.text);
    setSeverity(p.sev);
    setDuration(p.duration);
    setHeartRate(p.hr);
    setSpO2(p.spo2);
  };

  const handleToggleVoice = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type symptoms manually.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'te' ? 'te-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSymptoms(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setIsLoading(true);
    const input: TriageInput = {
      patientId,
      patientName,
      age: Number(age),
      gender,
      symptoms,
      duration,
      severity: Number(severity) <= 3 ? 'mild' : Number(severity) <= 6 ? 'moderate' : 'severe',
      vitals: {
        heartRate: heartRate ? Number(heartRate) : undefined,
        spO2: spO2 ? Number(spO2) : undefined,
        systolicBP: systolicBP ? Number(systolicBP) : undefined,
        diastolicBP: diastolicBP ? Number(diastolicBP) : undefined
      },
      chronicConditions: selectedConditions,
      reportedBy: 'PATIENT'
    };

    try {
      if (offlineSyncEngine.isOnline()) {
        const response = await apiClient.runTriage(input);
        if (response.success) {
          setResult(response.result);
        } else {
          // Fallback to local triage if backend responds with error
          const localRes = offlineSyncEngine.runLocalTriage(input);
          setResult(localRes);
        }
      } else {
        // Offline Mode: Deterministic triage
        const localRes = offlineSyncEngine.runLocalTriage(input);
        setResult(localRes);
      }
    } catch {
      const localRes = offlineSyncEngine.runLocalTriage(input);
      setResult(localRes);
    } finally {
      setIsLoading(false);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'RED':
        return {
          bg: 'bg-rose-600 text-white',
          border: 'border-rose-300',
          title: 'RED — EMERGENCY / CRITICAL',
          desc: 'Immediate emergency medical intervention required. Critical danger signs detected.'
        };
      case 'ORANGE':
        return {
          bg: 'bg-orange-500 text-white',
          border: 'border-orange-300',
          title: 'ORANGE — HIGH RISK / URGENT',
          desc: 'In-person evaluation needed at Community Health Center (CHC) or District Hospital today.'
        };
      case 'YELLOW':
        return {
          bg: 'bg-amber-500 text-slate-950',
          border: 'border-amber-300',
          title: 'YELLOW — MODERATE / PHC VISIT',
          desc: 'Visit Primary Health Center (PHC) or consult a doctor within 24 to 48 hours.'
        };
      case 'GREEN':
      default:
        return {
          bg: 'bg-emerald-600 text-white',
          border: 'border-emerald-300',
          title: 'GREEN — MILD / ROUTINE CARE',
          desc: 'Home care and active symptom monitoring. Consult ASHA or doctor if condition persists.'
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                {t.aiSymptomChecker}
              </h3>
              <p className="text-xs text-slate-500">
                Bilingual Clinical Decision Support & Deterministic Triage Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Presets Quick Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  1-Click Sample Scenarios (For Quick Demonstration):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {presets.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      className="text-left p-2 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-teal-50 hover:border-teal-300 text-[11px] transition-colors cursor-pointer"
                    >
                      <span className="font-bold text-slate-800 block">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Natural Language Symptoms with Voice input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-900 text-xs sm:text-sm">
                    {t.describeSymptoms}
                  </label>
                  <button
                    type="button"
                    onClick={handleToggleVoice}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isListening
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'
                    }`}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    <span>{isListening ? 'Listening (Speak now)...' : 'Voice (Telugu/English)'}</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder={
                    language === 'te'
                      ? 'మీకు ఏమి ఇబ్బందిగా ఉంది? (ఉదా: తీవ్రమైన గుండె నొప్పి, 3 రోజులుగా జ్వరం, శ్వాస ఆడకపోవడం...)'
                      : 'Describe what you are experiencing in your own words (e.g., severe chest pressure, sweating, breathing difficulty)...'
                  }
                  required
                  className="w-full text-xs sm:text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-hidden leading-relaxed"
                />
              </div>

              {/* Clinical Duration & Severity Slider */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.symptomDuration}
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 2 hours, 3 days"
                    className="w-full text-xs sm:text-sm px-3 py-1.5 border border-slate-300 rounded-lg bg-white outline-hidden"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>{t.severityLevel} (1-10)</span>
                    <span className="text-teal-700 font-extrabold">{severity} / 10</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={severity}
                    onChange={(e) => setSeverity(Number(e.target.value))}
                    className="w-full accent-teal-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Mild (1-3)</span>
                    <span>Moderate (4-6)</span>
                    <span>Severe (7-10)</span>
                  </div>
                </div>
              </div>

              {/* Optional Physical Vitals */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Physical Vitals (Optional or as measured by ASHA worker):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Heart Rate</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <input
                        type="number"
                        value={heartRate}
                        onChange={(e) => setHeartRate(e.target.value ? Number(e.target.value) : '')}
                        className="w-14 font-mono font-bold text-xs sm:text-sm bg-transparent outline-hidden"
                      />
                      <span className="text-[10px] text-slate-400">bpm</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Oxygen (SpO2)</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <input
                        type="number"
                        value={spO2}
                        onChange={(e) => setSpO2(e.target.value ? Number(e.target.value) : '')}
                        className="w-14 font-mono font-bold text-xs sm:text-sm bg-transparent outline-hidden"
                      />
                      <span className="text-[10px] text-slate-400">%</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Systolic BP</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <input
                        type="number"
                        value={systolicBP}
                        onChange={(e) => setSystolicBP(e.target.value ? Number(e.target.value) : '')}
                        className="w-14 font-mono font-bold text-xs sm:text-sm bg-transparent outline-hidden"
                      />
                      <span className="text-[10px] text-slate-400">mmHg</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Diastolic BP</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <input
                        type="number"
                        value={diastolicBP}
                        onChange={(e) => setDiastolicBP(e.target.value ? Number(e.target.value) : '')}
                        className="w-14 font-mono font-bold text-xs sm:text-sm bg-transparent outline-hidden"
                      />
                      <span className="text-[10px] text-slate-400">mmHg</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Triage Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-xl font-extrabold text-sm sm:text-base shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <span>Evaluating Clinical Risk & Symptoms...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run AI & Safety Triage Assessment</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* ==================== TRIAGE RESULT DISPLAY ==================== */
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Urgency Badge Banner */}
              {(() => {
                const badge = getUrgencyBadge(result.urgency);
                return (
                  <div className={`p-4 rounded-xl ${badge.bg} shadow-md`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6" />
                        <div>
                          <div className="text-xs uppercase font-bold opacity-80">
                            Clinical Triage Classification
                          </div>
                          <div className="text-lg sm:text-xl font-black tracking-tight">
                            {badge.title}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs uppercase font-bold opacity-80 block">Risk Score</span>
                        <span className="text-2xl font-black">{result.riskScore}</span>
                        <span className="text-xs opacity-75"> / 100</span>
                      </div>
                    </div>
                    <p className="mt-2 text-xs opacity-90 leading-relaxed">
                      {badge.desc}
                    </p>
                  </div>
                );
              })()}

              {/* Danger Signs Alert If Found */}
              {result.dangerSignsDetected.length > 0 && (
                <div className="p-3.5 bg-rose-50 border-2 border-rose-200 rounded-xl">
                  <div className="flex items-center gap-2 text-rose-800 font-bold text-xs mb-1">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>Deterministic Danger Signs Detected (Hard Override):</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-xs text-rose-950 font-medium">
                    {result.dangerSignsDetected.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actionable Care Pathway Recommendation */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Recommended Care Pathway & Timeframe
                </div>
                <div className="text-sm sm:text-base font-extrabold text-slate-900">
                  {result.recommendedAction}
                </div>
                <div className="flex flex-wrap gap-2 pt-1 text-xs">
                  <span className="bg-teal-100 text-teal-900 px-2.5 py-1 rounded-md font-bold">
                    Specialist: {result.specialistRequired}
                  </span>
                  <span className="bg-slate-200 text-slate-800 px-2.5 py-1 rounded-md font-medium">
                    Timeframe: {result.recommendedTimeframe}
                  </span>
                </div>
              </div>

              {/* Transparent Explainable Score Breakdown */}
              {result.scoreBreakdown && result.scoreBreakdown.length > 0 && (
                <div className="p-4 bg-white border border-slate-200 rounded-xl">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2 flex items-center justify-between">
                    <span>Explainable Risk Factor Point Contributions</span>
                    <span className="text-[11px] text-slate-400 font-normal">Deterministic Weights</span>
                  </div>
                  <div className="space-y-1.5">
                    {result.scoreBreakdown.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-none">
                        <span className="text-slate-700 font-medium">{item.factor}</span>
                        <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md">
                          +{item.points} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* First Aid & Next Steps */}
              {result.firstAidInstructions && result.firstAidInstructions.length > 0 && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5">
                  <div className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                    First Aid & Immediate Protocol
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-xs text-emerald-900">
                    {result.firstAidInstructions.map((inst, i) => (
                      <li key={i}>{inst}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Questions for Doctor */}
              {result.questionsForDoctor && result.questionsForDoctor.length > 0 && (
                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5">
                  <div className="text-xs font-bold text-blue-950 uppercase tracking-wide">
                    Suggested Questions to Ask Your Doctor
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-xs text-blue-900">
                    {result.questionsForDoctor.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons based on Urgency */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                {result.urgency === 'RED' ? (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenSos(symptoms, result.dangerSignsDetected);
                    }}
                    className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-sm shadow-md shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>TRIGGER EMERGENCY SOS & DISPATCH AMBULANCE NOW</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        onClose();
                        onBookAppointment(result.specialistRequired);
                      }}
                      className="w-full sm:flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Stethoscope className="w-4 h-4" />
                      <span>Book Doctor Consultation</span>
                    </button>
                    <button
                      onClick={() => setResult(null)}
                      className="w-full sm:w-auto px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Assess New Symptoms
                    </button>
                  </>
                )}
              </div>

            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 text-center shrink-0">
          AikyaCare Triage Engine • Clinical decision support only • Not a substitute for professional clinical diagnosis
        </div>

      </div>
    </div>
  );
};
