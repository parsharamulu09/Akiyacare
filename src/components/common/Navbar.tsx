import React from 'react';
import {
  HeartPulse,
  AlertTriangle,
  WifiOff,
  RefreshCw,
  Bell,
  Globe,
  User,
  Stethoscope,
  Users,
  Truck,
  Building2,
  BarChart3,
  Home,
  LogOut,
  LogIn,
  UserPlus,
  ShieldCheck
} from 'lucide-react';
import { UserRole } from '../../types';
import { ConnectivityState } from '../../services/offlineSync';
import { TranslationDict } from '../../utils/teluguTranslations';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  currentRole: UserRole | 'LANDING';
  onSelectRole: (role: UserRole | 'LANDING') => void;
  language: 'en' | 'te';
  onToggleLanguage: () => void;
  t: TranslationDict;
  connectivity: ConnectivityState;
  pendingSyncCount: number;
  onToggleSimulateOffline: () => void;
  onOpenSos: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
  onOpenAuth?: (role?: UserRole, mode?: 'SIGN_IN' | 'SIGN_UP') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onSelectRole,
  language,
  onToggleLanguage,
  t,
  connectivity,
  pendingSyncCount,
  onToggleSimulateOffline,
  onOpenSos,
  onOpenNotifications,
  unreadCount,
  onOpenAuth
}) => {
  const { user, isAuthenticated, logout, canAccessRole } = useAuth();

  const roleButtons: Array<{ role: UserRole | 'LANDING'; label: string; icon: React.ReactNode }> = [
    { role: 'LANDING', label: 'Overview', icon: <Home className="w-4 h-4" /> },
    { role: 'PATIENT', label: 'Patient', icon: <User className="w-4 h-4" /> },
    { role: 'HEALTH_WORKER', label: 'ASHA Worker', icon: <Users className="w-4 h-4" /> },
    { role: 'DOCTOR', label: 'Doctor', icon: <Stethoscope className="w-4 h-4" /> },
    { role: 'AMBULANCE_PARAMEDIC', label: 'Ambulance', icon: <Truck className="w-4 h-4" /> },
    { role: 'HOSPITAL_STAFF', label: 'Hospital', icon: <Building2 className="w-4 h-4" /> },
    { role: 'ADMIN', label: 'Admin Command', icon: <BarChart3 className="w-4 h-4" /> }
  ];

  const handleRoleClick = (role: UserRole | 'LANDING') => {
    if (role === 'LANDING') {
      onSelectRole('LANDING');
      return;
    }

    if (!isAuthenticated) {
      if (onOpenAuth) {
        onOpenAuth(role, 'SIGN_IN');
      }
      return;
    }

    if (canAccessRole(role)) {
      onSelectRole(role);
    } else {
      alert(`Access Restricted: You are currently signed in with the '${user?.role}' role. To access the '${role}' dashboard, please sign in with an authorized account.`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner for Connectivity Warning if offline */}
      {connectivity === 'OFFLINE' && (
        <div className="bg-amber-600 text-white text-xs font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          <span>{t.offlineMode}</span>
          {pendingSyncCount > 0 && (
            <span className="bg-amber-800/80 px-2 py-0.5 rounded-full text-[11px]">
              {pendingSyncCount} {t.casesWaitingToSync}
            </span>
          )}
          <button
            onClick={onToggleSimulateOffline}
            className="ml-3 underline hover:text-amber-200 text-[11px] font-medium cursor-pointer"
          >
            Reconnect Network
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Brand */}
          <div
            onClick={() => onSelectRole('LANDING')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-700/20 group-hover:bg-teal-700 transition-colors">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  {language === 'te' ? 'ఐక్యకేర్' : 'AikyaCare'}
                </span>
                <span className="bg-teal-50 text-teal-700 text-[11px] font-bold px-2 py-0.5 rounded-md border border-teal-200">
                  RURAL AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Role Navigation Bar (Desktop) */}
          <nav className="hidden xl:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
            {roleButtons.map((item) => {
              const isActive = currentRole === item.role;
              return (
                <button
                  key={item.role}
                  onClick={() => handleRoleClick(item.role)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-teal-800 shadow-xs border border-slate-200/60 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Utilities & Auth State */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Connectivity Status Indicator */}
            <div
              onClick={onToggleSimulateOffline}
              title="Click to toggle offline simulation for demo testing"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer select-none transition-colors ${
                connectivity === 'ONLINE'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : connectivity === 'SYNCING'
                  ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
              }`}
            >
              {connectivity === 'ONLINE' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="hidden md:inline">Online</span>
                </>
              ) : connectivity === 'SYNCING' ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
                  <span className="hidden md:inline">Syncing...</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-rose-600" />
                  <span className="hidden md:inline">Offline</span>
                </>
              )}
            </div>

            {/* Language Switcher */}
            <button
              onClick={onToggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              title="Switch language: English | తెలుగు"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{language === 'en' ? 'తెలుగు' : 'English'}</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Emergency SOS Button */}
            <button
              onClick={onOpenSos}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs sm:text-sm font-bold shadow-sm shadow-rose-600/30 transition-all cursor-pointer animate-pulse hover:animate-none"
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="font-extrabold tracking-wide">SOS</span>
            </button>

            {/* AUTHENTICATION CONTROLS */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
                {/* User Badge */}
                <div
                  onClick={() => onSelectRole(user.role)}
                  className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-teal-50 border border-teal-200 rounded-xl cursor-pointer hover:bg-teal-100 transition-colors"
                  title={`Signed in as ${user.name} (${user.role})`}
                >
                  <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-teal-950 truncate max-w-[110px] leading-tight">
                      {user.name}
                    </p>
                    <span className="text-[10px] text-teal-700 font-semibold block leading-tight">
                      {user.role.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                  title="Sign Out of AikyaCare"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 pl-1 border-l border-slate-200">
                <button
                  onClick={() => onOpenAuth && onOpenAuth('PATIENT', 'SIGN_IN')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-50 text-teal-700 border border-teal-300 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={() => onOpenAuth && onOpenAuth('PATIENT', 'SIGN_UP')}
                  className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-sm shadow-teal-600/20 transition-all cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </button>
              </div>
            )}

          </div>

        </div>

        {/* Mobile Sub-Navbar with Role Icons */}
        <div className="xl:hidden flex items-center gap-1 py-2 border-t border-slate-100 overflow-x-auto no-scrollbar">
          {roleButtons.map((item) => {
            const isActive = currentRole === item.role;
            return (
              <button
                key={item.role}
                onClick={() => handleRoleClick(item.role)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs whitespace-nowrap font-medium transition-colors ${
                  isActive
                    ? 'bg-teal-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
