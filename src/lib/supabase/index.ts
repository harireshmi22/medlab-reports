import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

const STORAGE_KEY = 'medlab_supabase_config';

export function saveSupabaseConfig(config: SupabaseConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function getSupabaseConfig(): SupabaseConfig | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return null;
    }
  }

  // Fallback to environment variables
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (envUrl && envKey) {
    return { url: envUrl, anonKey: envKey };
  }

  return null;
}

export function clearSupabaseConfig() {
  localStorage.removeItem(STORAGE_KEY);
}

let supabaseInstance: SupabaseClient | null = null;
let currentConfigKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config) {
    supabaseInstance = null;
    return null;
  }

  const configKey = `${config.url}-${config.anonKey}`;
  if (supabaseInstance && currentConfigKey === configKey) {
    return supabaseInstance;
  }

  try {
    supabaseInstance = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      }
    });
    currentConfigKey = configKey;
    return supabaseInstance;
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    return null;
  }
}

export async function uploadReportPdf(fileName: string, file: Blob): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    // Unique path in bucket
    const filePath = `${Date.now()}_${fileName.replace(/\s+/g, '_')}`;
    const { data, error } = await supabase.storage
      .from('medlab-reports-bucket')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('medlab-reports-bucket')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (err) {
    console.error('Error uploading PDF to storage:', err);
    return null;
  }
}

// Helper: Create required tables in Supabase if they don't exist
export function getSetupSQL(): string {
  return `
-- Create profiles table
CREATE TABLE IF NOT EXISTS medlab_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'patient',
  age INTEGER DEFAULT 30,
  gender TEXT DEFAULT 'Not specified',
  blood_group TEXT DEFAULT 'O+',
  avatar TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reports table  
CREATE TABLE IF NOT EXISTS medlab_reports (
  id TEXT PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES medlab_profiles(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  lab_ref TEXT,
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  referrer TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  patient_alert_required BOOLEAN DEFAULT FALSE,
  alert_text TEXT,
  doctor_remarks TEXT,
  lab_note TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS medlab_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  content TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE medlab_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE medlab_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE medlab_messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own profile" ON medlab_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can read all profiles" ON medlab_profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM medlab_profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can insert own profile" ON medlab_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON medlab_profiles FOR UPDATE USING (auth.uid() = id);

-- Reports
CREATE POLICY "Patients can read own reports" ON medlab_reports FOR SELECT USING (patient_id = auth.uid());
CREATE POLICY "Admins can read all reports" ON medlab_reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM medlab_profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can insert reports" ON medlab_reports FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM medlab_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Messages
CREATE POLICY "Users can read own messages" ON medlab_messages FOR SELECT USING (
  sender_id = auth.uid()::text OR recipient_id = auth.uid()::text
);
CREATE POLICY "Users can insert messages" ON medlab_messages FOR INSERT WITH CHECK (sender_id = auth.uid()::text);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE medlab_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE medlab_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE medlab_messages;
  `.trim();
}
