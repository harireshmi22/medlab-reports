-- ═══════════════════════════════════════════════════════════════
-- MedLab Reports — Supabase Database Setup
-- Paste this ENTIRE script into your Supabase SQL Editor and click RUN.
-- ═══════════════════════════════════════════════════════════════

-- ─── Step 1: Clean up any existing tables/types ───────────────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TABLE IF EXISTS report_items CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS report_status CASCADE;

-- ─── Step 2: Create Custom Types/Enums ────────────────────────
CREATE TYPE user_role AS ENUM ('admin', 'lab_staff', 'patient');
CREATE TYPE report_status AS ENUM ('draft', 'pending', 'completed', 'published');

-- ─── Step 3: Create Tables ───────────────────────────────────

-- Profiles Table (Maps to Supabase Auth Users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'patient',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patients Table (Clinical Details & Demographics)
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  age INT,
  gender TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  blood_group TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports Table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_no TEXT UNIQUE NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status report_status DEFAULT 'draft',
  notes TEXT,
  pdf_url TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Report Items Table (Extracted blood chemistry levels)
CREATE TABLE report_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  result_value TEXT,
  unit TEXT,
  normal_range TEXT,
  flag TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Step 4: Enable Row Level Security (RLS) ──────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_items ENABLE ROW LEVEL SECURITY;

-- ─── Step 5: Configure RLS Policies ───────────────────────────

-- 1. Profiles Table Policies
CREATE POLICY "Allow users to read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow staff to read all profiles" ON profiles
  FOR SELECT USING (
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('admin', 'lab_staff')
  );

CREATE POLICY "Allow users to update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow trigger/admin to insert profiles" ON profiles
  FOR INSERT WITH CHECK (true);

-- 2. Patients Table Policies
CREATE POLICY "Allow patients to read own clinical record" ON patients
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Allow staff to view all patients" ON patients
  FOR SELECT USING (
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('admin', 'lab_staff')
  );

CREATE POLICY "Allow staff to manage patients" ON patients
  FOR ALL USING (
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('admin', 'lab_staff')
  );

-- 3. Reports Table Policies
CREATE POLICY "Allow patients to read own reports" ON reports
  FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE profile_id = auth.uid())
  );

CREATE POLICY "Allow staff to select all reports" ON reports
  FOR SELECT USING (
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('admin', 'lab_staff')
  );

CREATE POLICY "Allow staff to manage reports" ON reports
  FOR ALL USING (
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('admin', 'lab_staff')
  );

-- 4. Report Items Table Policies
CREATE POLICY "Allow patients to read own report metrics" ON report_items
  FOR SELECT USING (
    report_id IN (
      SELECT r.id FROM reports r
      JOIN patients p ON r.patient_id = p.id
      WHERE p.profile_id = auth.uid()
    )
  );

CREATE POLICY "Allow staff to select all report metrics" ON report_items
  FOR SELECT USING (
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('admin', 'lab_staff')
  );

CREATE POLICY "Allow staff to manage report metrics" ON report_items
  FOR ALL USING (
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('admin', 'lab_staff')
  );

-- ─── Step 6: Create Sync Trigger for Supabase Auth ────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    coalesce(NEW.raw_user_meta_data ->> 'name', 'New Patient'),
    NEW.phone,
    coalesce((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'patient'::public.user_role)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ─── Step 7: Retroactive User Sync & confirm Confirmation ──────
-- Syncs existing auth users who might be missing from public.profiles
INSERT INTO public.profiles (id, full_name, role)
SELECT id, coalesce(raw_user_meta_data ->> 'name', email), 'patient'::user_role
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Force email confirmation on existing users so they can log in
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;

-- ─── Step 8: Enable Real-time Replication ─────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE reports;
ALTER PUBLICATION supabase_realtime ADD TABLE patients;
ALTER PUBLICATION supabase_realtime ADD TABLE report_items;
