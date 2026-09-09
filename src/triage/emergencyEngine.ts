/**
 * Layer 2 & Layer 3: Deterministic Emergency Risk Engine & Explainable Scorer
 * 
 * IMPORTANT CLINICAL SAFETY DISCLAIMER:
 * These rules are illustrative decision-support guidelines for hackathon/demonstration
 * and must NOT be presented as clinically validated. Qualified clinicians and local health authorities
 * must formally review, calibrate, and validate all clinical rules before any real-world deployment.
 */

import { TriageInput, TriageResult, UrgencyLevel, CarePathway, RiskScoreBreakdown } from '../types';

interface DangerRule {
  id: string;
  name: string;
  category: 'CARDIOVASCULAR' | 'RESPIRATORY' | 'NEUROLOGICAL' | 'TRAUMA' | 'PEDIATRIC' | 'OBSTETRIC' | 'GENERAL';
  keywordsEn: string[];
  keywordsTe: string[];
  basePoints: number;
  isHardCritical: boolean; // Triggers immediate RED override
  reason: string;
}

export const DANGER_RULES: DangerRule[] = [
  {
    id: 'CHEST_PAIN_SEVERE',
    name: 'Severe Chest Pain / Pressure',
    category: 'CARDIOVASCULAR',
    keywordsEn: ['chest pain', 'heart pain', 'pressure in chest', 'crushing chest', 'sweating with chest pain', 'angina', 'left arm pain'],
    keywordsTe: ['ఛాతీ నొప్పి', 'గుండె నొప్పి', 'ఛాతీలో మంట', 'గుండె వద్ద నొప్పి'],
    basePoints: 35,
    isHardCritical: false, // combined with dyspnea/sweat becomes critical
    reason: 'Severe chest discomfort or radiating pressure can indicate acute myocardial infarction or acute coronary syndrome.'
  },
  {
    id: 'RESPIRATORY_DISTRESS',
    name: 'Severe Difficulty Breathing / Cyanosis',
    category: 'RESPIRATORY',
    keywordsEn: ['difficulty breathing', 'shortness of breath', 'gasping', 'blue lips', 'blue nails', 'struggling to breathe', 'choking', 'wheezing severe', 'breathless'],
    keywordsTe: ['శ్వాస తీసుకోవడంలో ఇబ్బంది', 'ఆయాసం', 'శ్వాస ఆడకపోవడం', 'పెదవులు నీలంగా మారడం'],
    basePoints: 35,
    isHardCritical: false,
    reason: 'Acute respiratory distress or cyanosis indicates compromised oxygenation requiring immediate evaluation.'
  },
  {
    id: 'UNCONSCIOUSNESS',
    name: 'Loss of Consciousness / Unresponsive',
    category: 'NEUROLOGICAL',
    keywordsEn: ['unconscious', 'fainted', 'passed out', 'unresponsive', 'coma', 'collapsed', 'blacked out'],
    keywordsTe: ['స్పృహ కోల్పోవడం', 'సృహ తప్పడం', 'కళ్ళు తిరిగి పడిపోవడం', 'స్పృహ లేదు'],
    basePoints: 45,
    isHardCritical: true,
    reason: 'Sudden loss of consciousness or unresponsiveness is a critical neurological/hemodynamic emergency.'
  },
  {
    id: 'STROKE_SIGNS',
    name: 'Stroke-like Symptoms (FAST)',
    category: 'NEUROLOGICAL',
    keywordsEn: ['face drooping', 'arm weakness', 'slurred speech', 'sudden numbness', 'one side paralysis', 'stroke', 'mouth twisted'],
    keywordsTe: ['ముఖం వంకర', 'మాట తడబడటం', 'ఒకవైపు పక్షవాతం', 'చెయ్యి కదలకపోవడం'],
    basePoints: 45,
    isHardCritical: true,
    reason: 'Acute focal neurological deficits (FAST signs) require immediate emergency stroke thrombolytic pathway.'
  },
  {
    id: 'SEVERE_BLEEDING',
    name: 'Severe Bleeding / Hemorrhage',
    category: 'TRAUMA',
    keywordsEn: ['severe bleeding', 'uncontrolled bleeding', 'heavy blood loss', 'vomiting blood', 'coughing blood', 'arterial bleed'],
    keywordsTe: ['రక్తం ఎక్కువగా కారడం', 'రక్తపు వాంతులు', 'తీవ్ర రక్తస్రావం'],
    basePoints: 45,
    isHardCritical: true,
    reason: 'Uncontrolled hemorrhage risks rapid hypovolemic shock.'
  },
  {
    id: 'SEIZURE_CONVULSIONS',
    name: 'Active Seizures / Convulsions',
    category: 'NEUROLOGICAL',
    keywordsEn: ['seizure', 'convulsion', 'fits', 'epileptic fit', 'shaking uncontrollably', 'tremors severe'],
    keywordsTe: ['ఫిట్స్', 'మూర్ఛ', 'వణుకు తీవ్రంగా ఉండటం'],
    basePoints: 40,
    isHardCritical: true,
    reason: 'Active or repeated seizures (status epilepticus risk) require immediate airway protection and medical stabilization.'
  },
  {
    id: 'ANAPHYLAXIS',
    name: 'Severe Allergic Reaction / Anaphylaxis',
    category: 'GENERAL',
    keywordsEn: ['throat swelling', 'unable to swallow', 'swollen tongue', 'anaphylaxis', 'bee sting reaction', 'severe allergy'],
    keywordsTe: ['గొంతు వాపు', 'నాలుక వాపు', 'తీవ్రమైన అలర్జీ'],
    basePoints: 45,
    isHardCritical: true,
    reason: 'Anaphylaxis leads to acute upper airway compromise and cardiovascular collapse.'
  },
  {
    id: 'HIGH_FEVER',
    name: 'High Fever / Hyperpyrexia',
    category: 'GENERAL',
    keywordsEn: ['high fever', 'burning fever', 'fever with chills', 'rigors', '103 fever', '104 fever', 'very hot body'],
    keywordsTe: ['తీవ్రమైన జ్వరం', 'ఎక్కువ జ్వరం', 'చలి జ్వరం', 'ఒళ్ళు కాలిపోవడం'],
    basePoints: 15,
    isHardCritical: false,
    reason: 'High grade fever indicates acute infectious or inflammatory process.'
  },
  {
    id: 'SEVERE_ABDOMINAL_PAIN',
    name: 'Acute Severe Abdominal Pain',
    category: 'GENERAL',
    keywordsEn: ['severe stomach pain', 'acute abdominal pain', 'belly pain severe', 'rigid abdomen', 'stomach burning severe'],
    keywordsTe: ['తీవ్ర కడుపు నొప్పి', 'కడుపు నొప్పి విపరీతంగా ఉండటం'],
    basePoints: 20,
    isHardCritical: false,
    reason: 'Severe acute abdomen can signify surgical emergencies (perforation, appendicitis, obstruction).'
  },
  {
    id: 'PREGNANCY_DANGER',
    name: 'Obstetric Danger Signs',
    category: 'OBSTETRIC',
    keywordsEn: ['pregnant bleeding', 'labor pain severe', 'water broke early', 'baby not moving', 'high bp in pregnancy', 'pregnancy headache severe'],
    keywordsTe: ['గర్భిణీ రక్తస్రావం', 'నొప్పులు రావడం', 'కడుపులో బిడ్డ కదలికలు లేకపోవడం'],
    basePoints: 40,
    isHardCritical: true,
    reason: 'Obstetric danger signs (antepartum hemorrhage, pre-eclampsia, fetal distress) demand urgent emergency care.'
  }
];

