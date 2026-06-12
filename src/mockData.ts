import { Patient, Report } from './types';

export const mockPatients: Patient[] = [
  {
    id: 'P-409122',
    name: 'John Doe',
    email: 'john.doe@medical.com',
    age: 34,
    gender: 'Male',
    bloodGroup: 'A+',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhVNkbYwWmffHwwpAB6BQUi7ghb0wxiUOBEOAAXjVwSkFm1fSpfMUmue8WTk-VypCB7OMYOh5bBlOKOOhWwjwGMNh1UFRosynieP4dnk50r20Mt08OUtFABFvpd3ea6LQoN4VN2nycW-eGeeFuwv-3bO52JTE0to2mDtl4IsKHTR1zAaL0hjiAm-RK_v-1RHHu37QcSoWbJeC8n0vIGfIowJTi_baN_1Ax9kPQXbGCcAf8b3jzq5ohjvYlYC7txxKrubcnjoas1g',
    phone: '+1 (555) 382-9012'
  },
  {
    id: 'P-409123',
    name: 'Elena Smith',
    email: 'elena.smith@clinical.com',
    age: 28,
    gender: 'Female',
    bloodGroup: 'O-',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbBSKa6b8gKOp6AaBmrDXQkjZOkktgagjpdA9bKYzMlqCxhFAMDrX0kYD8Ll6m_gUTLQrUpksEH2dYq5JDoAVw761hdirEIKfGX3YgzgfqNHRtGBQYLQPordOqYAUrOfm3mq6FSi0TvOOXGutmN3BHO3K0qg402dP3DRsJ3GQGK9broOYLBEyVunn6bT95adMZFakzeux70nLmbyUYldrmpaE16QALu4w6kts-5AC9QrGTsRsLuQluNPXwRTsF9lh-yseHJHNLtQ',
    phone: '+1 (555) 782-3145'
  },
  {
    id: 'P-409124',
    name: 'Marcus Brown',
    email: 'marcus.b@outlook.com',
    age: 45,
    gender: 'Male',
    bloodGroup: 'B+',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGobGhAdIKclk7giBtU7JvH3p5uPJTcz0i07XslLEXCN1OmFWZpVDsfGDGKpCmCwymNqyRZIwNvQrwSEL7qvN7VGJoIdseHIb2BW0L-wMHBnnHc512lhh2y7_wg6gTDiiO1XTW1fqejFe2qxZHtjJ3EMT-AsXCbWtZNlWj7knEIA-mvp_D78ShJbJgsrb1wXYgkLPTYWUeFAyuWMg5bOaOZ1tpn4DTTSohAyYBg4OBu4sOy6xUmwq_MmauBDRJuQncElq8Brr4ow',
    phone: '+1 (555) 901-4478'
  },
  {
    id: 'P-409125',
    name: 'Rachel White',
    email: 'rachelw@gmail.com',
    age: 52,
    gender: 'Female',
    bloodGroup: 'AB+',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0xrO9WmYNlEa1fJDt61WWIW-H9MKffduo2eRn0HeqF23fNZQowMNF_or0tirOF63wLYkm-k7Y1dnJdVzhrjDc1OXqe5-7TBZGjqU5XPitIb_P-S8Z-EAiKEYZdg08uMd-5Zwy6nodWBfjcs-qy8UqEVpJehkxXO0j0LcFolY6rWDwVgfUqnwvYSy1ppBUsp97cOMeqYS6XXkZ_egFHLaHq1iiHYept-9E6DQD2uQ10vrrrNKIRLvUZN0Atpef8Fk0SrG47dfAJQ',
    phone: '+1 (555) 438-2091'
  }
];

