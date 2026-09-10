/**
 * Express REST API Routes for AikyaCare
 */

import { Router, Request, Response } from 'express';
import { dbStore } from './store';
import { processTriageWithAI, summarizeLabReportWithAI, askHealthAssistantAI } from './gemini';
import { TriageInput } from '../types';
import {
  hashPassword,
  comparePassword,
  generateToken,
  authenticateToken,
  requireRole,
  AuthenticatedRequest
} from './auth';

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

// Public Registration - Only permitted for PATIENT role
apiRouter.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const {
      name,
      phone,
      email,
      password,
      confirmPassword,
      role = 'PATIENT',
      age,
      gender,
      village,
      district,
      bloodGroup,
      allergies,
      chronicConditions,
      address,
      emergencyContact
    } = req.body;

    // 1. Role check: Only Patients can self-register publicly
    const normRole = (role || 'PATIENT').toUpperCase();
    if (normRole !== 'PATIENT') {
      return res.status(403).json({
        success: false,
        error: 'Public registration is restricted to Patients. ASHA workers, Clinicians, Paramedics, and Hospital staff accounts are provisioned by District Health Administrators.'
      });
    }

    // 2. Field validations
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Full Name is required.' });
    }
    if (!phone || typeof phone !== 'string' || phone.trim().length < 8) {
      return res.status(400).json({ success: false, error: 'A valid Phone Number is required.' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Passwords do not match.' });
    }
    if (!age || isNaN(Number(age)) || Number(age) <= 0 || Number(age) > 130) {
      return res.status(400).json({ success: false, error: 'A valid age is required.' });
    }
    if (!gender || typeof gender !== 'string') {
      return res.status(400).json({ success: false, error: 'Gender is required.' });
    }
    if (!village || typeof village !== 'string' || !village.trim()) {
      return res.status(400).json({ success: false, error: 'Village name is required.' });
    }
    if (!district || typeof district !== 'string' || !district.trim()) {
      return res.status(400).json({ success: false, error: 'District name is required.' });
    }

    // 3. Duplicate checks
    const existingPhone = dbStore.users.find(u => u.phone.replace(/\D/g, '') === phone.replace(/\D/g, ''));
    if (existingPhone) {
      return res.status(409).json({ success: false, error: 'An account with this phone number already exists.' });
    }
    if (email && typeof email === 'string' && email.trim()) {
      const existingEmail = dbStore.users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase().trim());
      if (existingEmail) {
        return res.status(409).json({ success: false, error: 'An account with this email address already exists.' });
      }
    }

    // 4. Secure password hashing
    const passwordHash = await hashPassword(password);

    // 5. Parse arrays if strings provided
    const parsedAllergies = Array.isArray(allergies)
      ? allergies
      : typeof allergies === 'string' && allergies.trim()
      ? allergies.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const parsedConditions = Array.isArray(chronicConditions)
      ? chronicConditions
      : typeof chronicConditions === 'string' && chronicConditions.trim()
      ? chronicConditions.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    // 6. Save in store
    const { user, patient } = dbStore.registerPatient({
      name: name.trim(),
      phone: phone.trim(),
      email: email && email.trim() ? email.toLowerCase().trim() : undefined,
      passwordHash,
      age: Number(age),
      gender: gender.trim(),
      villageName: village.trim(),
      district: district.trim(),
      bloodGroup: bloodGroup ? bloodGroup.trim() : 'Unknown',
      allergies: parsedAllergies,
      chronicConditions: parsedConditions,
      address: address ? address.trim() : undefined,
      emergencyContact: emergencyContact ? emergencyContact.trim() : undefined
    });

    // 7. Generate JWT token
    const token = generateToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      phone: user.phone,
      email: user.email,
      patientId: patient.id
    });

    const safeUser = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      patientId: patient.id,
      villageName: user.villageName,
      district: user.district
    };

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Welcome to AikyaCare!',
      token,
      user: safeUser,
      patient
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, error: 'Registration failed due to a server error.' });
  }
});

// Dedicated Sign In for all 6 Roles
apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { identifier, phone, email, password, role } = req.body;
    const loginId = identifier || phone || email;

    if (!loginId || typeof loginId !== 'string' || !loginId.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please enter your registered Email, Phone, or ID.'
      });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Password is required.'
      });
    }

    // Lookup user in store
    const user = dbStore.findUserByIdentifier(loginId.trim(), role);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Account not found for the provided ID/credentials and selected role.'
      });
    }

    // Role verification if role passed
    if (role) {
      const normalizedReqRole = role.toUpperCase();
      const userRole = user.role.toUpperCase();
      const isAsha = (normalizedReqRole === 'ASHA' && userRole === 'HEALTH_WORKER');
      const isAmb = (normalizedReqRole === 'AMBULANCE' && userRole === 'AMBULANCE_PARAMEDIC');
      const isHosp = (normalizedReqRole === 'HOSPITAL' && userRole === 'HOSPITAL_STAFF');
      const matches = isAsha || isAmb || isHosp || (userRole === normalizedReqRole);

      if (!matches) {
        return res.status(403).json({
          success: false,
          error: `Role mismatch: This account is registered as '${user.role}', but you selected '${role}'.`
        });
      }
    }

    // Verify password with bcrypt
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid password. Please check your credentials.'
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      phone: user.phone,
      email: user.email,
      patientId: user.patientId,
      doctorId: user.doctorId,
      workerId: user.workerId,
      ambulanceId: user.ambulanceId,
      hospitalId: user.hospitalId
    });

    const safeUser = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      patientId: user.patientId,
      doctorId: user.doctorId,
      workerId: user.workerId,
      ambulanceId: user.ambulanceId,
      hospitalId: user.hospitalId,
      specialization: user.specialization,
      villageName: user.villageName,
      district: user.district,
      vehicleNumber: user.vehicleNumber,
      hospitalName: user.hospitalName
    };

    return res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: safeUser
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: 'Login failed due to a server error.' });
  }
});

