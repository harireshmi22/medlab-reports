-- ─── Step 0: Clean up any existing stale records first ────────
DELETE FROM public.report_items;
DELETE FROM public.reports;
DELETE FROM public.patients;
DELETE FROM public.profiles;

DELETE FROM auth.identities WHERE provider_id IN ('admin@medlab.com', 'john.doe@medlab.com', 'elena.smith@medlab.com');
DELETE FROM auth.users WHERE email IN ('admin@medlab.com', 'john.doe@medlab.com', 'elena.smith@medlab.com');

-- ─── Step 1: Seed Profiles & Auth Users ───────────────────────

-- 1a. Insert Auth Users
-- Admin
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, aud, role)
VALUES (
  'aadaad00-ad00-ad00-ad00-aadaad000000',
  'admin@medlab.com',
  crypt('medlab123456', gen_salt('bf')),
  NOW(),
  '{"name": "Dr. Sarah Chen", "role": "admin"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  'authenticated', 'authenticated'
);

-- Patients
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, aud, role)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'john.doe@medlab.com',
  crypt('medlab123456', gen_salt('bf')),
  NOW(),
  '{"name": "John Doe", "role": "patient"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  'authenticated', 'authenticated'
);

INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, aud, role)
VALUES (
  'a2222222-2222-2222-2222-222222222222',
  'elena.smith@medlab.com',
  crypt('medlab123456', gen_salt('bf')),
  NOW(),
  '{"name": "Elena Smith", "role": "patient"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  'authenticated', 'authenticated'
);


-- 1b. Insert Auth Identities
INSERT INTO auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
VALUES (
  'aadaad00-ad00-ad00-ad00-aadaad000000',
  'aadaad00-ad00-ad00-ad00-aadaad000000',
  'admin@medlab.com',
  'email',
  '{"sub":"aadaad00-ad00-ad00-ad00-aadaad000000","email":"admin@medlab.com"}'::jsonb,
  NOW(), NOW(), NOW()
);

INSERT INTO auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'a1111111-1111-1111-1111-111111111111',
  'john.doe@medlab.com',
  'email',
  '{"sub":"a1111111-1111-1111-1111-111111111111","email":"john.doe@medlab.com"}'::jsonb,
  NOW(), NOW(), NOW()
);

INSERT INTO auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
VALUES (
  'a2222222-2222-2222-2222-222222222222',
  'a2222222-2222-2222-2222-222222222222',
  'elena.smith@medlab.com',
  'email',
  '{"sub":"a2222222-2222-2222-2222-222222222222","email":"elena.smith@medlab.com"}'::jsonb,
  NOW(), NOW(), NOW()
);


-- 1c. Sync Profiles Table
INSERT INTO public.profiles (id, full_name, role) VALUES
('aadaad00-ad00-ad00-ad00-aadaad000000', 'Dr. Sarah Chen', 'admin'),
('a1111111-1111-1111-1111-111111111111', 'John Doe', 'patient'),
('a2222222-2222-2222-2222-222222222222', 'Elena Smith', 'patient')
ON CONFLICT (id) DO NOTHING;

-- ─── Step 2: Seed Patients ───────────────────────────────────
INSERT INTO public.patients (id, profile_id, name, age, gender, phone, email, address) VALUES
(
  'd1111111-1111-1111-1111-111111111111',
  'a1111111-1111-1111-1111-111111111111',
  'John Doe',
  34,
  'Male',
  '+1 (555) 382-9012',
  'john.doe@medlab.com',
  '123 Medical Way, Health City'
),
(
  'd2222222-2222-2222-2222-222222222222',
  'a2222222-2222-2222-2222-222222222222',
  'Elena Smith',
  28,
  'Female',
  '+1 (555) 782-3145',
  'elena.smith@medlab.com',
  '456 Clinical Road, Science Town'
);

-- ─── Step 3: Seed Reports ────────────────────────────────────
INSERT INTO public.reports (id, report_no, patient_id, created_by, status, notes) VALUES
(
  'e1111111-1111-1111-1111-111111111111',
  'ML-8842-2023',
  'd1111111-1111-1111-1111-111111111111',
  'aadaad00-ad00-ad00-ad00-aadaad000000',
  'published',
  'The patient shows hyperlipidemia with elevated LDL and total cholesterol. Recommend standard low-fat diet.'
),
(
  'e2222222-2222-2222-2222-222222222222',
  'ML-88209',
  'd2222222-2222-2222-2222-222222222222',
  'aadaad00-ad00-ad00-ad00-aadaad000000',
  'published',
  'Patient manifests clinically critical hemoglobin reduction. Requires immediate therapeutic assessment.'
);

-- ─── Step 4: Seed Report Items ───────────────────────────────
INSERT INTO public.report_items (report_id, test_name, result_value, unit, normal_range, flag) VALUES
-- John Doe Report
('e1111111-1111-1111-1111-111111111111', 'Hemoglobin (Hb)', '14.2', 'g/dL', '13.5 - 17.5', 'NORMAL'),
('e1111111-1111-1111-1111-111111111111', 'Fasting Blood Sugar', '110', 'mg/dL', '70 - 100', 'HIGH'),
('e1111111-1111-1111-1111-111111111111', 'Total Cholesterol', '240', 'mg/dL', '120 - 200', 'HIGH'),
('e1111111-1111-1111-1111-111111111111', 'LDL Cholesterol', '162', 'mg/dL', '0 - 100', 'HIGH'),

-- Elena Smith Report
('e2222222-2222-2222-2222-222222222222', 'Hemoglobin (Hb)', '9.8', 'g/dL', '12.0 - 16.0', 'CRITICAL'),
('e2222222-2222-2222-2222-222222222222', 'Fasting Blood Sugar', '85', 'mg/dL', '70 - 100', 'NORMAL'),
('e2222222-2222-2222-2222-222222222222', 'Total Cholesterol', '175', 'mg/dL', '120 - 200', 'NORMAL');
