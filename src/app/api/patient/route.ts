import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const adminClient = createServerClient(cookieStore);

    // 1. Authenticate the admin/staff member
    const { data: { user }, error: authUserError } = await adminClient.auth.getUser();
    if (authUserError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    // Verify requester is admin or staff
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || (profile.role?.toLowerCase() !== 'admin' && profile.role?.toLowerCase() !== 'lab_staff')) {
      return NextResponse.json({ error: 'Unauthorized. Only admins can register new patients.' }, { status: 403 });
    }

    // 2. Parse request payload
    const { name, email, password, age, gender, phone } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required fields.' }, { status: 400 });
    }

    // 3. Create non-persistent client to sign up the new user without affecting the admin's cookie session
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Server configuration error: missing Supabase URL or publishable key.' }, { status: 500 });
    }

    // Use standard client for isolated signup
    const authClient = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    const { data: authData, error: authError } = await authClient.auth.signUp({
      email: email.trim(),
      password: password.trim(),
      options: {
        data: {
          name: name.trim(),
          full_name: name.trim(),
          role: 'patient'
        }
      }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create authenticated user profile.' }, { status: 500 });
    }

    const newUserId = authData.user.id;

    // 4. Insert clinical record into patients table using the admin client
    // Note: patients table schema contains: id, profile_id, name, age, gender, phone, email, address, created_at.
    // It does NOT have avatar_url or blood_group columns.
    const { data: patientData, error: patientError } = await adminClient
      .from('patients')
      .insert({
        profile_id: newUserId,
        name: name.trim(),
        email: email.trim(),
        age: parseInt(age) || 30,
        gender,
        phone: phone?.trim() || ''
      })
      .select()
      .single();

    if (patientError) {
      console.error('Database insertion error for patient:', patientError);
      return NextResponse.json({ error: patientError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Patient registered successfully.',
      patient: {
        id: patientData.id,
        name: patientData.name,
        email: patientData.email,
        age: patientData.age,
        gender: patientData.gender,
        bloodGroup: 'O+', // default fallback for UI
        phone: patientData.phone,
        avatar: `https://avatar.vercel.sh/${encodeURIComponent(patientData.name)}`
      }
    });

  } catch (err) {
    console.error('Patient registration server error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
