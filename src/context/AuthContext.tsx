/**
 * Global Authentication Context for AikyaCare
 * 
 * Provides:
 * - Persistent authentication state & session restoration via JWT
 * - Role-based permissions and access checks
 * - Login, Patient Register, and Logout actions
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole } from '../types';
import { apiClient, setAuthToken } from '../services/apiClient';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  patientId?: string;
  doctorId?: string;
  workerId?: string;
  ambulanceId?: string;
  hospitalId?: string;
  specialization?: string;
  villageName?: string;
  district?: string;
  vehicleNumber?: string;
  hospitalName?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  currentRole: UserRole | 'LANDING';
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { identifier?: string; phone?: string; email?: string; password?: string; role?: string }) => Promise<{ success: boolean; error?: string; user?: UserProfile }>;
  register: (data: any) => Promise<{ success: boolean; error?: string; user?: UserProfile }>;
  logout: () => void;
  setCurrentRole: (role: UserRole | 'LANDING') => void;
  canAccessRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const normalizeRole = (role?: string): UserRole => {
  if (!role) return 'PATIENT';
  const upper = role.toUpperCase().trim();
  if (upper === 'ASHA' || upper === 'HEALTH_WORKER') return 'HEALTH_WORKER';
  if (upper === 'AMBULANCE' || upper === 'AMBULANCE_PARAMEDIC') return 'AMBULANCE_PARAMEDIC';
  if (upper === 'HOSPITAL' || upper === 'HOSPITAL_STAFF') return 'HOSPITAL_STAFF';
  if (upper === 'DOCTOR') return 'DOCTOR';
  if (upper === 'ADMIN') return 'ADMIN';
  return 'PATIENT';
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [currentRole, setCurrentRoleState] = useState<UserRole | 'LANDING'>('LANDING');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore authenticated session on initial mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem('aikyacare_token');
        if (savedToken) {
          setAuthToken(savedToken);
          setTokenState(savedToken);
          const res = await apiClient.getMe();
          if (res.success && res.user) {
            const normalized = {
              ...res.user,
              role: normalizeRole(res.user.role)
            };
            setUser(normalized);
            // If user previously had an active dashboard, restore to their role dashboard
            const lastRole = localStorage.getItem('aikyacare_last_role');
            if (lastRole && lastRole !== 'LANDING' && normalizeRole(lastRole) === normalized.role) {
              setCurrentRoleState(normalized.role);
            } else {
              setCurrentRoleState(normalized.role);
            }
          } else {
            // Token invalid or expired
            setAuthToken(null);
            setTokenState(null);
            setUser(null);
          }
        }
      } catch (err) {
        console.warn('Session restoration failed:', err);
        setAuthToken(null);
        setTokenState(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: { identifier?: string; phone?: string; email?: string; password?: string; role?: string }) => {
    setIsLoading(true);
    try {
      const res = await apiClient.login(credentials);
      if (res.success && res.token && res.user) {
        const normalizedRole = normalizeRole(res.user.role);
        const userProfile: UserProfile = {
          ...res.user,
          role: normalizedRole
        };
        setAuthToken(res.token);
        setTokenState(res.token);
        setUser(userProfile);
        setCurrentRoleState(normalizedRole);
        localStorage.setItem('aikyacare_last_role', normalizedRole);
        return { success: true, user: userProfile };
      }
      return { success: false, error: res.error || 'Authentication failed.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Unable to connect to server.' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await apiClient.registerPatient(data);
      if (res.success && res.token && res.user) {
        const normalizedRole = normalizeRole(res.user.role);
        const userProfile: UserProfile = {
          ...res.user,
          role: normalizedRole
        };
        setAuthToken(res.token);
        setTokenState(res.token);
        setUser(userProfile);
        setCurrentRoleState(normalizedRole);
        localStorage.setItem('aikyacare_last_role', normalizedRole);
        return { success: true, user: userProfile };
      }
      return { success: false, error: res.error || 'Registration failed.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Unable to register account.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAuthToken(null);
    setTokenState(null);
    setUser(null);
    setCurrentRoleState('LANDING');
    localStorage.removeItem('aikyacare_last_role');
  };

  const canAccessRole = (targetRole: UserRole): boolean => {
    if (!user) return false;
    // Admins have supervisory oversight
    if (user.role === 'ADMIN') return true;
    return user.role === targetRole;
  };

  const setCurrentRole = (role: UserRole | 'LANDING') => {
    if (role === 'LANDING') {
      setCurrentRoleState('LANDING');
      localStorage.setItem('aikyacare_last_role', 'LANDING');
      return;
    }

    // Role-based protection: if authenticated, verify authorization
    if (user && !canAccessRole(role)) {
      console.warn(`[RBAC] Access denied: User with role '${user.role}' cannot navigate to '${role}'.`);
      return;
    }

    setCurrentRoleState(role);
    localStorage.setItem('aikyacare_last_role', role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        currentRole,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        setCurrentRole,
        canAccessRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
