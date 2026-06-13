"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Loader2, Mail, Lock, Shield, ArrowLeft, Terminal, CheckCircle2, FlaskConical, Cpu } from "lucide-react"
import Link from "next/link"

export default function AdminLogin() {
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
            const response = await fetch("/api/auth/admin/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                setMessage("Login successful! Accessing LIS Core...")
                localStorage.setItem("auth_token", data.token)
                localStorage.setItem("user_role", data.profile?.role || "admin")
                router.push("/admin/dashboard")
            } else {
                setIsError(true)
                setMessage(data.message || "Invalid credentials.")
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
            <div className="hidden lg:flex lg:w-1/2 relative bg-[#0a1931] overflow-hidden flex-col justify-between p-12 text-white border-r border-slate-900">
                {/* Background Grid & Blurs */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#152a4a_1px,transparent_1px),linear-gradient(to_bottom,#152a4a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
                <div className="absolute top-1/3 -left-20 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl" />
                <div className="absolute bottom-1/3 -right-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl" />

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
                        <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">MedLab LIS</span>
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
                            <Cpu className="w-3.5 h-3.5 text-blue-400" /> Pathology Core LIS
                        </span>
                        <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
                            Lab Administrator & Pathologist Portal
                        </h1>
                        <p className="text-slate-400 text-base leading-relaxed">
                            Manage patient records, verify diagnostic analytics, compile trend metrics, and orchestrate laboratory workflows securely.
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
                            "Real-time analyzer connectivity & telemetry",
                            "Batch PDF processing & automated OCR extraction",
                            "Secure HL7/FHIR-compliant messaging cores"
                        ].map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                                <div className="mt-1 w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
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
                        <Terminal className="w-4 h-4 text-blue-400" />
                        <span>Enterprise LIS v2.4</span>
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
                    <span className="font-bold text-base text-slate-800">MedLab LIS</span>
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
                    {/* Accent bar */}
                    <div className="h-1.5 bg-gradient-to-r from-blue-700 to-indigo-900" />

                    <div className="p-8">
                        {/* Title and subtitle */}
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Pathology Login</h2>
                            <p className="text-slate-500 text-sm font-medium mt-1.5">Access lab coordinator dashboard</p>
                        </div>

                        {/* Message / Status Panel */}
                        {message && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`mb-6 p-4 rounded-xl text-xs font-bold border transition-colors ${
                                    isError 
                                        ? 'bg-red-50 text-red-700 border-red-200' 
                                        : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                }`}
                            >
                                {message}
                            </motion.div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">LIS Username / Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="admin@medlab.com"
                                        required
                                        className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-sm font-medium text-slate-800 placeholder-slate-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Access Key / Password</label>
                                    <a href="#" className="text-xs font-bold text-blue-600 hover:underline">Reset LIS</a>
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
                                        className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-sm font-medium text-slate-800 placeholder-slate-400"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#0a1931] hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-blue-500/10 active:scale-98 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer font-sans"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Authorizing...</span>
                                    </>
                                ) : (
                                    <span>Authenticate Portal</span>
                                )}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}