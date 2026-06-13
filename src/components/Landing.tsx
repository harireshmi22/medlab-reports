import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Activity,
    ArrowRight,
    Check,
    Shield,
    Upload,
    TrendingUp,
    FileText,
    Bell,
    Download,
    Lock,
    Globe,
    Workflow,
    Mail,
    FlaskConical,
    Laptop,
    CheckCircle2,
    Users,
    LogOut
} from 'lucide-react';
import { ViewState } from '@/types';
import { redirect } from 'next/dist/server/api-utils';

interface LandingPageProps {
    onNavigate?: (view: ViewState) => void;
    onOpenAuth?: (role: 'patient' | 'admin') => void;
    isLoggedIn?: boolean;
    currentUserProfile?: {
        name: string;
        patientId: string;
        avatar: string;
        email?: string;
    };
    currentUserRole?: 'patient' | 'admin';
    onLogout?: () => void;
}

export default function LandingPage({
    onNavigate = () => { },
    onOpenAuth = () => { },
    isLoggedIn = false,
    currentUserProfile = {
        name: '',
        patientId: '',
        avatar: '',
        email: ''
    },
    currentUserRole = 'patient',
    onLogout = () => { }
}: LandingPageProps = {}) {
    const [activeTab, setActiveTab] = useState<'Home' | 'Features' | 'How it Works'>('Home');

    const stats = [
        { value: '2.4M', label: 'REPORTS DELIVERED' },
        { value: '15k+', label: 'ACTIVE PATIENTS' },
        { value: '99.9%', label: 'UPTIME SLA' },
        { value: '256-bit', label: 'DATA ENCRYPTION' }
    ];

    const features = [
        {
            icon: <Activity className="w-6 h-6 text-[#004e9f]" />,
            title: 'Real-time updates',
            desc: 'Instant synchronization between lab analyzers and patient portals ensures zero delay in information flow.'
        },
        {
            icon: <Shield className="w-6 h-6 text-[#006a65]" />,
            title: 'Secure patient data',
            desc: 'End-to-end encryption and HIPAA compliance protocols protect every single clinical data point.'
        },
        {
            icon: <Upload className="w-6 h-6 text-[#005d1e]" />,
            title: 'PDF report upload',
            desc: 'Support for batch PDF processing with intelligent OCR to extract critical health markers automatically.'
        },
        {
            icon: <TrendingUp className="w-6 h-6 text-[#004e9f]" />,
            title: 'Health trend tracking',
            desc: 'Visual historical comparisons allow patients to track their progress across multiple tests over time.'
        }
    ];

    return (
        <div className="bg-slate-50 min-h-screen text-[#191c1d] font-sans overflow-x-hidden">
            {/* Hero Section */}
            <section id="home" className="relative overflow-hidden pt-12 md:pt-20 pb-20 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="z-10 text-left"
                    >
                        <span className="inline-block px-4 py-1.5 bg-blue-100 text-[#004e9f] rounded-full text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
                            NEW: Automated Pathology Workflows
                        </span>
                        <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-[1.15] tracking-tight mb-6">
                            Real-Time Blood Report Management for Modern Labs
                        </h1>
                        <p className="text-gray-600 text-lg mb-8 max-w-[540px] leading-relaxed">
                            Upload, manage, and deliver patient blood reports instantly with secure dashboards and real-time updates. Experience a clinical ecosystem built for speed and precision.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => onNavigate('PASS_DASHBOARD')}
                                className="bg-[#004e9f] text-white font-medium px-6 py-3.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/10 hover:bg-blue-800 transition-all flex items-center gap-2 group active:scale-95"
                            >
                                View Patient Portal
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => onNavigate('ADMIN_DASHBOARD')}
                                className="border-2 border-slate-300 text-slate-700 hover:text-[#004e9f] hover:border-[#004e9f] font-medium px-6 py-3.5 rounded-xl hover:bg-white transition-all active:scale-95"
                            >
                                Access Lab Admin
                            </button>
                        </div>

                        <div className="mt-12 flex items-center gap-4">
                            <div className="flex -space-x-3">
                                <Image
                                    className="w-10 h-10 rounded-full border-2 border-white object-cover"
                                    alt="Doctor avatar"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbBSKa6b8gKOp6AaBmrDXQkjZOkktgagjpdA9bKYzMlqCxhFAMDrX0kYD8Ll6m_gUTLQrUpksEH2dYq5JDoAVw761hdirEIKfGX3YgzgfqNHRtGBQYLQPordOqYAUrOfm3mq6FSi0TvOOXGutmN3BHO3K0qg402dP3DRsJ3GQGK9broOYLBEyVunn6bT95adMZFakzeux70nLmbyUYldrmpaE16QALu4w6kts-5AC9QrGTsRsLuQluNPXwRTsF9lh-yseHJHNLtQ"
                                    width={"10"}
                                    height={"10"}
                                />
                                <Image
                                    className="w-10 h-10 rounded-full border-2 border-white object-cover"
                                    alt="Technician avatar"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGobGhAdIKclk7giBtU7JvH3p5uPJTcz0i07XslLEXCN1OmFWZpVDsfGDGKpCmCwymNqyRZIwNvQrwSEL7qvN7VGJoIdseHIb2BW0L-wMHBnnHc512lhh2y7_wg6gTDiiO1XTW1fqejFe2qxZHtjJ3EMT-AsXCbWtZNlWj7knEIA-mvp_D78ShJbJgsrb1wXYgkLPTYWUeFAyuWMg5bOaOZ1tpn4DTTSohAyYBg4OBu4sOy6xUmwq_MmauBDRJuQncElq8Brr4ow"
                                    width={"10"}
                                    height={"10"}
                                />
                                <Image
                                    className="w-10 h-10 rounded-full border-2 border-white object-cover"
                                    alt="Pathologist avatar"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0xrO9WmYNlEa1fJDt61WWIW-H9MKffduo2eRn0HeqF23fNZQowMNF_or0tirOF63wLYkm-k7Y1dnJdVzhrjDc1OXqe5-7TBZGjqU5XPitIb_P-S8Z-EAiKEYZdg08uMd-5Zwy6nodWBfjcs-qy8UqEVpJehkxXO0j0LcFolY6rWDwVgfUqnwvYSy1ppBUsp97cOMeqYS6XXkZ_egFHLaHq1iiHYept-9E6DQD2uQ10vrrrNKIRLvUZN0Atpef8Fk0SrG47dfAJQ"
                                    width={"10"}
                                    height={"10"}
                                />
                            </div>
                            <p className="text-gray-500 text-sm">
                                Trusted by <span className="font-bold text-[#004e9f]">500+</span> Clinical Laboratories
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
                        className="relative"
                    >
                        <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-200/40 blur-3xl rounded-full"></div>
                        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-teal-100/40  blur-3xl rounded-full"></div>

                        <div className="bg-white rounded-2xl p-4 shadow-2xl relative overflow-hidden border border-slate-100 group">
                            <Image
                                className="rounded-xl w-full aspect-4/3 object-cover"
                                alt="Modern health diagnostics monitor"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBKnYNYC79PNVWT8YmIqQY6gjoPcrJVIvGvJLtLtNvWtnA-CNu1v-WJ3Klglpu4ACE3bybmKqx97blo4uEuNeu_R1e0sLC0whwlqP_GvZeoPIj3HZIWz0VH6jJXv8EmuMT10U0C81DIgw6t1qIO7eGX-EM0YPc1uBv-Msj9ae4lL0ToDeyyHcUuaeOLUASzkAcmYdi-EO0Oys_YXjjWZPG8PD1sYVcxky4WvqaihT-aa03wJTRxamO58a6eT8EvVKxkimg9XxwDA"
                                width={"10"}
                                height={"10"}
                            />
                            <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-2 border border-slate-100 animate-bounce-subtle">
                                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-bold text-slate-800">Live Updates: Lipid Panel</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Feature Cards Section */}
            <section id="features" className="py-20 bg-slate-100 border-t border-b border-gray-200/50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Precision Features for Patient Excellence</h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            Our platform bridges the gap between laboratory processing and patient understanding with specialized tools.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, i) => (
                            <motion.div
                                whileHover={{ y: -6, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
                                key={i}
                                className="bg-white p-6 rounded-2xl border border-slate-200 transition-all group flex flex-col justify-between"
                            >
                                <div>
                                    <div className="w-12 h-12 bg-blue-50 group-hover:bg-[#004e9f]/10 rounded-xl flex items-center justify-center text-[#004e9f] mb-6 transition-colors">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-3">{feature.title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-20 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-extrabold text-slate-900 mb-4">How It Works</h2>
                        <p className="text-[#414753] text-lg">Streamlining the diagnostic lifecycle in three simple steps.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* Step 1 */}
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-[#004e9f] text-white rounded-full flex items-center justify-center font-bold text-2xl mb-6 shadow-lg shadow-blue-500/20">
                                1
                            </div>
                            <h4 className="text-lg font-bold text-slate-800 mb-3">Lab uploads report</h4>
                            <p className="text-sm text-gray-500 max-w-xs mb-6">Lab technicians upload PDF results or enter data directly into the secure portal.</p>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 w-full max-w-[240px] shadow-sm">
                                <Image
                                    className="rounded-lg mb-4 h-32 object-cover w-full shadow-inner"
                                    alt="Technician uploading diagnostic reports"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOPTADw-pNYGVzyKLZSxmXEFWlzMdR0bXHq3pUELUriCr2s7BE1cMr3Nj4zYYGIADV2jpvBpOZOnUlB4kINX36Srgv8Hv04f7FuIriewD7ImWbU2jvmsvSgnqwXe_A4hJyJ9etVPn_fWo9cD8EgxSzWRhNeY8REKg6YprQZKe6TjBRxYVVUZU5tO_KTGdDXnZw7P85XJguaLKC0FdoBjnVWkhLMbwr06LCiCRlqTzFE8A0zRxWmY20a8ZMkEW1pA7ECcliNKRA1w"
                                    width={100}
                                    height={100}
                                />
                                <div className="h-2 w-full bg-blue-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: '10%' }}
                                        whileInView={{ width: '75%' }}
                                        transition={{ duration: 1.5 }}
                                        className="h-full bg-[#004e9f]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-[#004e9f] text-white rounded-full flex items-center justify-center font-bold text-2xl mb-6 shadow-lg shadow-blue-500/20">
                                2
                            </div>
                            <h4 className="text-lg font-bold text-slate-800 mb-3">Patient gets notified</h4>
                            <p className="text-sm text-gray-500 max-w-xs mb-6 font-medium">Automated SMS and email notifications are triggered the moment results are verified.</p>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 w-full max-w-[240px] shadow-sm flex flex-col justify-between h-[184px]">
                                <div className="flex items-center gap-2 mb-2 text-teal-600">
                                    <Bell className="w-4 h-4 text-teal-600" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">New Notification</span>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-teal-100 shadow-sm text-left my-2">
                                    <p className="text-xs font-semibold text-slate-800">MedLab Reports</p>
                                    <p className="text-[10px] leading-relaxed text-gray-500 mt-1">Hello John, your Lipid Panel results are now ready for secure viewing.</p>
                                </div>
                                <div className="bg-neutral-200 h-1.5 w-1/2 rounded-full"></div>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-[#004e9f] text-white rounded-full flex items-center justify-center font-bold text-2xl mb-6 shadow-lg shadow-blue-500/20">
                                3
                            </div>
                            <h4 className="text-lg font-bold text-slate-800 mb-3">Patient views/downloads</h4>
                            <p className="text-sm text-gray-500 max-w-xs mb-6">Secure access via the dashboard for viewing detailed trends and downloading PDF copies.</p>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 w-full max-w-[240px] shadow-sm">
                                <Image
                                    className="rounded-lg mb-3 h-32 object-cover w-full shadow-inner"
                                    alt="Viewing medical results on smartphone"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBoWfsH9k6sP4nCeJzd8yvIcKmP6Wg9ibm1i1QGNwizXGgA6MNrGVMuIx9V-SL21FSox978n45wZ4V1trSvR7-7z25-lDZTm-7f7idC_VgeqFOoYqZGgmf9tpKpsywNHhrth0dvhROODyWl9gMwOkIuRs3DgwlaEwcEIxTYgkgotGLd98PjcH7Ho--6F1AB1GhOil2t6EwDyfH-zQZ_UzPNMbB99UVpOvbIt5flguFu9JgHjIYonUzlub1qlcZ9OpMK8DgRVyV-w"
                                    width={100}
                                    height={100}
                                />
                                <div className="flex justify-between items-center bg-white px-2 py-1.5 rounded-lg border border-gray-100">
                                    <span className="text-[10px] font-bold text-slate-700">REPORT_092.pdf</span>
                                    <Download className="w-3.5 h-3.5 text-[#004e9f]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-[#004e9f] text-white my-8">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {stats.map((stat, idx) => (
                        <div key={idx}>
                            <div className="text-4xl lg:text-5xl font-extrabold mb-2 tracking-tight">{stat.value}</div>
                            <div className="text-xs font-bold text-[#dfe8ff] tracking-widest uppercase">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto bg-white rounded-3xl p-10 md:p-14 text-center border border-gray-100 shadow-xl relative overflow-hidden">
                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#004e9f]/5 rounded-full blur-2xl"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Ready to modernize your lab workflows?</h2>
                        <p className="text-gray-600 text-lg mb-8 max-w-xl mx-auto">
                            Join hundreds of medical professionals who trust MedLab Reports for their diagnostic delivery.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => onOpenAuth('patient')}
                                className="bg-[#004e9f] text-white font-bold px-8 py-4 rounded-xl hover:shadow-xl hover:bg-blue-800 transition-all shadow-md shadow-blue-500/10 active:scale-95 text-base"
                            >
                                Get Started for Free
                            </button>
                            <button
                                onClick={() => onNavigate('ADMIN_DASHBOARD')}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-8 py-4 rounded-xl transition-all active:scale-95 text-base"
                            >
                                Schedule a Demo
                            </button>
                        </div>
                    </div>
                </div>
            </section>


        </div>
    );
}
