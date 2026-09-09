import React, { useState } from 'react';
import {
  User,
  Users,
  Stethoscope,
  Truck,
  Building2,
  BarChart3,
  X,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import { UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/apiClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: UserRole;
  initialMode?: 'SIGN_IN' | 'SIGN_UP';
  onSuccessRedirect?: (role: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'PATIENT',
  initialMode = 'SIGN_IN',
  onSuccessRedirect
}) => {
  const { login, register, isLoading } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [authMode, setAuthMode] = useState<'SIGN_IN' | 'SIGN_UP'>(
    initialRole === 'PATIENT' ? initialMode : 'SIGN_IN'
  );

  // Form Fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Patient Registration specific fields
  const [fullName, setFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [age, setAge] = useState<number | ''>(32);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [village, setVillage] = useState('Kothur Gramam');
  const [district, setDistrict] = useState('Warangal Rural');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [allergies, setAllergies] = useState('None known');
  const [conditions, setConditions] = useState('None');

  // Status & Feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');

  if (!isOpen) return null;

  const roleConfigs: Record<
    UserRole,
    {
      label: string;
      subtext: string;
      icon: React.ReactNode;
      color: string;
      identifierLabel: string;
      identifierPlaceholder: string;
      allowPublicSignup: boolean;
      demoUser: { id: string; pass: string; note: string };
    }
  > = {
    PATIENT: {
      label: 'Patient',
      subtext: 'Rural citizen, family member, or care seeker',
      icon: <User className="w-5 h-5" />,
      color: 'teal',
      identifierLabel: 'Email or Mobile Number',
      identifierPlaceholder: 'e.g. +91 94401 56789 or patient@aikyacare.demo',
      allowPublicSignup: true,
      demoUser: { id: 'patient@aikyacare.demo', pass: 'Password@123', note: 'Ravi Kumar (+91 94401 56789)' }
    },
    HEALTH_WORKER: {
      label: 'ASHA Worker',
      subtext: 'Accredited Social Health Activist & rural triage worker',
      icon: <Users className="w-5 h-5" />,
      color: 'emerald',
      identifierLabel: 'Worker ID / Mobile / Email',
      identifierPlaceholder: 'e.g. HW-ASHA-01 or asha@aikyacare.demo',
      allowPublicSignup: false,
      demoUser: { id: 'HW-ASHA-01', pass: 'Password@123', note: 'Padmavati (Kothur Gramam)' }
    },
    DOCTOR: {
      label: 'Doctor',
      subtext: 'Licensed medical officer & telemedicine consultant',
      icon: <Stethoscope className="w-5 h-5" />,
      color: 'blue',
      identifierLabel: 'Doctor ID / Email / Phone',
      identifierPlaceholder: 'e.g. DOC-101 or doctor@aikyacare.demo',
      allowPublicSignup: false,
      demoUser: { id: 'doctor@aikyacare.demo', pass: 'Password@123', note: 'Dr. Ananya Sharma (General Medicine)' }
    },
    AMBULANCE_PARAMEDIC: {
      label: 'Ambulance',
      subtext: 'Emergency 108/104 vehicle driver & paramedic',
      icon: <Truck className="w-5 h-5" />,
      color: 'rose',
      identifierLabel: 'Ambulance ID / Vehicle No. / Phone',
      identifierPlaceholder: 'e.g. AMB-104 or ambulance@aikyacare.demo',
      allowPublicSignup: false,
      demoUser: { id: 'AMB-104', pass: 'Password@123', note: 'Ramesh Goud (ALS Unit AMB-104)' }
    },
    HOSPITAL_STAFF: {
      label: 'Hospital',
      subtext: 'District Hospital / PHC bed & trauma triage desk',
      icon: <Building2 className="w-5 h-5" />,
      color: 'purple',
      identifierLabel: 'Hospital ID / Desk Email / Phone',
      identifierPlaceholder: 'e.g. HOSP-01 or hospital@aikyacare.demo',
      allowPublicSignup: false,
      demoUser: { id: 'hospital@aikyacare.demo', pass: 'Password@123', note: 'District Care Hospital Triage' }
    },
    ADMIN: {
      label: 'Admin',
      subtext: 'Chief District Medical Officer & health command',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'amber',
      identifierLabel: 'District Officer Email',
      identifierPlaceholder: 'e.g. admin@aikyacare.demo',
      allowPublicSignup: false,
      demoUser: { id: 'admin@aikyacare.demo', pass: 'Password@123', note: 'Chief District Medical Officer' }
    }
  };

  const currentConfig = roleConfigs[selectedRole];

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg(null);
    setInfoMsg(null);
    if (!roleConfigs[role].allowPublicSignup) {
      setAuthMode('SIGN_IN');
    }
  };

  const handleApplyDemoCredentials = (role: UserRole) => {
    setSelectedRole(role);
    setAuthMode('SIGN_IN');
    setIdentifier(roleConfigs[role].demoUser.id);
    setPassword(roleConfigs[role].demoUser.pass);
    setErrorMsg(null);
    setInfoMsg(`Filled verified demo credentials for ${roleConfigs[role].label}. Click "Sign In" to proceed.`);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!identifier.trim()) {
      setErrorMsg(`Please enter your ${currentConfig.identifierLabel.toLowerCase()}.`);
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    const res = await login({
      identifier: identifier.trim(),
      password,
      role: selectedRole
    });

    if (res.success && res.user) {
      onClose();
      if (onSuccessRedirect) {
        onSuccessRedirect(res.user.role);
      }
    } else {
      setErrorMsg(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handlePatientSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!fullName.trim()) return setErrorMsg('Full Name is required.');
    if (!regPhone.trim()) return setErrorMsg('Phone Number is required.');
    if (!regPassword || regPassword.length < 6) return setErrorMsg('Password must be at least 6 characters.');
    if (regPassword !== regConfirmPassword) return setErrorMsg('Passwords do not match.');
    if (!age || Number(age) <= 0) return setErrorMsg('A valid age is required.');
    if (!village.trim()) return setErrorMsg('Village name is required.');
    if (!district.trim()) return setErrorMsg('District name is required.');

    const res = await register({
      name: fullName.trim(),
      phone: regPhone.trim(),
      email: regEmail.trim() || undefined,
      password: regPassword,
      confirmPassword: regConfirmPassword,
      role: 'PATIENT',
      age: Number(age),
      gender,
      village: village.trim(),
      district: district.trim(),
      bloodGroup,
      allergies,
      chronicConditions: conditions
    });

    if (res.success && res.user) {
      onClose();
      if (onSuccessRedirect) {
        onSuccessRedirect('PATIENT');
      }
    } else {
      setErrorMsg(res.error || 'Registration failed. Please try again.');
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) return;
    try {
      const res = await apiClient.forgotPassword(forgotIdentifier.trim(), selectedRole);
      setInfoMsg(res.message);
      setIsForgotPasswordOpen(false);
    } catch {
      setErrorMsg('Unable to request password reset. Contact health desk.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden relative my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-950 to-slate-950 text-white p-6 sm:p-7 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>AikyaCare Secure Unified Access</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {authMode === 'SIGN_IN' ? 'Welcome to AikyaCare' : 'Create Patient Account'}
          </h2>
          <p className="text-xs sm:text-sm text-teal-100/80 mt-1 max-w-lg">
            AI-assisted rural triage, emergency telemetry, and clinical care coordination network.
          </p>
        </div>

        {/* Role Selection Bar */}
        <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Your Stakeholder Role
            </span>
            <span className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
              Active: {currentConfig.label}
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {(Object.keys(roleConfigs) as UserRole[]).map((role) => {
              const cfg = roleConfigs[role];
              const isSelected = selectedRole === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleSelect(role)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white text-teal-800 border-teal-600 shadow-md ring-2 ring-teal-500/20 scale-102'
                      : 'bg-white/60 text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg mb-1 ${isSelected ? 'bg-teal-50 text-teal-700' : 'text-slate-400'}`}>
                    {cfg.icon}
                  </div>
                  <span className="text-[11px] leading-tight text-center truncate w-full">
                    {cfg.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notification / Feedback Alerts */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        {infoMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* Body Form Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">

          {/* Mode Switcher for Patient Role */}
          {selectedRole === 'PATIENT' && (
            <div className="flex rounded-xl bg-slate-100 p-1 mb-6 border border-slate-200 max-w-sm mx-auto">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('SIGN_IN');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  authMode === 'SIGN_IN'
                    ? 'bg-white text-teal-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('SIGN_UP');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  authMode === 'SIGN_UP'
                    ? 'bg-white text-teal-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Notice for Controlled Roles */}
          {!currentConfig.allowPublicSignup && (
            <div className="p-3 bg-teal-50/60 border border-teal-200/60 rounded-xl text-xs text-slate-600 mb-5 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
              <span>
                <strong>Controlled Access:</strong> {currentConfig.label} credentials are institutional and verified. Use your government/hospital assigned ID or click a demo account below.
              </span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {authMode === 'SIGN_IN' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {currentConfig.identifierLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    {selectedRole === 'PATIENT' || selectedRole === 'DOCTOR' ? (
                      <Phone className="w-4 h-4" />
                    ) : (
                      <KeyRound className="w-4 h-4" />
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={currentConfig.identifierPlaceholder}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(true)}
                    className="text-[11px] font-semibold text-teal-700 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 hover:scale-101"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to {currentConfig.label} Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* PATIENT SIGN UP FORM */}
          {authMode === 'SIGN_UP' && selectedRole === 'PATIENT' && (
            <form onSubmit={handlePatientSignUp} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Venkatesh Rao"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="e.g. patient@gmail.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Age <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Gender <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={gender}
                    onChange={(e: any) => setGender(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Village / Gramam <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="e.g. Kothur Gramam"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    District <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Warangal Rural"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Known Allergies
                  </label>
                  <input
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="e.g. Penicillin, Sulfa, Dust"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Existing Medical Conditions
                  </label>
                  <input
                    type="text"
                    value={conditions}
                    onChange={(e) => setConditions(e.target.value)}
                    placeholder="e.g. Diabetes, Hypertension"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 hover:scale-101"
              >
                {isLoading ? (
                  <span>Registering Account...</span>
                ) : (
                  <>
                    <span>Create Account & Go to Patient Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo Credentials Panel for Hackathon Testing */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>One-Click Demo Credentials (Evaluation Mode)</span>
              </span>
              <span className="text-[10px] text-slate-400">Password: Password@123</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(roleConfigs) as UserRole[]).map((r) => {
                const cfg = roleConfigs[r];
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleApplyDemoCredentials(r)}
                    className="p-2 text-left bg-slate-100 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-xl transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 group-hover:text-teal-800">
                      <span>{cfg.label}</span>
                      <span className="text-[9px] bg-slate-200 group-hover:bg-teal-200 px-1 py-0.5 rounded text-slate-600 group-hover:text-teal-800 font-mono">Fill</span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {cfg.demoUser.note}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Forgot Password Modal Overlay */}
        {isForgotPasswordOpen && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-md p-6 flex flex-col justify-center items-center z-20 animate-in fade-in">
            <div className="max-w-md w-full p-6 bg-slate-50 rounded-2xl border border-slate-200 shadow-md">
              <h3 className="text-lg font-black text-slate-900 mb-1">
                Password Recovery for {currentConfig.label}
              </h3>
              <p className="text-xs text-slate-600 mb-4">
                Enter your registered Email or Mobile Number. For emergency health networks, reset tokens are validated by the Primary Health Centre Desk.
              </p>
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                <input
                  type="text"
                  required
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  placeholder="Enter email or mobile number"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(false)}
                    className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Send Recovery Code
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
