import React, { useState, useEffect } from 'react';
import {
  Building2,
  Bed,
  Activity,
  AlertOctagon,
  Clock,
  Plus,
  Minus,
  CheckCircle2,
  Users,
  ShieldCheck,
  Truck
} from 'lucide-react';
import { Hospital, EmergencyRequest } from '../../types';
import { TranslationDict } from '../../utils/teluguTranslations';
import { apiClient } from '../../services/apiClient';

interface HospitalDashboardProps {
  t: TranslationDict;
}

export const HospitalDashboard: React.FC<HospitalDashboardProps> = ({ t }) => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [emergencies, setEmergencies] = useState<EmergencyRequest[]>([]);
  const [updateFeedback, setUpdateFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 8000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      const hRes = await apiClient.getHospitals();
      if (hRes.success && hRes.hospitals.length > 0) {
        setHospitals(hRes.hospitals);
        if (!selectedHospital) {
          setSelectedHospital(hRes.hospitals[0]);
        } else {
          const updated = hRes.hospitals.find(h => h.id === selectedHospital.id);
          if (updated) setSelectedHospital(updated);
        }
      }

      const eRes = await apiClient.getEmergencies();
      if (eRes.success) {
        setEmergencies(eRes.emergencies);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdjustBed = async (type: 'availableBeds' | 'icuBedsAvailable' | 'oxygenBedsAvailable', delta: number) => {
    if (!selectedHospital) return;

    const currentVal = selectedHospital[type];
    const maxVal =
      type === 'availableBeds'
        ? selectedHospital.totalBeds
        : type === 'icuBedsAvailable'
        ? selectedHospital.icuBedsTotal
        : selectedHospital.oxygenBedsTotal;

    const newVal = Math.max(0, Math.min(maxVal, currentVal + delta));

    try {
      const res = await apiClient.updateHospitalBeds(selectedHospital.id, {
        [type]: newVal
      });
      if (res.success) {
        setSelectedHospital(res.hospital);
        setUpdateFeedback(`Updated ${type} to ${newVal}`);
        setTimeout(() => setUpdateFeedback(null), 2500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Hospital Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white font-black text-xl flex items-center justify-center shadow-md">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  {selectedHospital?.name || 'District Care Hospital'}
                </h1>
                <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Level-2 Trauma & Referral Center
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                District Medical Cluster, Warangal Rural • Emergency Hotline: 0870-245999
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedHospital?.id}
              onChange={(e) => {
                const h = hospitals.find(x => x.id === e.target.value);
                if (h) setSelectedHospital(h);
              }}
              className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold bg-white outline-hidden cursor-pointer"
            >
              {hospitals.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
        </div>

        {updateFeedback && (
          <div className="mt-4 p-2.5 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
            <span>{updateFeedback}</span>
          </div>
        )}
      </div>

      {/* Real-time Bed Management Cards */}
      {selectedHospital && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          {/* General Inpatient Beds */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                <span>GENERAL INPATIENT BEDS</span>
                <Bed className="w-4 h-4 text-teal-600" />
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900">
                  {selectedHospital.availableBeds}
                </span>
                <span className="text-sm font-semibold text-slate-400">
                  / {selectedHospital.totalBeds} Available
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-teal-600 h-full rounded-full"
                  style={{ width: `${(selectedHospital.availableBeds / selectedHospital.totalBeds) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Adjust Vacancy:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAdjustBed('availableBeds', -1)}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleAdjustBed('availableBeds', 1)}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* ICU Beds */}
          <div className="bg-white rounded-3xl border-2 border-rose-200 bg-rose-50/20 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-rose-800 font-bold">
                <span>INTENSIVE CARE UNIT (ICU)</span>
                <Activity className="w-4 h-4 text-rose-600" />
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-black text-rose-600">
                  {selectedHospital.icuBedsAvailable}
                </span>
                <span className="text-sm font-semibold text-slate-400">
                  / {selectedHospital.icuBedsTotal} Available
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-rose-600 h-full rounded-full"
                  style={{ width: `${(selectedHospital.icuBedsAvailable / selectedHospital.icuBedsTotal) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-rose-100 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Critical Reserve:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAdjustBed('icuBedsAvailable', -1)}
                  className="w-8 h-8 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold flex items-center justify-center cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleAdjustBed('icuBedsAvailable', 1)}
                  className="w-8 h-8 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold flex items-center justify-center cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Oxygen Supported Beds */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-blue-700 font-bold">
                <span>OXYGEN SUPPORTED BEDS</span>
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-black text-blue-600">
                  {selectedHospital.oxygenBedsAvailable}
                </span>
                <span className="text-sm font-semibold text-slate-400">
                  / {selectedHospital.oxygenBedsTotal} Available
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full"
                  style={{ width: `${(selectedHospital.oxygenBedsAvailable / selectedHospital.oxygenBedsTotal) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Oxygen Line:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAdjustBed('oxygenBedsAvailable', -1)}
                  className="w-8 h-8 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold flex items-center justify-center cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleAdjustBed('oxygenBedsAvailable', 1)}
                  className="w-8 h-8 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold flex items-center justify-center cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Incoming Ambulances & On-Duty Emergency Team */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Incoming Critical Ambulance Dispatches */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-rose-600" />
              <span>Incoming Critical Emergency Cases</span>
            </h3>
            <span className="text-xs text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md">
              Trauma Bay Alert Active
            </span>
          </div>

          <div className="space-y-3">
            {emergencies.filter(e => e.status !== 'ARRIVED_AT_HOSPITAL').map((em) => (
              <div key={em.id} className="p-4 rounded-2xl border border-rose-200 bg-rose-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">{em.patientName}</span>
                    <span className="bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 rounded-md">
                      {em.urgency}
                    </span>
                    <span className="text-slate-500">Ambulance: {em.ambulanceNumber || 'AMB-104'}</span>
                  </div>
                  <p className="text-slate-700 mt-1 font-medium">{em.symptoms}</p>
                  <div className="mt-2 text-rose-800 font-bold flex items-center gap-2">
                    <span>Danger Signs: {em.dangerSigns.join(', ')}</span>
                  </div>
                </div>

                <div className="text-right sm:text-right shrink-0">
                  <span className="text-[11px] text-slate-500 block">ETA to Bay</span>
                  <span className="text-xl font-black text-rose-600">~{em.etaMinutes} Mins</span>
                  <span className="text-[10px] text-teal-700 font-bold block mt-0.5">{em.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Emergency Department Readiness */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs text-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span>On-Duty Emergency Medical Officers</span>
            </h3>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block">Dr. S. K. Murthy, MS</span>
                <span className="text-slate-500">Chief Trauma Surgeon • Bay 1</span>
                <span className="text-[10px] text-emerald-600 font-bold block mt-1">AVAILABLE</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block">Dr. Kavitha Reddy, MD</span>
                <span className="text-slate-500">Critical Care & Pulmonology • ICU Lead</span>
                <span className="text-[10px] text-emerald-600 font-bold block mt-1">ON SHIFT</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block">S. Radhika</span>
                <span className="text-slate-500">Senior Triage Nursing Officer</span>
                <span className="text-[10px] text-emerald-600 font-bold block mt-1">TRIAGE DESK</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
