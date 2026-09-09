/**
 * Express REST API Routes for AikyaCare
 */

import { Router, Request, Response } from 'express';
import { dbStore } from './store';
import { processTriageWithAI, summarizeLabReportWithAI, askHealthAssistantAI } from './gemini';
import { TriageInput } from '../types';

export const apiRouter = Router();

// ==================== HEALTH CHECK ====================
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'AikyaCare Rural AI Health Triage & Coordination Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ==================== AUTHENTICATION ====================
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { phone, role = 'PATIENT' } = req.body;
  // Demo auto-login / token generation
  const patient = dbStore.patients.find(p => p.phone === phone) || dbStore.patients[0];
  res.json({
    success: true,
    token: `demo-jwt-${Date.now()}-${role.toLowerCase()}`,
    user: {
      id: patient.userId,
      name: role === 'PATIENT' ? patient.name : role === 'DOCTOR' ? 'Dr. Ananya Sharma' : role === 'HEALTH_WORKER' ? 'Padmavati (ASHA)' : role === 'AMBULANCE_PARAMEDIC' ? 'Ramesh (AMB-104)' : role === 'HOSPITAL_STAFF' ? 'District Hospital Triage Desk' : 'Chief District Medical Officer',
      role,
      phone: phone || '+91 94401 56789',
      patientId: patient.id
    }
  });
});

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { name, phone, age, gender, villageId } = req.body;
  const newPatient = {
    id: `pat-${Date.now()}`,
    userId: `usr-${Date.now()}`,
    name: name || 'New Patient',
    phone: phone || '+91 90000 00000',
    age: Number(age) || 30,
    gender: gender || 'Other',
    bloodGroup: 'Unknown',
    address: 'Rural Cluster',
    villageId: villageId || 'vil-1',
    villageName: 'Kothur Gramam',
    emergencyContact: 'Nearest Village Relative',
    chronicConditions: [],
    allergies: [],
    currentMeds: [],
    vitals: { heartRate: 75, spO2: 98, systolicBP: 120, diastolicBP: 80 }
  };
  dbStore.patients.push(newPatient);

  res.json({
    success: true,
    patient: newPatient,
    token: `demo-jwt-${Date.now()}`
  });
});

// ==================== PATIENTS ====================
apiRouter.get('/patients', (req: Request, res: Response) => {
  res.json({ success: true, patients: dbStore.patients });
});

