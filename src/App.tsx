import React, { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar';
import { EmergencyModal } from './components/common/EmergencyModal';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { LandingPage } from './components/landing/LandingPage';
import { PatientDashboard } from './components/patient/PatientDashboard';
import { TriageModal } from './components/patient/TriageModal';
import { ReportSummarizerModal } from './components/patient/ReportSummarizerModal';
import { AshaPortal } from './components/healthworker/AshaPortal';
import { DoctorDashboard } from './components/doctor/DoctorDashboard';
import { AmbulanceDashboard } from './components/ambulance/AmbulanceDashboard';
import { HospitalDashboard } from './components/hospital/HospitalDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { teluguTranslations } from './utils/teluguTranslations';
import { offlineSyncEngine, ConnectivityState } from './services/offlineSync';
import { apiClient } from './services/apiClient';
import { UserRole, NotificationItem } from './types';
import { ShieldCheck, HeartPulse, Sparkles } from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole | 'LANDING'>('LANDING');
  const [language, setLanguage] = useState<'en' | 'te'>('en');
  const [connectivity, setConnectivity] = useState<ConnectivityState>(offlineSyncEngine.getStatus());
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(offlineSyncEngine.getPendingQueue().length);
  
  // Modals state
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isTriageOpen, setIsTriageOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  
  // Emergency parameters passed from triage if triggered
  const [sosSymptoms, setSosSymptoms] = useState<string | undefined>(undefined);
  const [sosDangerSigns, setSosDangerSigns] = useState<string[] | undefined>(undefined);

  const t = teluguTranslations[language];

  useEffect(() => {
    const unsub = offlineSyncEngine.subscribe((status, count) => {
      setConnectivity(status);
      setPendingSyncCount(count);
    });

    loadNotifications();
    const timer = setInterval(loadNotifications, 10000);

    return () => {
      unsub();
      clearInterval(timer);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await apiClient.getNotifications();
      if (res.success) {
        setNotifications(res.notifications);
      }
    } catch {
      // Offline fallback
    }
  };

  const handleToggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'te' : 'en'));
  };

  const handleToggleSimulateOffline = () => {
    offlineSyncEngine.toggleOfflineSimulation();
  };

  const handleOpenSos = (symptoms?: string, dangerSigns?: string[]) => {
    if (symptoms) setSosSymptoms(symptoms);
    if (dangerSigns) setSosDangerSigns(dangerSigns);
    setIsSosOpen(true);
  };

  // Guided Interactive Demos
  const handleLaunchScenario1 = () => {
    // Scenario 1: Critical Chest Pain -> Red SOS -> Ambulance Dispatch
    setSosSymptoms('Severe crushing chest pain radiating to left arm, heavy sweating, dyspnea');
    setSosDangerSigns(['Severe Chest Pain', 'Acute Dyspnea']);
    setIsSosOpen(true);
  };

  const handleLaunchScenario2 = () => {
    // Scenario 2: ASHA Offline in remote village -> Local Triage -> Sync Queue
    offlineSyncEngine.toggleOfflineSimulation(true); // Force offline
    setCurrentRole('HEALTH_WORKER');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      
      {/* Universal Top Navigation */}
      <Navbar
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        t={t}
        connectivity={connectivity}
        pendingSyncCount={pendingSyncCount}
        onToggleSimulateOffline={handleToggleSimulateOffline}
        onOpenSos={() => handleOpenSos()}
        onOpenNotifications={() => setIsNotifDrawerOpen(true)}
        unreadCount={unreadCount}
      />

      {/* Main Role Content View */}
      <main className="flex-1">
        {currentRole === 'LANDING' && (
          <LandingPage
            onSelectRole={setCurrentRole}
            onOpenSos={() => handleOpenSos()}
            onLaunchDemoScenario1={handleLaunchScenario1}
            onLaunchDemoScenario2={handleLaunchScenario2}
            t={t}
          />
        )}

        {currentRole === 'PATIENT' && (
          <PatientDashboard
            onOpenTriage={() => setIsTriageOpen(true)}
            onOpenSos={() => handleOpenSos()}
            onOpenReportSummarizer={() => setIsReportModalOpen(true)}
            t={t}
          />
        )}

        {currentRole === 'HEALTH_WORKER' && (
          <AshaPortal
            t={t}
            language={language}
            onOpenSos={() => handleOpenSos()}
          />
        )}

        {currentRole === 'DOCTOR' && (
          <DoctorDashboard t={t} />
        )}

        {currentRole === 'AMBULANCE_PARAMEDIC' && (
          <AmbulanceDashboard t={t} />
        )}

        {currentRole === 'HOSPITAL_STAFF' && (
          <HospitalDashboard t={t} />
        )}

        {currentRole === 'ADMIN' && (
          <AdminDashboard t={t} />
        )}
      </main>

      {/* Emergency SOS Modal */}
      <EmergencyModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        onViewAmbulanceDashboard={() => {
          setIsSosOpen(false);
          setCurrentRole('AMBULANCE_PARAMEDIC');
        }}
        defaultSymptoms={sosSymptoms}
        defaultDangerSigns={sosDangerSigns}
      />

      {/* AI Triage Modal */}
      <TriageModal
        isOpen={isTriageOpen}
        onClose={() => setIsTriageOpen(false)}
        onOpenSos={(symp, danger) => handleOpenSos(symp, danger)}
        onBookAppointment={(specialist) => {
          setCurrentRole('PATIENT');
        }}
        t={t}
        language={language}
      />

      {/* Report Summarizer Modal */}
      <ReportSummarizerModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onRecordCreated={() => {
          // Handled
        }}
      />

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
        notifications={notifications}
        onMarkAllRead={() => {
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        }}
      />

      {/* Universal Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-teal-600 flex items-center justify-center text-white">
              <HeartPulse className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-slate-900">AikyaCare</span>
            <span>• Rural AI Health Triage & Coordination Platform</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Layered Clinical Safety Override</span>
            </span>
            <span>•</span>
            <span>English & Telugu (తెలుగు)</span>
            <span>•</span>
            <span className="font-bold text-teal-700">Hackathon PS4 Edition</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
