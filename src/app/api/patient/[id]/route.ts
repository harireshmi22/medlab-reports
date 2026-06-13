import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// PUT /api/patient/[id] — Update patient details
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      return NextResponse.json({ error: 'Unauthorized. Only admins can edit patient details.' }, { status: 403 });
    }

    // 2. Parse request body
    const { name, email, age, gender, bloodGroup, phone } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Patient name is required.' }, { status: 400 });
    }

    // 3. Update patient record in database
    // blood_group column may not exist in the actual table — handle gracefully
    const baseUpdateData: Record<string, unknown> = {
      name: name.trim(),
      age: parseInt(age) || 30,
      gender: gender || 'Not specified',
      phone: phone?.trim() || '',
    };

    // Only update email if provided
    if (email) {
      baseUpdateData.email = email.trim();
    }

    // Try updating with blood_group first; if column doesn't exist, retry without it
    let patientData: Record<string, unknown> | null = null;
    let patientError: { message: string } | null = null;

    if (bloodGroup) {
      const { data: d1, error: e1 } = await adminClient
        .from('patients')
        .update({ ...baseUpdateData, blood_group: bloodGroup })
        .eq('id', id)
        .select()
        .single();

      if (e1 && e1.message?.includes('blood_group')) {
        // Column doesn't exist — retry without blood_group
        const { data: d2, error: e2 } = await adminClient
          .from('patients')
          .update(baseUpdateData)
          .eq('id', id)
          .select()
          .single();
        patientData = d2;
        patientError = e2;
      } else {
        patientData = d1;
        patientError = e1;
      }
    } else {
      const { data: d1, error: e1 } = await adminClient
        .from('patients')
        .update(baseUpdateData)
        .eq('id', id)
        .select()
        .single();
      patientData = d1;
      patientError = e1;
    }

    if (patientError) {
      console.error('Database update error for patient:', patientError);
      return NextResponse.json({ error: patientError.message }, { status: 500 });
    }

    if (!patientData) {
      return NextResponse.json({ error: 'Patient not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Patient updated successfully.',
      patient: {
        id: patientData.id,
        name: patientData.name,
        email: (patientData.email as string) || '',
        age: (patientData.age as number) || 30,
        gender: (patientData.gender as string) || 'Not specified',
        bloodGroup: (patientData.blood_group as string) || bloodGroup || 'O+',
        phone: (patientData.phone as string) || '',
        avatar: (patientData.avatar_url as string) || `https://avatar.vercel.sh/${encodeURIComponent(patientData.name as string)}`
      }
    });

  } catch (err) {
    console.error('Patient update server error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

// DELETE /api/patient/[id] — Delete patient record
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const adminClient = createServerClient(cookieStore);

    // 1. Authenticate
    const { data: { user }, error: authUserError } = await adminClient.auth.getUser();
    if (authUserError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    // Verify requester is admin
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || (profile.role?.toLowerCase() !== 'admin' && profile.role?.toLowerCase() !== 'lab_staff')) {
      return NextResponse.json({ error: 'Unauthorized. Only admins can remove patient records.' }, { status: 403 });
    }

    // 2. Delete patient record (associated report_items cascade if FK is set, otherwise they stay orphaned)
    const { error: deleteError } = await adminClient
      .from('patients')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Database delete error for patient:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Patient removed successfully.'
    });

  } catch (err) {
    console.error('Patient delete server error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
