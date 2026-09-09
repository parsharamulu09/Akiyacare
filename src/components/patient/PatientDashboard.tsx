import React, { useState, useEffect } from 'react';
import {
  Heart,
  Activity,
  AlertTriangle,
  Calendar,
  Pill,
  FileText,
  Stethoscope,
  Clock,
  User,
  Phone,
  Video,
  ChevronRight,
  Sparkles,
  Send,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import { Patient, Appointment, Prescription, MedicalRecord } from '../../types';
import { TranslationDict } from '../../utils/teluguTranslations';
import { apiClient } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';

interface PatientDashboardProps {
  onOpenTriage: () => void;
  onOpenSos: () => void;
  onOpenReportSummarizer: () => void;
  t: TranslationDict;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  onOpenTriage,
  onOpenSos,
  onOpenReportSummarizer,
  t
}) => {
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [assistantMessage, setAssistantMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: `Namaste ${user?.name || 'Ravi'} garu! I am your AikyaCare health companion. You can ask me questions about your medications, diet for hypertension, or symptoms.`
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeCallDoctor, setActiveCallDoctor] = useState<string>('Dr. Ananya Sharma');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const targetId = user?.patientId || 'pat-1';
      const pRes = await apiClient.getPatient(targetId);
      if (pRes.success && pRes.patient) {
        setPatient(pRes.patient);
      }

      const aRes = await apiClient.getAppointments({ patientId: targetId });
      if (aRes.success) setAppointments(aRes.appointments);

      const prRes = await apiClient.getPrescriptions(targetId);
      if (prRes.success) setPrescriptions(prRes.prescriptions);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistantMessage.trim()) return;

    const userMsg = assistantMessage;
    setAssistantMessage('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);

    try {
      const conditions = (patient?.chronicConditions || []).join(', ') || 'None';
      const meds = (patient?.currentMeds || []).join(', ') || 'None';
      const res = await apiClient.askAssistant(
        userMsg,
        `Patient: ${patient?.name || user?.name || 'Ravi Kumar'}, Age: ${patient?.age || 48}, Chronic: ${conditions}, Current Meds: ${meds}`
      );
      if (res.success) {
        setChatHistory(prev => [...prev, { role: 'assistant', text: res.reply }]);
      }
    } catch (err) {
      setChatHistory(prev => [
        ...prev,
        { role: 'assistant', text: 'I am currently unable to reach the AI server. Please consult your local ASHA worker or doctor directly.' }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const initials = (patient?.name || user?.name || 'Ravi Kumar')
    .split(' ')
    .map(n => n[0])
    .filter(Boolean)
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'PT';

  const conditionsList = patient?.chronicConditions || [];
  const allergiesList = patient?.allergies || [];
  const villageDisplay = patient?.villageName || (patient as any)?.village || 'Kothur Gramam';
  const districtDisplay = (patient as any)?.district || 'Warangal Rural';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Patient Profile Card & Quick Actions Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white font-black text-2xl flex items-center justify-center shadow-md shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  {patient?.name || user?.name || 'Ravi Kumar'}
                </h1>
                <span className="bg-teal-50 text-teal-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-teal-200">
                  ABHA: {(patient as any)?.abhaId || '91-4401-5678-9012'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {patient?.age || 48} yrs, {patient?.gender || 'Male'} • {villageDisplay}, {districtDisplay} • Blood Group: <span className="font-bold text-slate-700">{patient?.bloodGroup || 'B+'}</span>
              </p>
              <div className="flex flex-wrap gap-2 mt-2 text-xs">
                {conditionsList.length > 0 ? (
                  conditionsList.map((cond, idx) => (
                    <span key={idx} className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md font-semibold">
                      Condition: {cond}
                    </span>
                  ))
                ) : (
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold">
                    No Known Chronic Conditions
                  </span>
                )}
                {allergiesList.length > 0 ? (
                  allergiesList.map((allg, idx) => (
                    <span key={idx} className="bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-md font-semibold">
                      Allergy: {allg}
                    </span>
                  ))
                ) : (
                  <span className="bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md font-semibold">
                    No Known Allergies
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Core Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenTriage}
              className="flex-1 sm:flex-none px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Stethoscope className="w-4 h-4" />
              <span>{t.checkSymptoms}</span>
            </button>

            <button
              onClick={onOpenReportSummarizer}
              className="flex-1 sm:flex-none px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>AI Lab Summarizer</span>
            </button>

            <button
              onClick={onOpenSos}
              className="flex-1 sm:flex-none px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xs sm:text-sm shadow-md shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer animate-pulse"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>EMERGENCY SOS</span>
            </button>
          </div>

        </div>

        {/* Physical Vitals Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Heart Rate</span>
              <Heart className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div className="text-xl font-black text-slate-900 mt-1">
              84 <span className="text-xs font-normal text-slate-500">bpm</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold">Normal Resting</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Blood Pressure</span>
              <Activity className="w-3.5 h-3.5 text-teal-600" />
            </div>
            <div className="text-xl font-black text-slate-900 mt-1">
              138/88 <span className="text-xs font-normal text-slate-500">mmHg</span>
            </div>
            <span className="text-[10px] text-amber-600 font-bold">Stage 1 Pre-HTN</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Oxygen (SpO2)</span>
              <Activity className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="text-xl font-black text-slate-900 mt-1">
              97%
            </div>
            <span className="text-[10px] text-emerald-600 font-bold">Optimal Saturation</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Random Glucose</span>
              <Activity className="w-3.5 h-3.5 text-purple-500" />
            </div>
            <div className="text-xl font-black text-slate-900 mt-1">
              142 <span className="text-xs font-normal text-slate-500">mg/dL</span>
            </div>
            <span className="text-[10px] text-amber-600 font-bold">Post-meal check</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Appointments & Prescriptions + AI Companion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Consultations & Medical Timeline */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Scheduled Appointments / Telemedicine Desk */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-700" />
                <h3 className="font-extrabold text-base text-slate-900">
                  {t.scheduledAppointments}
                </h3>
              </div>
              <span className="text-xs text-slate-500">Telemedicine & PHC</span>
            </div>

            <div className="space-y-3">
              {appointments.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No upcoming appointments scheduled.
                </div>
              ) : (
                appointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-teal-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{appt.doctorName}</span>
                        <span className="bg-teal-50 text-teal-800 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-teal-200">
                          {appt.doctorSpecialty}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Reason: <span className="font-medium text-slate-800">{appt.reasonForVisit}</span>
                      </p>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(appt.scheduledAt).toLocaleDateString()} at {new Date(appt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveCallDoctor(appt.doctorName);
                        setIsVideoModalOpen(true);
                      }}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <Video className="w-4 h-4" />
                      <span>{t.joinConsultation}</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Prescriptions & Dosage */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-purple-700" />
                <h3 className="font-extrabold text-base text-slate-900">
                  {t.prescriptions} & Dosage Schedule
                </h3>
              </div>
              <span className="text-xs text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-full">
                Active Therapy
              </span>
            </div>

            <div className="space-y-3">
              {prescriptions.map((rx) => (
                <div key={rx.id} className="p-4 rounded-2xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                    <span className="font-bold text-slate-800">Prescribed by {rx.doctorName}</span>
                    <span className="text-slate-400">{new Date(rx.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-2 text-xs text-slate-600">
                    <span className="font-semibold text-slate-900">Diagnosis:</span> {rx.diagnosis}
                  </div>

                  <div className="mt-3 space-y-2">
                    {rx.medications.map((m, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl text-xs">
                        <div>
                          <span className="font-extrabold text-slate-900 text-sm block">{m.name}</span>
                          <span className="text-slate-500">{m.dosage} • {m.timing}</span>
                        </div>
                        <div className="text-right">
                          <span className="bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-md text-[11px] block">
                            {m.frequency}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5 block">{m.durationDays} Days</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 italic">
                    Instructions: {rx.instructions}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: AI Health Companion Chatbot */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col h-[560px]">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  AikyaCare Health Assistant
                </h3>
                <p className="text-[11px] text-slate-500">Gemini Clinical Q&A • English & Telugu</p>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5 text-xs">
              {chatHistory.map((c, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-2xl leading-relaxed ${
                    c.role === 'user'
                      ? 'bg-teal-600 text-white ml-6'
                      : 'bg-slate-100 text-slate-800 mr-6'
                  }`}
                >
                  {c.text}
                </div>
              ))}
              {isChatLoading && (
                <div className="p-3 rounded-2xl bg-slate-100 text-slate-500 mr-6 text-xs animate-pulse">
                  Thinking...
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={assistantMessage}
                onChange={(e) => setAssistantMessage(e.target.value)}
                placeholder="Ask about diet, medicines, or vitals..."
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl outline-hidden focus:border-teal-600"
              />
              <button
                type="submit"
                disabled={isChatLoading}
                className="p-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Village Emergency Contact Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
            <span className="font-bold text-slate-900 block">Village Health Support:</span>
            <div className="flex items-center justify-between text-slate-700">
              <span>ASHA Worker (Padmavati):</span>
              <span className="font-mono font-bold">+91 94401 22334</span>
            </div>
            <div className="flex items-center justify-between text-slate-700">
              <span>Primary Health Center (Kothur):</span>
              <span className="font-mono font-bold">0870-245678</span>
            </div>
            <div className="flex items-center justify-between text-rose-700 font-bold">
              <span>Emergency Ambulance:</span>
              <span className="font-mono">108 / 104</span>
            </div>
          </div>

        </div>

      </div>

      {/* Telemedicine Video Call Simulation Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 text-white rounded-3xl max-w-xl w-full border border-slate-800 overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-teal-400 animate-pulse" />
                <span className="font-bold text-sm">Telemedicine Consultation — {activeCallDoctor}</span>
              </div>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                End Call
              </button>
            </div>
            <div className="p-8 text-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-teal-800/60 border-2 border-teal-400 flex items-center justify-center mx-auto text-3xl font-black">
                🩺
              </div>
              <h4 className="text-lg font-bold">Connected with {activeCallDoctor}</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Secure rural audio/video bridge active. Clinical notes and prescription will be automatically appended to your ABHA profile upon session conclusion.
              </p>
              <div className="flex items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => setIsVideoModalOpen(false)}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
                >
                  Disconnect Consultation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
