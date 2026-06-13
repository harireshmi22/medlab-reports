import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, ArrowLeft, FileText, CheckCircle, Activity, Heart, Droplet, User } from "lucide-react";

interface Patient {
  id: string;
  profile_id: string;
  name: string;
  email?: string;
  age?: number;
  gender?: string;
  phone?: string;
  blood_group?: string;
  address?: string;
}

interface PatientReport {
  id: string;
  title: string;
  report_no: string;
  created_at: string;
  published_at?: string;
  status: string;
}

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function AdminPatientDetailPage({ searchParams }: PageProps) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  // Verify requester is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role?.toLowerCase() !== "admin" && profile?.role?.toLowerCase() !== "lab_staff") {
    redirect('/');
  }

  // Fetch target patient ID
  const resolvedParams = await searchParams;
  const patientId = resolvedParams.id;

  if (!patientId) {
    redirect('/admin/dashboard');
  }

  // Find patient
  const { data: dbPatient } = await supabase
    .from("patients")
    .select("*")
    .eq("id", patientId)
    .maybeSingle();

  if (!dbPatient) {
    redirect('/admin/dashboard');
  }

  const patient = dbPatient as Patient;

  // Fetch reports for this patient
  const { data: dbReports } = await supabase
    .from("reports")
    .select("*")
    .eq("patient_id", patient.id)
    .order("created_at", { ascending: false });

  const reports = (dbReports || []) as PatientReport[];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Top Header Section */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-[#c1c6d5]/40 h-16 px-6 md:px-8 flex items-center justify-between z-20 shadow-xs">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/dashboard"
            className="p-2 -ml-2 rounded-lg text-gray-500 hover:bg-slate-100 flex items-center gap-1.5 text-xs font-bold transition-all text-[#004e9f]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Directory</span>
          </Link>
          <div className="h-6 w-px bg-slate-200" />
          <h2 className="font-extrabold text-slate-800 text-sm tracking-tight">
            Patient File: {patient.name}
          </h2>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
        {/* Patient Hero Info */}
        <section className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4.5">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#004e9f] shrink-0">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#191c1d] tracking-tight">
                {patient.name}
              </h1>
              <p className="text-xs text-gray-400 font-bold mt-1 leading-relaxed">
                {patient.email || "No email registered"} • Phone: {patient.phone || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex gap-3 shrink-0">
            <Link
              href="/admin/dashboard"
              className="px-4.5 py-3 bg-[#004e9f] hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 active:scale-95 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Generate New Report</span>
            </Link>
          </div>
        </section>

        {/* Stats Bento Box Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Reports</span>
            <p className="text-3xl font-extrabold text-[#191c1d] tracking-tight font-mono mt-1">
              {reports.length}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Age</span>
            <p className="text-3xl font-extrabold text-[#191c1d] tracking-tight font-mono mt-1">
              {patient.age || "N/A"} <span className="text-xs font-medium text-gray-400 ml-0.5">years</span>
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Blood Group</span>
            <p className="text-3xl font-extrabold text-rose-600 tracking-tight font-mono mt-1">
              {patient.blood_group || "Unknown"}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Gender</span>
            <p className="text-3xl font-extrabold text-[#191c1d] tracking-tight font-mono mt-1">
              {patient.gender || "N/A"}
            </p>
          </div>
        </div>

        {/* Reports Directory Log Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-800">Released Diagnostic Reports</h3>
              <p className="text-slate-400 text-xs mt-0.5">Clinical logs and telemetry files assigned to this file</p>
            </div>
            <span className="text-[10px] font-bold text-gray-400 bg-slate-100 px-2.5 py-1 rounded-lg">
              {reports.length} records
            </span>
          </div>

          {reports.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-xs font-bold text-slate-500">No reports generated for this patient profile yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 uppercase font-bold text-[9px] tracking-wider">
                    <th className="px-6 py-4">Report No</th>
                    <th className="px-6 py-4">Test Title</th>
                    <th className="px-6 py-4">Date Uploaded</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-[#004e9f]">
                        {report.report_no}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700">
                        {report.title}
                      </td>
                      <td className="px-6 py-4 text-gray-400 font-semibold">
                        {new Date(report.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[9px] uppercase tracking-wider">
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                          <span>{report.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/dashboard?tab=Reports&id=${report.id}`}
                          className="inline-flex items-center justify-center px-3 py-1.5 border border-[#004e9f]/30 hover:bg-blue-50 text-[#004e9f] font-bold rounded-lg text-2xs transition-all active:scale-95 cursor-pointer"
                        >
                          Review Telemetry
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
