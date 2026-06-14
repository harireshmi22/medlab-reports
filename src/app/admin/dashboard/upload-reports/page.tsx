"use client";

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

const AddReport = dynamic(() => import('@/app/admin/component/AddReport'), {
    loading: () => <Loader2 className="animate-spin w-6 h-6 text-[#004e9f]" />,
    ssr: false
})

const page = () => {
    return (
        <div className="min-h-screen bg-slate-50">
            <AddReport
                onClose={() => { }}
                onAddReport={() => { }}
            />
        </div>
    )
}

export default page