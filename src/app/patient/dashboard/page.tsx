"use client"

import React, { useState, useEffect, useCallback } from 'react'
import Sidebar from '../component/Sidebar'
import PatientDashboard from '../component/PatientDashboard'
import ReportDetails from '../component/ReportDetails'
import { motion, AnimatePresence } from 'motion/react'
import {
    Activity,
    Bell,
    Send,
    Loader2
} from 'lucide-react'
import { ViewState, DashboardSideTab, Report, ReportItem } from '@/types'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import useSWR from 'swr'

interface PatientDashboardData {
  currentUserProfile: {
    name: string;
    patientId: string;
    avatar: string;
    email: string;
  };
  reports: Report[];
}

const patientDashboardFetcher = async (): Promise<PatientDashboardData> => {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Not authenticated')
  }

  // Fetch patient clinical details linked to this auth user
  let patientData = null
  const { data: pData, error: pError } = await supabase
      .from('patients')
      .select('*')
      .eq('profile_id', user.id)
      .maybeSingle()

  if (pData) {
      patientData = pData
  } else {
      // Try by email
      const { data: pDataByEmail } = await supabase
          .from('patients')
          .select('*')
          .eq('email', user.email)
          .maybeSingle()
      
      if (pDataByEmail) {
          patientData = pDataByEmail
      }
  }

  if (!patientData) {
      throw new Error(`No patient record found in database for auth user: ${user.email}`)
  }

  const currentUserProfile = {
      name: patientData.name,
      patientId: `P-${patientData.id.slice(0, 6).toUpperCase()}`,
      avatar: patientData.avatar_url || `https://avatar.vercel.sh/${patientData.name}`,
      email: patientData.email || ''
  }

  // Fetch reports for this patient
  const { data: dbReports, error: reportsError } = await supabase
      .from('reports')
      .select(`
          *,
          report_items (
              *
          )
      `)
      .eq('patient_id', patientData.id)
      .order('created_at', { ascending: false })

  if (reportsError) throw reportsError

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
          patientName: patientData.name,
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

  return {
      currentUserProfile,
      reports: mappedReports
  }
}

export default function PatientDashboardPage() {
    const [activeTab, setActiveTab] = useState<DashboardSideTab>('Dashboard')
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null)

    // SWR setup for client-side caching & revalidation
    const { data, error, isLoading } = useSWR<PatientDashboardData>(
        'patient-dashboard-data',
        patientDashboardFetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 30000,
            onError: (err) => {
                if (err.message === 'Not authenticated') {
                    window.location.href = '/patient/login'
                }
            }
        }
    )

    const reports = data?.reports || []
    const currentUserProfile = data?.currentUserProfile || null
    const isLoadingData = isLoading && !data && !error

    const currentSelectedReport = reports.find(r => r.id === selectedReportId)

    if (isLoadingData) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-[#004e9f] animate-spin" />
                    <p className="text-slate-500 text-sm font-semibold tracking-wide">Retrieving patient health records...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            {/* Sidebar component */}
            <Sidebar
                currentView="PASS_DASHBOARD"
                onNavigate={(view) => {
                    if (view === 'LANDING') window.location.href = '/'
                }}
                activeTab={activeTab}
                setActiveTab={(tab) => {
                    setActiveTab(tab)
                    if (tab !== 'Reports') setSelectedReportId(null)
                }}
                onOpenAddReport={() => { }}
                currentUserRole="patient"
                currentUserProfile={currentUserProfile || undefined}
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

            {/* Main Content Pane */}
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
                                    alt="Profile"
                                    src={currentUserProfile?.avatar || "https://avatar.vercel.sh/patient"}
                                    width={32}
                                    height={32}
                                    className="object-cover w-full h-full rounded-full"
                                />
                            </div>
                            <span className="hidden sm:inline text-xs font-bold text-slate-700">{currentUserProfile?.name || 'Patient'}</span>
                        </div>
                    </div>
                </header>

                {/* Tab content wrappers */}
                <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
                    <AnimatePresence mode="wait">
                        {activeTab === 'Dashboard' && (
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                className="w-full"
                            >
                                <PatientDashboard
                                    reports={reports}
                                    onNavigateToReport={(repId) => {
                                        setSelectedReportId(repId)
                                        setActiveTab('Reports')
                                    }}
                                    currentUserProfile={currentUserProfile || undefined}
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
                                    />
                                ) : (
                                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
                                        <div className="pb-4 border-b border-slate-100">
                                            <h3 className="font-extrabold text-slate-800">Available Reports</h3>
                                            <p className="text-slate-400 text-xs mt-0.5">Select a report below to view detailed breakdown</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {reports.map((report) => (
                                                <button
                                                    key={report.id}
                                                    onClick={() => setSelectedReportId(report.id)}
                                                    className="w-full text-left p-5 border border-slate-200/80 rounded-xl shadow-xs hover:border-[#004e9f]/50 hover:shadow-md transition-all cursor-pointer bg-white flex justify-between items-start"
                                                >
                                                    <div className="space-y-2">
                                                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${report.patientAlertRequired ? 'bg-rose-50 text-[#ba1a1a]' : 'bg-emerald-50 text-emerald-700'}`}>
                                                            {report.patientAlertRequired ? 'Alert' : 'Normal'}
                                                        </span>
                                                        <h4 className="font-bold text-slate-800">{report.title}</h4>
                                                        <p className="text-xs text-slate-400 font-semibold">{report.date} • {report.referrer}</p>
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
                                className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-xs space-y-6 max-w-2xl"
                            >
                                <h3 className="font-extrabold text-slate-800">Account Settings</h3>

                                <div className="space-y-4 divide-y divide-slate-100">
                                    <div className="py-4 first:pt-0">
                                        <h4 className="font-bold text-slate-800 text-sm mb-1">Email Notifications</h4>
                                        <p className="text-slate-400 text-xs leading-relaxed mb-3">Get automated notification logs whenever laboratory testing reports are published.</p>
                                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                                            <input type="checkbox" defaultChecked className="rounded text-[#004e9f] focus:ring-[#004e9f]" />
                                            <span>Send report publication emails</span>
                                        </label>
                                    </div>

                                    <div className="py-4">
                                        <h4 className="font-bold text-slate-800 text-sm mb-1">HIPAA Consent & Safety</h4>
                                        <p className="text-slate-400 text-xs leading-relaxed mb-3">Authorize medical analyzer systems to deliver structured JSON logs to your dashboard.</p>
                                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                                            <input type="checkbox" defaultChecked className="rounded text-[#004e9f] focus:ring-[#004e9f]" />
                                            <span>Accept HL7 digital telemetry consent</span>
                                        </label>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    )
}