import React, { useState, useEffect } from 'react';
import {
  Users,
  Wifi,
  WifiOff,
  RefreshCw,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Mic,
  MicOff,
  MapPin,
  FileCheck,
  Send,
  Baby,
  HeartPulse,
  Activity,
  UserCheck
} from 'lucide-react';
import { TranslationDict } from '../../utils/teluguTranslations';
import { offlineSyncEngine, ConnectivityState } from '../../services/offlineSync';
import { apiClient } from '../../services/apiClient';
import { TriageInput, TriageResult, HouseholdSurvey, Referral } from '../../types';

interface AshaPortalProps {
  t: TranslationDict;
  language: 'en' | 'te';
  onOpenSos: () => void;
}

export const AshaPortal: React.FC<AshaPortalProps> = ({
  t,
  language,
  onOpenSos
}) => {
  const [connectivity, setConnectivity] = useState<ConnectivityState>(offlineSyncEngine.getStatus());
  const [pendingQueueCount, setPendingQueueCount] = useState(offlineSyncEngine.getPendingQueue().length);
  const [activeTab, setActiveTab] = useState<'TRIAGE' | 'SURVEYS' | 'REFERRALS'>('TRIAGE');
  
  // Triage Form state
  const [patientName, setPatientName] = useState('Laxmi Bai');
  const [age, setAge] = useState(32);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [symptoms, setSymptoms] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isPregnant, setIsPregnant] = useState(false);
  const [heartRate, setHeartRate] = useState<number | ''>(92);
  const [spO2, setSpO2] = useState<number | ''>(96);
  const [systolicBP, setSystolicBP] = useState<number | ''>(130);
  const [diastolicBP, setDiastolicBP] = useState<number | ''>(84);
  const [lastTriageResult, setLastTriageResult] = useState<TriageResult | null>(null);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Household Surveys & Referrals
  const [surveys, setSurveys] = useState<HouseholdSurvey[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  
  // Survey Form
  const [familyHead, setFamilyHead] = useState('');
  const [membersCount, setMembersCount] = useState(4);
  const [pregnantCount, setPregnantCount] = useState(0);
  const [childrenUnder5, setChildrenUnder5] = useState(1);
  const [elderlyCount, setElderlyCount] = useState(1);
  const [sanitation, setSanitation] = useState<'ADEQUATE' | 'INADEQUATE'>('ADEQUATE');
  const [waterSource, setWaterSource] = useState<'TAP' | 'BOREWELL' | 'OPEN_WELL'>('TAP');

  useEffect(() => {
    const unsub = offlineSyncEngine.subscribe((status, count) => {
      setConnectivity(status);
      setPendingQueueCount(count);
    });

    loadData();
    return unsub;
  }, []);

  const loadData = async () => {
    try {
      const sRes = await apiClient.getHouseholdSurveys();
      if (sRes.success) setSurveys(sRes.surveys);

      const rRes = await apiClient.getReferrals();
      if (rRes.success) setReferrals(rRes.referrals);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVoiceInput = () => {
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
      recognition.lang = 'te-IN';
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setSymptoms(prev => (prev ? `${prev} ${text}` : text));
        setIsListening(false);
      };
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleRunAshaTriage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    const input: TriageInput = {
      patientName,
      age: Number(age),
      gender,
      symptoms: `${symptoms} ${isPregnant ? '(Pregnant Woman)' : ''}`,
      vitals: {
        heartRate: heartRate ? Number(heartRate) : undefined,
        spO2: spO2 ? Number(spO2) : undefined,
        systolicBP: systolicBP ? Number(systolicBP) : undefined,
        diastolicBP: diastolicBP ? Number(diastolicBP) : undefined
      },
      reportedBy: 'ASHA'
    };

    // Run via local deterministic engine (saves to offline queue)
    const result = offlineSyncEngine.runLocalTriage(input);
    setLastTriageResult(result);
    setSyncFeedback(
      connectivity === 'OFFLINE'
        ? 'Case evaluated locally and saved to offline queue. Will sync when back online.'
        : 'Case evaluated and synced to central PHC registry.'
    );
  };

  const handleSyncNow = async () => {
    setSyncFeedback('Synchronizing queued field cases with district cloud...');
    const res = await offlineSyncEngine.syncPendingQueue();
    setSyncFeedback(res.message);
    loadData();
  };

  const handleSaveSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyHead.trim()) return;

    const surveyData = {
      familyHeadName: familyHead,
      membersCount: Number(membersCount),
      pregnantWomen: Number(pregnantCount),
      childrenUnder5: Number(childrenUnder5),
      elderlyAbove60: Number(elderlyCount),
      sanitationStatus: sanitation,
      waterSource,
      villageName: 'Narsapur Tanda'
    };

    if (offlineSyncEngine.isOnline()) {
      await apiClient.createHouseholdSurvey(surveyData);
    } else {
      offlineSyncEngine.queueItem('SURVEY', surveyData);
    }

    setFamilyHead('');
    setSyncFeedback('Household survey recorded successfully.');
    loadData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Profile with Offline Sync Control */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-black text-xl flex items-center justify-center shadow-md">
              PW
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  Padmavati (ASHA Lead Worker)
                </h1>
                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  ID: HW-0870
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Sector: Narsapur Tanda & Kothur Hamlets • Primary Health Center: Kothur
              </p>
            </div>
          </div>

          {/* Sync Queue Badge & Manual Trigger */}
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-2xl border flex items-center gap-3 ${
                connectivity === 'OFFLINE'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              {connectivity === 'OFFLINE' ? (
                <WifiOff className="w-5 h-5 text-amber-600" />
              ) : (
                <Wifi className="w-5 h-5 text-emerald-600" />
              )}
              <div className="text-xs">
                <span className="font-bold block">
                  {connectivity === 'OFFLINE' ? t.offlineMode : 'Connected to District Cloud'}
                </span>
                <span className="text-[11px] opacity-80">
                  {pendingQueueCount > 0
                    ? `${pendingQueueCount} ${t.casesWaitingToSync}`
                    : t.allCasesSynced}
                </span>
              </div>
            </div>

            <button
              onClick={handleSyncNow}
              disabled={connectivity === 'OFFLINE' || pendingQueueCount === 0}
              className={`px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                connectivity === 'OFFLINE' || pendingQueueCount === 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t.syncNow}</span>
            </button>
          </div>

        </div>

        {/* Sync feedback notification if present */}
        {syncFeedback && (
          <div className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 font-semibold flex items-center justify-between">
            <span>{syncFeedback}</span>
            <button
              onClick={() => setSyncFeedback(null)}
              className="text-teal-700 font-bold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('TRIAGE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'TRIAGE'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Field Triage Engine (Offline Capable)
          </button>
          <button
            onClick={() => setActiveTab('SURVEYS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'SURVEYS'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Household Survey Registry ({surveys.length})
          </button>
          <button
            onClick={() => setActiveTab('REFERRALS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'REFERRALS'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Supervisor Referrals ({referrals.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Field Triage */}
      {activeTab === 'TRIAGE' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Triage Entry Form */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-slate-900">
                Record Patient Symptoms (Telugu & English)
              </h3>
              <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                Local-First Safe Engine
              </span>
            </div>

            <form onSubmit={handleRunAshaTriage} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Patient Name</label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={isPregnant}
                    onChange={(e) => setIsPregnant(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 rounded-sm"
                  />
                  <span>Pregnant Mother (High Priority Focus)</span>
                </label>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Symptoms Description</label>
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold ${
                      isListening
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    <span>{isListening ? 'Listening...' : 'Telugu Voice Input'}</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="గ్రామస్థుల సమస్యలను వివరించండి (ఉదా: తీవ్రమైన కడుపు నొప్పి, రక్తస్రావం, జ్వరం)..."
                  required
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-hidden focus:border-emerald-600"
                />
              </div>

              {/* Measured Physical Vitals */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Field Vitals (Measured with kit):</label>
                <div className="grid grid-cols-4 gap-2">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-bold">HR (bpm)</span>
                    <input
                      type="number"
                      value={heartRate}
                      onChange={(e) => setHeartRate(e.target.value ? Number(e.target.value) : '')}
                      className="w-full font-bold text-xs bg-transparent outline-hidden"
                    />
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-bold">SpO2 (%)</span>
                    <input
                      type="number"
                      value={spO2}
                      onChange={(e) => setSpO2(e.target.value ? Number(e.target.value) : '')}
                      className="w-full font-bold text-xs bg-transparent outline-hidden"
                    />
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-bold">Sys BP</span>
                    <input
                      type="number"
                      value={systolicBP}
                      onChange={(e) => setSystolicBP(e.target.value ? Number(e.target.value) : '')}
                      className="w-full font-bold text-xs bg-transparent outline-hidden"
                    />
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-bold">Dia BP</span>
                    <input
                      type="number"
                      value={diastolicBP}
                      onChange={(e) => setDiastolicBP(e.target.value ? Number(e.target.value) : '')}
                      className="w-full font-bold text-xs bg-transparent outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <HeartPulse className="w-4 h-4" />
                <span>Evaluate & Save Triage Case</span>
              </button>
            </form>
          </div>

          {/* Last Triage Result Display */}
          <div className="space-y-4">
            {lastTriageResult ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm">
                    Triage Evaluation Outcome
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black ${
                      lastTriageResult.urgency === 'RED'
                        ? 'bg-rose-600 text-white'
                        : lastTriageResult.urgency === 'ORANGE'
                        ? 'bg-orange-500 text-white'
                        : lastTriageResult.urgency === 'YELLOW'
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {lastTriageResult.urgency} • Risk: {lastTriageResult.riskScore}/100
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="font-bold text-slate-700 block mb-1">Recommended Care Protocol:</span>
                  <p className="text-slate-900 font-semibold">{lastTriageResult.recommendedAction}</p>
                </div>

                {lastTriageResult.dangerSignsDetected.length > 0 && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-950">
                    <span className="font-bold block mb-1">⚠️ Danger Signs Detected:</span>
                    <ul className="list-disc list-inside space-y-0.5">
                      {lastTriageResult.dangerSignsDetected.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {lastTriageResult.urgency === 'RED' && (
                  <button
                    onClick={onOpenSos}
                    className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-rose-600/30 cursor-pointer animate-pulse"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>IMMEDIATELY CALL AMBULANCE (RED EMERGENCY)</span>
                  </button>
                )}

                <div className="text-[11px] text-slate-500 italic">
                  Case ID logged into ASHA sync buffer. Verified with local deterministic protocol.
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-3xl border border-dashed border-slate-300 p-8 text-center text-slate-400 text-xs">
                Enter symptoms on the left to evaluate risk and produce immediate clinical instructions for the field.
              </div>
            )}
          </div>

        </div>
      )}

      {/* Tab 2: Household Survey Register */}
      {activeTab === 'SURVEYS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Survey Input */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs text-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900">
              New Household Health Survey
            </h3>

            <form onSubmit={handleSaveSurvey} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Head of Family Name</label>
                <input
                  type="text"
                  value={familyHead}
                  onChange={(e) => setFamilyHead(e.target.value)}
                  placeholder="e.g. M. Venkat Rao"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Members</label>
                  <input
                    type="number"
                    value={membersCount}
                    onChange={(e) => setMembersCount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pregnant Women</label>
                  <input
                    type="number"
                    value={pregnantCount}
                    onChange={(e) => setPregnantCount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Children &lt; 5 yrs</label>
                  <input
                    type="number"
                    value={childrenUnder5}
                    onChange={(e) => setChildrenUnder5(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Elderly (60+ yrs)</label>
                  <input
                    type="number"
                    value={elderlyCount}
                    onChange={(e) => setElderlyCount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sanitation</label>
                  <select
                    value={sanitation}
                    onChange={(e: any) => setSanitation(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg outline-hidden bg-white"
                  >
                    <option value="ADEQUATE">Adequate Toilet</option>
                    <option value="INADEQUATE">Inadequate / Open</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Water Source</label>
                  <select
                    value={waterSource}
                    onChange={(e: any) => setWaterSource(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg outline-hidden bg-white"
                  >
                    <option value="TAP">Piped Tap</option>
                    <option value="BOREWELL">Borewell</option>
                    <option value="OPEN_WELL">Open Well</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer transition-colors"
              >
                Record Household Survey
              </button>
            </form>
          </div>

          {/* Survey List */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900">
              Registered Household Records in Sector
            </h3>
            <div className="space-y-2.5">
              {surveys.map((s) => (
                <div key={s.id} className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">{s.familyHeadName}</span>
                    <span className="text-slate-500">
                      {s.villageName} • {s.membersCount} Members • {s.waterSource} water
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.pregnantWomen > 0 && (
                      <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md font-bold text-[10px]">
                        {s.pregnantWomen} Pregnant
                      </span>
                    )}
                    {s.childrenUnder5 > 0 && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-bold text-[10px]">
                        {s.childrenUnder5} Under 5
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Tab 3: Supervisor Referrals */}
      {activeTab === 'REFERRALS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900">
              PHC Supervisor Referral Escalation Register
            </h3>
            <span className="text-xs text-slate-500">Live Status with Medical Officer</span>
          </div>

          <div className="space-y-3">
            {referrals.map((r) => (
              <div key={r.id} className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{r.patientName}</span>
                    <span className="text-slate-500">({r.age} yrs • {r.villageName})</span>
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        r.urgency === 'RED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {r.urgency}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1">Reason: <span className="font-medium text-slate-800">{r.reason}</span></p>
                  {r.supervisorNotes && (
                    <p className="text-teal-800 font-medium mt-1">Supervisor Note: {r.supervisorNotes}</p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`px-3 py-1 rounded-full font-bold text-[11px] block ${
                      r.status === 'ACCEPTED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Status: {r.status}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
