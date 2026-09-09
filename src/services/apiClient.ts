/**
 * Typed Frontend API Client for AikyaCare
 * 
 * Includes:
 * - Persistent JWT authorization header management
 * - Public & authenticated API routes
 * - Backward compatibility with all existing mock/live endpoints
 */

import {
  TriageInput,
  TriageResult,
  EmergencyRequest,
  Appointment,
  Prescription,
  MedicalRecord,
  Hospital,
  Ambulance,
  HouseholdSurvey,
  Referral,
  NotificationItem,
  VillageHealthIndex,
  Patient
} from '../types';

let authToken = typeof window !== 'undefined' ? (localStorage.getItem('aikyacare_token') || '') : '';

export const setAuthToken = (token: string | null) => {
  authToken = token || '';
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('aikyacare_token', token);
    } else {
      localStorage.removeItem('aikyacare_token');
    }
  }
};

export const getAuthToken = (): string => authToken;

async function apiFetch<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(url, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => ({ success: false, error: 'Failed to parse JSON response' }));
  if (!res.ok && !data.error) {
    data.error = `HTTP Error ${res.status}: ${res.statusText}`;
  }
  return data as T;
}

export const apiClient = {
  // ==================== AUTHENTICATION ====================
  login: async (credentials: { identifier?: string; phone?: string; email?: string; password?: string; role?: string }) => {
    return apiFetch<{ success: boolean; token?: string; user?: any; error?: string; message?: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  registerPatient: async (data: any) => {
    return apiFetch<{ success: boolean; token?: string; user?: any; patient?: Patient; error?: string; message?: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  getMe: async () => {
    return apiFetch<{ success: boolean; user?: any; error?: string }>('/api/auth/me');
  },

  forgotPassword: async (identifier: string, role?: string) => {
    return apiFetch<{ success: boolean; message: string; error?: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identifier, role })
    });
  },

  // ==================== PATIENTS ====================
  getPatients: async (): Promise<{ success: boolean; patients: Patient[]; error?: string }> => {
    return apiFetch('/api/patients');
  },

  getPatient: async (id: string): Promise<{ success: boolean; patient: Patient; error?: string }> => {
    return apiFetch(`/api/patients/${id}`);
  },

  getPatientMe: async (): Promise<{ success: boolean; patient: Patient; user?: any; error?: string }> => {
    return apiFetch('/api/patients/me');
  },

  // ==================== TRIAGE & AI ====================
  runTriage: async (input: TriageInput): Promise<{ success: boolean; result: TriageResult; error?: string }> => {
    return apiFetch('/api/triage', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },

  summarizeReport: async (data: { rawText: string; recordType?: string; patientId?: string; title?: string }): Promise<{ success: boolean; record: MedicalRecord; error?: string }> => {
    return apiFetch('/api/ai/report-summary', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  askAssistant: async (message: string, context?: string): Promise<{ success: boolean; reply: string; suggestedQuestions: string[]; error?: string }> => {
    return apiFetch('/api/ai/health-assistant', {
      method: 'POST',
      body: JSON.stringify({ message, context })
    });
  },

  // ==================== EMERGENCY SOS & AMBULANCE ====================
  triggerEmergencySos: async (data: Partial<EmergencyRequest>): Promise<{ success: boolean; emergency: EmergencyRequest; error?: string }> => {
    return apiFetch('/api/emergency/sos', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  getEmergencies: async (): Promise<{ success: boolean; emergencies: EmergencyRequest[]; error?: string }> => {
    return apiFetch('/api/emergency/requests');
  },

  updateEmergencyStatus: async (id: string, status: string, notes?: string): Promise<{ success: boolean; emergency: EmergencyRequest; error?: string }> => {
    return apiFetch(`/api/emergency/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes })
    });
  },

  getAmbulances: async (): Promise<{ success: boolean; emergencies: EmergencyRequest[]; ambulances: Ambulance[]; error?: string }> => {
    return apiFetch('/api/ambulance/requests');
  },

  updateAmbulanceStatus: async (id: string, status: string, notes?: string): Promise<{ success: boolean; emergency: EmergencyRequest; error?: string }> => {
    return apiFetch(`/api/ambulance/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes })
    });
  },

  // ==================== APPOINTMENTS & TELEMEDICINE ====================
  getAppointments: async (params?: { patientId?: string; doctorId?: string }): Promise<{ success: boolean; appointments: Appointment[]; doctors: any[]; error?: string }> => {
    const query = new URLSearchParams(params as any).toString();
    return apiFetch(`/api/appointments?${query}`);
  },

  bookAppointment: async (data: Partial<Appointment>): Promise<{ success: boolean; appointment: Appointment; error?: string }> => {
    return apiFetch('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateAppointment: async (id: string, data: Partial<Appointment>): Promise<{ success: boolean; appointment: Appointment; error?: string }> => {
    return apiFetch(`/api/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // ==================== PRESCRIPTIONS ====================
  getPrescriptions: async (patientId: string): Promise<{ success: boolean; prescriptions: Prescription[]; error?: string }> => {
    return apiFetch(`/api/prescriptions/${patientId}`);
  },

  createPrescription: async (data: any): Promise<{ success: boolean; prescription: Prescription; error?: string }> => {
    return apiFetch('/api/prescriptions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // ==================== HEALTH WORKER & OFFLINE SYNC ====================
  syncOfflineQueue: async (items: any[]): Promise<{ success: boolean; syncedCount: number; message: string; error?: string }> => {
    return apiFetch('/api/health-worker/sync', {
      method: 'POST',
      body: JSON.stringify({ items })
    });
  },

  getHealthWorkerTriage: async (): Promise<{ success: boolean; triageRecords: any[]; villages: VillageHealthIndex[]; error?: string }> => {
    return apiFetch('/api/health-worker/triage');
  },

  getHouseholdSurveys: async (): Promise<{ success: boolean; surveys: HouseholdSurvey[]; error?: string }> => {
    return apiFetch('/api/health-worker/surveys');
  },

  createHouseholdSurvey: async (data: Partial<HouseholdSurvey>): Promise<{ success: boolean; survey: HouseholdSurvey; error?: string }> => {
    return apiFetch('/api/health-worker/surveys', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // ==================== HOSPITALS & BEDS ====================
  getHospitals: async (): Promise<{ success: boolean; hospitals: Hospital[]; error?: string }> => {
    return apiFetch('/api/hospitals');
  },

  updateHospitalBeds: async (id: string, beds: Partial<Hospital>): Promise<{ success: boolean; hospital: Hospital; error?: string }> => {
    return apiFetch(`/api/hospitals/${id}/beds`, {
      method: 'PUT',
      body: JSON.stringify(beds)
    });
  },

  // ==================== REFERRALS ====================
  getReferrals: async (): Promise<{ success: boolean; referrals: Referral[]; error?: string }> => {
    return apiFetch('/api/referrals');
  },

  updateReferralStatus: async (id: string, status: string, notes?: string): Promise<{ success: boolean; referral: Referral; error?: string }> => {
    return apiFetch(`/api/referrals/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, supervisorNotes: notes })
    });
  },

  // ==================== ADMIN ANALYTICS ====================
  getAdminAnalytics: async (): Promise<{ success: boolean; summary: any; villages: VillageHealthIndex[]; diseaseDistribution: any[]; referralTrends: any[]; error?: string }> => {
    return apiFetch('/api/admin/analytics');
  },

  // ==================== NOTIFICATIONS ====================
  getNotifications: async (): Promise<{ success: boolean; notifications: NotificationItem[]; error?: string }> => {
    return apiFetch('/api/notifications');
  }
};
