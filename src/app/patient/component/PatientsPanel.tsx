import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Search,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Heart,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FlaskConical,
  Activity,
  FileText,
  Pencil,
  Trash2,
  AlertTriangle,
  Save,
  Droplets,
  ShieldCheck
} from 'lucide-react';
import { Patient, Report } from '@/types';

interface PatientsPanelProps {
  patients: Patient[];
  reports: Report[];
  onAddPatientLocal: (newPatient: Patient) => void;
  onNavigateToReport: (reportId: string) => void;
  onEditPatient?: (updatedPatient: Patient) => void;
  onDeletePatient?: (patientId: string) => void;

  // Pagination & Search extensions
  searchTerm: string;
  onSearchChange: (value: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPatientsCount: number;
  pageSize: number;
}

export default function PatientsPanel({
  patients,
  reports,
  onAddPatientLocal,
  onNavigateToReport,
  onEditPatient,
  onDeletePatient,
  searchTerm,
  onSearchChange,
  currentPage,
  onPageChange,
  totalPatientsCount,
  pageSize
}: PatientsPanelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('medlab123456');
  const [age, setAge] = useState('35');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [phone, setPhone] = useState('');

  // Selected patient details view state
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const selectedPatientId = selectedPatient?.id || null;

  // Selected patient reports fetched from server
  const [selectedPatientReports, setSelectedPatientReports] = useState<Report[]>([]);
  const [loadingPatientReports, setLoadingPatientReports] = useState(false);

  // Edit patient modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);
  const [editPatientId, setEditPatientId] = useState<string>('');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editBloodGroup, setEditBloodGroup] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletePatientId, setDeletePatientId] = useState<string>('');
  const [deletePatientName, setDeletePatientName] = useState<string>('');

  // Filter patients by search term - now mapped directly to the paginated/filtered patients from server
  const filteredPatients = patients;

  // Effect to load patient reports dynamically when selected
  React.useEffect(() => {
    if (!selectedPatientId) {
      setSelectedPatientReports([]);
      return;
    }

    const fetchReportsForPatient = async () => {
      setLoadingPatientReports(true);
      try {
        const response = await fetch(`/api/reports?patientId=${selectedPatientId}`);
        const data = await response.json();
        if (data.success) {
          const mapped: Report[] = (data.reports || []).map((r: any) => {
            const items = (r.report_items || []).map((i: any) => ({
              id: i.id,
              name: i.test_name,
              result: parseFloat(i.result_value) || 0,
              unit: i.unit || '',
              minNormal: parseFloat(i.normal_range?.split('-')[0]) || 0,
              maxNormal: parseFloat(i.normal_range?.split('-')[1]) || 0,
              status: (i.flag || 'NORMAL')
            }));
            const isAlert = items.some((item: any) => ['HIGH', 'LOW', 'CRITICAL'].includes(item.status));
            return {
              id: r.id,
              labRef: r.report_no || 'L-UNKNOWN',
              patientId: r.patient_id,
              patientName: selectedPatient?.name || 'Selected Patient',
              date: new Date(r.published_at || r.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
              title: r.status === 'published' ? (items.length > 3 ? 'Comprehensive Blood Panel' : 'Lipid Profile & Glucose') : 'Pending Blood Chemistry',
              referrer: 'Dr. Sarah Miller',
              patientAlertRequired: isAlert,
              items,
              pdf_url: r.pdf_url || undefined,
              doctorRemarks: r.notes || (isAlert ? 'Needs attention.' : 'Patient demonstrates excellent physiological wellness.')
            };
          });
          setSelectedPatientReports(mapped);
        }
      } catch (err) {
        console.error('Failed to load selected patient reports:', err);
      } finally {
        setLoadingPatientReports(false);
      }
    };

    fetchReportsForPatient();
  }, [selectedPatientId, selectedPatient?.name]);

  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSuccess(false);

    if (!name || !email || !password) {
      setError('Name, email, and password are required.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          age: parseInt(age) || 35,
          gender,
          bloodGroup,
          phone: phone.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create patient account.');
      }

      onAddPatientLocal(data.patient);
      setSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        resetForm();
      }, 1500);

    } catch (err) {
      console.error('Error registering patient:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage || 'Failed to create patient account.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('medlab123456');
    setAge('35');
    setGender('Male');
    setBloodGroup('O+');
    setPhone('');
    setError('');
    setSuccess(false);
  };

  // --- Edit Patient Handlers ---
  const openEditModal = (patient: Patient) => {
    setEditPatientId(patient.id);
    setEditName(patient.name);
    setEditEmail(patient.email);
    setEditAge(patient.age.toString());
    setEditGender(patient.gender);
    setEditBloodGroup(patient.bloodGroup || 'O+');
    setEditPhone(patient.phone || '');
    setEditError('');
    setEditSuccess(false);
    setIsEditModalOpen(true);
  };

  const handleEditPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    setEditLoading(true);
    setEditSuccess(false);

    if (!editName) {
      setEditError('Patient name is required.');
      setEditLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/patient/${editPatientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          email: editEmail.trim(),
          age: parseInt(editAge) || 30,
          gender: editGender,
          bloodGroup: editBloodGroup,
          phone: editPhone.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update patient.');
      }

      if (onEditPatient) {
        onEditPatient(data.patient);
      }

      setEditSuccess(true);
      setTimeout(() => {
        setIsEditModalOpen(false);
        setEditSuccess(false);
      }, 1500);

    } catch (err) {
      console.error('Error updating patient:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setEditError(errorMessage || 'Failed to update patient.');
    } finally {
      setEditLoading(false);
    }
  };

  // --- Delete Patient Handlers ---
  const openDeleteModal = (patient: Patient) => {
    setDeletePatientId(patient.id);
    setDeletePatientName(patient.name);
    setIsDeleteModalOpen(true);
  };

  const handleDeletePatient = async () => {
    setDeleteLoading(true);

    try {
      const response = await fetch(`/api/patient/${deletePatientId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete patient.');
      }

      if (onDeletePatient) {
        onDeletePatient(deletePatientId);
      }

      if (selectedPatient?.id === deletePatientId) {
        setSelectedPatient(null);
      }

      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error('Error deleting patient:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Shared input styles
  const inputClass = "w-full bg-white border border-slate-200 pl-3.5 pr-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-900 focus:border-[#004e9f] focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400";
  const labelClass = "block text-[11px] uppercase font-bold text-slate-500 mb-1.5 tracking-wider";
  const selectClass = "w-full bg-white border border-slate-200 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-[#004e9f] focus:ring-2 focus:ring-blue-100 transition-all";

  return (
    <div className="space-y-6 pb-12">

      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-[#191c1d] tracking-tight">Patient Database Directory</h2>
          <p className="text-sm text-slate-500 font-medium mt-1.5">Manage patient accounts, register profiles, and review clinical histories.</p>
        </div>

        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-1.5 px-5 py-3 bg-[#004e9f] hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 active:scale-95 cursor-pointer"
        >
          <UserPlus className="w-4 h-4 text-white" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md w-full">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by patient name, email, or phone..."
          className="w-full bg-white border border-[#c1c6d5]/40 pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium text-slate-800 focus:border-[#004e9f] focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm placeholder:text-slate-400"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
      </div>

      {/* Main Content Splitter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Patient Cards Listing Grid */}
        <div className={`${selectedPatientId ? 'lg:col-span-6' : 'lg:col-span-12'} flex flex-col gap-4 transition-all duration-300`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPatients.length === 0 ? (
              <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl col-span-full">
                <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-500">No patient accounts found.</p>
              </div>
            ) : (
              filteredPatients.map((patient) => {
                const patientReportsCount = patient.reportsCount || 0;
                const isSelected = selectedPatientId === patient.id;

                return (
                  <motion.div
                    whileHover={{ y: -2, boxShadow: '0 8px 20px -6px rgba(0,78,159,0.08)' }}
                    key={patient.id}
                    onClick={() => setSelectedPatient(isSelected ? null : patient)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer bg-white relative ${isSelected
                        ? 'border-[#004e9f] ring-2 ring-blue-50 shadow-md'
                        : 'border-slate-200 hover:border-slate-300 shadow-sm'
                      }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <Image
                        alt={patient.name}
                        src={patient.avatar}
                        width={44}
                        height={44}
                        className="w-11 h-11 rounded-xl object-cover border-2 border-slate-100 shadow-sm shrink-0"
                        loading="lazy"
                      />
                      <div className="overflow-hidden flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-slate-900 truncate">{patient.name}</h4>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{patient.email}</p>

                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2.5 text-xs text-slate-600 font-medium">
                          <span>Age: {patient.age}</span>
                          <span className="text-slate-300">•</span>
                          <span>Gender: {patient.gender}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[#004e9f] font-bold">{patient.bloodGroup || 'O+'}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0 gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-600">
                          {patientReportsCount} {patientReportsCount === 1 ? 'Report' : 'Reports'}
                        </span>

                        {/* Edit & Delete action buttons */}
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); openEditModal(patient); }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#004e9f] hover:bg-blue-50 transition-all"
                            title="Edit patient"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); openDeleteModal(patient); }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                            title="Remove patient"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Patients server-side pagination controls */}
          {totalPatientsCount > pageSize && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
              <button
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-white"
              >
                Previous
              </button>
              <span className="text-xs font-bold text-slate-500">
                Page {currentPage} of {Math.ceil(totalPatientsCount / pageSize)}
              </span>
              <button
                onClick={() => onPageChange(Math.min(currentPage + 1, Math.ceil(totalPatientsCount / pageSize)))}
                disabled={currentPage === Math.ceil(totalPatientsCount / pageSize)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-white"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* ===== Selected Patient Detailed Drawer Panel ===== */}
        <AnimatePresence>
          {selectedPatientId && selectedPatient && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              className="lg:col-span-6 bg-white border border-[#c1c6d5]/40 rounded-2xl p-6 shadow-sm space-y-6"
            >
              {/* Header with patient avatar */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3.5">
                  <Image
                    alt={selectedPatient.name}
                    src={selectedPatient.avatar}
                    width={56}
                    height={56}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-md"
                    loading="lazy"
                  />
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">{selectedPatient.name}</h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">ID: {selectedPatient.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(selectedPatient)}
                    className="p-1.5 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-[#004e9f] transition-colors"
                    title="Edit patient"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(selectedPatient)}
                    className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                    title="Remove patient"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedPatient(null)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-800 transition-colors"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Patient Attributes Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-[#004e9f]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email</p>
                    <p className="font-semibold text-slate-800 truncate">{selectedPatient.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-[#004e9f]" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Phone</p>
                    <p className="font-semibold text-slate-800">{selectedPatient.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-[#004e9f]" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Age / Gender</p>
                    <p className="font-semibold text-slate-800">{selectedPatient.age} years / {selectedPatient.gender}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
                    <Droplets className="w-4 h-4 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Blood Group</p>
                    <p className="font-bold text-rose-600 text-sm">{selectedPatient.bloodGroup || 'O+'}</p>
                  </div>
                </div>
              </div>

              {/* Patient Reports list section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Reports Log ({selectedPatientReports.length})</h4>
                {loadingPatientReports ? (
                  <div className="flex items-center justify-center py-8 bg-slate-50 border border-slate-100 rounded-xl">
                    <Loader2 className="w-5 h-5 text-[#004e9f] animate-spin" />
                  </div>
                ) : selectedPatientReports.length === 0 ? (
                  <div className="p-6 border border-dashed border-slate-200 rounded-xl text-center">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-500">No medical reports registered for this patient yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {selectedPatientReports.map((report) => (
                      <div
                        key={report.id}
                        onClick={() => onNavigateToReport(report.id)}
                        className="p-3.5 border border-slate-200 hover:border-[#004e9f]/40 hover:bg-blue-50/30 rounded-xl transition-all cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <Activity className="w-4 h-4 text-[#004e9f] shrink-0" />
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-slate-800 truncate">{report.title}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">#{report.id} • {report.date}</p>
                          </div>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${report.patientAlertRequired
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                          {report.patientAlertRequired ? 'ALERT' : 'NORMAL'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ===================== Register Patient Modal ===================== */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-7 pt-7 pb-5 border-b border-slate-100 bg-gradient-to-b from-blue-50/80 to-white">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-[#004e9f] text-white flex items-center justify-center rounded-xl shadow-lg shadow-blue-500/20">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Register Patient</h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Create login credentials & database profile</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Form Body */}
              <form onSubmit={handleRegisterPatient} className="p-7 space-y-5">

                <div>
                  <label className={labelClass}>Full Name</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter patient full name" className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>Email Address</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="patient@example.com" className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>Login Password</label>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputClass} />
                  <p className="text-[10px] text-slate-400 font-medium mt-1.5">Share this password with the patient for sign-in access.</p>
                </div>

                {/* Demographics row */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>Age</label>
                    <input type="number" required value={age} onChange={(e) => setAge(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Gender</label>
                    <select value={gender} onChange={(e) => setGender(e.target.value)} className={selectClass}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Blood Group</label>
                    <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className={selectClass}>
                      {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Phone Number</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className={inputClass} />
                </div>

                {/* Error / Success alerts */}
                {error && (
                  <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Patient profile registered successfully!</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || success}
                  className="w-full py-3 bg-[#004e9f] hover:bg-blue-800 disabled:bg-blue-300 text-white rounded-xl text-sm font-bold transition-all hover:shadow-lg shadow-blue-500/15 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating records...</span>
                    </>
                  ) : (
                    <span>Register Patient</span>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===================== Edit Patient Modal ===================== */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsEditModalOpen(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-7 pt-7 pb-5 border-b border-slate-100 bg-gradient-to-b from-amber-50/80 to-white">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-amber-500 text-white flex items-center justify-center rounded-xl shadow-lg shadow-amber-500/20">
                      <Pencil className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Edit Patient</h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Update profile information in the database</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Form Body */}
              <form onSubmit={handleEditPatient} className="p-7 space-y-5">

                <div>
                  <label className={labelClass}>Full Name</label>
                  <input type="text" required value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Patient full name" className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>Email Address</label>
                  <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="patient@example.com" className={inputClass} />
                </div>

                {/* Demographics row */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>Age</label>
                    <input type="number" value={editAge} onChange={(e) => setEditAge(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Gender</label>
                    <select value={editGender} onChange={(e) => setEditGender(e.target.value)} className={selectClass}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Blood Group</label>
                    <select value={editBloodGroup} onChange={(e) => setEditBloodGroup(e.target.value)} className={selectClass}>
                      {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Phone Number</label>
                  <input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="+91 98765 43210" className={inputClass} />
                </div>

                {/* Error / Success alerts */}
                {editError && (
                  <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{editError}</span>
                  </div>
                )}

                {editSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Patient details updated successfully!</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={editLoading || editSuccess}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-xl text-sm font-bold transition-all hover:shadow-lg shadow-amber-500/15 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  {editLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating records...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===================== Delete Confirmation Modal ===================== */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsDeleteModalOpen(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full overflow-hidden"
            >
              {/* Header with danger gradient */}
              <div className="px-7 pt-8 pb-6 text-center bg-gradient-to-b from-rose-50 to-white">
                <div className="w-16 h-16 bg-rose-100 text-rose-600 flex items-center justify-center rounded-full mx-auto mb-4 ring-4 ring-rose-50">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Delete Patient?</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed mt-2 max-w-xs mx-auto">
                  This will permanently remove <span className="font-bold text-slate-800">{deletePatientName}</span> and all associated data from the database.
                </p>
              </div>

              {/* Actions */}
              <div className="px-7 pb-7 pt-2 flex gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={deleteLoading}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeletePatient}
                  disabled={deleteLoading}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  {deleteLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
