import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Building2,
  Users,
  Activity,
  Truck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  MapPin
} from 'lucide-react';
import { TranslationDict } from '../../utils/teluguTranslations';
import { apiClient } from '../../services/apiClient';
import { VillageHealthIndex } from '../../types';

interface AdminDashboardProps {
  t: TranslationDict;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ t }) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [villages, setVillages] = useState<VillageHealthIndex[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const res = await apiClient.getAdminAnalytics();
      if (res.success) {
        setAnalytics(res);
        setVillages(res.villages);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Village Name,Health Index Score,Risk Category,Active Cases,Clean Water %,Maternal Vaccination %\n"
      + villages.map(v => `"${v.villageName}",${v.healthIndexScore},"${v.riskCategory}",${v.activeCases},${v.cleanWaterAccessPercentage}%,${v.maternalVaccinationCoverage}%`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AikyaCare_District_Health_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Admin Command Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-600 text-white font-black text-xl flex items-center justify-center shadow-md">
              <BarChart3 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  District Health Command Center
                </h1>
                <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Warangal Rural Healthcare Cluster
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Real-Time Population Health Surveillance & Emergency Care Coordination
              </p>
            </div>
          </div>

          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-2 border border-slate-200 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export District CSV Report</span>
          </button>
        </div>

        {/* 6 Key Surveillance Summary Cards */}
        {analytics?.summary && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-100 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block font-semibold text-[11px]">Tracked Citizens</span>
              <span className="text-xl font-black text-slate-900 mt-1 block">
                {analytics.summary.totalPatients.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold">38 Villages</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block font-semibold text-[11px]">Active Emergencies</span>
              <span className="text-xl font-black text-rose-600 mt-1 block">
                {analytics.summary.activeEmergencies}
              </span>
              <span className="text-[10px] text-rose-600 font-bold">Priority Red</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block font-semibold text-[11px]">Field ASHA Workers</span>
              <span className="text-xl font-black text-teal-700 mt-1 block">
                {analytics.summary.activeAshaWorkers}
              </span>
              <span className="text-[10px] text-teal-700 font-bold">100% Reporting</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block font-semibold text-[11px]">Primary Centers</span>
              <span className="text-xl font-black text-blue-700 mt-1 block">
                {analytics.summary.phcCount}
              </span>
              <span className="text-[10px] text-blue-700 font-bold">Connected</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block font-semibold text-[11px]">Ambulance Response</span>
              <span className="text-xl font-black text-amber-700 mt-1 block">
                {analytics.summary.averageAmbulanceResponseMinutes}m
              </span>
              <span className="text-[10px] text-emerald-600 font-bold">Target &lt; 12 min</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block font-semibold text-[11px]">Referral Completion</span>
              <span className="text-xl font-black text-emerald-700 mt-1 block">
                {analytics.summary.referralCompletionRate}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold">High Adherence</span>
            </div>
          </div>
        )}
      </div>

      {/* Village Health Index (VHI) Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              Village Health Index (VHI) Surveillance
            </h3>
            <p className="text-xs text-slate-500">
              Calculated dynamically from household sanitation, maternal vaccinations, and field triage reports
            </p>
          </div>
        </div>

        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="p-3.5">Village Name</th>
                <th className="p-3.5">Health Index (0-100)</th>
                <th className="p-3.5">Risk Category</th>
                <th className="p-3.5">Active Cases</th>
                <th className="p-3.5">Clean Water Access</th>
                <th className="p-3.5">Maternal Immunization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {villages.map((v) => (
                <tr key={v.villageId} className="hover:bg-slate-50/70">
                  <td className="p-3.5 font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{v.villageName}</span>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-slate-900">{v.healthIndexScore}</span>
                      <div className="w-20 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            v.healthIndexScore >= 80
                              ? 'bg-emerald-500'
                              : v.healthIndexScore >= 60
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${v.healthIndexScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] ${
                        v.riskCategory === 'HEALTHY'
                          ? 'bg-emerald-100 text-emerald-800'
                          : v.riskCategory === 'MODERATE'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {v.riskCategory}
                    </span>
                  </td>
                  <td className="p-3.5 font-medium text-slate-800">{v.activeCases} Citizens</td>
                  <td className="p-3.5 text-slate-600">{v.cleanWaterAccessPercentage}% Coverage</td>
                  <td className="p-3.5 text-slate-600 font-semibold text-emerald-700">{v.maternalVaccinationCoverage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disease Distribution Breakdown & Clinical Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Disease Categorization */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
            District Symptom & Disease Distribution
          </h3>
          <p className="text-xs text-slate-500">
            Automated categorizations from AI triage and field health reports
          </p>

          <div className="space-y-3 pt-2">
            {analytics?.diseaseDistribution?.map((d: any, idx: number) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{d.category}</span>
                  <span className="font-mono text-slate-500">{d.count} cases ({d.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-600 h-full rounded-full"
                    style={{ width: `${d.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Referral Volume Trends */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
            Monthly Referral Escalations
          </h3>
          <p className="text-xs text-slate-500">
            Trends of routine vs urgent vs critical emergency referrals
          </p>

          <div className="space-y-3 pt-2 text-xs">
            {analytics?.referralTrends?.map((trend: any, idx: number) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-800 text-sm">{trend.month}</span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-600">Routine: <strong className="text-slate-900">{trend.routine}</strong></span>
                  <span className="text-amber-700">Urgent: <strong>{trend.urgent}</strong></span>
                  <span className="text-rose-700 font-bold">Emergency: {trend.emergency}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
