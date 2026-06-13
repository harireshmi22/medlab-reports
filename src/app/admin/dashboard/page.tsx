"use client"

import React, { useState, useEffect, useCallback } from 'react'
import Sidebar from '@/app/patient/component/Sidebar'
import AdminDashboard from '../component/AdminDashboard'
import AddReport from '../component/AddReport'
import PatientsPanel from '@/app/patient/component/PatientsPanel'
import ReportDetails from '@/app/patient/component/ReportDetails'
import { motion, AnimatePresence } from 'motion/react'
import { 
    Activity, 
    Bell,
    Send,
    Loader2
} from 'lucide-react'
import Image from 'next/image'
import { Report, Patient, DashboardSideTab, ReportItem } from '@/types'
import { createClient } from '@/lib/supabase/client'

export default function AdminDashboardPage() {
    const [activeTab, setActiveTab] = useState<DashboardSideTab>('Dashboard')
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
    const [isAddReportOpen, setIsAddReportOpen] = useState(false)
    
    // Alert state
    const [alertMessage, setAlertMessage] = useState("")

    // Reports and Patients registry state
    const [reports, setReports] = useState<Report[]>([])
    const [patients, setPatients] = useState<Patient[]>([])
    const [isLoadingData, setIsLoadingData] = useState(true)

    const fetchDashboardData = useCallback(async () => {
        try {
            const supabase = createClient()

            // Fetch patients
            const { data: dbPatients, error: pError } = await supabase
                .from('patients')
                .select('*')
                .order('created_at', { ascending: false })

            if (pError) throw pError

            const mappedPatients: Patient[] = (dbPatients || []).map((p: Record<string, unknown>) => ({
                id: p.id as string,
                name: p.name as string,
                email: (p.email as string) || '',
                age: (p.age as number) || 30,
                gender: (p.gender as string) || 'Not specified',
                bloodGroup: (p.blood_group as string) || 'O+',
                avatar: (p.avatar_url as string) || `https://avatar.vercel.sh/${p.name}`,
                phone: (p.phone as string) || ''
            }))
            setPatients(mappedPatients)

            // Fetch reports
            const { data: dbReports, error: rError } = await supabase
                .from('reports')
                .select(`
                    *,
                    patients (
                        name
                    ),
                    report_items (
                        *
                    )
                `)
                .order('created_at', { ascending: false })

            if (rError) throw rError

            const mappedReports: Report[] = (dbReports || []).map(r => {
                const items: ReportItem[] = (r.report_items || []).map((i: { id: string; test_name: string; result_value: string; unit: string; normal_range: string; flag: string }) => ({
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
            setReports(mappedReports)
        } catch (err) {
            console.error('Error fetching dashboard data:', err)
        } finally {
            setIsLoadingData(false)
        }
    }, [])

    useEffect(() => {
        const load = async () => {
            await fetchDashboardData()
        }
        load()
    }, [fetchDashboardData])

    // Handler to save manual report entry
    const handleAddReportCommit = async (newReport: Report) => {
        try {
            const supabase = createClient()

            // 1. Insert report
            const { data: reportData, error: reportError } = await supabase
                .from('reports')
                .insert({
                    report_no: newReport.id,
                    patient_id: newReport.patientId,
                    status: 'published',
                    notes: newReport.doctorRemarks,
                    pdf_url: newReport.pdf_url,
                    published_at: new Date().toISOString()
                })
                .select()
                .single()

            if (reportError) throw reportError

            // 2. Insert items
            const itemsToInsert = newReport.items.map(item => ({
                report_id: reportData.id,
                test_name: item.name,
                result_value: item.result.toString(),
                unit: item.unit,
                normal_range: `${item.minNormal} - ${item.maxNormal}`,
                flag: item.status
            }))

            const { error: itemsError } = await supabase
                .from('report_items')
                .insert(itemsToInsert)

            if (itemsError) throw itemsError

            setAlertMessage(`Successfully verified and published report for ${newReport.patientName}!`)
            setTimeout(() => setAlertMessage(""), 4000)
            setIsAddReportOpen(false)
            
            // Reload database state
            await fetchDashboardData()

            // Auto navigate to the newly added report
            setSelectedReportId(reportData.id)
            setActiveTab('Reports')

        } catch (err) {
            console.error('Error saving report to DB:', err)
            setAlertMessage('Failed to save report to database.')
            setTimeout(() => setAlertMessage(""), 4000)
        }
    }

    // Handler to add patient locally
    const handleAddPatientLocal = async (newPatient: Patient) => {
        try {
            await fetchDashboardData()
        } catch (err) {
            console.error('Error reloading data after patient register:', err)
        }
    }

    // Handler for editing patient — reload dashboard data
    const handleEditPatient = async (updatedPatient: Patient) => {
        try {
            await fetchDashboardData()
            setAlertMessage(`Successfully updated patient: ${updatedPatient.name}`)
            setTimeout(() => setAlertMessage(""), 4000)
        } catch (err) {
            console.error('Error reloading data after patient edit:', err)
        }
    }

    // Handler for deleting patient — reload dashboard data
    const handleDeletePatient = async (patientId: string) => {
        try {
            await fetchDashboardData()
            setAlertMessage('Patient record removed successfully.')
            setTimeout(() => setAlertMessage(""), 4000)
        } catch (err) {
            console.error('Error reloading data after patient delete:', err)
        }
    }



    const currentSelectedReport = reports.find(r => r.id === selectedReportId)

    if (isLoadingData) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-[#004e9f] animate-spin" />
                    <p className="text-slate-500 text-sm font-semibold tracking-wide">Loading LIS telemetry...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            {/* Sidebar for admin */}
            <Sidebar
                currentView="ADMIN_DASHBOARD"
                onNavigate={(view) => {
                    if (view === 'LANDING') window.location.href = '/'
                }}
                activeTab={activeTab}
                setActiveTab={(tab) => {
                    setActiveTab(tab)
                    if (tab !== 'Reports') setSelectedReportId(null)
                }}
                onOpenAddReport={() => setIsAddReportOpen(true)}
                currentUserRole="admin"
                onLogout={async () => {
                    localStorage.removeItem("auth_token")
                    localStorage.removeItem("user_role")
                    try {
                        await fetch("/api/auth/logout", { method: "POST" })
                    } catch (err) {
                        console.error("Logout error:", err)
                    }
                    window.location.href = '/'
                }}
                isOpen={isMobileSidebarOpen}
                onClose={() => setIsMobileSidebarOpen(false)}
            />

            {/* Main Content Area */}
            <main className="flex-1 md:pl-64 min-w-0 flex flex-col min-h-screen">
                {/* Header bar */}
                <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-[#c1c6d5]/40 h-16 px-6 md:px-8 flex items-center justify-between z-20 shadow-xs">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsMobileSidebarOpen(true)}
                            className="p-2 -ml-2 rounded-lg text-gray-500 hover:bg-slate-100 md:hidden"
                        >
                            <Activity className="w-5 h-5 text-[#004e9f]" />
                        </button>
                        <h2 className="font-extrabold text-slate-800 text-lg tracking-tight capitalize">{activeTab}</h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 rounded-xl text-gray-400 hover:text-slate-600 hover:bg-slate-50 transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                        </button>
                        <div className="h-8 w-px bg-slate-200" />
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-[#004e9f]/20">
                                <Image
                                    alt="Admin Profile"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTGD7gHvWcehi15F5euALOPYLsRRZKrx3Rx5F2OGleEbdAJz5ix4OaNSTcpmLhZzoAOvw8T9yqgRCn2FbBjc27daMYDWrZoVOJMi4bUVWsDUlnlQOQQfr6Ie-i6SDn_xzYF3EtekMNzO0xcLWj5DEsh3rENhV36FdxONoGigCFJBNHmCsglC7jxcig98bAWd0FQUaJnPqOdfKI3_YqRb2-lbV_x6jCqoF0WvseNkof0Iyj3XxQ-5XWyFA9FQGoBX1N5-ff7Y2QJQ"
                                    width={32}
                                    height={32}
                                    className="object-cover w-full h-full rounded-full"
                                />
                            </div>
                            <span className="hidden sm:inline text-xs font-bold text-slate-700">Dr. Sarah Chen</span>
                        </div>
                    </div>
                </header>

                {/* Banner Status Alerts */}
                {alertMessage && (
                    <div className="mx-6 md:mx-8 mt-6 bg-teal-50 border border-teal-200 text-teal-800 px-4 py-3 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                        <span>{alertMessage}</span>
                    </div>
                )}

                {/* Main panel content wrapper */}
                <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
                    <AnimatePresence mode="wait">
                        {activeTab === 'Dashboard' && (
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                className="w-full"
                            >
                                <AdminDashboard
                                    reports={reports}
                                    patients={patients}
                                    onNavigateToReport={(repId) => {
                                        setSelectedReportId(repId)
                                        setActiveTab('Reports')
                                    }}
                                />
                            </motion.div>
                        )}

                        {activeTab === 'Patients' && (
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                className="w-full"
                            >
                                <PatientsPanel
                                    patients={patients}
                                    reports={reports}
                                    onAddPatientLocal={handleAddPatientLocal}
                                    onEditPatient={handleEditPatient}
                                    onDeletePatient={handleDeletePatient}
                                    onNavigateToReport={(repId) => {
                                        setSelectedReportId(repId)
                                        setActiveTab('Reports')
                                    }}
                                />
                            </motion.div>
                        )}

                        {activeTab === 'Reports' && (
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                className="w-full"
                            >
                                {currentSelectedReport ? (
                                    <ReportDetails
                                        report={currentSelectedReport}
                                        onBack={() => setSelectedReportId(null)}
                                        patients={patients}
                                    />
                                ) : (
                                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
                                        <div className="pb-4 border-b border-slate-100">
                                            <h3 className="font-extrabold text-slate-800">Released Reports Log</h3>
                                            <p className="text-slate-400 text-xs mt-0.5">Select a report below to review diagnostic metrics</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {reports.map((report) => (
                                                <button
                                                    key={report.id}
                                                    onClick={() => setSelectedReportId(report.id)}
                                                    className="w-full text-left p-5 border border-slate-200/80 rounded-xl shadow-xs hover:border-[#004e9f]/50 hover:shadow-md transition-all cursor-pointer bg-white flex justify-between items-start"
                                                >
                                                    <div className="space-y-2">
                                                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                            report.patientAlertRequired ? 'bg-rose-50 text-[#ba1a1a]' : 'bg-emerald-50 text-emerald-700'
                                                        }`}>
                                                            {report.patientAlertRequired ? 'Alert' : 'Released'}
                                                        </span>
                                                        <h4 className="font-bold text-slate-800">{report.patientName}</h4>
                                                        <p className="text-xs text-slate-400 font-semibold">{report.title} • {report.date}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}



                        {activeTab === 'Settings' && (
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-xs max-w-2xl space-y-6"
                            >
                                <h3 className="font-extrabold text-slate-800">LIS Settings</h3>
                                
                                <div className="space-y-4 divide-y divide-slate-100">
                                    <div className="py-4 first:pt-0">
                                        <h4 className="font-bold text-slate-800 text-sm mb-1">HL7 Analyzer Integration</h4>
                                        <p className="text-slate-400 text-xs leading-relaxed mb-3">Sync verified telemetry directly with medical analyzers.</p>
                                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                                            <input type="checkbox" defaultChecked className="rounded text-[#004e9f] focus:ring-[#004e9f]" />
                                            <span>Automatic analyzer listener online</span>
                                        </label>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* Interactive Add Report Modal */}
            <AnimatePresence>
                {isAddReportOpen && (
                    <AddReport
                        onClose={() => setIsAddReportOpen(false)}
                        onAddReport={handleAddReportCommit}
                        patients={patients}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
