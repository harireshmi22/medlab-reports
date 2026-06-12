export interface Patient {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  bloodGroup: string;
  avatar: string;
  phone: string;
}

export interface ReportItem {
  id: string;
  name: string;
  result: number;
  unit: string;
  minNormal: number;
  maxNormal: number;
  status: 'NORMAL' | 'BORDERLINE' | 'HIGH' | 'LOW' | 'CRITICAL';
}

export interface Report {
  id: string;
  labRef: string;
  patientId: string;
  patientName: string;
  date: string;
  title: string;
  referrer: string;
  items: ReportItem[];
  patientAlertRequired?: boolean;
  alertText?: string;
  doctorRemarks?: string;
  labNote?: string;
  pdf_url?: string;
}

export type ViewState = 'LANDING' | 'PASS_DASHBOARD' | 'DEEP_REPORT' | 'ADMIN_DASHBOARD' | 'Dashboard';
export type SubNavbarTab = 'Home' | 'Features' | 'How it Works';
export type DashboardSideTab = 'Dashboard' | 'Patients' | 'Reports' | 'Add Report' | 'Analytics' | 'Chat' | 'Settings';

export interface ChatMessage {
  id: string;
  created_at: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'patient' | 'admin';
  recipient_id: string;
  content: string;
}
