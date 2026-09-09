// AikyaCare Core Type Definitions

export type UserRole =
  | 'PATIENT'
  | 'DOCTOR'
  | 'HEALTH_WORKER'
  | 'HOSPITAL_STAFF'
  | 'AMBULANCE_PARAMEDIC'
  | 'ADMIN';

export type UrgencyLevel = 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';

export type CarePathway =
  | 'HOME_MONITORING'
  | 'PHC_VISIT'
  | 'DOCTOR_CONSULTATION'
  | 'SPECIALIST_CONSULTATION'
  | 'HOSPITAL_VISIT'
  | 'EMERGENCY_SOS'
  | 'AMBULANCE_DISPATCH';

export type EmergencyStatus =
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'EN_ROUTE'
  | 'ARRIVING'
  | 'PATIENT_PICKED_UP'
  | 'ARRIVED_AT_HOSPITAL'
  | 'CANCELLED';

export type AppointmentStatus =
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type ReferralStatus = 'PENDING' | 'REVIEWED' | 'REFERRED' | 'COMPLETED';

export type SyncStatus = 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';

export interface VitalsInput {
  heartRate?: number;
  systolicBP?: number;
  diastolicBP?: number;
  spO2?: number;
  temperature?: number; // °F
  weightKg?: number;
}

export interface TriageInput {
  patientId?: string;
  patientName?: string;
  age: number;
  gender: string;
  symptoms: string;
  duration?: string;
  severity?: 'mild' | 'moderate' | 'severe';
  vitals?: VitalsInput;
  chronicConditions?: string[];
  currentMeds?: string[];
  reportedBy?: 'PATIENT' | 'ASHA' | 'RELATIVE';
  languageUsed?: 'en' | 'te';
  isOfflineCase?: boolean;
}

export interface DangerSignAlert {
  id: string;
  sign: string;
  severityScore: number;
  description: string;
  category: 'CARDIOVASCULAR' | 'RESPIRATORY' | 'NEUROLOGICAL' | 'TRAUMA' | 'PEDIATRIC' | 'OBSTETRIC' | 'GENERAL';
}

export interface RiskScoreBreakdown {
  component: string;
  points: number;
  reason: string;
}

export interface TriageResult {
  id: string;
  triageCaseId?: string;
  patientId?: string;
  urgency: UrgencyLevel;
  riskScore: number; // 0 - 100
  carePathway: CarePathway;
  extractedSymptoms: string[];
  duration?: string;
  severity?: string;
  dangerSignsFound: string[];
  possibleConcerns: string[];
  recommendedAction: string;
  specialistRequired?: string;
  reasoning: string[];
  isSafetyRuleTriggered: boolean;
  scoreBreakdown: RiskScoreBreakdown[];
  summary: string;
  disclaimer: string;
  createdAt: string;
}

export interface EmergencyRequest {
  id: string;
  patientId?: string;
  patientName: string;
  patientAge?: number;
  patientPhone: string;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  symptoms: string;
  dangerSigns: string[];
  urgency: UrgencyLevel;
  ambulanceId?: string;
  ambulanceNumber?: string;
  hospitalId?: string;
  hospitalName?: string;
  status: EmergencyStatus;
  etaMinutes: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ambulance {
  id: string;
  vehicleNumber: string;
  type: 'ALS' | 'BLS';
  driverName: string;
  driverPhone: string;
  isAvailable: boolean;
  currentLatitude: number;
  currentLongitude: number;
  currentLocationName: string;
}

export interface Hospital {
  id: string;
  name: string;
  type: 'PHC' | 'CHC' | 'DISTRICT_HOSPITAL' | 'PRIVATE';
  address: string;
  district: string;
  phone: string;
  latitude: number;
  longitude: number;
  totalBeds: number;
  availableBeds: number;
  icuBedsTotal: number;
  icuBedsAvailable: number;
  oxygenBedsTotal: number;
  oxygenBedsAvailable: number;
  emergencyCapacity: 'NORMAL' | 'HIGH' | 'FULL';
  specialties: string[];
}

export interface Patient {
  id: string;
  userId: string;
  name: string;
  phone: string;
  age: number;
  gender: string;
  bloodGroup: string;
  address: string;
  villageId: string;
  villageName: string;
  emergencyContact: string;
  chronicConditions: string[];
  allergies: string[];
  currentMeds: string[];
  vitals: VitalsInput;
}

export interface Doctor {
  id: string;
  userId: string;
  name: string;
  specialization: string;
  qualification: string;
  hospitalName: string;
  isAvailable: boolean;
  consultationFee: number;
  phone: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  scheduledAt: string;
  status: AppointmentStatus;
  type: 'TELEMEDICINE' | 'IN_PERSON';
  reasonForVisit: string;
  clinicalNotes?: string;
  prescriptionGiven?: boolean;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  title: string;
  recordType: 'LAB_REPORT' | 'XRAY' | 'PRESCRIPTION' | 'DISCHARGE_SUMMARY';
  rawText?: string;
  aiSummary?: string;
  biomarkers?: Record<string, string | number>;
  observations: string[];
  questionsForDoctor?: string[];
  uploadedAt: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    durationDays: number;
    instructions: string;
  }>;
  instructions: string;
  diagnosis: string;
  followUpDate?: string;
  createdAt: string;
}

export interface HouseholdSurvey {
  id: string;
  healthWorkerId: string;
  villageId: string;
  villageName: string;
  familyHeadName: string;
  membersCount: number;
  pregnantWomen: number;
  childrenUnder5: number;
  elderlyAbove60: number;
  sanitationStatus: 'ADEQUATE' | 'INADEQUATE';
  waterSource: 'TAP' | 'BOREWELL' | 'WELL';
  notes?: string;
  createdAt: string;
}

export interface VillageHealthIndex {
  villageId: string;
  villageName: string;
  district: string;
  population: number;
  overallScore: number; // 0 - 100
  status: 'Healthy' | 'Moderate' | 'At Risk';
  metrics: {
    vaccinationCoverage: number; // %
    maternalHealth: number;
    childHealth: number;
    diseaseBurden: number;
    emergencyResponse: number;
    healthcareAccessibility: number;
  };
  highRiskHouseholds: number;
  pendingReferrals: number;
  connectivity: 'GOOD' | 'INTERMITTENT' | 'POOR';
}

export interface Referral {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  villageName: string;
  healthWorkerId: string;
  healthWorkerName: string;
  reason: string;
  priority: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  status: ReferralStatus;
  urgency: UrgencyLevel;
  createdAt: string;
  supervisorNotes?: string;
}

export interface SyncQueueItem {
  id: string;
  healthWorkerId: string;
  actionType: 'TRIAGE_CASE' | 'SURVEY' | 'REFERRAL';
  payload: any;
  status: SyncStatus;
  clientCreatedAt: string;
  retryCount: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'ALERT' | 'EMERGENCY' | 'APPOINTMENT';
  timestamp: string;
  isRead: boolean;
}