apiRouter.get('/patients/:id', (req: Request, res: Response) => {
  const patient = dbStore.patients.find(p => p.id === req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  res.json({ success: true, patient });
});

apiRouter.put('/patients/:id', (req: Request, res: Response) => {
  const patient = dbStore.patients.find(p => p.id === req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  Object.assign(patient, req.body);
  res.json({ success: true, patient });
});

// ==================== TRIAGE & AI ASSISTANT ====================
apiRouter.post('/triage', async (req: Request, res: Response) => {
  try {
    const input: TriageInput = req.body;
    const triageResult = await processTriageWithAI(input);

    // Save triage record
    const record = {
      id: `trig-${Date.now()}`,
      patientId: input.patientId,
      patientName: input.patientName || 'Rural Patient',
      age: input.age,
      gender: input.gender,
      symptoms: input.symptoms,
      result: triageResult,
      reportedBy: input.reportedBy || 'PATIENT',
      villageName: 'Kothur Gramam',
      createdAt: new Date().toISOString()
    };
    dbStore.triageRecords.unshift(record);

    // If result is RED or ORANGE, create automatic supervisor referral
    if (triageResult.urgency === 'RED' || triageResult.urgency === 'ORANGE') {
      const priority = triageResult.urgency === 'RED' ? 'EMERGENCY' : 'URGENT';
      dbStore.referrals.unshift({
        id: `ref-${Date.now()}`,
        patientId: input.patientId || 'pat-demo',
        patientName: input.patientName || 'Patient',
        age: input.age,
        villageName: 'Kothur Gramam',
        healthWorkerId: 'hw-1',
        healthWorkerName: input.reportedBy === 'ASHA' ? 'ASHA Field Worker' : 'AikyaCare System',
        reason: `${triageResult.urgency} triage: ${triageResult.extractedSymptoms.join(', ')}`,
        priority,
        status: 'PENDING',
        urgency: triageResult.urgency,
        createdAt: new Date().toISOString(),
        supervisorNotes: triageResult.recommendedAction
      });
    }

    res.json({ success: true, result: triageResult });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Triage calculation failed' });
  }
});

apiRouter.get('/triage/:patientId', (req: Request, res: Response) => {
  const records = dbStore.triageRecords.filter(r => r.patientId === req.params.patientId);
  res.json({ success: true, records });
});

apiRouter.post('/ai/symptom-check', async (req: Request, res: Response) => {
  try {
    const input: TriageInput = req.body;
    const result = await processTriageWithAI(input);
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/ai/report-summary', async (req: Request, res: Response) => {
  try {
    const { rawText, recordType, patientId, title } = req.body;
    const summaryData = await summarizeLabReportWithAI(rawText, recordType);

    const newRecord = {
      id: `rec-${Date.now()}`,
      patientId: patientId || 'pat-1',
      patientName: 'Ravi Kumar',
      title: title || 'Diagnostic Lab Report',
      recordType: recordType || 'LAB_REPORT',
      rawText,
      aiSummary: summaryData.summary,
      biomarkers: summaryData.biomarkers,
      observations: summaryData.observations,
      questionsForDoctor: summaryData.questionsForDoctor,
      uploadedAt: new Date().toISOString()
    };
    dbStore.medicalRecords.unshift(newRecord);

    res.json({ success: true, record: newRecord });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/ai/health-assistant', async (req: Request, res: Response) => {
  try {
    const { message, context } = req.body;
    const response = await askHealthAssistantAI(message, context);
    res.json({ success: true, ...response });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== EMERGENCY & AMBULANCE ====================
apiRouter.post('/emergency/sos', (req: Request, res: Response) => {
  const { patientId, patientName, patientPhone, pickupAddress, symptoms, dangerSigns, urgency } = req.body;
  const newEmergency = dbStore.createEmergencyRequest({
    patientId: patientId || 'pat-1',
    patientName: patientName || 'Emergency Patient',
    patientPhone: patientPhone || '+91 94401 56789',
    pickupAddress: pickupAddress || 'Village Road, Kothur',
    pickupLatitude: 17.8920,
    pickupLongitude: 79.6800,
    symptoms: symptoms || 'Acute distress / Emergency SOS',
    dangerSigns: dangerSigns || ['Acute distress'],
    urgency: urgency || 'RED'
  });

  res.json({ success: true, emergency: newEmergency });
});

apiRouter.get('/emergency/requests', (req: Request, res: Response) => {
  res.json({ success: true, emergencies: dbStore.emergencyRequests });
});

apiRouter.put('/emergency/:id/status', (req: Request, res: Response) => {
  const { status, notes } = req.body;
  const updated = dbStore.updateEmergencyStatus(req.params.id, status, notes);
  if (!updated) return res.status(404).json({ error: 'Emergency request not found' });
  res.json({ success: true, emergency: updated });
});

apiRouter.get('/ambulance/requests', (req: Request, res: Response) => {
  res.json({
    success: true,
    emergencies: dbStore.emergencyRequests,
    ambulances: dbStore.ambulances
  });
});

apiRouter.put('/ambulance/:id/status', (req: Request, res: Response) => {
  const { status, notes } = req.body;
  const updated = dbStore.updateEmergencyStatus(req.params.id, status, notes);
  if (!updated) return res.status(404).json({ error: 'Emergency not found' });
  res.json({ success: true, emergency: updated });
});

// ==================== APPOINTMENTS & TELEMEDICINE ====================
apiRouter.get('/appointments', (req: Request, res: Response) => {
  const { patientId, doctorId } = req.query;
  let list = dbStore.appointments;
  if (patientId) list = list.filter(a => a.patientId === patientId);
  if (doctorId) list = list.filter(a => a.doctorId === doctorId);
  res.json({ success: true, appointments: list, doctors: dbStore.doctors });
});

apiRouter.post('/appointments', (req: Request, res: Response) => {
  const { patientId, doctorId, scheduledAt, reasonForVisit, type = 'TELEMEDICINE' } = req.body;
  const patient = dbStore.patients.find(p => p.id === patientId) || dbStore.patients[0];
  const doctor = dbStore.doctors.find(d => d.id === doctorId) || dbStore.doctors[0];

  const newAppt = {
    id: `apt-${Date.now()}`,
    patientId: patient.id,
    patientName: patient.name,
    doctorId: doctor.id,
    doctorName: doctor.name,
    doctorSpecialty: doctor.specialization,
    scheduledAt: scheduledAt || new Date(Date.now() + 3600 * 1000).toISOString(),
    status: 'SCHEDULED' as const,
    type: type as 'TELEMEDICINE' | 'IN_PERSON',
    reasonForVisit: reasonForVisit || 'Health consultation'
  };

  dbStore.appointments.unshift(newAppt);

  dbStore.notifications.unshift({
    id: `notif-${Date.now()}`,
    title: 'Consultation Scheduled',
    message: `Appointment confirmed with ${doctor.name} for ${patient.name}.`,
    type: 'APPOINTMENT',
    timestamp: new Date().toISOString(),
    isRead: false
  });

  res.json({ success: true, appointment: newAppt });
});

apiRouter.put('/appointments/:id', (req: Request, res: Response) => {
  const appt = dbStore.appointments.find(a => a.id === req.params.id);
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });
  Object.assign(appt, req.body);
  res.json({ success: true, appointment: appt });
});

// ==================== PRESCRIPTIONS ====================
apiRouter.get('/prescriptions/:patientId', (req: Request, res: Response) => {
  const list = dbStore.prescriptions.filter(p => p.patientId === req.params.patientId);
  res.json({ success: true, prescriptions: list });
});

apiRouter.post('/prescriptions', (req: Request, res: Response) => {
  const { patientId, doctorId, medications, instructions, diagnosis, followUpDate } = req.body;
  const doctor = dbStore.doctors.find(d => d.id === doctorId) || dbStore.doctors[0];

  const newRx = {
    id: `rx-${Date.now()}`,
    patientId: patientId || 'pat-1',
    doctorId: doctor.id,
    doctorName: doctor.name,
    medications: medications || [],
    instructions: instructions || 'Take medications as directed with clean drinking water.',
    diagnosis: diagnosis || 'Clinical observation and management',
    followUpDate: followUpDate || new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  };

  dbStore.prescriptions.unshift(newRx);
  res.json({ success: true, prescription: newRx });
});

// ==================== HEALTH WORKER & OFFLINE SYNC ====================
apiRouter.get('/health-worker/triage', (req: Request, res: Response) => {
  res.json({
    success: true,
    triageRecords: dbStore.triageRecords,
    villages: dbStore.villageHealthIndices
  });
});

apiRouter.post('/health-worker/triage', async (req: Request, res: Response) => {
  const input: TriageInput = { ...req.body, reportedBy: 'ASHA' };
  const result = await processTriageWithAI(input);

  const record = {
    id: `trig-${Date.now()}`,
    patientId: input.patientId,
    patientName: input.patientName || 'Village Patient',
    age: input.age,
    gender: input.gender,
    symptoms: input.symptoms,
    result,
    reportedBy: 'ASHA',
    villageName: 'Narsapur Tanda',
    createdAt: new Date().toISOString()
  };
  dbStore.triageRecords.unshift(record);

  res.json({ success: true, record });
});

apiRouter.post('/health-worker/sync', (req: Request, res: Response) => {
  const { items } = req.body; // Array of queued sync items
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Expected items array' });
  }

  let syncedCount = 0;
  for (const item of items) {
    if (item.actionType === 'TRIAGE_CASE') {
      const record = {
        id: `trig-synced-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        patientName: item.payload.patientName || 'Offline Village Patient',
        age: item.payload.age || 40,
        gender: item.payload.gender || 'Unknown',
        symptoms: item.payload.symptoms,
        result: item.payload.result,
        reportedBy: 'ASHA (Synced from offline)',
        villageName: item.payload.villageName || 'Narsapur Tanda',
        createdAt: item.clientCreatedAt || new Date().toISOString()
      };
      dbStore.triageRecords.unshift(record);
      syncedCount++;
    } else if (item.actionType === 'SURVEY') {
      dbStore.householdSurveys.unshift({
        id: `srv-synced-${Date.now()}`,
        healthWorkerId: 'hw-1',
        villageId: item.payload.villageId || 'vil-2',
        villageName: item.payload.villageName || 'Narsapur Tanda',
        familyHeadName: item.payload.familyHeadName || 'Surveyed Household',
        membersCount: Number(item.payload.membersCount) || 4,
        pregnantWomen: Number(item.payload.pregnantWomen) || 0,
        childrenUnder5: Number(item.payload.childrenUnder5) || 0,
        elderlyAbove60: Number(item.payload.elderlyAbove60) || 0,
        sanitationStatus: item.payload.sanitationStatus || 'ADEQUATE',
        waterSource: item.payload.waterSource || 'BOREWELL',
        notes: item.payload.notes || 'Offline survey synced',
        createdAt: item.clientCreatedAt || new Date().toISOString()
      });
      syncedCount++;
    }
  }

  dbStore.notifications.unshift({
    id: `notif-${Date.now()}`,
    title: 'Offline Cases Synchronized',
    message: `${syncedCount} offline health worker records successfully merged into central registry.`,
    type: 'INFO',
    timestamp: new Date().toISOString(),
    isRead: false
  });

  res.json({
    success: true,
    syncedCount,
    message: `${syncedCount} cases synchronized successfully`
  });
});

apiRouter.get('/health-worker/surveys', (req: Request, res: Response) => {
  res.json({ success: true, surveys: dbStore.householdSurveys });
});

apiRouter.post('/health-worker/surveys', (req: Request, res: Response) => {
  const newSurvey = {
    id: `srv-${Date.now()}`,
    healthWorkerId: 'hw-1',
    villageId: req.body.villageId || 'vil-1',
    villageName: req.body.villageName || 'Kothur Gramam',
    familyHeadName: req.body.familyHeadName || 'Household Head',
    membersCount: Number(req.body.membersCount) || 4,
    pregnantWomen: Number(req.body.pregnantWomen) || 0,
    childrenUnder5: Number(req.body.childrenUnder5) || 0,
    elderlyAbove60: Number(req.body.elderlyAbove60) || 0,
    sanitationStatus: req.body.sanitationStatus || 'ADEQUATE',
    waterSource: req.body.waterSource || 'TAP',
    notes: req.body.notes || '',
    createdAt: new Date().toISOString()
  };
  dbStore.householdSurveys.unshift(newSurvey);
  res.json({ success: true, survey: newSurvey });
});

// ==================== HOSPITALS & BEDS ====================
apiRouter.get('/hospitals', (req: Request, res: Response) => {
  res.json({ success: true, hospitals: dbStore.hospitals });
});

apiRouter.get('/hospitals/:id/beds', (req: Request, res: Response) => {
  const hosp = dbStore.hospitals.find(h => h.id === req.params.id);
  if (!hosp) return res.status(404).json({ error: 'Hospital not found' });
  res.json({
    success: true,
    hospital: hosp,
    bedsSummary: {
      total: hosp.totalBeds,
      available: hosp.availableBeds,
      icuTotal: hosp.icuBedsTotal,
      icuAvailable: hosp.icuBedsAvailable,
      oxygenTotal: hosp.oxygenBedsTotal,
      oxygenAvailable: hosp.oxygenBedsAvailable,
      capacityStatus: hosp.emergencyCapacity
    }
  });
});

apiRouter.put('/hospitals/:id/beds', (req: Request, res: Response) => {
  const updated = dbStore.updateHospitalBeds(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Hospital not found' });
  res.json({ success: true, hospital: updated });
});

// ==================== REFERRALS ====================
apiRouter.get('/referrals', (req: Request, res: Response) => {
  res.json({ success: true, referrals: dbStore.referrals });
});

apiRouter.put('/referrals/:id/status', (req: Request, res: Response) => {
  const ref = dbStore.referrals.find(r => r.id === req.params.id);
  if (!ref) return res.status(404).json({ error: 'Referral not found' });
  ref.status = req.body.status || ref.status;
  if (req.body.supervisorNotes) ref.supervisorNotes = req.body.supervisorNotes;
  res.json({ success: true, referral: ref });
});

// ==================== ADMIN & DISTRICT ANALYTICS ====================
apiRouter.get('/admin/analytics', (req: Request, res: Response) => {
  const totalPatients = dbStore.patients.length + 1420; // Include surveyed village populace
  const activeEmergencies = dbStore.emergencyRequests.filter(e => e.status !== 'ARRIVED_AT_HOSPITAL').length;
  const pendingReferrals = dbStore.referrals.filter(r => r.status === 'PENDING').length;

  res.json({
    success: true,
    summary: {
      totalPatients,
      activeEmergencies,
      pendingReferrals,
      totalVillagesCovered: dbStore.villageHealthIndices.length,
      activeAshaWorkers: 38,
      phcCount: 14,
      hospitalCount: dbStore.hospitals.length,
      ambulanceCount: dbStore.ambulances.length,
      averageAmbulanceResponseMinutes: 9.4,
      referralCompletionRate: '88.5%'
    },
    villages: dbStore.villageHealthIndices,
    diseaseDistribution: [
      { category: 'Acute Respiratory Infections / Dyspnea', percentage: 34, count: 184 },
      { category: 'Hypertension & Cardiovascular', percentage: 26, count: 141 },
      { category: 'Gastroenteritis & Dehydration', percentage: 18, count: 97 },
      { category: 'Maternal / Obstetric Care', percentage: 12, count: 65 },
      { category: 'Trauma / Minor Accidents', percentage: 10, count: 54 }
    ],
    referralTrends: [
      { month: 'May', routine: 45, urgent: 22, emergency: 8 },
      { month: 'Jun', routine: 52, urgent: 28, emergency: 12 },
      { month: 'Jul', routine: 64, urgent: 34, emergency: 15 },
      { month: 'Aug', routine: 78, urgent: 40, emergency: 18 },
      { month: 'Sep', routine: 92, urgent: 46, emergency: 14 }
    ]
  });
});

apiRouter.get('/admin/villages', (req: Request, res: Response) => {
  res.json({ success: true, villages: dbStore.villageHealthIndices });
});

apiRouter.get('/admin/emergencies', (req: Request, res: Response) => {
  res.json({
    success: true,
    emergencies: dbStore.emergencyRequests,
    ambulances: dbStore.ambulances
  });
});

// ==================== NOTIFICATIONS ====================
apiRouter.get('/notifications', (req: Request, res: Response) => {
  res.json({ success: true, notifications: dbStore.notifications });
});

apiRouter.put('/notifications/:id/read', (req: Request, res: Response) => {
  const notif = dbStore.notifications.find(n => n.id === req.params.id);
  if (notif) notif.isRead = true;
  res.json({ success: true });
});
