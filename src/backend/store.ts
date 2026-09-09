/**
 * AikyaCare In-Memory Database Store & Realistic Data Seed
 * 
 * Implements full relational state for all 20 models defined in Prisma.
 * Enables live multi-role coordination across Patient, ASHA, Doctor,
 * Ambulance, Hospital, and District Admin dashboards.
 */

import {
  Patient,
  Doctor,
  Hospital,
  Ambulance,
  Appointment,
  EmergencyRequest,
  TriageResult,
  MedicalRecord,
  Prescription,
  HouseholdSurvey,
  Referral,
  VillageHealthIndex,
  NotificationItem
} from '../types';

export interface TriageRecord {
  id: string;
  patientId?: string;
  patientName?: string;
  age: number;
  gender: string;
  symptoms: string;
  result: TriageResult;
  reportedBy: string;
  villageName: string;
  createdAt: string;
}

class DatabaseStore {
  public patients: Patient[] = [];
  public doctors: Doctor[] = [];
  public hospitals: Hospital[] = [];
  public ambulances: Ambulance[] = [];
  public appointments: Appointment[] = [];
  public emergencyRequests: EmergencyRequest[] = [];
  public triageRecords: TriageRecord[] = [];
  public medicalRecords: MedicalRecord[] = [];
  public prescriptions: Prescription[] = [];
  public householdSurveys: HouseholdSurvey[] = [];
  public referrals: Referral[] = [];
  public villageHealthIndices: VillageHealthIndex[] = [];
  public notifications: NotificationItem[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Villages
    this.villageHealthIndices = [
      {
        villageId: 'vil-1',
        villageName: 'Kothur Gramam',
        district: 'Warangal Rural',
        population: 2850,
        overallScore: 82,
        status: 'Healthy',
        metrics: {
          vaccinationCoverage: 94,
          maternalHealth: 88,
          childHealth: 90,
          diseaseBurden: 24,
          emergencyResponse: 85,
          healthcareAccessibility: 78
        },
        highRiskHouseholds: 14,
        pendingReferrals: 2,
        connectivity: 'INTERMITTENT'
      },
      {
        villageId: 'vil-2',
        villageName: 'Narsapur Tanda',
        district: 'Warangal Rural',
        population: 1720,
        overallScore: 64,
        status: 'Moderate',
        metrics: {
          vaccinationCoverage: 76,
          maternalHealth: 70,
          childHealth: 68,
          diseaseBurden: 48,
          emergencyResponse: 60,
          healthcareAccessibility: 52
        },
        highRiskHouseholds: 29,
        pendingReferrals: 5,
        connectivity: 'POOR'
      },
      {
        villageId: 'vil-3',
        villageName: 'Chennur Palle',
        district: 'Warangal Rural',
        population: 3400,
        overallScore: 43,
        status: 'At Risk',
        metrics: {
          vaccinationCoverage: 58,
          maternalHealth: 45,
          childHealth: 51,
          diseaseBurden: 72,
          emergencyResponse: 38,
          healthcareAccessibility: 34
        },
        highRiskHouseholds: 56,
        pendingReferrals: 11,
        connectivity: 'POOR'
      }
    ];

    // 2. Hospitals
    this.hospitals = [
      {
        id: 'hosp-1',
        name: 'District Care Hospital',
        type: 'DISTRICT_HOSPITAL',
        address: 'Collectorate Junction, Warangal Urban',
        district: 'Warangal',
        phone: '+91 870 245 9901',
        latitude: 17.9689,
        longitude: 79.5941,
        totalBeds: 250,
        availableBeds: 42,
        icuBedsTotal: 30,
        icuBedsAvailable: 4,
        oxygenBedsTotal: 80,
        oxygenBedsAvailable: 15,
        emergencyCapacity: 'NORMAL',
        specialties: ['Cardiology', 'Emergency & Trauma', 'Neurology', 'General Surgery', 'Pediatrics', 'Obstetrics']
      },
      {
        id: 'hosp-2',
        name: 'Rural Community Hospital (CHC)',
        type: 'CHC',
        address: 'Narsapur Road, Sub-District Centre',
        district: 'Warangal Rural',
        phone: '+91 870 248 1122',
        latitude: 17.9250,
        longitude: 79.6420,
        totalBeds: 60,
        availableBeds: 18,
        icuBedsTotal: 8,
        icuBedsAvailable: 2,
        oxygenBedsTotal: 25,
        oxygenBedsAvailable: 7,
        emergencyCapacity: 'NORMAL',
        specialties: ['General Medicine', 'Maternity Care', 'Pediatrics', 'Emergency Stabilization']
      },
      {
        id: 'hosp-3',
        name: 'Kothur Primary Health Centre (PHC)',
        type: 'PHC',
        address: 'Main Bazaar, Kothur',
        district: 'Warangal Rural',
        phone: '+91 870 249 3344',
        latitude: 17.8920,
        longitude: 79.6800,
        totalBeds: 12,
        availableBeds: 5,
        icuBedsTotal: 0,
        icuBedsAvailable: 0,
        oxygenBedsTotal: 4,
        oxygenBedsAvailable: 2,
        emergencyCapacity: 'NORMAL',
        specialties: ['Primary Care', 'Immunization', 'Outpatient Consultations', 'First Aid']
      }
    ];

    // 3. Ambulances
    this.ambulances = [
      {
        id: 'amb-104',
        vehicleNumber: 'AMB-104',
        type: 'ALS',
        driverName: 'Ramesh Goud',
        driverPhone: '+91 98480 12345',
        isAvailable: true,
        currentLatitude: 17.9500,
        currentLongitude: 79.6100,
        currentLocationName: 'Stationed at CHC Narsapur Hub'
      },
      {
        id: 'amb-101',
        vehicleNumber: 'AMB-101',
        type: 'BLS',
        driverName: 'Kishore Nayak',
        driverPhone: '+91 98480 23456',
        isAvailable: true,
        currentLatitude: 17.9710,
        currentLongitude: 79.5880,
        currentLocationName: 'Stationed at District Hospital Base'
      },
      {
        id: 'amb-102',
        vehicleNumber: 'AMB-102',
        type: 'ALS',
        driverName: 'Srinivas Rao',
        driverPhone: '+91 98480 34567',
        isAvailable: false,
        currentLatitude: 17.9100,
        currentLongitude: 79.6500,
        currentLocationName: 'En route Chennur Rural Route'
      }
    ];

    // 4. Patients
    this.patients = [
      {
        id: 'pat-1',
        userId: 'usr-pat-1',
        name: 'Ravi Kumar',
        phone: '+91 94401 56789',
        age: 58,
        gender: 'Male',
        bloodGroup: 'B+',
        address: 'House #4-12, Kothur Village',
        villageId: 'vil-1',
        villageName: 'Kothur Gramam',
        emergencyContact: 'Lakshmi (Spouse) - +91 94401 56790',
        chronicConditions: ['Type 2 Diabetes', 'Hypertension'],
        allergies: ['Penicillin'],
        currentMeds: ['Metformin 500mg', 'Amlodipine 5mg'],
        vitals: {
          heartRate: 84,
          systolicBP: 138,
          diastolicBP: 88,
          spO2: 97,
          temperature: 98.6,
          weightKg: 68
        }
      },
      {
        id: 'pat-2',
        userId: 'usr-pat-2',
        name: 'Lakshmi Devi',
        phone: '+91 94402 67890',
        age: 32,
        gender: 'Female',
        bloodGroup: 'O+',
        address: 'Tanda Main Road, Narsapur',
        villageId: 'vil-2',
        villageName: 'Narsapur Tanda',
        emergencyContact: 'Venkatesh (Husband) - +91 94402 67891',
        chronicConditions: ['Gestational Anemia'],
        allergies: ['None known'],
        currentMeds: ['Iron & Folic Acid Tablets', 'Calcium Carbonate'],
        vitals: {
          heartRate: 78,
          systolicBP: 114,
          diastolicBP: 74,
          spO2: 99,
          temperature: 98.4,
          weightKg: 56
        }
      },
      {
        id: 'pat-3',
        userId: 'usr-pat-3',
        name: 'Suresh Reddy',
        phone: '+91 94403 78901',
        age: 71,
        gender: 'Male',
        bloodGroup: 'A+',
        address: 'Near Old Water Tank, Chennur',
        villageId: 'vil-3',
        villageName: 'Chennur Palle',
        emergencyContact: 'Mahesh (Son) - +91 94403 78902',
        chronicConditions: ['Chronic Bronchitis / COPD', 'Coronary Artery Disease'],
        allergies: ['Sulfa drugs'],
        currentMeds: ['Tiotropium Inhaler', 'Aspirin 75mg', 'Atorvastatin 20mg'],
        vitals: {
          heartRate: 92,
          systolicBP: 146,
          diastolicBP: 92,
          spO2: 94,
          temperature: 99.1,
          weightKg: 62
        }
      }
    ];

    // 5. Doctors
    this.doctors = [
      {
        id: 'doc-1',
        userId: 'usr-doc-1',
        name: 'Dr. Ananya Sharma',
        specialization: 'General Medicine / Primary Care',
        qualification: 'MBBS, MD (Family Medicine)',
        hospitalName: 'District Care Hospital',
        isAvailable: true,
        consultationFee: 0,
        phone: '+91 98490 11223'
      },
      {
        id: 'doc-2',
        userId: 'usr-doc-2',
        name: 'Dr. Rajesh Varma',
        specialization: 'Cardiology & Emergency Critical Care',
        qualification: 'MBBS, MD, DM (Cardiology)',
        hospitalName: 'District Care Hospital',
        isAvailable: true,
        consultationFee: 0,
        phone: '+91 98490 22334'
      },
      {
        id: 'doc-3',
        userId: 'usr-doc-3',
        name: 'Dr. Madhavi Latha',
        specialization: 'Pediatrics & Child Health',
        qualification: 'MBBS, DCH',
        hospitalName: 'Rural Community Hospital (CHC)',
        isAvailable: true,
        consultationFee: 0,
        phone: '+91 98490 33445'
      }
    ];

    // 6. Appointments
    this.appointments = [
      {
        id: 'apt-1',
        patientId: 'pat-1',
        patientName: 'Ravi Kumar',
        doctorId: 'doc-1',
        doctorName: 'Dr. Ananya Sharma',
        doctorSpecialty: 'General Medicine',
        scheduledAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
        status: 'SCHEDULED',
        type: 'TELEMEDICINE',
        reasonForVisit: 'Routine diabetic follow-up & medication review',
        clinicalNotes: 'Blood sugar fasting slightly elevated (138 mg/dL). Vitals stable.'
      },
      {
        id: 'apt-2',
        patientId: 'pat-2',
        patientName: 'Lakshmi Devi',
        doctorId: 'doc-1',
        doctorName: 'Dr. Ananya Sharma',
        doctorSpecialty: 'General Medicine / Maternal Care',
        scheduledAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        status: 'SCHEDULED',
        type: 'TELEMEDICINE',
        reasonForVisit: 'Second trimester ANC check & hemoglobin assessment',
        clinicalNotes: 'Follow up on iron supplementation.'
      }
    ];

    // 7. Medical Records
    this.medicalRecords = [
      {
        id: 'rec-1',
        patientId: 'pat-1',
        patientName: 'Ravi Kumar',
        title: 'Complete Blood Count (CBC) & HbA1c Panel',
        recordType: 'LAB_REPORT',
        rawText: `COMPLETE BLOOD COUNT REPORT
Patient: Ravi Kumar, 58/M
HbA1c: 7.8% (Elevated)
Fasting Plasma Glucose: 142 mg/dL
Hemoglobin: 13.8 g/dL (Normal)
Total Leucocyte Count (WBC): 7,600 /cu.mm
Platelets: 240,000 /cu.mm
Serum Creatinine: 0.9 mg/dL
Urine Microalbumin: Negative`,
        aiSummary: 'Glycemic control requires optimization with HbA1c at 7.8%. Renal function and hematological markers remain within healthy physiological limits.',
        biomarkers: {
          'HbA1c': '7.8% (High)',
          'Fasting Glucose': '142 mg/dL (High)',
          'Hemoglobin': '13.8 g/dL (Normal)',
          'Creatinine': '0.9 mg/dL (Normal)'
        },
        observations: [
          'Elevated HbA1c indicates sub-optimal glycemic control over past 90 days.',
          'Kidney filtration markers (Creatinine 0.9 mg/dL) are completely normal.',
          'Blood cell counts (Hemoglobin, Platelets, WBC) are healthy.'
        ],
        questionsForDoctor: [
          'Should we adjust the Metformin dosage or add a second agent?',
          'How frequently should home capillary blood glucose be logged?',
          'What dietary fiber modifications are suggested?'
        ],
        uploadedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
      },
      {
        id: 'rec-2',
        patientId: 'pat-2',
        patientName: 'Lakshmi Devi',
        title: 'Antenatal Ultrasound & Anemia Profile',
        recordType: 'LAB_REPORT',
        rawText: `OBSTETRIC REPORT & HEMOGRAM
Patient: Lakshmi Devi, 32/F, 24 Weeks Gestation
Fetal Heart Rate: 144 bpm (Normal regular)
Single live intrauterine fetus, cephalic presentation.
Hemoglobin: 10.1 g/dL (Mild Maternal Anemia)
Blood Group: O Positive
Serum Ferritin: 18 ng/mL (Low)`,
        aiSummary: 'Fetal growth and cardiac parameters are healthy. Mild maternal anemia is noted with Hemoglobin at 10.1 g/dL, benefiting from therapeutic iron supplementation.',
        biomarkers: {
          'Fetal Heart Rate': '144 bpm (Healthy)',
          'Hemoglobin': '10.1 g/dL (Mild Anemia)',
          'Ferritin': '18 ng/mL (Low)'
        },
        observations: [
          'Mild nutritional anemia typical for second trimester.',
          'Ultrasound confirms normal fetal growth and amniotic fluid index.'
        ],
        questionsForDoctor: [
          'Is twice-daily elemental iron recommended over once daily?',
          'Are there any symptoms of fatigue I should watch closely?'
        ],
        uploadedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
      }
    ];

    // 8. Prescriptions
    this.prescriptions = [
      {
        id: 'rx-1',
        patientId: 'pat-1',
        doctorId: 'doc-1',
        doctorName: 'Dr. Ananya Sharma',
        medications: [
          {
            name: 'Metformin Hydrochloride',
            dosage: '500 mg',
            frequency: 'Twice daily with meals',
            durationDays: 30,
            instructions: 'Take immediately after breakfast and dinner. Avoid skipping meals.'
          },
          {
            name: 'Amlodipine Besylate',
            dosage: '5 mg',
            frequency: 'Once daily morning',
            durationDays: 30,
            instructions: 'Take every morning around 8:00 AM with water.'
          }
        ],
        instructions: 'Monitor fasting blood sugar twice a week in logbook. Limit polished white rice.',
        diagnosis: 'Type 2 Diabetes Mellitus with Primary Hypertension',
        followUpDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
      }
    ];

    // 9. Initial Emergency Request (Active Demo Scenario)
    this.emergencyRequests = [
      {
        id: 'emg-101',
        patientId: 'pat-3',
        patientName: 'Suresh Reddy',
        patientAge: 71,
        patientPhone: '+91 94403 78901',
        pickupAddress: 'Near Old Water Tank, Chennur Palle Village',
        pickupLatitude: 17.9100,
        pickupLongitude: 79.6500,
        symptoms: 'Crushing chest pain radiating to left shoulder, profuse cold sweats, gasping for breath',
        dangerSigns: ['Severe Chest Pain', 'Shortness of Breath', 'Diaphoresis (Sweating)'],
        urgency: 'RED',
        ambulanceId: 'amb-104',
        ambulanceNumber: 'AMB-104',
        hospitalId: 'hosp-1',
        hospitalName: 'District Care Hospital',
        status: 'EN_ROUTE',
        etaMinutes: 8,
        notes: 'Paramedic equipped with portable 12-lead ECG and sublingual nitrates.',
        createdAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // 10. Household Surveys
    this.householdSurveys = [
      {
        id: 'srv-1',
        healthWorkerId: 'hw-1',
        villageId: 'vil-1',
        villageName: 'Kothur Gramam',
        familyHeadName: 'M. Venkataiah',
        membersCount: 5,
        pregnantWomen: 1,
        childrenUnder5: 2,
        elderlyAbove60: 1,
        sanitationStatus: 'ADEQUATE',
        waterSource: 'TAP',
        notes: 'All children up-to-date with MR and Pentavalent vaccines.',
        createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
      },
      {
        id: 'srv-2',
        healthWorkerId: 'hw-1',
        villageId: 'vil-2',
        villageName: 'Narsapur Tanda',
        familyHeadName: 'B. Ramulu',
        membersCount: 6,
        pregnantWomen: 0,
        childrenUnder5: 1,
        elderlyAbove60: 2,
        sanitationStatus: 'INADEQUATE',
        waterSource: 'BOREWELL',
        notes: 'Elderly family member has persistent cough for 3 weeks; recommended TB sputum test.',
        createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
      }
    ];

    // 11. Referrals
    this.referrals = [
      {
        id: 'ref-1',
        patientId: 'pat-3',
        patientName: 'Suresh Reddy',
        age: 71,
        villageName: 'Chennur Palle',
        healthWorkerId: 'hw-1',
        healthWorkerName: 'Padmavati (ASHA)',
        reason: 'Acute cardiovascular emergency - severe chest pain and dyspnea',
        priority: 'EMERGENCY',
        status: 'REFERRED',
        urgency: 'RED',
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        supervisorNotes: 'Ambulance AMB-104 dispatched with portable ECG unit.'
      },
      {
        id: 'ref-2',
        patientId: 'pat-2',
        patientName: 'Lakshmi Devi',
        age: 32,
        villageName: 'Narsapur Tanda',
        healthWorkerId: 'hw-1',
        healthWorkerName: 'Padmavati (ASHA)',
        reason: 'Gestational anemia management & specialist sonography review',
        priority: 'URGENT',
        status: 'REVIEWED',
        urgency: 'YELLOW',
        createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        supervisorNotes: 'Telemedicine consultation booked with Dr. Ananya.'
      }
    ];

    // 12. Notifications
    this.notifications = [
      {
        id: 'notif-1',
        title: 'Emergency SOS Dispatched',
        message: 'Ambulance AMB-104 is en route to Chennur Palle for patient Suresh Reddy (ETA: 8 mins).',
        type: 'EMERGENCY',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        isRead: false
      },
      {
        id: 'notif-2',
        title: 'Doctor Appointment Confirmed',
        message: 'Telemedicine consultation scheduled with Dr. Ananya Sharma today.',
        type: 'APPOINTMENT',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        isRead: false
      },
      {
        id: 'notif-3',
        title: 'ASHA Offline Triage Sync',
        message: 'Local triage cases from Narsapur Tanda successfully synchronized.',
        type: 'INFO',
        timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        isRead: true
      }
    ];
  }

  // Helper Methods
  public createEmergencyRequest(data: Omit<EmergencyRequest, 'id' | 'createdAt' | 'updatedAt' | 'etaMinutes' | 'status'>): EmergencyRequest {
    const id = `emg-${Date.now().toString().slice(-4)}`;
    const availableAmb = this.ambulances.find(a => a.isAvailable) || this.ambulances[0];
    if (availableAmb) {
      availableAmb.isAvailable = false;
    }

    const newRequest: EmergencyRequest = {
      ...data,
      id,
      ambulanceId: availableAmb?.id,
      ambulanceNumber: availableAmb?.vehicleNumber || 'AMB-104',
      hospitalId: 'hosp-1',
      hospitalName: 'District Care Hospital',
      status: 'ACCEPTED',
      etaMinutes: Math.floor(Math.random() * 6) + 6, // 6-12 mins
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.emergencyRequests.unshift(newRequest);

    // Create notification
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: '🚨 Emergency SOS Activated',
      message: `Ambulance ${newRequest.ambulanceNumber} assigned to ${newRequest.patientName} (${newRequest.pickupAddress}). ETA: ${newRequest.etaMinutes} mins.`,
      type: 'EMERGENCY',
      timestamp: new Date().toISOString(),
      isRead: false
    });

    return newRequest;
  }

  public updateEmergencyStatus(id: string, status: EmergencyRequest['status'], notes?: string): EmergencyRequest | null {
    const req = this.emergencyRequests.find(r => r.id === id);
    if (!req) return null;

    req.status = status;
    req.updatedAt = new Date().toISOString();
    if (notes) req.notes = notes;

    if (status === 'EN_ROUTE') {
      req.etaMinutes = Math.max(req.etaMinutes - 3, 4);
    } else if (status === 'ARRIVING') {
      req.etaMinutes = 2;
    } else if (status === 'PATIENT_PICKED_UP' || status === 'ARRIVED_AT_HOSPITAL') {
      req.etaMinutes = 0;
    }

    if (status === 'ARRIVED_AT_HOSPITAL' && req.ambulanceId) {
      const amb = this.ambulances.find(a => a.id === req.ambulanceId);
      if (amb) amb.isAvailable = true;
    }

    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: `Emergency Update: ${req.patientName}`,
      message: `Status updated to ${status.replace(/_/g, ' ')}. ${notes || ''}`,
      type: 'EMERGENCY',
      timestamp: new Date().toISOString(),
      isRead: false
    });

    return req;
  }

  public updateHospitalBeds(hospitalId: string, updates: Partial<Hospital>): Hospital | null {
    const hosp = this.hospitals.find(h => h.id === hospitalId);
    if (!hosp) return null;

    Object.assign(hosp, updates);
    return hosp;
  }
}

export const dbStore = new DatabaseStore();
