import React from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';

import {
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Eye,
  Calendar,
  FlaskConical,
  Gauge
} from 'lucide-react';
import { Report, Patient } from '@/types';

interface AdminDashboardProps {
  onNavigateToReport: (reportId: string) => void;
  reports: Report[];
  patients?: Patient[];
}

export default function AdminDashboard({ onNavigateToReport, reports, patients }: AdminDashboardProps) {

  const criticalReportsCount = reports.filter(r => r.items.some(item => item.status === 'CRITICAL')).length;

  // Derive all stats from actual data — no hardcoded fallbacks
  const totalPatients = patients?.length || 0;
  const totalReports = reports.length;
  const pendingReports = reports.filter(r => r.patientAlertRequired).length;

  const stats = [
    {
      title: 'Total Patients',
      value: totalPatients.toLocaleString(),
      label: `${totalPatients} active database profiles`,
      icon: <Users className="w-5 h-5 text-[#004e9f]" />,
      colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-100',
      isUp: true
    },
    {
      title: 'Reports Uploaded',
      value: totalReports.toLocaleString(),
      label: `${totalReports} total reports in system`,
      icon: <CheckCircle className="w-5 h-5 text-teal-600" />,
      colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-100',
      isUp: true
    },
    {
      title: 'Pending Reports',
      value: pendingReports.toString(),
      label: pendingReports > 0 ? `${pendingReports} reports need attention` : 'No pending reports',
      icon: <Clock className="w-5 h-5 text-gray-500" />,
      colorClass: 'text-gray-500 bg-slate-50 border-gray-100',
      isUp: false
    },
    {
      title: 'Critical Reports',
      value: criticalReportsCount.toString(),
      label: criticalReportsCount > 0 ? `${criticalReportsCount} require immediate action` : 'No critical reports',
      icon: <AlertTriangle className="w-5 h-5 text-rose-600" />,
      colorClass: 'text-rose-700 bg-rose-50 border-rose-100',
      isUp: false,
      isEmergency: true
    }
  ];

  const getStatusBadgeStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case 'NORMAL':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'CRITICAL':
        return 'bg-rose-50 text-rose-800 border-rose-200 font-bold';
      case 'HIGH':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'LOW':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  // Find priority diagnostic status for patients list display
  const getOverallDiagnosticStatus = (report: Report) => {
    if (report.items.some(item => item.status === 'CRITICAL')) return 'CRITICAL';
    if (report.items.some(item => item.status === 'HIGH')) return 'HIGH';
    if (report.items.some(item => item.status === 'LOW')) return 'LOW';
    return 'NORMAL';
  };

  return (
    <div className="space-y-8 pb-12">

      {/* Title section with date calendar */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-[#191c1d] tracking-tight">Dashboard Overview</h2>
          <p className="text-sm text-gray-400 font-bold mt-1.5">Monitor laboratory status and pending diagnostics.</p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold bg-white border border-[#c1c6d5]/40 shadow-sm px-4 py-2 rounded-xl">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>Today: {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => {
          if (stat.isEmergency) {
            return (
              <div
                key={idx}
                className="bg-rose-50 border border-rose-100 p-5 rounded-2xl flex items-start justify-between shadow-sm shadow-rose-100/50"
              >
                <div>
                  <p className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-2">{stat.title}</p>
                  <h3 className="text-3xl font-extrabold text-[#ba1a1a] tracking-tight font-mono">{stat.value}</h3>
                  <p className="text-rose-700 font-semibold text-[10px] mt-4.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{stat.label}</span>
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#ba1a1a] rounded-xl flex items-center justify-center text-white shrink-0 shadow shadow-rose-200">
                  {stat.icon}
                </div>
              </div>
            );
          }

          return (
            <div
              key={idx}
              className="bg-white border border-[#c1c6d5]/40 p-5 rounded-2xl flex items-start justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{stat.title}</p>
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">{stat.value}</h3>

                <p className={`text-[10px] font-bold mt-4.5 flex items-center gap-1 ${stat.isUp ? 'text-emerald-600' : 'text-gray-400'
                  }`}>
                  {stat.isUp && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                  {!stat.isUp && <Clock className="w-3.5 h-3.5 text-gray-400" />}
                  <span>{stat.label}</span>
                </p>
              </div>

              <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-[#004e9f] shrink-0">
                {stat.icon}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main split: recent reports & quick references */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Table list card */}
        <div className="lg:col-span-8 bg-white border border-[#c1c6d5]/40 rounded-2xl overflow-hidden shadow-sm">

          <div className="px-6 py-4 border-b border-[#c1c6d5]/40 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-[#191c1d] text-sm">Recent Diagnostics Reports</h3>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Operational Monitor</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-[#c1c6d5]/40 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-3">Patient Name</th>
                  <th className="px-6 py-3">Report ID</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => {
                  const status = getOverallDiagnosticStatus(report);
                  // Grab first letters of name for beautiful avatar circles
                  const initials = report.patientName.split(' ').map(n => n[0]).join('');

                  return (
                    <tr
                      key={report.id}
                      className="border-b border-gray-100 hover:bg-slate-50/60 transition-colors cursor-pointer"
                      onClick={() => onNavigateToReport(report.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-[#004e9f] flex items-center justify-center font-bold text-xs">
                            {initials}
                          </div>
                          <span className="text-xs font-bold text-slate-800 hover:text-[#004e9f]">{report.patientName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono font-medium text-gray-500">#{report.id}</td>
                      <td className="px-6 py-4 text-xs text-gray-500 font-semibold">{report.date}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeStyle(status)}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateToReport(report.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-[#004e9f] hover:bg-slate-100 rounded-lg transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>

        {/* Quick references charts and diagnostics helper details */}
        <div className="lg:col-span-4 space-y-6">

          {/* Reference range mini analytics panels */}
          <div className="bg-white border border-[#c1c6d5]/40 rounded-2xl p-6 shadow-sm space-y-5">
            <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Dynamic Reference Ranges</h4>

            {/* Range 1 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">Glucose Tolerance</span>
                <span className="font-bold text-emerald-600">Normal</span>
              </div>

              <div className="h-2 w-full bg-slate-100 rounded-full flex overflow-hidden">
                <div className="w-[30%] bg-amber-200/50" />
                <div className="w-[50%] bg-emerald-400/80 border-x border-white" />
                <div className="w-[20%] bg-rose-400/80" />
              </div>

              <div className="flex justify-between text-[9px] text-gray-400 font-medium">
                <span>70 mg/dL</span>
                <span>140 mg/dL</span>
              </div>
            </div>

            {/* Range 2 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="font-bold text-slate-700">Hemoglobin</span>
                <span className="font-bold text-[#ba1a1a]">Critical</span>
              </div>

              <div className="relative pt-1.5">
                {/* Arrow needle mark pointing precisely to critical low range */}
                <div className="absolute left-[15%] top-0 -translate-x-1/2 w-1.5 h-3 bg-slate-900 rounded rounded-b-none" />

                <div className="h-2 w-full bg-slate-100 rounded-full flex overflow-hidden">
                  <div className="w-[35%] bg-rose-300" />
                  <div className="w-[45%] bg-emerald-400/80 border-x border-white" />
                  <div className="w-[20%] bg-rose-300" />
                </div>
              </div>

              <div className="flex justify-between text-[9px] text-gray-400 font-medium">
                <span>Low (&lt; 12.0)</span>
                <span>High (&gt; 17.5)</span>
              </div>
            </div>

          </div>

          {/* Advanced machine analytics graphic banner */}
          <div className="rounded-2xl overflow-hidden shadow-sm relative group bg-slate-950">
            <Image
              alt="Clinical automated laboratory visuals"
              className="w-full h-48 object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQzCCwm4CLqPAit0JZ-pl1Jqo2tfrKpKQ9u6p7kRakeHZtJ0HSkox5ecv8m4h81gFA4YwQRoMYKp5a8Bc4eh3QvdyjEytaQW9NF-_BiNU25_t6eW68lVjw8FIDWwYOXCahqtYwoQ7UH4GMhqfTu6QNZY6ROwtxHvhb2r1VNBeF-eQBxkOwSG4jr5aFuHCpF4d-3QxC5Q6JwXvk7WxQYiZsjb3HyAbERyQv703W_pZE3OpSQWKKld6-0-a2LAeO7EC2ue9wLb2S1Q"
              width={600}
              height={192}
            />
            {/* Linear background overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/40 to-transparent p-5 flex flex-col justify-end text-white">
              <h4 className="font-bold text-base flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Advanced Analytics</span>
              </h4>
              <p className="text-[11px] text-gray-300 leading-relaxed mt-1.5 font-medium">
                Our AI-driven system now flags abnormal metrics 15% faster, reducing emergency triage duration.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
