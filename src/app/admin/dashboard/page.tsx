import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import DashboardClient from './DashboardClient'
import { Patient, Report, ReportItem } from '@/types'

export default async function AdminDashboardPage() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // 1. Fetch exact database counts for stats (to keep stats accurate without fetching all rows)
    const { count: totalPatientsCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
    
    const { count: totalReportsCount } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })

    // Count pending/alert and critical from report_items (distinct count of report_ids)
    const { data: alertItems } = await supabase
        .from('report_items')
        .select('report_id')
        .in('flag', ['HIGH', 'LOW', 'CRITICAL'])
    const uniquePendingIds = new Set(alertItems?.map(item => item.report_id) || [])
    const pendingCountVal = uniquePendingIds.size

    const { data: criticalItems } = await supabase
        .from('report_items')
        .select('report_id')
        .eq('flag', 'CRITICAL')
    const uniqueCriticalIds = new Set(criticalItems?.map(item => item.report_id) || [])
    const criticalCountVal = uniqueCriticalIds.size

    const statsCounts = {
        totalPatients: totalPatientsCount || 0,
        totalReports: totalReportsCount || 0,
        pendingReports: pendingCountVal,
        criticalReports: criticalCountVal
    }

    // 2. Fetch initial patients (page 1, 10 items)
    const { data: dbPatients, count: pCount } = await supabase
        .from('patients')
        .select('*, reports(count)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(0, 9)

    const mappedPatients: Patient[] = (dbPatients || []).map((p: Record<string, any>) => ({
        id: p.id as string,
        name: p.name as string,
        email: (p.email as string) || '',
        age: (p.age as number) || 30,
        gender: (p.gender as string) || 'Not specified',
        bloodGroup: (p.blood_group as string) || 'O+',
        avatar: (p.avatar_url as string) || `https://avatar.vercel.sh/${p.name}`,
        phone: (p.phone as string) || '',
        reportsCount: (p.reports as any)?.[0]?.count || 0
    }))

    // 3. Fetch initial reports (page 1, 10 items)
    const { data: dbReports, count: rCount } = await supabase
        .from('reports')
        .select(`
            *,
            patients (
                name
            ),
            report_items (
                *
            )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(0, 9)

    const mappedReports: Report[] = (dbReports || []).map(r => {
        const items: ReportItem[] = (r.report_items || []).map((i: any) => ({
            id: i.id,
            name: i.test_name,
            result: parseFloat(i.result_value) || 0,
            unit: i.unit || '',
            minNormal: parseFloat(i.normal_range?.split('-')[0]) || 0,
            maxNormal: parseFloat(i.normal_range?.split('-')[1]) || 0,
            status: (i.flag || 'NORMAL') as 'NORMAL' | 'BORDERLINE' | 'HIGH' | 'LOW' | 'CRITICAL'
        }))

        const isAlert = items.some(item => ['HIGH', 'LOW', 'CRITICAL'].includes(item.status))
        const criticalNotes = items
            .filter(item => ['CRITICAL', 'HIGH'].includes(item.status))
            .map(item => `elevated ${item.name}`)
            .join(' and ')

        return {
            id: r.id,
            labRef: r.report_no || 'L-UNKNOWN',
            patientId: r.patient_id,
            patientName: r.patients?.name || 'Unknown Patient',
            date: new Date(r.published_at || r.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            title: r.status === 'published' ? (items.length > 3 ? 'Comprehensive Blood Panel' : 'Lipid Profile & Glucose') : 'Pending Blood Chemistry',
            referrer: 'Dr. Sarah Miller',
            patientAlertRequired: isAlert,
            alertText: isAlert
                ? `Attention Required: Values parsed indicate immediate consultation range regarding ${criticalNotes || 'blood densities'}.`
                : undefined,
            doctorRemarks: r.notes || (isAlert
                ? `The patient shows elevated thresholds for ${criticalNotes}. Advised immediate follow-up.`
                : `Patient metrics demonstrate excellent overall physiological wellness.`),
            labNote: 'Processed via Supabase database client.',
            items,
            pdf_url: r.pdf_url || undefined
        }
    })

    return (
        <DashboardClient
            initialPatients={mappedPatients}
            initialReports={mappedReports}
            initialStats={statsCounts}
            initialPatientsTotal={pCount || 0}
            initialReportsTotal={rCount || 0}
        />
    )
}
