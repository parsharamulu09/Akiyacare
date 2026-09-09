/**
 * Typed Frontend API Client for AikyaCare
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

export const apiClient = {
  // Authentication
  login: async (phone: string, role: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, role })
    });
    return res.json();
  },

  // Patients
  getPatients: async (): Promise<{ success: boolean; patients: Patient[] }> => {
    const res = await fetch('/api/patients');
    return res.json();
  },

  getPatient: async (id: string): Promise<{ success: boolean; patient: Patient }> => {
    const res = await fetch(`/api/patients/${id}`);
    return res.json();
  },

  // Triage
  runTriage: async (input: TriageInput): Promise<{ success: boolean; result: TriageResult }> => {
    const res = await fetch('/api/triage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    return res.json();
  },

  // AI Services
  summarizeReport: async (data: { rawText: string; recordType?: string; patientId?: string; title?: string }): Promise<{ success: boolean; record: MedicalRecord }> => {
    const res = await fetch('/api/ai/report-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  askAssistant: async (message: string, context?: string): Promise<{ success: boolean; reply: string; suggestedQuestions: string[] }> => {
    const res = await fetch('/api/ai/health-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context })
    });
    return res.json();
  },

  // Emergency SOS
  triggerEmergencySos: async (data: Partial<EmergencyRequest>): Promise<{ success: boolean; emergency: EmergencyRequest }> => {
    const res = await fetch('/api/emergency/sos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  getEmergencies: async (): Promise<{ success: boolean; emergencies: EmergencyRequest[] }> => {
    const res = await fetch('/api/emergency/requests');
    return res.json();
  },

  updateEmergencyStatus: async (id: string, status: string, notes?: string): Promise<{ success: boolean; emergency: EmergencyRequest }> => {
    const res = await fetch(`/api/emergency/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes })
    });
    return res.json();
  },

  // Ambulance
  getAmbulances: async (): Promise<{ success: boolean; emergencies: EmergencyRequest[]; ambulances: Ambulance[] }> => {
    const res = await fetch('/api/ambulance/requests');
    return res.json();
  },

  // Appointments
  getAppointments: async (params?: { patientId?: string; doctorId?: string }): Promise<{ success: boolean; appointments: Appointment[]; doctors: any[] }> => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`/api/appointments?${query}`);
    return res.json();
  },

  bookAppointment: async (data: Partial<Appointment>): Promise<{ success: boolean; appointment: Appointment }> => {
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  updateAppointment: async (id: string, data: Partial<Appointment>): Promise<{ success: boolean; appointment: Appointment }> => {
    const res = await fetch(`/api/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Prescriptions
  getPrescriptions: async (patientId: string): Promise<{ success: boolean; prescriptions: Prescription[] }> => {
    const res = await fetch(`/api/prescriptions/${patientId}`);
    return res.json();
  },

  createPrescription: async (data: any): Promise<{ success: boolean; prescription: Prescription }> => {
    const res = await fetch('/api/prescriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Health Worker & Sync
  syncOfflineQueue: async (items: any[]): Promise<{ success: boolean; syncedCount: number; message: string }> => {
    const res = await fetch('/api/health-worker/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
    return res.json();
  },

  getHealthWorkerTriage: async () => {
    const res = await fetch('/api/health-worker/triage');
    return res.json();
  },

  getHouseholdSurveys: async (): Promise<{ success: boolean; surveys: HouseholdSurvey[] }> => {
    const res = await fetch('/api/health-worker/surveys');
    return res.json();
  },

  createHouseholdSurvey: async (data: Partial<HouseholdSurvey>): Promise<{ success: boolean; survey: HouseholdSurvey }> => {
    const res = await fetch('/api/health-worker/surveys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Hospitals
  getHospitals: async (): Promise<{ success: boolean; hospitals: Hospital[] }> => {
    const res = await fetch('/api/hospitals');
    return res.json();
  },

  updateHospitalBeds: async (id: string, beds: Partial<Hospital>): Promise<{ success: boolean; hospital: Hospital }> => {
    const res = await fetch(`/api/hospitals/${id}/beds`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(beds)
    });
    return res.json();
  },

  // Referrals
  getReferrals: async (): Promise<{ success: boolean; referrals: Referral[] }> => {
    const res = await fetch('/api/referrals');
    return res.json();
  },

  updateReferralStatus: async (id: string, status: string, notes?: string): Promise<{ success: boolean; referral: Referral }> => {
    const res = await fetch(`/api/referrals/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, supervisorNotes: notes })
    });
    return res.json();
  },

  // Admin Analytics
  getAdminAnalytics: async () => {
    const res = await fetch('/api/admin/analytics');
    return res.json();
  },

  // Notifications
  getNotifications: async (): Promise<{ success: boolean; notifications: NotificationItem[] }> => {
    const res = await fetch('/api/notifications');
    return res.json();
  }
};