export function assessEmergencyRisk(input: TriageInput): TriageResult {
  const text = (input.symptoms || '').toLowerCase();
  const breakdown: RiskScoreBreakdown[] = [];
  const dangerSignsFound: string[] = [];
  let rawScore = 0;
  let hardCriticalTriggered = false;
  let hardCriticalReason = '';

  // 1. Evaluate Rule-Based Danger Signs (English & Telugu)
  for (const rule of DANGER_RULES) {
    const matchedEn = rule.keywordsEn.some(kw => text.includes(kw.toLowerCase()));
    const matchedTe = rule.keywordsTe.some(kw => text.includes(kw));

    if (matchedEn || matchedTe) {
      dangerSignsFound.push(rule.name);
      rawScore += rule.basePoints;
      breakdown.push({
        component: rule.name,
        points: rule.basePoints,
        reason: rule.reason
      });

      if (rule.isHardCritical) {
        hardCriticalTriggered = true;
        hardCriticalReason = rule.reason;
      }
    }
  }

  // Multi-symptom critical combination: Chest pain + Shortness of breath / Sweating
  const hasChestPain = text.includes('chest pain') || text.includes('ఛాతీ నొప్పి') || text.includes('గుండె నొప్పి');
  const hasBreathingDiff = text.includes('breath') || text.includes('shortness of breath') || text.includes('శ్వాస');
  const hasSweating = text.includes('sweat') || text.includes('చెమట') || text.includes('dizzy') || text.includes('తలతిరగడం');

  if (hasChestPain && (hasBreathingDiff || hasSweating)) {
    hardCriticalTriggered = true;
    hardCriticalReason = 'Combined presentation of chest pain with respiratory distress or autonomic sweating indicates high risk of acute coronary syndrome.';
    if (!dangerSignsFound.includes('Acute Coronary Syndrome Risk (Chest Pain + Dyspnea/Sweating)')) {
      dangerSignsFound.push('Acute Coronary Syndrome Risk (Chest Pain + Dyspnea/Sweating)');
      rawScore += 30;
      breakdown.push({
        component: 'Multi-Symptom Synergy (Chest Pain + Dyspnea/Autonomic Signs)',
        points: 30,
        reason: 'Combination of cardiac and autonomic symptoms significantly elevates acute cardiovascular mortality risk.'
      });
    }
  }

  // 2. Evaluate Objective Vital Signs (if provided)
  if (input.vitals) {
    const { spO2, heartRate, systolicBP, diastolicBP, temperature } = input.vitals;

    // SpO2
    if (spO2 !== undefined && spO2 > 0) {
      if (spO2 < 90) {
        rawScore += 40;
        hardCriticalTriggered = true;
        dangerSignsFound.push(`Severe Hypoxia (SpO2: ${spO2}%)`);
        breakdown.push({
          component: `Severe Hypoxemia (SpO2 ${spO2}%)`,
          points: 40,
          reason: 'Blood oxygen saturation below 90% indicates critical respiratory failure.'
        });
      } else if (spO2 < 94) {
        rawScore += 20;
        breakdown.push({
          component: `Moderate Hypoxia (SpO2 ${spO2}%)`,
          points: 20,
          reason: 'Blood oxygen saturation below 94% indicates abnormal gas exchange.'
        });
      }
    }

    // Heart rate
    if (heartRate !== undefined && heartRate > 0) {
      if (heartRate > 130 || heartRate < 45) {
        rawScore += 25;
        hardCriticalTriggered = true;
        dangerSignsFound.push(`Critical Arrhythmia/Tachycardia (${heartRate} bpm)`);
        breakdown.push({
          component: `Severe Pulse Anomaly (${heartRate} bpm)`,
          points: 25,
          reason: 'Severe tachy/bradycardia can precipitate hemodynamic collapse.'
        });
      } else if (heartRate > 110 || heartRate < 55) {
        rawScore += 15;
        breakdown.push({
          component: `Elevated/Abnormal Pulse (${heartRate} bpm)`,
          points: 15,
          reason: 'Compensatory tachycardia or relative bradycardia observed.'
        });
      }
    }

    // Blood Pressure
    if (systolicBP !== undefined && systolicBP > 0) {
      if (systolicBP > 180 || (diastolicBP && diastolicBP > 120)) {
        rawScore += 30;
        hardCriticalTriggered = true;
        dangerSignsFound.push(`Hypertensive Crisis (${systolicBP}/${diastolicBP} mmHg)`);
        breakdown.push({
          component: `Hypertensive Emergency (${systolicBP}/${diastolicBP ?? 0} mmHg)`,
          points: 30,
          reason: 'Risk of end-organ damage (intracranial hemorrhage, aortic dissection).'
        });
      } else if (systolicBP < 90) {
        rawScore += 35;
        hardCriticalTriggered = true;
        dangerSignsFound.push(`Hypotension / Shock Risk (${systolicBP} mmHg)`);
        breakdown.push({
          component: `Hypotension / Shock (${systolicBP} mmHg)`,
          points: 35,
          reason: 'Systolic blood pressure below 90 mmHg implies circulatory hypoperfusion.'
        });
      }
    }

    // Temperature
    if (temperature !== undefined && temperature > 0) {
      if (temperature >= 103.5) {
        rawScore += 20;
        breakdown.push({
          component: `Hyperpyrexia (${temperature}°F)`,
          points: 20,
          reason: 'Extreme febrile state increases metabolic demand and seizure threshold.'
        });
      } else if (temperature >= 101.0) {
        rawScore += 10;
        breakdown.push({
          component: `Moderate Fever (${temperature}°F)`,
          points: 10,
          reason: 'Febrile reaction to infection or inflammation.'
        });
      }
    }
  }

  // 3. Evaluate Age Risk Factor
  if (input.age < 5) {
    rawScore += 10;
    breakdown.push({
      component: 'Pediatric Vulnerability (<5 yrs)',
      points: 10,
      reason: 'Infants and young children decompensate rapidly with respiratory or febrile illness.'
    });
  } else if (input.age >= 65) {
    rawScore += 10;
    breakdown.push({
      component: 'Geriatric Risk Factor (>=65 yrs)',
      points: 10,
      reason: 'Elderly patients present with atypical symptoms and elevated comorbidity risk.'
    });
  }

  // 4. Evaluate Pre-existing Chronic Conditions
  if (input.chronicConditions && input.chronicConditions.length > 0) {
    const points = Math.min(input.chronicConditions.length * 5, 15);
    rawScore += points;
    breakdown.push({
      component: `Pre-existing Conditions (${input.chronicConditions.join(', ')})`,
      points: points,
      reason: 'Comorbidities lower physiologic reserve and heighten risk of acute decompensation.'
    });
  }

  // Cap final score at 100
  let finalScore = Math.min(Math.max(rawScore, 0), 100);

  // If deterministic hard critical rule triggered, guarantee at least score 85 (RED)
  if (hardCriticalTriggered && finalScore < 85) {
    finalScore = 88;
  }

  // Classify Urgency Level
  let urgency: UrgencyLevel = 'GREEN';
  let carePathway: CarePathway = 'HOME_MONITORING';
  let recommendedAction = 'Home monitoring with rest, oral fluids, and follow-up if symptoms persist.';
  let specialistRequired = 'Primary Care / Family Medicine';

  if (finalScore >= 81 || hardCriticalTriggered) {
    urgency = 'RED';
    carePathway = 'EMERGENCY_SOS';
    recommendedAction = 'Seek emergency medical care immediately. Call Emergency SOS or dispatch an ambulance right away.';
    specialistRequired = 'Emergency Medicine / Trauma Critical Care';
  } else if (finalScore >= 61) {
    urgency = 'ORANGE';
    carePathway = 'HOSPITAL_VISIT';
    recommendedAction = 'Urgent medical attention required today. Visit the nearest Community Health Centre (CHC) or District Hospital.';
    specialistRequired = 'Internal Medicine / General Physician';
  } else if (finalScore >= 31) {
    urgency = 'YELLOW';
    carePathway = 'PHC_VISIT';
    recommendedAction = 'Consult a doctor or visit your nearest Primary Health Centre (PHC) within 24–48 hours for clinical evaluation.';
    specialistRequired = 'Primary Care Physician / Medical Officer';
  } else {
    urgency = 'GREEN';
    carePathway = 'HOME_MONITORING';
    recommendedAction = 'Symptoms appear mild. Practice supportive home care, stay hydrated, and monitor for red flag signs.';
    specialistRequired = 'General Health / ASHA Worker Follow-up';
  }

  // Synthesize concise reasoning statements
  const reasoning: string[] = [];
  if (hardCriticalTriggered) {
    reasoning.push(hardCriticalReason || 'Critical danger sign identified by emergency rule engine.');
  }
  if (dangerSignsFound.length > 0) {
    reasoning.push(`Identified acute signs: ${dangerSignsFound.join(', ')}.`);
  }
  if (input.vitals && Object.keys(input.vitals).length > 0) {
    reasoning.push('Objective vital signs were factored into the clinical urgency calculation.');
  }
  if (reasoning.length === 0) {
    reasoning.push('No acute danger signs detected. Symptoms are consistent with mild self-limiting presentation.');
  }

  const extractedSymptomsList = dangerSignsFound.length > 0
    ? Array.from(new Set([...dangerSignsFound, input.symptoms.slice(0, 50)]))
    : [input.symptoms.slice(0, 60)];

  return {
    id: `tr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    urgency,
    riskScore: finalScore,
    carePathway,
    extractedSymptoms: extractedSymptomsList,
    duration: input.duration || 'Not specified',
    severity: input.severity || (finalScore > 60 ? 'severe' : finalScore > 30 ? 'moderate' : 'mild'),
    dangerSignsFound,
    possibleConcerns: dangerSignsFound.length > 0
      ? dangerSignsFound.map(ds => `Evaluation for ${ds}`)
      : ['Mild acute viral/functional syndrome', 'Sub-acute symptoms requiring observation'],
    recommendedAction,
    specialistRequired,
    reasoning,
    isSafetyRuleTriggered: hardCriticalTriggered,
    scoreBreakdown: breakdown,
    summary: hardCriticalTriggered
      ? `CRITICAL EMERGENCY: Severe danger signs detected (${dangerSignsFound.join(', ')}). Immediate hospital transfer and emergency stabilization required.`
      : `Triage evaluation concluded ${urgency} urgency (Risk Score: ${finalScore}/100). Recommended pathway: ${carePathway.replace(/_/g, ' ')}.`,
    disclaimer: 'AikyaCare provides preliminary AI-assisted health guidance and care navigation. It is not a medical diagnosis and does not replace a qualified healthcare professional. In an emergency, seek immediate professional medical assistance.',
    createdAt: new Date().toISOString()
  };
}
