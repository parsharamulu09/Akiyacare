import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { EmergencyModal } from './components/common/EmergencyModal';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { LandingPage } from './components/landing/LandingPage';
import { PatientDashboard } from './components/patient/PatientDashboard';
import { ReportSummarizerModal } from './components/patient/ReportSummarizerModal';
import { AshaPortal } from './components/healthworker/AshaPortal';
import { DoctorDashboard } from './components/doctor/DoctorDashboard';
import { AmbulanceDashboard } from './components/ambulance/AmbulanceDashboard';
import { HospitalDashboard } from './components/hospital/HospitalDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthModal } from './components/auth/AuthModal';
import { teluguTranslations } from './utils/teluguTranslations';
import { offlineSyncEngine, ConnectivityState } from './services/offlineSync';
import { apiClient } from './services/apiClient';
import { UserRole, NotificationItem } from './types';
import { ShieldCheck, HeartPulse, ShieldAlert, X } from 'lucide-react';

function AikyaCareMain() {
  const { user, isAuthenticated, currentRole, setCurrentRole, canAccessRole } = useAuth();

  const [language, setLanguage] = useState<'en' | 'te'>('en');
  const [connectivity, setConnectivity] = useState<ConnectivityState>(offlineSyncEngine.getStatus());
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(offlineSyncEngine.getPendingQueue().length);
  
  // Modals state
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Authentication Modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalRole, setAuthModalRole] = useState<UserRole>('PATIENT');
  const [authModalMode, setAuthModalMode] = useState<'SIGN_IN' | 'SIGN_UP'>('SIGN_IN');
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);
  
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

  const handleOpenAuth = (role?: UserRole, mode?: 'SIGN_IN' | 'SIGN_UP') => {
    if (role) setAuthModalRole(role);
    if (mode) setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleSelectRole = (targetRole: UserRole | 'LANDING') => {
    setAccessDeniedMessage(null);

    if (targetRole === 'LANDING') {
      setCurrentRole('LANDING');
      return;
    }

    if (!isAuthenticated) {
      // Prompt sign in for the requested dashboard
      setAuthModalRole(targetRole);
      setAuthModalMode('SIGN_IN');
      setIsAuthModalOpen(true);
      return;
    }

    if (canAccessRole(targetRole)) {
      setCurrentRole(targetRole);
    } else {
      setAccessDeniedMessage(
        `Access Denied: Your current account role '${user?.role}' does not have permission to access the '${targetRole}' dashboard. Each stakeholder role maintains strictly separated privileges.`
      );
    }
  };

  // Guided Interactive Demos
  const handleLaunchScenario1 = () => {
    setSosSymptoms('Severe crushing chest pain radiating to left arm, heavy sweating, dyspnea');
    setSosDangerSigns(['Severe Chest Pain', 'Acute Dyspnea']);
    setIsSosOpen(true);
  };

  const handleLaunchScenario2 = () => {
    offlineSyncEngine.toggleOfflineSimulation(true);
    if (isAuthenticated && user?.role === 'HEALTH_WORKER') {
      setCurrentRole('HEALTH_WORKER');
    } else {
      handleOpenAuth('HEALTH_WORKER', 'SIGN_IN');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      
      {/* Universal Top Navigation */}
      <Navbar
        currentRole={currentRole}
        onSelectRole={handleSelectRole}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        t={t}
        connectivity={connectivity}
        pendingSyncCount={pendingSyncCount}
        onToggleSimulateOffline={handleToggleSimulateOffline}
        onOpenSos={() => handleOpenSos()}
        onOpenNotifications={() => setIsNotifDrawerOpen(true)}
        unreadCount={unreadCount}
        onOpenAuth={handleOpenAuth}
      />

      {/* Role-Based Access Restriction Warning Banner */}
      {accessDeniedMessage && (
        <div className="bg-rose-600 text-white px-4 py-3 text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2 max-w-5xl mx-auto">
            <ShieldAlert className="w-4 h-4 shrink-0 text-white" />
            <span>{accessDeniedMessage}</span>
          </div>
          <button
            onClick={() => setAccessDeniedMessage(null)}
            className="p-1 hover:bg-rose-700 rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Role Content View */}
      <main className="flex-1">
        {currentRole === 'LANDING' && (
          <LandingPage
            onSelectRole={handleSelectRole}
            onOpenSos={() => handleOpenSos()}
            onLaunchDemoScenario1={handleLaunchScenario1}
            onLaunchDemoScenario2={handleLaunchScenario2}
            t={t}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentRole === 'PATIENT' && (
          <PatientDashboard
            onOpenSos={() => handleOpenSos()}
            onOpenReportSummarizer={() => setIsReportModalOpen(true)}
            t={t}
          />
        )}

        {currentRole === 'HEALTH_WORKER' && (
          <AshaPortal
            t={t}
            language={language}
            onOpenSos={(symptoms, dangerSigns) => handleOpenSos(symptoms, dangerSigns)}
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

      {/* Role-Based Authentication & Registration Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialRole={authModalRole}
        initialMode={authModalMode}
        onSuccessRedirect={(role) => {
          setCurrentRole(role);
        }}
      />

      {/* Emergency SOS Modal */}
      <EmergencyModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        onViewAmbulanceDashboard={() => {
          setIsSosOpen(false);
          if (isAuthenticated && canAccessRole('AMBULANCE_PARAMEDIC')) {
            setCurrentRole('AMBULANCE_PARAMEDIC');
          } else {
            handleOpenAuth('AMBULANCE_PARAMEDIC', 'SIGN_IN');
          }
        }}
        defaultSymptoms={sosSymptoms}
        defaultDangerSigns={sosDangerSigns}
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
            <span>Role-Based Secure Multi-Portal</span>
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

class ErrorBoundary extends (React.Component as any) {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('AikyaCare Uncaught UI Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-lg text-center space-y-4">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Dashboard View Recovered</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              An unexpected display issue occurred in this panel. All your clinical and offline survey data remains safely preserved.
            </p>
            {this.state.error?.message && (
              <div className="p-3 bg-slate-100 rounded-xl text-left text-[11px] text-slate-700 font-mono overflow-auto max-h-24">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
            >
              Refresh & Reload Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AikyaCareMain />
      </AuthProvider>
    </ErrorBoundary>
  );
}
