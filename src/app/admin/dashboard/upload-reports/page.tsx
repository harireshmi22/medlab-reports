import AddReport from '@/app/admin/component/AddReport'
import React from 'react'

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