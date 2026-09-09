/**
 * Telugu Localization & Clinical Vocabulary for AikyaCare
 */

export interface TranslationDict {
  appName: string;
  tagline: string;
  altTagline: string;
  disclaimerText: string;
  emergencySos: string;
  checkSymptoms: string;
  bookDoctor: string;
  medicalRecords: string;
  findHospital: string;
  talkToDoctor: string;
  offlineMode: string;
  onlineMode: string;
  syncing: string;
  casesWaitingToSync: string;
  allSynced: string;
  speakSymptoms: string;
  listening: string;
  urgencyLabels: {
    GREEN: string;
    YELLOW: string;
    ORANGE: string;
    RED: string;
  };
  carePathways: {
    HOME_MONITORING: string;
    PHC_VISIT: string;
    DOCTOR_CONSULTATION: string;
    SPECIALIST_CONSULTATION: string;
    HOSPITAL_VISIT: string;
    EMERGENCY_SOS: string;
    AMBULANCE_DISPATCH: string;
  };
  sampleSymptoms: Array<{
    label: string;
    textEn: string;
    textTe: string;
    severity: 'mild' | 'moderate' | 'severe';
  }>;
}

export const TELUGU_DATA: TranslationDict = {
  appName: 'ఐక్యకేర్ (AikyaCare)',
  tagline: 'లక్షణాల నుండి సరైన చికిత్స వరకు — ఎక్కడికైనా.',
  altTagline: 'ప్రతి గ్రామానికి AI ఆధారిత ఆరోగ్య సమన్వయం.',
  disclaimerText: 'ఐక్యకేర్ ప్రాథమిక AI ఆరోగ్య మార్గదర్శకత్వాన్ని మరియు సంరక్షణ నావిగేషన్‌ను మాత్రమే అందిస్తుంది. ఇది వైద్య నిర్ధారణ (Diagnosis) కాదు మరియు వైద్యుడికి ప్రత్యామ్నాయం కాదు. అత్యవసర పరిస్థితుల్లో వెంటనే అత్యవసర వైద్య సేవలను ఆశ్రయించండి.',
  emergencySos: 'అత్యవసర SOS (Emergency)',
  checkSymptoms: 'లక్షణాలను తనిఖీ చేయండి',
  bookDoctor: 'వైద్యుడిని సంప్రదించండి',
  medicalRecords: 'వైద్య రికార్డులు',
  findHospital: 'ఆసుపత్రిని కనుగొనండి',
  talkToDoctor: 'వైద్యునితో మాట్లాడండి',
  offlineMode: 'ఆఫ్‌లైన్ మోడ్ — స్థానిక ట్రయాజ్ అందుబాటులో ఉంది',
  onlineMode: 'ఆన్‌లైన్ — కనెక్ట్ అయింది',
  syncing: 'సమాచారాన్ని సమకాలీకరిస్తోంది...',
  casesWaitingToSync: 'కేసులు సమకాలీకరణ కోసం వేచి ఉన్నాయి',
  allSynced: 'అన్ని కేసులు విజయవంతంగా సమకాలీకరించబడ్డాయి',
  speakSymptoms: 'లక్షణాలను మాట్లాడండి (వాయిస్)',
  listening: 'వింటోంది... మాట్లాడండి',
  urgencyLabels: {
    GREEN: 'గ్రీన్: ఇంటి వద్ద పర్యవేక్షణ',
    YELLOW: 'ఎల్లో: డాక్టర్ / PHC సంప్రదింపు',
    ORANGE: 'ఆరెంజ్: తక్షణ వైద్య సహాయం',
    RED: 'రెడ్: అత్యవసర SOS / ఆసుపత్రికి తరలించండి'
  },
  carePathways: {
    HOME_MONITORING: 'ఇంటి వద్ద సంరక్షణ & పర్యవేక్షణ',
    PHC_VISIT: 'ప్రాథమిక ఆరోగ్య కేంద్రం (PHC) సందర్శన',
    DOCTOR_CONSULTATION: 'వైద్యుని సంప్రదింపు',
    SPECIALIST_CONSULTATION: 'నిపుణులైన వైద్యుని సంప్రదింపు',
    HOSPITAL_VISIT: 'సమీప ఆసుపత్రికి తరలింపు',
    EMERGENCY_SOS: 'తక్షణ అత్యవసర SOS',
    AMBULANCE_DISPATCH: 'అంబులెన్స్ పిలవండి'
  },
  sampleSymptoms: [
    {
      label: 'తీవ్ర గుండె నొప్పి & ఆయాసం (Chest Pain + Dyspnea)',
      textTe: 'నా తండ్రికి తీవ్రమైన ఛాతీ నొప్పి ఉంది, బాగా చెమటలు పడుతున్నాయి మరియు శ్వాస తీసుకోవడంలో తీవ్ర ఇబ్బందిగా ఉంది.',
      textEn: 'My father has severe crushing chest pain, sweating profusely, and struggling to breathe.',
      severity: 'severe'
    },
    {
      label: '3 రోజులుగా జ్వరం మరియు దగ్గు (Fever & Cough 3 days)',
      textTe: 'నాకు మూడు రోజుల నుండి జ్వరం ఉంది మరియు పొడి దగ్గు ఉంది. ఒళ్ళు నొప్పులు కూడా ఉన్నాయి.',
      textEn: 'I have had fever and dry cough for three days along with body aches.',
      severity: 'moderate'
    },
    {
      label: 'పిల్లలలో నీరసం మరియు వాంతులు (Child Weakness & Vomiting)',
      textTe: 'చిన్న పిల్లాడికి విపరీతమైన వాంతులు అవుతున్నాయి, నీరసంగా ఉన్నాడు మరియు స్పృహ తప్పుతున్నాడు.',
      textEn: 'Young child has severe vomiting, extreme lethargy, and is slipping into unconsciousness.',
      severity: 'severe'
    },
    {
      label: 'గర్భిణీ స్త్రీకి రక్తస్రావం (Maternal Danger Signs)',
      textTe: 'గర్భిణీ స్త్రీకి తీవ్రమైన కడుపు నొప్పి మరియు రక్తస్రావం జరుగుతోంది.',
      textEn: 'Pregnant mother experiencing acute severe abdominal pain and heavy bleeding.',
      severity: 'severe'
    },
    {
      label: 'సాధారణ జలుబు మరియు గొంతు నొప్పి (Mild Cold & Sore Throat)',
      textTe: 'సాధారణ జలుబు, ముక్కు కారడం మరియు కొద్దిగా గొంతు గరగర ఉంది.',
      textEn: 'Mild cold symptoms, runny nose, and minor throat irritation.',
      severity: 'mild'
    }
  ]
};

