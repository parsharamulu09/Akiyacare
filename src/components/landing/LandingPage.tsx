import React from 'react';
import {
  HeartPulse,
  AlertTriangle,
  ShieldCheck,
  Stethoscope,
  Truck,
  Building2,
  Users,
  Activity,
  BarChart3,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Play
} from 'lucide-react';
import { UserRole } from '../../types';
import { TranslationDict } from '../../utils/teluguTranslations';

interface LandingPageProps {
  onSelectRole: (role: UserRole) => void;
  onOpenSos: () => void;
  onLaunchDemoScenario1: () => void;
  onLaunchDemoScenario2: () => void;
  t: TranslationDict;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSelectRole,
  onOpenSos,
  onLaunchDemoScenario1,
  onLaunchDemoScenario2,
  t
}) => {
  return (
    <div className="space-y-16 pb-16">
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-900 via-teal-950 to-slate-950 text-white pt-14 pb-20 px-4 sm:px-6 lg:px-8 rounded-b-3xl shadow-xl">
        <div className="max-w-6xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-800/80 border border-teal-600/50 text-teal-200 text-xs font-bold tracking-wide shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI-POWERED RURAL HEALTHCARE DECISION-SUPPORT & COORDINATION</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            From Symptoms to the <span className="text-teal-300 underline decoration-teal-500/60 decoration-wavy">Right Care</span> — Anywhere.
          </h1>

          <p className="text-base sm:text-xl text-teal-100/90 max-w-2xl mx-auto font-normal leading-relaxed">
            Designed for rural and underserved communities with intermittent connectivity, doctor shortages, and delayed referrals. We do not stop at predicting a condition — we navigate you to immediate safety.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => onSelectRole('PATIENT')}
              className="px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-sm sm:text-base shadow-lg shadow-teal-500/20 flex items-center gap-2 transition-all cursor-pointer hover:scale-102"
            >
              <Stethoscope className="w-5 h-5 text-slate-950" />
              <span>{t.checkSymptoms}</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenSos}
              className="px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all cursor-pointer animate-pulse hover:animate-none"
            >
              <AlertTriangle className="w-5 h-5" />
              <span>{t.emergencySos}</span>
            </button>

            <button
              onClick={() => onSelectRole('HEALTH_WORKER')}
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm sm:text-base flex items-center gap-2 transition-all cursor-pointer"
            >
              <Users className="w-5 h-5 text-teal-300" />
              <span>ASHA Worker Portal</span>
            </button>
          </div>

          {/* Quick Guided Demo Scenarios Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-3 text-xs">
            <span className="text-teal-300 font-semibold">Instant Interactive Demos:</span>
            <button
              onClick={onLaunchDemoScenario1}
              className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Play className="w-3 h-3 text-rose-400 fill-rose-400" />
              <span className="font-bold">Scenario 1: Critical Chest Pain SOS</span>
            </button>
            <button
              onClick={onLaunchDemoScenario2}
              className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Play className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="font-bold">Scenario 2: ASHA Offline Triage & Sync</span>
            </button>
          </div>

          {/* Architectural Pipeline Badge */}
          <div className="pt-8 max-w-4xl mx-auto">
            <div className="bg-white/5 border border-white/10 p-3 sm:p-4 rounded-2xl backdrop-blur-md">
              <div className="text-[11px] font-bold uppercase tracking-wider text-teal-300 mb-2">
                AikyaCare Core Decision Pipeline
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-200">
                <span className="bg-teal-800/60 px-2.5 py-1 rounded-md">1. Symptoms in Natural Language</span>
                <span className="text-teal-400">→</span>
                <span className="bg-teal-800/60 px-2.5 py-1 rounded-md">2. AI Understanding & Biomarkers</span>
                <span className="text-teal-400">→</span>
                <span className="bg-amber-800/60 px-2.5 py-1 rounded-md text-amber-200">3. Emergency Danger Rules</span>
                <span className="text-teal-400">→</span>
                <span className="bg-rose-800/60 px-2.5 py-1 rounded-md text-rose-200">4. Transparent Urgency Score</span>
                <span className="text-teal-400">→</span>
                <span className="bg-emerald-800/60 px-2.5 py-1 rounded-md text-emerald-200">5. Connected Action (Ambulance/PHC)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== THE PROBLEM & USP ==================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 text-teal-700 font-bold text-xs uppercase tracking-wider mb-2">
              <Activity className="w-4 h-4" />
              The Rural Healthcare Reality
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              Why Generic Health Chatbots Fail in Rural India
            </h2>
            <p className="mt-3 text-slate-600 text-sm leading-relaxed">
              In remote districts and tribal villages, healthcare delays are fatal. Most digital health apps are designed for urban, English-speaking users with fast 5G and accessible hospitals. They output vague diagnoses without emergency escalation or actionable logistics.
            </p>

            <div className="mt-6 space-y-3">
              {[
                { title: 'Zero or Intermittent Internet', desc: 'Health workers lose connectivity inside rural hamlets, rendering cloud-only apps completely useless.' },
                { title: 'Shortage of Doctors & Long Distances', desc: 'Patients travel 25–40 km on rough roads; knowing whether a symptom requires a PHC or an ICU saves lives.' },
                { title: 'Fragmented Emergency Referral Loops', desc: 'No synchronized communication between ASHA workers, ambulances, and district hospital triage desks.' }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    ✕
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-teal-50 border border-teal-200/80 p-6 sm:p-8 rounded-2xl shadow-xs">
            <div className="inline-flex items-center gap-1.5 text-teal-800 font-extrabold text-xs uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              The AikyaCare Breakthrough
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              "We Don't Stop at Diagnosis. We Guide the Next Action."
            </h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              AikyaCare combines the clinical language processing of Google Gemini with a 100% deterministic safety risk engine that overrides AI if danger signs are present.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-xl border border-teal-100 shadow-2xs">
                <span className="text-2xl font-black text-teal-700 block">4 Levels</span>
                <span className="text-xs font-bold text-slate-800">Urgency Triage</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Green, Yellow, Orange, and Red SOS</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-teal-100 shadow-2xs">
                <span className="text-2xl font-black text-teal-700 block">100%</span>
                <span className="text-xs font-bold text-slate-800">Offline Triage</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Local rule engine with pending auto-sync</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-teal-100 shadow-2xs">
                <span className="text-2xl font-black text-teal-700 block">Bilingual</span>
                <span className="text-xs font-bold text-slate-800">English & Telugu</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Native voice input (te-IN) for ASHA workers</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-teal-100 shadow-2xs">
                <span className="text-2xl font-black text-teal-700 block">End-to-End</span>
                <span className="text-xs font-bold text-slate-800">Care Network</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Patient, Doctor, Ambulance, Hospital Bed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 4-LAYER AI ARCHITECTURE ==================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-extrabold uppercase tracking-wider text-teal-700">
            Engineered For Clinical Safety
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Layered AI & Deterministic Safety Architecture
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            DO NOT let LLMs make critical emergency decisions alone. AikyaCare enforces a strict multi-layer protocol where deterministic rules take clinical precedence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 font-extrabold text-xs flex items-center justify-center mb-3">
                L1
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">
                AI / NLP Understanding
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Google Gemini extracts structured clinical parameters (symptoms, duration, severity, existing diseases) from conversational English or Telugu voice inputs.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-teal-700 font-semibold">
              Gemini 3.8 Flash Engine
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border-2 border-rose-200 bg-rose-50/20 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 font-extrabold text-xs flex items-center justify-center mb-3">
                L2
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Emergency Risk Engine
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Deterministic safety rules inspect hard red-flag danger signs: Severe chest pain, respiratory distress, cyanosis, seizure, unconsciousness, stroke FAST signs, or hemorrhage.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-rose-100 text-[11px] text-rose-700 font-bold">
              Hard Safety Override Active
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 font-extrabold text-xs flex items-center justify-center mb-3">
                L3
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Explainable Risk Scoring
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Calculates transparent 0–100 point score: Chest pain (+35), Dyspnea (+35), Unconsciousness (+45), SpO2 &lt;90% (+40), Pediatric/Geriatric factor (+10).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-amber-700 font-semibold">
              Transparent Point Weights
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center mb-3">
                L4
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Actionable Care Pathway
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Translates urgency into real physical care: Green (Home monitoring), Yellow (PHC within 48h), Orange (Hospital today), Red (Instant Ambulance SOS).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-emerald-700 font-semibold">
              Care Pathway Mapper
            </div>
          </div>
        </div>
      </section>

      {/* ==================== MULTI-ROLE PORTALS EXPLORER ==================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <span className="text-xs font-extrabold uppercase tracking-wider text-teal-700">
            Connected Healthcare Ecosystem
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Explore Portals for Every Healthcare Stakeholder
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            AikyaCare connects rural households with the full continuum of care. Select any portal below to explore live workflows:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            onClick={() => onSelectRole('PATIENT')}
            className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-teal-700 transition-colors">
              Patient Guidance Portal
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Check symptoms via voice/text, review vital metrics, book telemedicine doctor consultations, and summarize lab reports with AI.
            </p>
            <div className="mt-4 text-xs font-bold text-teal-700 flex items-center gap-1">
              <span>Open Patient View</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => onSelectRole('HEALTH_WORKER')}
            className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
              ASHA / Health Worker Portal
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Offline triage engine with Telugu voice input, pending sync queue, household survey register, maternal tracking, and supervisor referrals.
            </p>
            <div className="mt-4 text-xs font-bold text-emerald-700 flex items-center gap-1">
              <span>Open ASHA Portal</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => onSelectRole('DOCTOR')}
            className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-blue-700 transition-colors">
              Doctor Consultation Desk
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Review AI triage risk scores, examine patient history, conduct video consultations, issue digital prescriptions, and order tests.
            </p>
            <div className="mt-4 text-xs font-bold text-blue-700 flex items-center gap-1">
              <span>Open Doctor Desk</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => onSelectRole('AMBULANCE_PARAMEDIC')}
            className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-3 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-rose-700 transition-colors">
              Ambulance Dispatch & Telemetry
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Live GPS route simulation, turn-by-turn navigation, patient vitals feed, and instant status updates (En Route, Arriving, Hospital Pickup).
            </p>
            <div className="mt-4 text-xs font-bold text-rose-700 flex items-center gap-1">
              <span>Open Ambulance View</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => onSelectRole('HOSPITAL_STAFF')}
            className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-purple-700 transition-colors">
              Hospital Capacity & Bed Control
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Real-time ICU, Oxygen, and General bed availability counters, incoming ambulance ETA tracking, and emergency trauma bay alerts.
            </p>
            <div className="mt-4 text-xs font-bold text-purple-700 flex items-center gap-1">
              <span>Open Hospital Triage</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => onSelectRole('ADMIN')}
            className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-amber-700 transition-colors">
              District Health Command Center
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Calculated Village Health Index (VHI), disease distribution heatmaps, maternal vaccination coverage, and referral turnaround analytics.
            </p>
            <div className="mt-4 text-xs font-bold text-amber-700 flex items-center gap-1">
              <span>Open District Command</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* ==================== HACKATHON ALIGNMENT (PS4) ==================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-800/60 text-teal-300 text-xs font-bold mb-3">
            <span>HACKATHON PROBLEM STATEMENT ALIGNMENT</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            How AikyaCare Directly Solves PS4
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
            PS4 requires an AI-powered triage and care coordination system built specifically for rural, low-connectivity communities:
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                req: 'Remote Symptom Assessment',
                impl: 'AI Symptom Understanding (English & Telugu voice recognition te-IN) extracting onset, duration, and clinical danger flags.'
              },
              {
                req: 'Categorize Clinical Urgency',
                impl: '4-stage classification (Green, Yellow, Orange, Red) backed by an explainable 0–100 risk score breakdown.'
              },
              {
                req: 'Recommend Appropriate Care Pathway',
                impl: 'Maps symptoms to actionable outcomes: Home care, PHC visit within 48h, CHC specialist today, or Emergency SOS.'
              },
              {
                req: 'Emergency Risk Assessment',
                impl: 'Layer 2 Deterministic Emergency Engine checks critical danger signs without relying purely on external AI.'
              },
              {
                req: 'Low-Connectivity & Offline Support',
                impl: 'Local-first browser triage, localStorage queue, and automatic bi-directional sync upon network restoration.'
              },
              {
                req: 'Care Coordination Network',
                impl: 'Synchronized communication across Patient, ASHA Worker, Telemedicine Doctor, Hospital Beds, and Ambulance.'
              }
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80">
                <div className="text-[11px] font-bold text-teal-400 uppercase tracking-wide">
                  PS4 Requirement #{i + 1}
                </div>
                <h4 className="font-bold text-sm text-white mt-1">{item.req}</h4>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  <span className="font-semibold text-teal-200">AikyaCare Implementation:</span> {item.impl}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== MANDATORY MEDICAL SAFETY NOTICE ==================== */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        <div className="p-4 sm:p-5 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-xs text-amber-950 leading-relaxed space-y-1">
          <div className="flex items-center justify-center gap-1.5 font-bold text-amber-900 text-sm">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span>Mandatory Clinical & Regulatory Safety Disclaimer</span>
          </div>
          <p className="text-amber-800">
            {t.disclaimerText}
          </p>
          <p className="text-[11px] text-amber-700 pt-1">
            All rule weights and emergency triggers are illustrative decision-support models for demonstration and hackathon evaluation. They must be validated by licensed clinicians before clinical deployment.
          </p>
        </div>
      </section>
    </div>
  );
};
