'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { FileQuestion, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4f8] via-[#e2e8f0] to-[#d9e2ec] flex items-center justify-center p-6 font-sans relative overflow-hidden">
      
      {/* Decorative background shapes for premium look */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl" />

      {/* Main Glassmorphic Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center space-y-6"
      >
        {/* Soft Colored Icon */}
        <div className="w-16 h-16 bg-blue-50 text-[#004e9f] flex items-center justify-center rounded-full mx-auto ring-4 ring-blue-50/50">
          <FileQuestion className="w-8 h-8" />
        </div>

        {/* Clear and Simple Message */}
        <div className="space-y-2">
          <span className="text-sm font-bold text-blue-600/80 uppercase tracking-widest font-mono">Error 404</span>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Oops! Page not found</h1>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            We can&apos;t seem to find the page or laboratory log you are looking for. Let&apos;s get you back on track.
          </p>
        </div>

        {/* Elegant Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => window.history.back()}
            className="flex-1 py-3 border border-slate-200 hover:bg-slate-50/50 text-slate-650 rounded-xl text-xs font-bold transition-all active:scale-[0.98] cursor-pointer bg-white"
          >
            <span className="flex items-center justify-center gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </span>
          </button>
          
          <Link
            href="/"
            className="flex-1 py-3 bg-[#004e9f] hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 active:scale-[0.98] flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4 text-white" />
            <span>Home</span>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
