import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Calendar,
  Users,
  Pill,
  Video,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Send,
  Plus,
  Trash2,
  Activity,
  Heart
} from 'lucide-react';
import { Appointment, Prescription, Referral } from '../../types';
import { TranslationDict } from '../../utils/teluguTranslations';
import { apiClient } from '../../services/apiClient';

interface DoctorDashboardProps {
  t: TranslationDict;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ t }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('pat-1');
  const [selectedPatientName, setSelectedPatientName] = useState<string>('Ravi Kumar');
  const [isVideoActive, setIsVideoActive] = useState(false);

  // Prescription Writer state
  const [diagnosis, setDiagnosis] = useState('Stage 1 Hypertension & Tension-type Headache');
  const [instructions, setInstructions] = useState('Drink boiled water, restrict sodium to < 2g/day, avoid heavy exertion.');
  const [medications, setMedications] = useState([
    { name: 'Amlodipine', dosage: '5mg', frequency: 'Once Daily', durationDays: 30, timing: 'Morning after breakfast' },
    { name: 'Paracetamol', dosage: '500mg', frequency: 'SOS (as needed)', durationDays: 3, timing: 'After meals if headache' }
  ]);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [rxSuccessMsg, setRxSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const aRes = await apiClient.getAppointments();
      if (aRes.success) setAppointments(aRes.appointments);

      const rRes = await apiClient.getReferrals();
      if (rRes.success) setReferrals(rRes.referrals);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMedication = () => {
    if (!newMedName.trim()) return;
    setMedications(prev => [
      ...prev,
      {
        name: newMedName,
        dosage: newMedDosage || '1 tablet',
        frequency: 'Twice Daily',
        durationDays: 5,
        timing: 'After meals'
      }
    ]);
    setNewMedName('');
    setNewMedDosage('');
  };

  const handleRemoveMed = (index: number) => {
    setMedications(prev => prev.filter((_, i) => i !== index));
  };

  const handleIssuePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.createPrescription({
        patientId: selectedPatientId,
        doctorId: 'doc-1',
        medications,
        diagnosis,
        instructions
      });
      if (res.success) {
        setRxSuccessMsg(`Prescription registered for ${selectedPatientName} and sent to pharmacy!`);
        setTimeout(() => setRxSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Doctor Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-md">
              DA
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  Dr. Ananya Sharma, MD
                </h1>
                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                  Telemedicine & Rural Care Lead
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Kothur Primary Health Center & District Hospital General Medicine Desk
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsVideoActive(!isVideoActive)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isVideoActive
                  ? 'bg-rose-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>{isVideoActive ? 'End Live Tele-consult' : 'Start Video Room'}</span>
            </button>
          </div>
        </div>

        {/* Live Active Call Banner if enabled */}
        {isVideoActive && (
          <div className="mt-6 p-4 bg-slate-950 text-white rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
              <div>
                <span className="font-bold text-sm block">Live Consultation Active with {selectedPatientName}</span>
                <span className="text-[11px] text-slate-400">Audio/Video bandwidth optimized for 2G/3G rural networks</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsVideoActive(false)}
                className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold"
              >
                Disconnect Call
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Patient Queue + Prescription Writer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Scheduled Appointments Queue */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Today's Telemedicine Queue</span>
              </h3>
              <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded-md">
                {appointments.length} Patients
              </span>
            </div>

            <div className="space-y-2.5">
              {appointments.map((appt) => {
                const isSelected = appt.patientId === selectedPatientId;
                return (
                  <div
                    key={appt.id}
                    onClick={() => {
                      setSelectedPatientId(appt.patientId);
                      setSelectedPatientName(appt.patientName);
                    }}
                    className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-2 ring-blue-100'
                        : 'border-slate-200 hover:border-blue-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{appt.patientName}</span>
                      <span className="text-slate-400 text-[10px]">
                        {new Date(appt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-1">
                      Reason: <span className="font-semibold text-slate-800">{appt.reasonForVisit}</span>
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md">
                        {appt.type}
                      </span>
                      <span className="text-emerald-700 font-semibold">{appt.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pending Field Worker Referrals */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <h3 className="font-extrabold text-sm text-slate-900 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>ASHA Worker Urgent Referrals</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              {referrals.map((r) => (
                <div key={r.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{r.patientName}</span>
                    <span className="bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-md text-[10px]">
                      {r.urgency}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1">{r.reason}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Referred by {r.healthWorkerName} ({r.villageName})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Prescription Writer & Clinical Assessment */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Patient Overview Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base">{selectedPatientName}</span>
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">ID: {selectedPatientId}</span>
              </div>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md">
                Active Session
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block font-bold text-[10px]">LATEST VITALS</span>
                <span className="text-sm font-black text-slate-900 block mt-0.5">BP: 138/88 mmHg</span>
                <span className="text-[11px] text-slate-500">Pulse: 84 bpm • SpO2: 97%</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block font-bold text-[10px]">CHRONIC ILLNESS</span>
                <span className="text-sm font-black text-slate-900 block mt-0.5">Hypertension</span>
                <span className="text-[11px] text-slate-500">Duration: 3 years</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block font-bold text-[10px]">KNOWN ALLERGIES</span>
                <span className="text-sm font-black text-rose-700 block mt-0.5">Penicillin</span>
                <span className="text-[11px] text-slate-500">Anaphylaxis warning</span>
              </div>
            </div>
          </div>

          {/* Digital Prescription & Clinical Notes */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Pill className="w-5 h-5 text-blue-600" />
                <span>Digital Clinical Prescription Writer</span>
              </h3>
              <span className="text-xs text-slate-400">ABHA Compliant Rx</span>
            </div>

            {rxSuccessMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{rxSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleIssuePrescription} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Clinical Diagnosis</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden focus:border-blue-600"
                />
              </div>

              {/* Medication List */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Prescribed Medications</label>
                <div className="space-y-2">
                  {medications.map((m, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">{m.name} ({m.dosage})</span>
                        <span className="text-slate-500">{m.frequency} • {m.timing} ({m.durationDays} Days)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMed(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Medication Mini-Form */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    placeholder="Medication name (e.g. Metformin)"
                    className="px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                  />
                  <input
                    type="text"
                    value={newMedDosage}
                    onChange={(e) => setNewMedDosage(e.target.value)}
                    placeholder="Dosage (e.g. 500mg)"
                    className="px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddMedication}
                    className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Medicine</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Patient Instructions & Diet Guidance</label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-hidden focus:border-blue-600 leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Issue & Authenticate Prescription</span>
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};
