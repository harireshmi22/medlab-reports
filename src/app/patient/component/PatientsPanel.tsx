import React, { useState } from 'react';
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
  FileText
} from 'lucide-react';
import { Patient, Report } from '@/types';
import { getSupabaseClient, getSupabaseConfig } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

interface PatientsPanelProps {
  patients: Patient[];
  reports: Report[];
  onAddPatientLocal: (newPatient: Patient) => void;
  onNavigateToReport: (reportId: string) => void;
}

export default function PatientsPanel({ patients, reports, onAddPatientLocal, onNavigateToReport }: PatientsPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('medlab123456'); // Default password for simplicity
  const [age, setAge] = useState('35');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [phone, setPhone] = useState('');

  // Selected patient details view state
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Filter patients by search term
  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.phone && p.phone.includes(searchTerm))
  );

  const getPatientReports = (patientId: string) => {
    return reports.filter(r => r.patientId === patientId);
  };

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

    const supabase = getSupabaseClient();
    const config = getSupabaseConfig();

    if (supabase && config) {
      try {
        // 1. Create a non-persistent client to sign up the new user without logging the admin out
        const tempClient = createClient(config.url, config.anonKey, {
          auth: { persistSession: false }
        });

        const { data: authData, error: authError } = await tempClient.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            data: {
              name: name.trim(),
              role: 'patient'
            }
          }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('No user data returned from authentication.');

        const userId = authData.user.id;

        // 2. Insert clinical record into patients table using the admin's main client
        const { error: patientError } = await supabase
          .from('patients')
          .insert([{
            profile_id: userId,
            name: name.trim(),
            email: email.trim(),
            age: parseInt(age) || 35,
            gender,
            blood_group: bloodGroup,
            phone: phone.trim(),
            avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpF2T5v2g6kd6FOwUZpDVw_rQ1JenZaS5YMSnK3ysw6YGVGDjkKKXv1oB7c5Nyjv_zMbi3SPfHK556YnStrCs8ZReV9Fp2hmsX8YYECMqcNMvIGXzo5NZPXafYeMOUkt_HRVHck93wT2ho-8QIEuO-lZcTuNk9jkcTG0w0Xfr6bAoEwxQDu2vpCze4ZkLi4zRp87pWoo7Gsjq1PYKOFp0R_7QCuEFAIj6pzeEZa85VRy67EhbsDGyYQO1FwvcdSvKtbCkEuYAzBA'
          }]);

        if (patientError) throw patientError;

        // 3. Callback to app layout state for local append
        onAddPatientLocal({
          id: userId,
          name: name.trim(),
          email: email.trim(),
          age: parseInt(age) || 35,
          gender,
          bloodGroup,
          phone: phone.trim(),
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpF2T5v2g6kd6FOwUZpDVw_rQ1JenZaS5YMSnK3ysw6YGVGDjkKKXv1oB7c5Nyjv_zMbi3SPfHK556YnStrCs8ZReV9Fp2hmsX8YYECMqcNMvIGXzo5NZPXafYeMOUkt_HRVHck93wT2ho-8QIEuO-lZcTuNk9jkcTG0w0Xfr6bAoEwxQDu2vpCze4ZkLi4zRp87pWoo7Gsjq1PYKOFp0R_7QCuEFAIj6pzeEZa85VRy67EhbsDGyYQO1FwvcdSvKtbCkEuYAzBA',
        });

        setSuccess(true);
        setTimeout(() => {
          setIsModalOpen(false);
          resetForm();
        }, 1500);

      } catch (err: any) {
        console.error('Error registering patient:', err);
        setError(err.message || 'Failed to create patient account.');
      } finally {
        setLoading(false);
      }
    } else {
      // Offline/Local Simulated registration
      setTimeout(() => {
        const mockId = `p-${Date.now()}`;
        const newPatient: Patient = {
          id: mockId,
          name: name.trim(),
          email: email.trim(),
          age: parseInt(age) || 35,
          gender,
          bloodGroup,
          phone: phone.trim(),
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpF2T5v2g6kd6FOwUZpDVw_rQ1JenZaS5YMSnK3ysw6YGVGDjkKKXv1oB7c5Nyjv_zMbi3SPfHK556YnStrCs8ZReV9Fp2hmsX8YYECMqcNMvIGXzo5NZPXafYeMOUkt_HRVHck93wT2ho-8QIEuO-lZcTuNk9jkcTG0w0Xfr6bAoEwxQDu2vpCze4ZkLi4zRp87pWoo7Gsjq1PYKOFp0R_7QCuEFAIj6pzeEZa85VRy67EhbsDGyYQO1FwvcdSvKtbCkEuYAzBA',
        };

        // Save simulated credentials to auth DB locally
        const existingUsersRaw = localStorage.getItem('medlab_simulated_users');
        const users = existingUsersRaw ? JSON.parse(existingUsersRaw) : [];
        users.push({
          id: mockId,
          email: email.trim(),
          password: password.trim(),
          name: name.trim(),
          role: 'patient'
        });
        localStorage.setItem('medlab_simulated_users', JSON.stringify(users));

        onAddPatientLocal(newPatient);
        setSuccess(true);
        setTimeout(() => {
          setIsModalOpen(false);
          resetForm();
        }, 1500);
        setLoading(false);
      }, 1000);
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

  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  const patientReports = selectedPatientId ? getPatientReports(selectedPatientId) : [];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-[#191c1d] tracking-tight">Patient Database Directory</h2>
          <p className="text-sm text-gray-400 font-bold mt-1.5">Manage patient accounts, register profiles, and review clinical histories.</p>
        </div>
        
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-1.5 px-4.5 py-3 bg-[#004e9f] hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 active:scale-95 cursor-pointer"
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
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by patient name, email, or phone..."
          className="w-full bg-white border border-[#c1c6d5]/40 pl-10 pr-4 py-2.5 rounded-xl text-xs font-semibold text-slate-800 focus:border-[#004e9f] focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm"
        />
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
      </div>

      {/* Main Content Splitter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Patient Cards Listing Grid */}
        <div className={`${selectedPatientId ? 'lg:col-span-6' : 'lg:col-span-12'} grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-300`}>
          {filteredPatients.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl col-span-full">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-xs font-bold text-slate-500">No patient accounts found.</p>
            </div>
          ) : (
            filteredPatients.map((patient) => {
              const patientReportsCount = getPatientReports(patient.id).length;
              const isSelected = selectedPatientId === patient.id;

              return (
                <motion.div
                  whileHover={{ y: -2, boxShadow: '0 8px 16px -6px rgba(0,0,0,0.04)' }}
                  key={patient.id}
                  onClick={() => setSelectedPatientId(isSelected ? null : patient.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer bg-white relative ${
                    isSelected 
                      ? 'border-[#004e9f] ring-2 ring-blue-50 shadow-sm' 
                      : 'border-slate-200 hover:border-slate-350 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <img 
                      alt={patient.name}
                      src={patient.avatar}
                      className="w-12 h-12 rounded-xl object-cover border-2 border-slate-100 shadow-sm"
                    />
                    <div className="overflow-hidden flex-1">
                      <h4 className="font-extrabold text-sm text-slate-900 truncate hover:text-[#004e9f] transition-colors">{patient.name}</h4>
                      <p className="text-[10px] font-bold text-gray-450 truncate mt-0.5">{patient.email}</p>
                      
                      <div className="flex flex-wrap gap-2.5 mt-3 text-[10px] text-gray-400 font-bold">
                        <span>Age: {patient.age}</span>
                        <span>•</span>
                        <span>Gender: {patient.gender}</span>
                        <span>•</span>
                        <span className="text-[#004e9f]">{patient.bloodGroup}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 justify-between h-12">
                      <span className="px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-[9px] font-bold text-slate-500">
                        {patientReportsCount} {patientReportsCount === 1 ? 'Report' : 'Reports'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Selected Patient Detailed Drawer panel */}
        <AnimatePresence>
          {selectedPatientId && selectedPatient && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              className="lg:col-span-6 bg-white border border-[#c1c6d5]/40 rounded-2xl p-6 shadow-sm space-y-6"
            >
              <div className="flex justify-between items-start border-b border-gray-150 pb-4">
                <div className="flex items-center gap-3">
                  <img 
                    alt={selectedPatient.name}
                    src={selectedPatient.avatar}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-md"
                  />
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">{selectedPatient.name}</h3>
                    <p className="text-2xs font-bold text-gray-405 mt-0.5">ID: {selectedPatient.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedPatientId(null)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-gray-400 hover:text-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Patient Attributes Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-150">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#004e9f]" />
                  <div>
                    <p className="text-[9px] uppercase font-bold text-gray-450">Email Address</p>
                    <p className="font-bold text-slate-800 truncate max-w-[180px]">{selectedPatient.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#004e9f]" />
                  <div>
                    <p className="text-[9px] uppercase font-bold text-gray-455">Phone Number</p>
                    <p className="font-bold text-slate-800">{selectedPatient.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#004e9f]" />
                  <div>
                    <p className="text-[9px] uppercase font-bold text-gray-450">Age / Gender</p>
                    <p className="font-bold text-slate-800">{selectedPatient.age} years / {selectedPatient.gender}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <div>
                    <p className="text-[9px] uppercase font-bold text-gray-450">Blood Group</p>
                    <p className="font-bold text-rose-800">{selectedPatient.bloodGroup}</p>
                  </div>
                </div>
              </div>

              {/* Patient Reports list section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Reports Log ({patientReports.length})</h4>
                {patientReports.length === 0 ? (
                  <div className="p-5 border border-dashed border-slate-200 rounded-xl text-center">
                    <FileText className="w-7 h-7 text-gray-300 mx-auto mb-1.5" />
                    <p className="text-[10px] font-bold text-gray-400">No medical reports registered for this patient yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {patientReports.map((report) => (
                      <div
                        key={report.id}
                        onClick={() => onNavigateToReport(report.id)}
                        className="p-3 border border-slate-200 hover:border-[#004e9f]/40 hover:bg-blue-50/20 rounded-xl transition-all cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <Activity className="w-4 h-4 text-[#004e9f] shrink-0" />
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-slate-800 truncate">{report.title}</p>
                            <p className="text-[9px] text-gray-400 mt-0.5">#{report.id} • {report.date}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border shrink-0 ${
                          report.patientAlertRequired 
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

      {/* Register Patient Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden max-w-md w-full p-8 relative"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 text-gray-400 hover:text-slate-805 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-1 mb-6">
                <div className="w-10 h-10 bg-[#004e9f]/15 text-[#004e9f] flex items-center justify-center rounded-2xl mx-auto shadow-inner">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Register Patient Profile</h3>
                <p className="text-[10px] text-gray-450 font-semibold">Creates login credentials and database schema record</p>
              </div>

              <form onSubmit={handleRegisterPatient} className="space-y-4">
                
                {/* Full Name */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter patient full name"
                    className="w-full bg-slate-50 border border-slate-200 pl-3.5 pr-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-800 focus:border-[#004e9f] focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="patient@example.com"
                    className="w-full bg-slate-50 border border-slate-200 pl-3.5 pr-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-800 focus:border-[#004e9f] focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>

                {/* Password (Temporary) */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Login Password</label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 pl-3.5 pr-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-800 focus:border-[#004e9f] focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                  <p className="text-[9px] text-gray-400 font-medium mt-1">Provide this password to the patient so they can sign in.</p>
                </div>

                {/* Demographics row: Age, Gender, Blood Group */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Age</label>
                    <input
                      type="number"
                      required
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-2.5 py-2.5 rounded-xl text-xs font-semibold text-slate-800 outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Blood Group</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-2.5 py-2.5 rounded-xl text-xs font-semibold text-slate-800 outline-none"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-slate-50 border border-slate-200 pl-3.5 pr-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-800 focus:border-[#004e9f] focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>

                {/* Info banners / Success banners */}
                {error && (
                  <div className="p-2.5 bg-rose-50 text-rose-750 text-[10px] font-bold rounded-lg border border-rose-100 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="p-2.5 bg-emerald-50 text-emerald-750 text-[10px] font-bold rounded-lg border border-emerald-100 flex items-center gap-1.5 animate-pulse">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Patient profile registered successfully!</span>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading || success}
                  className="w-full py-3 bg-[#004e9f] hover:bg-blue-800 disabled:bg-blue-300 text-white rounded-xl text-xs font-extrabold transition-all hover:shadow-lg shadow-blue-500/10 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Writing database records...</span>
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

    </div>
  );
}
