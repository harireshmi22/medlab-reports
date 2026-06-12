"use client"

import React, { useState } from 'react'
import Sidebar from '../component/Sidebar'
import PatientDashboard from '../component/PatientDashboard'
import ReportDetails from '../component/ReportDetails'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Activity,
    Bell,
    Send
} from 'lucide-react'
import { ViewState, DashboardSideTab, Report } from '@/types'
import { mockReports } from '@/mockData'
import Image from 'next/image'

export default function PatientDashboardPage() {
    const [activeTab, setActiveTab] = useState<DashboardSideTab>('Dashboard')
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
    const [reports, setReports] = useState<Report[]>(mockReports)

    const currentSelectedReport = reports.find(r => r.id === selectedReportId)

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
                currentUserProfile={{
                    name: "John Doe",
                    patientId: "P-409122",
                    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAhVNkbYwWmffHwwpAB6BQUi7ghb0wxiUOBEOAAXjVwSkFm1fSpfMUmue8WTk-VypCB7OMYOh5bBlOKOOhWwjwGMNh1UFRosynieP4dnk50r20Mt08OUtFABFvpd3ea6LQoN4VN2nycW-eGeeFuwv-3bO52JTE0to2mDtl4IsKHTR1zAaL0hjiAm-RK_v-1RHHu37QcSoWbJeC8n0vIGfIowJTi_baN_1Ax9kPQXbGCcAf8b3jzq5ohjvYlYC7txxKrubcnjoas1g"
                }}
                onLogout={() => {
                    localStorage.removeItem("auth_token")
                    localStorage.removeItem("user_role")
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
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhVNkbYwWmffHwwpAB6BQUi7ghb0wxiUOBEOAAXjVwSkFm1fSpfMUmue8WTk-VypCB7OMYOh5bBlOKOOhWwjwGMNh1UFRosynieP4dnk50r20Mt08OUtFABFvpd3ea6LQoN4VN2nycW-eGeeFuwv-3bO52JTE0to2mDtl4IsKHTR1zAaL0hjiAm-RK_v-1RHHu37QcSoWbJeC8n0vIGfIowJTi_baN_1Ax9kPQXbGCcAf8b3jzq5ohjvYlYC7txxKrubcnjoas1g"
                                    width={32}
                                    height={32}
                                    className="object-cover w-full h-full rounded-full"
                                />
                            </div>
                            <span className="hidden sm:inline text-xs font-bold text-slate-700">John Doe</span>
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
                                    currentUserProfile={{
                                        name: "John Doe",
                                        patientId: "P-409122",
                                        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAhVNkbYwWmffHwwpAB6BQUi7ghb0wxiUOBEOAAXjVwSkFm1fSpfMUmue8WTk-VypCB7OMYOh5bBlOKOOhWwjwGMNh1UFRosynieP4dnk50r20Mt08OUtFABFvpd3ea6LQoN4VN2nycW-eGeeFuwv-3bO52JTE0to2mDtl4IsKHTR1zAaL0hjiAm-RK_v-1RHHu37QcSoWbJeC8n0vIGfIowJTi_baN_1Ax9kPQXbGCcAf8b3jzq5ohjvYlYC7txxKrubcnjoas1g",
                                        email: "john.doe@medical.com"
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