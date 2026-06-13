import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { FlaskConical, ArrowRight } from 'lucide-react'

const Header = ({
    onNavigate = (view) => {},
    activeTab = 'Home',
    setActiveTab = () => {},
    isLoggedIn = false,
    currentUserRole = 'patient',
    currentUserProfile = {},
    onOpenAuth = () => {},
    onOpenAddReport = () => {}
} = {}) => {

    const [showLoginMenu, setShowLoginMenu] = useState(false)
    return (
        < nav id="navbar-top" className="w-full top-0 sticky z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all" >
            <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('LANDING')}>
                    <div className="w-10 h-10 rounded-xl bg-[#004e9f] flex items-center justify-center text-white shadow-md shadow-[#004e9f]/20">
                        <FlaskConical className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-[#004e9f]">MedLab Reports</span>
                </div>

                <div className="hidden md:flex gap-8 items-center">
                    {(['Home', 'Features', 'How it Works']).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`text-sm font-medium transition-all relative py-1 ${activeTab === tab ? 'text-[#004e9f] font-semibold' : 'text-gray-600 hover:text-[#004e9f]'}`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="activeUnderline"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#004e9f] rounded-full"
                                />
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3 relative">
                    {isLoggedIn ? (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => onNavigate(currentUserRole === 'admin' ? 'ADMIN_DASHBOARD' : 'PASS_DASHBOARD')}
                                className="bg-[#004e9f] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-blue-800 transition-all active:scale-95 shadow-md shadow-blue-500/10 flex items-center gap-1.5 cursor-pointer font-sans"
                            >
                                Go to Dashboard
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>

                            <div className="relative">
                                <button
                                    onClick={() => setShowLoginMenu(!showLoginMenu)}
                                    className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-100 hover:border-[#004e9f] transition-all flex items-center justify-center cursor-pointer shadow-sm"
                                >
                                    <img
                                        src={currentUserProfile.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpF2T5v2g6kd6FOwUZpDVw_rQ1JenZaS5YMSnK3ysw6YGVGDjkKKXv1oB7c5Nyjv_zMbi3SPfHK556YnStrCs8ZReV9Fp2hmsX8YYECMqcNMvIGXzo5NZPXafYeMOUkt_HRVHck93wT2ho-8QIEuO-lZcTuNk9jkcTG0w0Xfr6bAoEwxQDu2vpCze4ZkLi4zRp87pWoo7Gsjq1PYKOFp0R_7QCuEFAIj6pzeEZa85VRy67EhbsDGyYQO1FwvcdSvKtbCkEuYAzBA'}
                                        alt="User avatar"
                                        className="w-full h-full object-cover"
                                        width={100}
                                        height={100}
                                    />
                                </button>

                            </div>
                        </div>
                    ) : (
                        <>

                            <div>
                                <button
                                    id="btn-login-trigger"
                                    onClick={() => setShowLoginMenu(!showLoginMenu)}
                                    className="text-sm font-medium text-[#004e9f] px-4 py-2 hover:bg-blue-50 transition-colors rounded-lg flex items-center gap-1 border border-transparent hover:border-blue-100"
                                >
                                    Portal Login
                                </button>
                            </div>
                            <Link href="/admin/login">
                                <button
                                    id="btn-get-started"
                                    onClick={() => onOpenAuth?.('admin')}
                                    className="bg-[#004e9f] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-blue-800 transition-all active:scale-95 shadow-md shadow-blue-500/10"
                                >
                                    Admin Login
                                </button>
                            </Link>

                            {/* Simulated dropdown dropdown menu */}
                            <AnimatePresence>
                                {showLoginMenu && (
                                    <>
                                        <div className="fixed inset-0 z-30" onClick={() => setShowLoginMenu(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-40"
                                        >
                                            <div className="px-3 py-2 text-xs font-semibold text-gray-400 border-b border-gray-50 uppercase tracking-wider">
                                                Access Diagnostics
                                            </div>
                                            <Link href="/patient/login">
                                                <button
                                                    onClick={() => {
                                                        setShowLoginMenu(false);
                                                        onOpenAuth?.('patient');
                                                    }}
                                                    className="w-full text-left px-4 py-3 text-sm text-[#191c1d] hover:bg-slate-50 transition-colors flex items-center gap-2.5 font-medium cursor-pointer"
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                                                    Patient Portal
                                                </button>
                                            </Link>
                                            <Link href="/admin/login">
                                                <button
                                                    onClick={() => {
                                                        setShowLoginMenu(false);
                                                        onOpenAuth?.('admin');
                                                    }}
                                                    className="w-full text-left px-4 py-3 text-sm text-[#191c1d] hover:bg-slate-50 transition-colors flex items-center gap-2.5 font-medium cursor-pointer"
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                                    Lab Pathologist Portal
                                                </button>
                                            </Link>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </>
                    )}
                </div>
            </div>
        </nav >
    )
}

export default Header