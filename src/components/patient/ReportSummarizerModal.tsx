import React, { useState } from 'react';
import { X, FileText, Sparkles, AlertCircle, CheckCircle2, UploadCloud, HelpCircle } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { MedicalRecord } from '../../types';

interface ReportSummarizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordCreated: (record: MedicalRecord) => void;
  patientId?: string;
}

export const ReportSummarizerModal: React.FC<ReportSummarizerModalProps> = ({
  isOpen,
  onClose,
  onRecordCreated,
  patientId = 'pat-1'
}) => {
  const [reportTitle, setReportTitle] = useState('Diagnostic Blood Profile');
  const [recordType, setRecordType] = useState('LAB_REPORT');
  const [rawText, setRawText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [summaryResult, setSummaryResult] = useState<MedicalRecord | null>(null);

  if (!isOpen) return null;

  const sampleReports = [
    {
      title: 'Complete Hemogram & Platelet Count',
      text: `PATIENT REPORT: Ravi Kumar, Age 48, Male
TEST: Complete Blood Count (CBC)
Hemoglobin: 10.2 g/dL (Reference: 13.0 - 17.0 g/dL) [LOW - Mild Microcytic Anemia]
RBC Count: 3.8 mil/uL (Reference: 4.5 - 5.5) [LOW]
WBC (Total Leucocyte Count): 13,800 /uL (Reference: 4,000 - 11,000 /uL) [HIGH - Leucocytosis indicating possible infection]
Platelet Count: 98,000 /uL (Reference: 150,000 - 450,000 /uL) [THROMBOCYTOPENIA - Below normal range, risk of dengue or viral etiology]
Erythrocyte Sedimentation Rate (ESR): 34 mm/hr (Reference: 0 - 15) [ELEVATED]
CLINICAL IMPRESSION: Thrombocytopenia with leucocytosis and mild anemia. Recommend immediate clinical correlation and peripheral smear examination.`
    },
    {
      title: 'Diabetic & Lipid Panel',
      text: `PATIENT REPORT: Ravi Kumar, Age 48
Fasting Blood Sugar (FBS): 168 mg/dL (Normal: 70-100) [HIGH]
Post Prandial Blood Sugar (PPBS): 245 mg/dL (Normal: < 140) [HIGH]
HbA1c (Glycated Hemoglobin): 8.4% (Normal: < 5.7%, Poor Control > 8.0%) [POOR GLYCEMIC CONTROL]
Total Cholesterol: 238 mg/dL (Desirable: < 200) [ELEVATED]
Serum Triglycerides: 220 mg/dL (Normal: < 150) [HIGH]
Serum Creatinine: 1.1 mg/dL (Normal: 0.7 - 1.3) [NORMAL]
RECOMMENDATION: Dose adjustment of oral hypoglycemics required. Low glycemic diet and active follow-up with Physician.`
    }
  ];

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    setIsLoading(true);
    try {
      const response = await apiClient.summarizeReport({
        rawText,
        recordType,
        patientId,
        title: reportTitle
      });

      if (response.success && response.record) {
        setSummaryResult(response.record);
        onRecordCreated(response.record);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                AI Diagnostic Lab Report Summarizer
              </h3>
              <p className="text-xs text-slate-500">
                Converts complex laboratory text into plain language biomarkers & doctor questions
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

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
          {!summaryResult ? (
            <form onSubmit={handleAnalyze} className="space-y-4">
              
              {/* Sample Report Loader */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Load Realistic Sample Lab Reports (1-Click):
                </label>
                <div className="flex flex-wrap gap-2">
                  {sampleReports.map((sample, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setReportTitle(sample.title);
                        setRawText(sample.text);
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-purple-50 hover:border-purple-300 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 transition-colors cursor-pointer"
                    >
                      {sample.title}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Report Title
                </label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Paste Lab Report Text or Medical Transcription
                </label>
                <textarea
                  rows={8}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste laboratory results, blood test numbers, ultrasound findings, or hospital discharge notes here..."
                  required
                  className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-hidden leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-extrabold text-sm shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {isLoading ? (
                  <span>Extracting Biomarkers with Gemini AI...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Summarize Report & Extract Biomarkers</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Summary Display */
            <div className="space-y-4 animate-in fade-in duration-200">
              
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <span className="text-xs font-bold text-purple-900 uppercase block mb-1">
                  AI Plain Language Summary
                </span>
                <p className="text-xs sm:text-sm text-purple-950 leading-relaxed font-medium">
                  {summaryResult.aiSummary}
                </p>
              </div>

              {/* Biomarkers Table */}
              {summaryResult.biomarkers && summaryResult.biomarkers.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                    Extracted Biomarkers & Reference Ranges
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <tr>
                          <th className="p-2.5">Biomarker</th>
                          <th className="p-2.5">Value</th>
                          <th className="p-2.5">Normal Range</th>
                          <th className="p-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {summaryResult.biomarkers.map((b, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-2.5 font-bold text-slate-800">{b.name}</td>
                            <td className="p-2.5 font-mono text-slate-900">{b.value}</td>
                            <td className="p-2.5 text-slate-500">{b.referenceRange}</td>
                            <td className="p-2.5">
                              <span
                                className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                  b.status === 'HIGH'
                                    ? 'bg-rose-100 text-rose-800'
                                    : b.status === 'LOW'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Questions for Doctor */}
              {summaryResult.questionsForDoctor && summaryResult.questionsForDoctor.length > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase tracking-wide">
                    <HelpCircle className="w-4 h-4 text-blue-700" />
                    <span>Questions You Should Ask Your Doctor</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-xs text-blue-950">
                    {summaryResult.questionsForDoctor.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => setSummaryResult(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Analyze Another Report
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Save & Close
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
