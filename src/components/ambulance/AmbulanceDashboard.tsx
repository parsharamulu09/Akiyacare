import React, { useState, useEffect } from 'react';
import {
  Truck,
  MapPin,
  Clock,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Navigation,
  Activity,
  Heart,
  ShieldAlert
} from 'lucide-react';
import { EmergencyRequest, Ambulance } from '../../types';
import { TranslationDict } from '../../utils/teluguTranslations';
import { apiClient } from '../../services/apiClient';

interface AmbulanceDashboardProps {
  t: TranslationDict;
}

export const AmbulanceDashboard: React.FC<AmbulanceDashboardProps> = ({ t }) => {
  const [emergencies, setEmergencies] = useState<EmergencyRequest[]>([]);
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [activeEmergency, setActiveEmergency] = useState<EmergencyRequest | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 6000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const res = await apiClient.getAmbulances();
      if (res.success) {
        setEmergencies(res.emergencies);
        setAmbulances(res.ambulances);
        if (!activeEmergency && res.emergencies.length > 0) {
          setActiveEmergency(res.emergencies[0]);
        } else if (activeEmergency) {
          const updated = res.emergencies.find(e => e.id === activeEmergency.id);
          if (updated) setActiveEmergency(updated);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!activeEmergency) return;
    try {
      const res = await apiClient.updateEmergencyStatus(activeEmergency.id, status);
      if (res.success) {
        setActiveEmergency(res.emergency);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const steps = [
    { key: 'REQUESTED', label: 'Requested' },
    { key: 'ACCEPTED', label: 'Accepted' },
    { key: 'EN_ROUTE', label: 'En Route' },
    { key: 'ARRIVING', label: 'Arriving' },
    { key: 'PATIENT_PICKED_UP', label: 'Patient Pickup' },
    { key: 'ARRIVED_AT_HOSPITAL', label: 'At Hospital' }
  ];

  const currentStepIdx = activeEmergency
    ? steps.findIndex(s => s.key === activeEmergency.status)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Ambulance Paramedic Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white font-black text-xl flex items-center justify-center shadow-md">
              <Truck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  Ambulance 104 Command — Warangal Cluster
                </h1>
                <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  ALS (Advanced Life Support)
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Vehicle: TS-03-EM-104 • Lead Paramedic: Ramesh Goud • Base: Kothur Emergency Hub
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex items-center gap-2 text-emerald-900">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold">GPS Telemetry Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Emergency Dispatch & Interactive Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Incoming Emergency Dispatches */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Active Emergency Queue ({emergencies.length})</span>
            </h3>
          </div>

          <div className="space-y-3">
            {emergencies.map((em) => {
              const isSelected = activeEmergency?.id === em.id;
              return (
                <div
                  key={em.id}
                  onClick={() => setActiveEmergency(em)}
                  className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-rose-600 bg-rose-50/50 shadow-md ring-2 ring-rose-200'
                      : 'border-slate-200 bg-white hover:border-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-sm">{em.patientName}</span>
                    <span className="bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 rounded-md">
                      {em.urgency}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1.5 font-medium line-clamp-2">
                    {em.symptoms}
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500 text-[11px]">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{em.pickupAddress}</span>
                    </span>
                    <span className="font-bold text-rose-600">{em.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Live Mission Control & Status Pipeline */}
        <div className="lg:col-span-2 space-y-6">
          {activeEmergency ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              
              {/* Mission Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wide">
                    Live Dispatch Mission #{activeEmergency.id}
                  </span>
                  <h2 className="text-xl font-black text-slate-900 mt-0.5">
                    {activeEmergency.patientName} ({activeEmergency.patientPhone})
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>Pickup: {activeEmergency.pickupAddress}</span>
                  </p>
                </div>

                <div className="text-right sm:text-right bg-rose-50 p-3 rounded-2xl border border-rose-200">
                  <span className="text-xs text-rose-700 block font-bold">Estimated Arrival</span>
                  <span className="text-2xl font-black text-rose-950">~{activeEmergency.etaMinutes} Mins</span>
                </div>
              </div>

              {/* Status Pipeline Tracker */}
              <div>
                <span className="text-xs font-bold text-slate-600 block mb-2 uppercase tracking-wide">
                  Mission Progress Stages
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center">
                  {steps.map((step, idx) => {
                    const isDone = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    return (
                      <div
                        key={step.key}
                        className={`p-2 rounded-xl border text-xs transition-all ${
                          isCurrent
                            ? 'bg-rose-600 text-white border-rose-700 font-bold shadow-xs animate-pulse'
                            : isDone
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                            : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}
                      >
                        <div className="text-[10px] opacity-75">Stage {idx + 1}</div>
                        <div className="truncate font-bold mt-0.5">{step.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Simulated Rural GPS Route View */}
              <div className="bg-slate-900 rounded-2xl p-5 text-white space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-teal-400 flex items-center gap-1.5">
                    <Navigation className="w-4 h-4" />
                    <span>Live GPS Navigation Feed (Rural Route)</span>
                  </span>
                  <span className="font-mono text-slate-400">17.8920° N, 79.6800° E</span>
                </div>

                {/* Visual Route Graphic */}
                <div className="h-32 bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col justify-between relative overflow-hidden">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-teal-400"></div>
                      <span>AMB-104 (Current GPS)</span>
                    </div>
                    <div className="flex items-center gap-2 text-rose-400">
                      <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></div>
                      <span>Patient: Kothur Village</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-400">
                      <Building2 className="w-4 h-4" />
                      <span>District Care Hospital</span>
                    </div>
                  </div>

                  {/* Route line */}
                  <div className="w-full bg-slate-800 h-2 rounded-full relative">
                    <div
                      className="bg-teal-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (currentStepIdx + 1) * 18)}%` }}
                    ></div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Speed: 52 km/h • Road: Warangal-Kothur District Link</span>
                    <span>Hospital Trauma Desk Pre-alerted</span>
                  </div>
                </div>
              </div>

              {/* Clinical Danger Signs & Symptoms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl">
                  <span className="font-bold text-rose-950 flex items-center gap-1 mb-1">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>Danger Signs Detected by AI Engine:</span>
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-rose-900 font-medium">
                    {activeEmergency.dangerSigns.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="font-bold text-slate-900 block mb-1">Destination Hospital</span>
                  <p className="text-slate-700 font-semibold">{activeEmergency.hospitalName || 'District Care Hospital'}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Emergency Trauma Bay 3 reserved with oxygen support</p>
                </div>
              </div>

              {/* Status Progression Action Controls */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2 text-xs">
                {activeEmergency.status === 'REQUESTED' && (
                  <button
                    onClick={() => handleUpdateStatus('ACCEPTED')}
                    className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Accept Emergency Mission
                  </button>
                )}
                {activeEmergency.status === 'ACCEPTED' && (
                  <button
                    onClick={() => handleUpdateStatus('EN_ROUTE')}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Mark En Route to Patient
                  </button>
                )}
                {activeEmergency.status === 'EN_ROUTE' && (
                  <button
                    onClick={() => handleUpdateStatus('ARRIVING')}
                    className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Mark Arrived at Patient Location
                  </button>
                )}
                {activeEmergency.status === 'ARRIVING' && (
                  <button
                    onClick={() => handleUpdateStatus('PATIENT_PICKED_UP')}
                    className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Patient Onboard → Navigating to Hospital
                  </button>
                )}
                {activeEmergency.status === 'PATIENT_PICKED_UP' && (
                  <button
                    onClick={() => handleUpdateStatus('ARRIVED_AT_HOSPITAL')}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Confirm Handover at Hospital Triage Bay
                  </button>
                )}
                {activeEmergency.status === 'ARRIVED_AT_HOSPITAL' && (
                  <div className="w-full p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-center font-bold">
                    Mission Complete: Patient safely transferred to hospital emergency department.
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-slate-50 rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-400 text-xs">
              Select an emergency dispatch from the left queue to open telemetry and live mission controls.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
