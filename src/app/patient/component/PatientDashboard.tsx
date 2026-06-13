import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Share2, 
  Download, 
  ArrowUpRight, 
  X, 
  Mail, 
  Info, 
  ExternalLink,
  Milestone,
  CheckCircle2,
  CalendarDays,
  FileSpreadsheet,
  Gauge,
  Activity,
  Heart,
  Droplet
} from 'lucide-react';
import { Patient, Report, ViewState } from '@/types';

interface PatientDashboardProps {
  onNavigateToReport: (reportId: string) => void;
  reports: Report[];
  currentUserProfile?: {
    name: string;
    patientId: string;
    avatar: string;
    email: string;
  };
}

export default function PatientDashboard({ onNavigateToReport, reports, currentUserProfile }: PatientDashboardProps) {
  const [showToast, setShowToast] = useState(true);
  const [activeTrendRange, setActiveTrendRange] = useState<'6M' | '1Y' | 'ALL'>('6M');
  const [selectedTimelinePoint, setSelectedTimelinePoint] = useState<number>(3); // AUG

  const patientName = currentUserProfile?.name || 'John Doe';
  const patientId = currentUserProfile?.patientId || '88219';

  // Dynamically extract values from patient's reports if available
  const getLatestValue = (metricName: string, defaultValue: string, defaultStatus: string) => {
    for (const report of reports) {
      const item = report.items.find(it => it.name.toLowerCase().includes(metricName.toLowerCase()));
      if (item) {
        return {
          value: item.result.toString(),
          status: item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase()
        };
      }
    }
    return { value: defaultValue, status: defaultStatus };
  };

  const hemoglobinData = getLatestValue('hemoglobin', '14.2', 'Normal');
  const wbcData = getLatestValue('white blood', '7.5', 'Normal');
  const rbcData = getLatestValue('red blood', '4.8', 'Normal');
  const plateletsData = getLatestValue('platelet', '250', 'Normal');
  const sugarData = getLatestValue('sugar', '95', 'Normal');
  const cholesterolData = getLatestValue('cholesterol', '180', 'Normal');

  // Metrics database for bento grid cards matches mockup perfectly
  const bentoMetrics = [
    { title: 'Hemoglobin', value: hemoglobinData.value, unit: 'g/dL', status: hemoglobinData.status, icon: <Droplet className="w-5 h-5 text-[#004e9f]" /> },
    { title: 'WBC Count', value: wbcData.value, unit: 'x10³/µL', status: wbcData.status, icon: <Activity className="w-5 h-5 text-[#004e9f]" /> },
    { title: 'RBC Count', value: rbcData.value, unit: 'x10⁶/µL', status: rbcData.status, icon: <Droplet className="w-5 h-5 text-[#004e9f]" /> },
    { title: 'Platelets', value: plateletsData.value.endsWith('k') ? plateletsData.value : plateletsData.value + 'k', unit: '/µL', status: plateletsData.status, icon: <Heart className="w-5 h-5 text-[#004e9f]" /> },
    { title: 'Blood Sugar', value: sugarData.value, unit: 'mg/dL', status: sugarData.status, icon: <Activity className="w-5 h-5 text-teal-600" /> },
    { title: 'Cholesterol', value: cholesterolData.value, unit: 'mg/dL', status: cholesterolData.status, icon: <Activity className="w-5 h-5 text-teal-600" /> }
  ];

  interface TrendPoint {
    month: string;
    val: number;
    cx: number;
    cy: number;
    date?: string;
  }

  // Hemoglobin Trend interactive data points
  const hbTrendPoints: Record<'6M' | '1Y' | 'ALL', TrendPoint[]> = {
    '6M': [
      { month: 'MAY', val: 13.9, cx: 100, cy: 150 },
      { month: 'JUN', val: 14.1, cx: 220, cy: 130 },
      { month: 'JUL', val: 14.6, cx: 340, cy: 100 },
      { month: 'AUG', val: 14.8, cx: 460, cy: 80, date: 'AUG 15' }, // Default highlighted in mockup
      { month: 'SEP', val: 14.3, cx: 580, cy: 120 },
      { month: 'OCT', val: 14.2, cx: 700, cy: 140 }
    ],
    '1Y': [
      { month: 'NOV', val: 13.8, cx: 100, cy: 155 },
      { month: 'DEC', val: 14.0, cx: 220, cy: 135 },
      { month: 'JAN', val: 14.2, cx: 340, cy: 120 },
      { month: 'FEB', val: 14.5, cx: 460, cy: 90 },
      { month: 'MAR', val: 14.4, cx: 580, cy: 100 },
      { month: 'APR', val: 14.1, cx: 700, cy: 120 }
    ],
    'ALL': [
      { month: '2022', val: 13.5, cx: 100, cy: 160 },
      { month: '2023', val: 14.2, cx: 300, cy: 120 },
      { month: '2024', val: 14.6, cx: 500, cy: 95 },
      { month: '2025', val: 14.8, cx: 700, cy: 80 }
    ]
  };

  const getDynamicTrendPoints = () => {
    const sorted = [...reports].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const points: { month: string; val: number; cx: number; cy: number; date?: string }[] = [];
    
    const minX = 100;
    const maxX = 700;
    
    sorted.slice(-6).forEach((rep, idx, arr) => {
      const hbItem = rep.items.find(it => it.name.toLowerCase().includes('hemoglobin'));
      if (hbItem) {
        const val = hbItem.result;
        const cy = Math.max(50, Math.min(180, 180 - (val - 8) * 15)); 
        const cx = arr.length > 1 ? minX + (idx * (maxX - minX)) / (arr.length - 1) : 400;
        
        let monthName = 'VAL';
        try {
          const d = new Date(rep.date);
          monthName = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
        } catch(e) {}
        
        points.push({
          month: monthName,
          val,
          cx,
          cy,
          date: rep.date
        });
      }
    });

    return points;
  };

  const dynamicTrendPoints = getDynamicTrendPoints();
  const currentTrendPoints = dynamicTrendPoints.length >= 2 ? dynamicTrendPoints : hbTrendPoints[activeTrendRange];
  const highlightedPoint = currentTrendPoints[selectedTimelinePoint] || currentTrendPoints[currentTrendPoints.length - 1];

  // Safe helper to handle opening detailed pathology report clicked
  const handleOpenReportFromHistory = (idOrTitle: string) => {
    const matchById = reports.find(rep => rep.id === idOrTitle);
    if (matchById) {
      onNavigateToReport(matchById.id);
      return;
    }
    const matches = reports.find(rep => rep.title.toLowerCase().includes(idOrTitle.toLowerCase().split(' ')[0]));
    if (matches) {
      onNavigateToReport(matches.id);
    } else {
      onNavigateToReport(reports[0]?.id || '');
    }
  };

  // Pre-configured list of sample timeline reports matches mockup exactly
  interface HistoryItem {
    id: string;
    title: string;
    date: string;
    icon: React.ReactNode;
    pdf_url?: string;
  }

  const historyItems: HistoryItem[] = reports.length > 0 
    ? reports.map(rep => {
        let icon = <FileSpreadsheet className="w-5 h-5 text-blue-600" />;
        if (rep.title.toLowerCase().includes('lipid') || rep.title.toLowerCase().includes('glucose') || rep.title.toLowerCase().includes('cholesterol')) {
          icon = <Activity className="w-5 h-5 text-blue-600" />;
        } else if (rep.title.toLowerCase().includes('liver')) {
          icon = <Gauge className="w-5 h-5 text-blue-600" />;
        } else if (rep.title.toLowerCase().includes('blood') || rep.title.toLowerCase().includes('cbc')) {
          icon = <Droplet className="w-5 h-5 text-blue-600" />;
        }
        return {
          id: rep.id,
          title: rep.title,
          date: rep.date,
          icon,
          pdf_url: rep.pdf_url
        };
      })
    : [
        { id: 'ML-8842-2023', title: 'Blood Panel', date: 'Oct 24, 2024', icon: <FileSpreadsheet className="w-5 h-5 text-blue-600" />, pdf_url: undefined },
        { id: 'ML-8842-2023', title: 'Lipid Profile', date: 'Aug 12, 2024', icon: <Activity className="w-5 h-5 text-blue-600" />, pdf_url: undefined },
        { id: 'ML-88209', title: 'Liver Function', date: 'Jun 05, 2024', icon: <Gauge className="w-5 h-5 text-blue-600" />, pdf_url: undefined },
        { id: 'ML-88209', title: 'CBC Routine', date: 'Mar 19, 2024', icon: <Droplet className="w-5 h-5 text-blue-600" />, pdf_url: undefined }
      ];

  const [bookingStatus, setBookingStatus] = useState<boolean>(false);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Toast simulated warning banner */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-[#004e9f] text-white p-4.5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg shadow-blue-500/15 overflow-hidden"
          >
            <div className="flex items-center gap-3.5">
              <div className="bg-white/20 p-2 rounded-xl">
                <CalendarDays className="w-5 h-5 text-[#dfe8ff]" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-0.5">New report available</p>
                <p className="text-sm font-semibold text-[#dfe8ff]"> Your Lipid Profile &amp; Glucose results from Oct 24 are now ready for review.</p>
              </div>
            </div>

            <div className="flex gap-3 shrink-0 items-center justify-end w-full md:w-auto">
              <button 
                onClick={() => onNavigateToReport(reports[0]?.id || 'ML-8842-2023')}
                className="px-4 py-2 bg-white text-[#004e9f] hover:bg-slate-100 rounded-xl text-xs font-extrabold transition-all active:scale-95 shadow-sm"
              >
                View Now
              </button>
              <button 
                onClick={() => setShowToast(false)} 
                className="p-1.5 hover:bg-white/10 rounded-lg text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome & Interactive Actions */}
      <section className="bg-white p-8 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div>
          <h2 className="text-2xl font-extrabold text-[#191c1d] tracking-tight">Welcome back, {patientName}</h2>
          <p className="text-sm text-gray-400 font-bold mt-1.5">Your health metrics are stable. Keep up the good work!</p>
        </div>

        {/* Consulting interactive trigger */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              setBookingStatus(true);
              setTimeout(() => setBookingStatus(false), 3000);
            }}
            className="flex items-center gap-1.5 px-4.5 py-3 bg-[#004e9f] hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>{bookingStatus ? 'Consultation Request Sent...' : 'Book Consultation'}</span>
          </button>
          
          <button
            onClick={() => alert(`Your secure MedLab digital health record sharing link was generated: https://medlab.portal/share/doe-88219`)}
            className="flex items-center gap-1.5 px-4.5 py-3 border border-[#006a65] text-[#006a65] hover:bg-teal-50 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Records</span>
          </button>
        </div>
      </section>

      {/* Metric Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5">
        {bentoMetrics.map((met, idx) => (
          <motion.div 
            whileHover={{ y: -3, boxShadow: '0 8px 20px -6px rgba(0,0,0,0.04)' }}
            key={idx} 
            className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-300 shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{met.title}</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                {met.icon}
              </div>
            </div>

            <p className="text-2xl font-extrabold text-[#191c1d] tracking-tight font-mono">
              {met.value} <span className="text-xs font-medium text-gray-400 ml-0.5">{met.unit}</span>
            </p>

            <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold text-[10px] tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{met.status}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Two Column Section: Trend line-graph & Record History list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* SVG Interactive Trend Lines */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#c1c6d5]/45 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-[#191c1d] text-base">Hemoglobin Trend</h3>
              <p className="text-xs text-gray-400 mt-1">{activeTrendRange === '6M' ? '6' : '12'}-Month historical analysis</p>
            </div>
            
            {/* Toggles range */}
            <div className="flex bg-slate-100 rounded-xl p-1 gap-1 border border-[#c1c6d5]/30">
              {(['6M', '1Y', 'ALL'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setActiveTrendRange(r);
                    setSelectedTimelinePoint(0);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTrendRange === r 
                      ? 'bg-white text-[#004e9f] shadow-sm' 
                      : 'text-gray-500 hover:text-slate-800'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Linear SVG Chart Plotter */}
          <div className="relative h-64 w-full bg-gradient-to-b from-[#004e9f]/5 to-transparent rounded-2xl border border-blue-50 overflow-hidden">
            
            <svg 
              className="absolute inset-0 w-full h-full p-4" 
              viewBox="0 0 800 200" 
              preserveAspectRatio="none"
            >
              {/* Dynamic Connecting Curve */}
              <defs>
                <linearGradient id="chartLineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#004e9f" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#004e9f" stopOpacity="0"/>
                </linearGradient>
              </defs>

              {/* Area path */}
              <path
                d={`M 100 200 
                    ${currentTrendPoints.map(pt => `L ${pt.cx} ${pt.cy}`).join(' ')} 
                    L ${currentTrendPoints[currentTrendPoints.length - 1].cx} 200 Z`}
                fill="url(#chartLineGrad)"
              />

              {/* Connection Stroke line */}
              <path
                d={currentTrendPoints.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.cx} ${pt.cy}`).join(' ')}
                fill="none"
                stroke="#004e9f"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Trigger Points */}
              {currentTrendPoints.map((pt, index) => {
                const isSelected = selectedTimelinePoint === index;
                return (
                  <circle
                    key={index}
                    cx={pt.cx}
                    cy={pt.cy}
                    r={isSelected ? '6.5' : '4.5'}
                    fill={isSelected ? '#004e9f' : '#ffffff'}
                    stroke="#004e9f"
                    strokeWidth="3.5"
                    className="cursor-pointer transition-all"
                    onClick={() => setSelectedTimelinePoint(index)}
                  />
                );
              })}
            </svg>

            {/* Dynamic tooltips matches exactly the default mockup tooltip at AUG 15 */}
            {highlightedPoint && (
              <div 
                style={{ 
                  left: `${(highlightedPoint.cx / 800) * 85}%`, 
                  top: `${highlightedPoint.cy - 70}px` 
                }}
                className="absolute bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 w-36 text-left pointer-events-none transition-all duration-300"
              >
                <p className="text-[10px] font-bold text-[#dfe8ff] tracking-wider uppercase mb-0.5">
                  {highlightedPoint.date || highlightedPoint.month}
                </p>
                <p className="text-xs font-extrabold text-white">Value: {highlightedPoint.val} g/dL</p>
                <div className="absolute left-6 -bottom-1 w-2.5 h-2.5 bg-slate-900 rotate-45 border-r border-b border-slate-700" />
              </div>
            )}

            {/* Background Grid Lines helper */}
            <div className="absolute inset-x-0 bottom-4 border-t border-slate-100 pointer-events-none" />
            <div className="absolute inset-x-0 top-1/2 border-t border-slate-100 border-dashed pointer-events-none" />

          </div>

          {/* Timeline Months Footers */}
          <div className="flex justify-between items-center mt-4 px-2 text-[10px] font-extrabold text-gray-400">
            {currentTrendPoints.map((p, idx) => (
              <span 
                key={idx}
                onClick={() => setSelectedTimelinePoint(idx)}
                className={`cursor-pointer tracking-wider ${selectedTimelinePoint === idx ? 'text-[#004e9f] font-extrabold scale-110' : 'hover:text-slate-700'}`}
              >
                {p.month}
              </span>
            ))}
          </div>

        </div>

        {/* Report History Widgets list */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#c1c6d5]/45 flex flex-col h-full shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-[#191c1d] text-base">Report History</h3>
            <button 
              onClick={() => onNavigateToReport(reports[0]?.id || '')}
              className="text-[#004e9f] hover:underline text-xs font-bold"
            >
              View all
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[290px] pr-1">
            {historyItems.map((item, index) => (
              <div 
                key={index} 
                onClick={() => handleOpenReportFromHistory(item.id || item.title)}
                className="group flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50/20 shadow-sm transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#004e9f] group-hover:bg-[#d7e3ff]/40 group-hover:text-blue-800 transition-colors shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#004e9f]">{item.title}</h4>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{item.date}</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (item.pdf_url) {
                      window.open(item.pdf_url, '_blank');
                    } else {
                      alert(`Starting secure file download folder for ${item.title} PDF archive.`);
                    }
                  }}
                  className="p-1.5 text-gray-400 hover:text-[#004e9f] hover:bg-blue-50/50 rounded-lg transition-colors shrink-0"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Reference understanding footer bar */}
      <section className="bg-slate-50 border border-[#c1c6d5]/30 rounded-2xl p-6 shadow-inner">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4.5">
          <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-[#006a65] shrink-0">
            <Info className="w-6 h-6 text-[#006a65]" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-900 leading-none">Understanding Reference Ranges</h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed font-semibold">
              Your laboratory results are compared to ranges determined by clinical studies. &quot;Normal&quot; signifies your value falls within the expected healthy demographic range. Consult your physician for a personalized interpretation of these findings.
            </p>
          </div>
          <button 
            onClick={() => alert('Opening medical diagnostics educational guide regarding biological variables, hematology indices and normal reference bounds.')}
            className="whitespace-nowrap px-4.5 py-3 border border-[#006a65] text-[#006a65] hover:bg-[#76f3ea]/10 rounded-xl text-xs font-bold transition-all active:scale-95 shrink-0 cursor-pointer shadow-sm"
          >
            Learn More
          </button>
        </div>
      </section>

    </div>
  );
}
