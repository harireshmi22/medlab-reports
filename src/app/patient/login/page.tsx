"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { Loader2, Mail, Lock, Shield, ArrowLeft, Heart, CheckCircle2, FlaskConical, Sparkles } from "lucide-react"
import Link from "next/link"

export default function PatientLogin() {
    const router = useRouter()

    const [formData, setFormData] = useState({ email: "", password: "" })
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [isError, setIsError] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage("")
        setIsError(false)

        try {
            const response = await fetch("/api/auth/patient/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (data.success) {
                localStorage.setItem("auth_token", data.token);
                localStorage.setItem("user_role", "patient");
                router.push("/patient/dashboard");
            } else {
                setIsError(true);
                setMessage(data.message || "Invalid email or password");
            }
        } catch (error) {
            setIsError(true)
            setMessage("Something went wrong. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setMessage("")
        setIsError(false)
    }


    return (
        <div className="min-h-screen w-full flex bg-slate-50 font-sans">
            {/* Left Brand Panel (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden flex-col justify-between p-12 text-white border-r border-slate-800">
                {/* Background Blobs and Decorative Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
                <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-blue-600/30 blur-3xl" />
                <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-teal-500/20 blur-3xl" />

                {/* Top Brand Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10 flex items-center gap-3"
                >
                    <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                        <div className="w-10 h-10 rounded-xl bg-[#004e9f] flex items-center justify-center text-white shadow-md shadow-blue-500/10">
                            <FlaskConical className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent font-[family-name:var(--font-heading)]">MedLab Reports</span>
                    </Link>
                </motion.div>

                {/* Middle Content */}
                <div className="relative z-10 my-auto max-w-md space-y-8">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="space-y-4"
                    >
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400 uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5" /> Patient Portal
                        </span>
                        <h1 className="text-4xl font-extrabold leading-tight tracking-tight font-[family-name:var(--font-heading)]">
                            Access Your Health Records Safely & Instantly
                        </h1>
                        <p className="text-slate-400 text-base leading-relaxed">
                            Log in to view live diagnostics, download PDF reports, and consult medical charts on your personalized wellness dashboard.
                        </p>
                    </motion.div>

                    {/* Features list */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="space-y-4"
                    >
                        {[
                            "Direct synchronization with laboratory analyzers",
                            "Historical blood panels trend mapping",
                            "Secure end-to-end HIPAA data encryption"
                        ].map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                                <div className="mt-1 w-5 h-5 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-slate-300 text-sm font-medium">{feature}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Footer stats */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="relative z-10 border-t border-slate-800/80 pt-6 flex justify-between items-center text-xs text-slate-400 font-semibold"
                >
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-teal-500" />
                        <span>HIPAA Compliant</span>
                    </div>
                    <span>© 2026 MedLab Reports</span>
                </motion.div>
            </div>

            {/* Right Form Panel */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 md:p-20 relative overflow-hidden bg-slate-50">
                {/* Mobile header (logo overlay on right panel) */}
                <div className="absolute top-6 left-6 lg:hidden flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#004e9f] flex items-center justify-center text-white">
                        <FlaskConical className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-base text-slate-800">MedLab Reports</span>
                </div>

                {/* Back Link */}
                <Link
                    href="/"
                    className="absolute top-6 right-6 flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm cursor-pointer"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Home
                </Link>

                {/* Login Form Wrapper */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden flex flex-col justify-between"
                >
                    {/* Visual colored accent bar */}
                    <div className="h-1.5 bg-linear-to-r from-teal-500 to-[#004e9f]" />

                    <div className="p-8">
                        {/* Title and subtitle */}
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight font-[family-name:var(--font-heading)]">Patient Login</h2>
                            <p className="text-slate-500 text-sm font-medium mt-1.5">Access your diagnostic reports</p>
                        </div>

                        {/* Message / Status Panel */}
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`mb-6 p-4 rounded-xl text-xs font-bold border transition-colors ${isError
                                    ? 'bg-red-50 text-red-700 border-red-200'
                                    : 'bg-green-50 text-teal-800 border-green-200'
                                    }`}
                            >
                                {message}
                            </motion.div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="patient@medlabs.com"
                                        required
                                        className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004e9f] focus:border-transparent transition-all text-sm font-medium text-slate-800 placeholder-slate-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                                    <a href="#" className="text-xs font-bold text-[#004e9f] hover:underline">Forgot?</a>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="••••••••"
                                        required
                                        className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004e9f] focus:border-transparent transition-all text-sm font-medium text-slate-800 placeholder-slate-400"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#004e9f] hover:bg-blue-800 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-blue-500/10 active:scale-98 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer font-sans"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Logging in...</span>
                                    </>
                                ) : (
                                    <span>Log In to Dashboard</span>
                                )}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}