export const mockReports: Report[] = [
  {
    id: 'ML-8842-2023',
    labRef: 'L-9021',
    patientId: 'P-409122',
    patientName: 'John Doe',
    date: 'Oct 24, 2023',
    title: 'Lipid Profile & Glucose',
    referrer: 'Dr. A. Gupta',
    patientAlertRequired: true,
    alertText: 'Your Cholesterol and LDL levels are significantly higher than the recommended healthy range. Consult your physician immediately.',
    doctorRemarks: 'The patient shows hyperlipidemia with significantly elevated LDL and total cholesterol levels. Borderline fasting glucose suggests early metabolic monitoring is required. Recommend low-fat, high-fiber diet and immediate follow-up with a cardiologist for lipid-lowering therapy evaluation.',
    labNote: 'Samples processed under controlled conditions (Room Temp: 22°C). All quality controls verified. Re-testing recommended in 12 weeks post-lifestyle intervention.',
    items: [
      { id: 'item-1', name: 'Hemoglobin (Hb)', result: 14.2, unit: 'g/dL', minNormal: 13.5, maxNormal: 17.5, status: 'NORMAL' },
      { id: 'item-2', name: 'Fasting Blood Sugar', result: 110, unit: 'mg/dL', minNormal: 70, maxNormal: 100, status: 'BORDERLINE' },
      { id: 'item-3', name: 'Total Cholesterol', result: 240, unit: 'mg/dL', minNormal: 120, maxNormal: 200, status: 'HIGH' },
      { id: 'item-4', name: 'Triglycerides', result: 145, unit: 'mg/dL', minNormal: 30, maxNormal: 150, status: 'NORMAL' },
      { id: 'item-5', name: 'LDL Cholesterol', result: 162, unit: 'mg/dL', minNormal: 0, maxNormal: 100, status: 'HIGH' },
      { id: 'item-6', name: 'HDL Cholesterol', result: 42, unit: 'mg/dL', minNormal: 40, maxNormal: 60, status: 'NORMAL' }
    ]
  },
  {
    id: 'ML-88209',
    labRef: 'L-9025',
    patientId: 'P-409123',
    patientName: 'Elena Smith',
    date: 'Oct 24, 2024',
    title: 'Comprehensive Blood Panel',
    referrer: 'Dr. Sarah Miller',
    patientAlertRequired: true,
    alertText: 'Hemoglobin and oxygen carrying capacities fluctuate. Urgent review of hematological profile advised.',
    doctorRemarks: 'Patient manifests symptoms of acute fatigue and clinically critical hemoglobin reduction. Requires immediate therapeutic assessment and dietary correction. Iron supplementation advised.',
    labNote: 'Verified with secondary analyzer calibration. Results flagged as emergency notification.',
    items: [
      { id: 'item-1', name: 'Hemoglobin (Hb)', result: 9.8, unit: 'g/dL', minNormal: 12.0, maxNormal: 16.0, status: 'CRITICAL' },
      { id: 'item-2', name: 'Fasting Blood Sugar', result: 85, unit: 'mg/dL', minNormal: 70, maxNormal: 100, status: 'NORMAL' },
      { id: 'item-3', name: 'Total Cholesterol', result: 175, unit: 'mg/dL', minNormal: 120, maxNormal: 200, status: 'NORMAL' },
      { id: 'item-4', name: 'Triglycerides', result: 110, unit: 'mg/dL', minNormal: 30, maxNormal: 150, status: 'NORMAL' },
      { id: 'item-5', name: 'White Blood Cell (WBC)', result: 7.2, unit: 'x10³/µL', minNormal: 4.5, maxNormal: 11.0, status: 'NORMAL' }
    ]
  },
  {
    id: 'ML-88208',
    labRef: 'L-9026',
    patientId: 'P-409124',
    patientName: 'Marcus Brown',
    date: 'Oct 23, 2024',
    title: 'Metabolic & Sugar Dynamics',
    referrer: 'Dr. Robert King',
    patientAlertRequired: false,
    doctorRemarks: 'Sugar levels remain elevated. Advised tight carbohydrate spacing and continuation of current treatment plan. Follow up in 4 weeks.',
    labNote: 'Samples processed within 30 minutes of extraction. Controls within reference limits.',
    items: [
      { id: 'item-1', name: 'Hemoglobin (Hb)', result: 15.1, unit: 'g/dL', minNormal: 13.5, maxNormal: 17.5, status: 'NORMAL' },
      { id: 'item-2', name: 'Fasting Blood Sugar', result: 145, unit: 'mg/dL', minNormal: 70, maxNormal: 100, status: 'HIGH' },
      { id: 'item-3', name: 'Total Cholesterol', result: 190, unit: 'mg/dL', minNormal: 120, maxNormal: 200, status: 'NORMAL' }
    ]
  },
  {
    id: 'ML-88207',
    labRef: 'L-9027',
    patientId: 'P-409125',
    patientName: 'Rachel White',
    date: 'Oct 23, 2024',
    title: 'Routine CBC Examination',
    referrer: 'Dr. Sarah Miller',
    patientAlertRequired: false,
    doctorRemarks: 'Slightly low hemoglobin density but within stable physiological boundaries. Increase green leafy vegetable intake.',
    labNote: 'Sample normal. No anomalous cells detected.',
    items: [
      { id: 'item-1', name: 'Hemoglobin (Hb)', result: 11.5, unit: 'g/dL', minNormal: 12.0, maxNormal: 16.0, status: 'LOW' },
      { id: 'item-2', name: 'White Blood Cell (WBC)', result: 5.8, unit: 'x10³/µL', minNormal: 4.5, maxNormal: 11.0, status: 'NORMAL' },
      { id: 'item-3', name: 'Platelets', result: 220, unit: 'k/µL', minNormal: 150, maxNormal: 450, status: 'NORMAL' }
    ]
  }
];

export const staticMetrics = {
  totalDelivered: '2.4M',
  activePatients: '15k+',
  uptimeSla: '99.9%',
  encryption: '256-bit'
};