// Current User Verification endpoint
apiRouter.get('/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  const user = dbStore.findUserById(req.user.userId);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User account not found' });
  }
  const safeUser = {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    role: user.role,
    patientId: user.patientId,
    doctorId: user.doctorId,
    workerId: user.workerId,
    ambulanceId: user.ambulanceId,
    hospitalId: user.hospitalId,
    specialization: user.specialization,
    villageName: user.villageName,
    district: user.district,
    vehicleNumber: user.vehicleNumber,
    hospitalName: user.hospitalName
  };
  return res.json({ success: true, user: safeUser });
});

// Forgot Password / Recovery Guidance
apiRouter.post('/auth/forgot-password', (req: Request, res: Response) => {
  const { identifier, role } = req.body;
  return res.json({
    success: true,
    message: `Password reset request registered for ${identifier || 'account'}. For security in rural healthcare networks, contact your PHC Supervisor or Chief Medical Officer Desk for verification.`
  });
});

// ==================== PATIENTS ====================
apiRouter.get('/patients/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const patientId = req.user?.patientId;
  const patient = dbStore.patients.find(p => p.id === patientId || p.userId === req.user?.userId) || dbStore.patients[0];
  res.json({ success: true, patient, user: req.user });
});

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

apiRouter.put('/ambulance/:id/status', authenticateToken, requireRole('AMBULANCE_PARAMEDIC', 'HOSPITAL_STAFF', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { status, notes } = req.body;
  const updated = dbStore.updateEmergencyStatus(req.params.id, status, notes);
  if (!updated) return res.status(404).json({ error: 'Emergency not found' });
  res.json({ success: true, emergency: updated });
});

// ==================== APPOINTMENTS & TELEMEDICINE ====================
apiRouter.get('/appointments', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  let { patientId, doctorId } = req.query;
  if (req.user?.role === 'DOCTOR') doctorId = req.user.doctorId;
  if (req.user?.role === 'PATIENT') patientId = req.user.patientId;
  let list = dbStore.appointments;
  if (patientId) list = list.filter(a => a.patientId === patientId);
  if (doctorId) list = list.filter(a => a.doctorId === doctorId);
  res.json({ success: true, appointments: list, doctors: dbStore.doctors });
});

apiRouter.get('/discharges', authenticateToken, requireRole('DOCTOR', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const doctorId = req.user?.role === 'ADMIN' ? String(req.query.doctorId || '') : req.user?.doctorId;
  if (!doctorId) return res.status(400).json({ success: false, error: 'Doctor identity is required.' });
  res.json({ success: true, discharges: dbStore.getDischargedPatients(doctorId) });
});

apiRouter.get('/discharges/patient/:patientId', authenticateToken, requireRole('PATIENT', 'DOCTOR', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role === 'PATIENT' && req.user.patientId !== req.params.patientId) {
    return res.status(403).json({ success: false, error: 'You are not authorized to view this discharge.' });
  }
  res.json({ success: true, discharges: dbStore.dischargeRecords.filter(record => record.patientId === req.params.patientId) });
});

apiRouter.post('/appointments/:id/discharge', authenticateToken, requireRole('DOCTOR', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const doctorId = req.user?.role === 'ADMIN' ? String(req.body.doctorId || '') : req.user?.doctorId;
  if (!doctorId) return res.status(400).json({ success: false, error: 'Doctor identity is required.' });
  const discharge = dbStore.dischargeAppointment(req.params.id, doctorId, req.body);
  if (!discharge) return res.status(404).json({ success: false, error: 'Appointment not found for this doctor.' });
  res.json({ success: true, discharge });
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

apiRouter.post('/prescriptions', authenticateToken, requireRole('DOCTOR', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { patientId, doctorId, medications, instructions, diagnosis, followUpDate } = req.body;
  const effectiveDocId = req.user?.doctorId || doctorId || 'doc-1';
  const doctor = dbStore.doctors.find(d => d.id === effectiveDocId) || dbStore.doctors[0];

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

apiRouter.post('/health-worker/sync', authenticateToken, requireRole('HEALTH_WORKER', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
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

apiRouter.put('/hospitals/:id/beds', authenticateToken, requireRole('HOSPITAL_STAFF', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const updated = dbStore.updateHospitalBeds(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Hospital not found' });
  res.json({ success: true, hospital: updated });
});

apiRouter.patch('/hospitals/:id/beds', authenticateToken, requireRole('HOSPITAL_STAFF', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
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
apiRouter.get('/admin/analytics', authenticateToken, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
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

apiRouter.get('/admin/villages', authenticateToken, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, villages: dbStore.villageHealthIndices });
});

apiRouter.get('/admin/emergencies', authenticateToken, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
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
