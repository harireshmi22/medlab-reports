import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    if (!patientId) {
      return NextResponse.json({ error: 'patientId is required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const { data: dbReports, error: rError } = await supabase
      .from('reports')
      .select(`
          *,
          report_items (
              *
          )
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (rError) throw rError;

    return NextResponse.json({ success: true, reports: dbReports || [] });
  } catch (err) {
    console.error('API reports GET error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