export const ENGLISH_DATA: TranslationDict = {
  appName: 'AikyaCare',
  tagline: 'From Symptoms to the Right Care — Anywhere.',
  altTagline: 'AI-powered healthcare coordination for every village.',
  disclaimerText: 'AikyaCare provides preliminary AI-assisted health guidance and care navigation. It is not a medical diagnosis and does not replace a qualified healthcare professional. In an emergency, seek immediate professional medical assistance.',
  emergencySos: 'Emergency SOS',
  checkSymptoms: 'Check Symptoms',
  bookDoctor: 'Book Doctor',
  medicalRecords: 'Medical Records',
  findHospital: 'Find Hospital',
  talkToDoctor: 'Talk to Doctor',
  offlineMode: 'Offline Mode — Local Triage Available',
  onlineMode: 'Online — Connected',
  syncing: 'Syncing pending records...',
  casesWaitingToSync: 'cases waiting to sync',
  allSynced: 'All cases synced successfully',
  speakSymptoms: 'Speak Symptoms (Voice)',
  listening: 'Listening... Please speak now',
  urgencyLabels: {
    GREEN: 'GREEN: Home Care / Monitor',
    YELLOW: 'YELLOW: Consult Doctor / PHC',
    ORANGE: 'ORANGE: Urgent Medical Attention',
    RED: 'RED: Emergency / SOS'
  },
  carePathways: {
    HOME_MONITORING: 'Home Care & Monitoring',
    PHC_VISIT: 'PHC Visit (Within 24-48h)',
    DOCTOR_CONSULTATION: 'Doctor Consultation',
    SPECIALIST_CONSULTATION: 'Specialist Consultation',
    HOSPITAL_VISIT: 'Hospital Visit Today',
    EMERGENCY_SOS: 'Immediate Emergency SOS',
    AMBULANCE_DISPATCH: 'Ambulance Dispatch Required'
  },
  sampleSymptoms: [
    {
      label: 'Severe Chest Pain & Sweating (Cardiac SOS)',
      textEn: 'My father has severe crushing chest pain, sweating profusely, and struggling to breathe.',
      textTe: 'నా తండ్రికి తీవ్రమైన ఛాతీ నొప్పి ఉంది, బాగా చెమటలు పడుతున్నాయి మరియు శ్వాస తీసుకోవడంలో తీవ్ర ఇబ్బందిగా ఉంది.',
      severity: 'severe'
    },
    {
      label: '3-Day Fever and Productive Cough',
      textEn: 'Fever of 102°F and persistent cough for three days with general fatigue.',
      textTe: 'నాకు మూడు రోజుల నుండి జ్వరం ఉంది మరియు పొడి దగ్గు ఉంది. ఒళ్ళు నొప్పులు కూడా ఉన్నాయి.',
      severity: 'moderate'
    },
    {
      label: 'Pediatric Lethargy and Dehydration',
      textEn: '3-year-old child has high fever, frequent loose stools, sunken eyes, and won’t take fluids.',
      textTe: 'చిన్న పిల్లాడికి విపరీతమైన వాంతులు అవుతున్నాయి, నీరసంగా ఉన్నాడు మరియు స్పృహ తప్పుతున్నాడు.',
      severity: 'severe'
    },
    {
      label: 'Obstetric Emergency Signs',
      textEn: '7-month pregnant mother with severe headache, blurred vision, and high blood pressure.',
      textTe: 'గర్భిణీ స్త్రీకి తీవ్రమైన కడుపు నొప్పి మరియు రక్తస్రావం జరుగుతోంది.',
      severity: 'severe'
    },
    {
      label: 'Mild Cold and Seasonal Rhinitis',
      textEn: 'Mild runny nose, sneezing, and slight scratchy throat for 1 day. No fever.',
      textTe: 'సాధారణ జలుబు, ముక్కు కారడం మరియు కొద్దిగా గొంతు గరగర ఉంది.',
      severity: 'mild'
    }
  ]
};

export const teluguTranslations = {
  en: ENGLISH_DATA,
  te: TELUGU_DATA
};

