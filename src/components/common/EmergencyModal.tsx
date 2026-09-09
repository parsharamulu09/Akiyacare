import React, { useState } from 'react';
import {
  AlertOctagon,
  X,
  PhoneCall,
  MapPin,
  Truck,
  Building2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Send
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { EmergencyRequest } from '../../types';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewAmbulanceDashboard: () => void;
  defaultSymptoms?: string;
  defaultDangerSigns?: string[];
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  onViewAmbulanceDashboard,
  defaultSymptoms,
  defaultDangerSigns
}) => {
  const [patientName, setPatientName] = useState('Ravi Kumar');
  const [patientPhone, setPatientPhone] = useState('+91 94401 56789');
  const [pickupAddress, setPickupAddress] = useState('House #4-12, Kothur Village, Warangal Rural');
  const [symptoms, setSymptoms] = useState(
    defaultSymptoms || 'Severe crushing chest pain, sweating, shortness of breath'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeRequest, setActiveRequest] = useState<EmergencyRequest | null>(null);

  if (!isOpen) return null;

  const handleTriggerSos = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await apiClient.triggerEmergencySos({
        patientName,
        patientPhone,
        pickupAddress,
        symptoms,
        dangerSigns: defaultDangerSigns || ['Severe Chest Pain', 'Acute Dyspnea'],
        urgency: 'RED',
        pickupLatitude: 17.8920,
        pickupLongitude: 79.6800
      });
      if (response.success) {
        setActiveRequest(response.emergency);
      }
    } catch (err) {
      console.error('SOS dispatch error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { key: 'REQUESTED', label: 'Requested' },
    { key: 'ACCEPTED', label: 'Accepted' },
    { key: 'EN_ROUTE', label: 'En Route' },
    { key: 'ARRIVING', label: 'Arriving' },
    { key: 'PATIENT_PICKED_UP', label: 'Pickup' },
    { key: 'ARRIVED_AT_HOSPITAL', label: 'Hospital' }
  ];

  const currentStepIndex = activeRequest
    ? steps.findIndex(s => s.key === activeRequest.status)
    : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full border-2 border-rose-600 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with High-Visibility Emergency Theme */}
        <div className="bg-rose-600 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white animate-pulse">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight">
                EMERGENCY SOS DISPATCH
              </h2>
              <p className="text-xs text-rose-100 font-medium">
                Immediate Critical Care & Ambulance Navigation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {!activeRequest ? (
            <form onSubmit={handleTriggerSos} className="space-y-4">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 leading-relaxed">
                <span className="font-bold">⚠️ High Priority Protocol:</span> Clicking below sends an immediate automated beacon to the nearest Advanced Life Support (ALS) ambulance, alerts the District Care Hospital emergency triage bay, and notifies village emergency contacts.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    required
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    required
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pickup Location (Village / Landmark)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    required
                    className="w-full text-sm pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-hidden"
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <span>Simulated GPS:</span>
                  <span className="font-mono font-medium text-slate-700">17.8920° N, 79.6800° E</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reported Emergency Symptoms
                </label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  rows={2}
                  required
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl font-extrabold text-base shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <span>DISPATCHING AMBULANCE...</span>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>CONFIRM & DISPATCH AMBULANCE NOW</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Active Live Dispatch Tracking Screen */
            <div className="space-y-5">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-md">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-emerald-950">
                  Emergency Assistance Requested & Confirmed
                </h3>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Request ID: <span className="font-mono font-bold">{activeRequest.id}</span>
                </p>
              </div>

              {/* Status Pipeline */}
              <div>
                <div className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
                  Live Dispatch Status
                </div>
                <div className="grid grid-cols-6 gap-1 text-center">
                  {steps.map((step, idx) => {
                    const isDone = idx <= (currentStepIndex >= 0 ? currentStepIndex : 1);
                    const isCurrent = idx === (currentStepIndex >= 0 ? currentStepIndex : 1);
                    return (
                      <div key={step.key} className="flex flex-col items-center">
                        <div
                          className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center transition-colors ${
                            isCurrent
                              ? 'bg-rose-600 text-white ring-4 ring-rose-100 animate-pulse'
                              : isDone
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <span
                          className={`text-[10px] mt-1 font-semibold ${
                            isCurrent
                              ? 'text-rose-600 font-bold'
                              : isDone
                              ? 'text-emerald-700'
                              : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dispatch Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-start gap-2.5">
                  <Truck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 block">Assigned Ambulance</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {activeRequest.ambulanceNumber || 'AMB-104 (ALS)'}
                    </span>
                    <span className="text-[11px] text-teal-700 block">Paramedic: Ramesh Goud (+91 98480 12345)</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 block">Estimated Arrival (ETA)</span>
                    <span className="font-extrabold text-rose-600 text-sm">
                      ~{activeRequest.etaMinutes} Minutes
                    </span>
                    <span className="text-[11px] text-slate-500 block">Driver navigating rural route</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Building2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 block">Destination Hospital</span>
                    <span className="font-bold text-slate-900">
                      {activeRequest.hospitalName || 'District Care Hospital'}
                    </span>
                    <span className="text-[11px] text-slate-500 block">ICU & Trauma Team Notified</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <PhoneCall className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 block">Emergency Contacts</span>
                    <span className="font-bold text-slate-900">
                      Lakshmi (Spouse) Notified
                    </span>
                    <span className="text-[11px] text-slate-500 block">ASHA Worker: Padmavati alerted</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onViewAmbulanceDashboard();
                  }}
                  className="w-full sm:flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Open Ambulance Tracking</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </div>
          )}

          {/* Safety Disclaimer */}
          <div className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1 border-t border-slate-100 pt-3">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Demonstration simulation. In real life emergencies, dial 108 / 112 directly.</span>
          </div>
        </div>

      </div>
    </div>
  );
};
