import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Printer, 
  Download, 
  AlertTriangle, 
  ChevronRight, 
  BarChart4, 
  MessageSquare, 
  Check, 
  ChevronDown, 
  User, 
  Loader2,
  Lock,
  ArrowLeft,
  FileCheck2
} from 'lucide-react';
import { Report, Patient, ReportItem } from '@/types';
import { mockPatients } from '@/mockData';

interface ReportDetailsProps {
  report: Report;
  onBack?: () => void;
  patients?: Patient[];
}

export default function ReportDetails({ report, onBack, patients }: ReportDetailsProps) {
  const [activeGlucoseMonth, setActiveGlucoseMonth] = useState<string>('Oct');
  const [showExportSuccess, setShowExportSuccess] = useState<'none' | 'pdf' | 'print'>('none');

  // Find associated patient data
  const patient: Patient = (patients || mockPatients).find(p => p.id === report.patientId) || mockPatients[0];

  // Cholesterol breakdown progress percentage calculation for range tracker widget
  const getProgressPercentage = (val: number) => {
    // 100 is optimal, 200 borderline, 240 is cholesterol in mock, max range around 300
    if (val <= 100) return (val / 100) * 30; // 0% to 30% area
    if (val <= 200) return 30 + ((val - 100) / 100) * 40; // 30% to 70% area
    return Math.min(100, 70 + ((val - 200) / 100) * 30); // 70% to 100% boundary
  };

  const getStatusColor = (status: ReportItem['status']) => {
    switch (status) {
      case 'NORMAL':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'BORDERLINE':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'HIGH':
      case 'CRITICAL':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'LOW':
        return 'bg-blue-50 text-[#004e9f] border-blue-105';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const triggerExportSim = (type: 'pdf' | 'print') => {
    setShowExportSuccess(type);
    setTimeout(() => {
      setShowExportSuccess('none');
      if (type === 'print') {
        window.print();
      } else {
        // Trigger generic mock download of PDF
        const link = document.createElement('a');
        link.href = '#';
        link.download = `${report.title.replace(/\s+/g, '_')}_Report.pdf`;
        link.click();
      }
    }, 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 border-b border-gray-100 pb-6">
        <div>
          {/* Breadcrumb line navigation */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold mb-2">
            {onBack && (
              <button 
                onClick={onBack} 
                className="hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Reports</span>
              </button>
            )}
            {!onBack && <span className="text-gray-400">Reports</span>}
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#004e9f] font-bold">Report #{report.id}</span>
          </nav>
          <h2 className="text-2xl font-extrabold text-[#191c1d] tracking-tight font-[family-name:var(--font-heading)]">{report.title}</h2>
        </div>
        
        {/* Print & Download buttons */}
        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => triggerExportSim('print')}
            className="flex items-center gap-2 px-4 py-2.5 border border-[#006a65] text-[#006a65] hover:bg-teal-50 text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Printer className="w-4.5 h-4.5" />
            <span>Print Report</span>
          </button>
          
          <button
            onClick={() => {
              if (report.pdf_url) {
                window.open(report.pdf_url, '_blank');
              } else {
                triggerExportSim('pdf');
              }
            }}
            className="flex items-center gap-2 px-4.5 py-2.5 bg-[#004e9f] hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/10 active:scale-95 cursor-pointer"
          >
            <Download className="w-4.5 h-4.5 text-white" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Export loading confirmation modal panel */}
      {showExportSuccess !== 'none' && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-teal-50 border border-teal-100 text-teal-850 rounded-2xl flex items-center gap-3"
        >
          <Loader2 className="w-5 h-5 text-teal-600 shrink-0 animate-spin" />
          <span className="text-xs font-bold">
            {showExportSuccess === 'pdf' 
              ? 'Compiling high fidelity variables into secure PDF... Downloading shortly.' 
              : 'Formatting printer layout modules... Opening printing manager.'}
          </span>
        </motion.div>
      )}

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (4 Grid columns): Patient Profile & Historical trends summary */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Patient Card details */}
          <div className="bg-white border border-[#c1c6d5]/40 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <img 
                alt="Patient Profile Headshot" 
                className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-md"
                src={patient.avatar}
              />
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 font-[family-name:var(--font-heading)]">{patient.name}</h3>
                <p className="text-xs text-gray-400 font-bold mt-1">Patient ID: {patient.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-2 border-t border-slate-100 pt-5 text-xs">
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 leading-none">Age / Gender</p>
                <p className="font-bold text-slate-800">{patient.age} / {patient.gender}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 leading-none">Blood Group</p>
                <p className="font-bold text-[#004e9f]">{patient.bloodGroup}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 leading-none">Report Date</p>
                <p className="font-bold text-slate-800">{report.date}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 leading-none">Referrer</p>
                <p className="font-bold text-slate-800">{report.referrer}</p>
              </div>
            </div>
          </div>

          {/* Attention requested banner */}
          {report.patientAlertRequired && report.alertText && (
            <motion.div 
              initial={{ scale: 0.98 }}
              animate={{ scale: [0.98, 1, 0.98] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="bg-rose-50/70 border border-rose-200 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 text-[#ba1a1a] mb-3">
                <AlertTriangle className="w-5 h-5 text-[#ba1a1a]" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Attention Required</h4>
              </div>
              <p className="text-xs text-rose-900 leading-relaxed font-semibold">
                {report.alertText}
              </p>
            </motion.div>
          )}

          {/* Glucose Trends bar graph timeline */}
          <div className="bg-white border border-[#c1c6d5]/40 rounded-2xl p-6 shadow-sm">
            <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-5">Glucose Trend (6 Months)</h4>
            
            <div className="h-32 w-full flex items-end gap-2.5 px-1 pt-4">
              {[
                { month: 'May', val: 92, height: '45%' },
                { month: 'Jun', val: 98, height: '52%' },
                { month: 'Jul', val: 104, height: '60%' },
                { month: 'Aug', val: 110, height: '68%' },
                { month: 'Sep', val: 102, height: '58%' },
                { month: 'Oct', val: 110, height: '70%', highlight: true }
              ].map((item, idx) => (
                <div 
                  key={idx}
                  className="flex-1 flex flex-col items-center justify-end h-full gap-2 cursor-pointer group"
                  onClick={() => setActiveGlucoseMonth(item.month)}
                >
                  <div className="w-full relative flex items-end justify-center">
                    <div 
                      style={{ height: item.height }}
                      className={`w-full rounded-t-sm transition-all duration-300 ${
                        item.highlight || activeGlucoseMonth === item.month
                          ? 'bg-[#004e9f] shadow-sm shadow-[#004e9f]/20' 
                          : 'bg-blue-100 group-hover:bg-blue-200'
                      }`}
                    />
                    
                    {/* Floating micro tooltip on bar hover */}
                    <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1e293b] text-white text-[9px] px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap">
                      {item.val} mg/dL
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 font-extrabold uppercase mt-1">
                    {item.month}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-4 border-t border-slate-100 pt-3 text-[10px] text-gray-400">
              <span className="font-extrabold">BASELINE: 70 - 100 mg/dL</span>
              <span>May - Oct 2023</span>
            </div>
          </div>

        </div>

        {/* Right Column (8 Grid columns): Clinical values table and range analysis */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white border border-[#c1c6d5]/40 rounded-2xl overflow-hidden shadow-sm">
            
            {/* Header row details */}
            <div className="bg-slate-50 px-6 py-4 border-b border-[#c1c6d5]/40 flex justify-between items-center">
              <h3 className="font-bold text-[#191c1d] text-sm font-[family-name:var(--font-heading)]">Standard Chemistry Test Results</h3>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Lab Ref: #{report.labRef}</span>
            </div>

            {/* Test results main table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left border-b border-[#c1c6d5]/40 bg-white">
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Test Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Result</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Reference Range</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {report.items.map((item, index) => {
                    const isHazard = item.status === 'HIGH' || item.status === 'LOW' || item.status === 'CRITICAL';
                    return (
                      <tr 
                        key={index} 
                        className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${
                          isHazard ? 'bg-rose-50/10' : ''
                        }`}
                      >
                        <td className={`px-6 py-4.5 text-xs font-bold ${isHazard ? 'text-rose-700' : 'text-slate-900'}`}>
                          {item.name}
                        </td>
                        <td className="px-6 py-4.5">
                          <span className={`text-xl font-bold font-mono tracking-tight ${isHazard && (item.status === 'HIGH' || item.status === 'CRITICAL') ? 'text-[#ba1a1a]' : 'text-slate-900'}`}>
                            {item.result} 
                          </span>
                          <span className={`text-[10px] font-medium ml-1.5 ${isHazard ? 'text-rose-400' : 'text-gray-400'}`}>
                            {item.unit}
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-xs text-slate-500 font-medium">
                          {item.minNormal ? `${item.minNormal} - ` : ''}{item.maxNormal}
                        </td>
                        <td className="px-6 py-4.5">
                          <span className={`px-2.5 py-1 text-[10px] font-bold tracking-wider rounded-full border ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Visual breakdown gradient for Total Cholesterol */}
            {report.items.some(item => item.name.includes('Cholesterol')) && (
              <div className="p-6 bg-[#f8f9fa] border-t border-[#c1c6d5]/40 mt-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Cholesterol Breakdown Analysis</p>
                
                <div id="cholesterol-breakdown-analysis" className="relative pt-6">
                  {/* Multi-layered custom colored indicator bar */}
                  <div className="h-2.5 w-full rounded-full bg-gradient-to-r from-yellow-300 via-green-400 to-rose-500 shadow-inner" />
                  
                  {/* Marker indicator pinpointing current calculated cholesterol */}
                  {(() => {
                    const choleItem = report.items.find(item => item.name === 'Total Cholesterol');
                    if (!choleItem) return null;
                    const val = choleItem.result;
                    const percent = getProgressPercentage(val);

                    return (
                      <div 
                        style={{ left: `${percent}%` }}
                        className="absolute top-0 -translate-x-1/2 flex flex-col items-center group transition-all"
                      >
                        <div className="w-1.5 h-6 bg-slate-950 rounded-full" />
                        <span className="text-[10px] font-bold bg-slate-950 text-white px-2 py-0.5 rounded-md mt-1 animate-pulse shadow">
                          {val}
                        </span>
                      </div>
                    );
                  })()}

                  <div className="flex justify-between mt-4 text-[10px] text-gray-400 font-bold uppercase">
                    <span>100 (Optimal)</span>
                    <span>200 (Borderline)</span>
                    <span>240+ (High)</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Pathology Remarks panel */}
          <div className="bg-white border border-[#c1c6d5]/40 rounded-2xl p-6 space-y-5 shadow-sm">
            <div className="flex items-center gap-2.5 text-[#004e9f] border-b border-gray-100 pb-3">
              <MessageSquare className="w-5 h-5 text-[#004e9f]" />
              <h3 className="font-bold text-slate-900 text-sm font-[family-name:var(--font-heading)]">Doctor &amp; Lab Remarks</h3>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-gray-600">
              {report.doctorRemarks && (
                <div className="p-4 bg-slate-50 border-l-4 border-l-[#004e9f] rounded-r-xl">
                  <p className="font-bold text-[#004e9f] mb-1.5">Dr. Sarah Miller - Pathologist</p>
                  <p className="italic font-medium text-slate-755 leading-relaxed">
                    &quot;{report.doctorRemarks}&quot;
                  </p>
                </div>
              )}

              {report.labNote && (
                <div className="p-4 bg-slate-50 border-l-4 border-l-teal-600 rounded-r-xl">
                  <p className="font-bold text-teal-700 mb-1.5">Laboratory Diagnostic Note</p>
                  <p className="font-medium text-slate-755 leading-relaxed animate-fade-in">
                    {report.labNote}
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
