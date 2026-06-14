import { FlaskConical, Globe, Mail, Workflow } from 'lucide-react'
import React from 'react'

const Footer = () => {
    return (
        // Footer view
        <footer className="w-full py-16 bg-[#1e293b] text-white border-t border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 px-6 max-w-7xl mx-auto">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#004e9f] flex items-center justify-center text-white">
                            <FlaskConical className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-lg font-[family-name:var(--font-heading)]">MedLab Reports</span>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Redefining laboratory diagnostics with real-time patient connectivity and enterprise-grade security.
                    </p>
                </div>

                <div className="flex flex-col md:items-center">
                    <div className="flex flex-col gap-3">
                        <h5 className="font-bold text-xs uppercase text-slate-300 tracking-wider mb-2 font-[family-name:var(--font-heading)]">Quick Links</h5>
                        {['Terms of Service', 'Privacy Policy', 'Contact Support', 'Security'].map((link) => (
                            <a key={link} className="text-slate-400 hover:text-white transition-colors text-sm hover:underline cursor-pointer">
                                {link}
                            </a>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col md:items-end justify-between">
                    <div className="flex gap-4">
                        <a className="w-10 h-10 bg-slate-800/80 rounded-full flex items-center justify-center hover:bg-[#004e9f] transition-all text-slate-300 hover:text-white cursor-pointer">
                            <Globe className="w-5 h-5" />
                        </a>
                        <a className="w-10 h-10 bg-slate-800/80 rounded-full flex items-center justify-center hover:bg-[#004e9f] transition-all text-slate-300 hover:text-white cursor-pointer">
                            <Workflow className="w-5 h-5" />
                        </a>
                        <a className="w-10 h-10 bg-slate-800/80 rounded-full flex items-center justify-center hover:bg-[#004e9f] transition-all text-slate-300 hover:text-white cursor-pointer">
                            <Mail className="w-5 h-5" />
                        </a>
                    </div>
                    <p className="text-slate-500 text-sm mt-6">© 2026 MedLab Reports. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer