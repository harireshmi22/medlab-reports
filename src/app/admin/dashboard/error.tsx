'use client'

import React, { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Admin Dashboard crash detected:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full shadow-lg text-center space-y-6">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 flex items-center justify-center rounded-full mx-auto ring-4 ring-rose-100">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Something went wrong</h2>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            An unexpected error occurred in the LIS dashboard environment.
          </p>
        </div>

        {error.message && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Error Telemetry</p>
            <p className="text-xs font-mono font-medium text-slate-800 break-all select-all">{error.message}</p>
          </div>
        )}

        <button
          onClick={() => reset()}
          className="w-full py-3 bg-[#004e9f] hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-white" />
          <span>Retry Operation</span>
        </button>
      </div>
    </div>
  )
}
