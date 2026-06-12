"use client"
import React from 'react'
import Sidebar from './component/Sidebar'
import { ViewState, DashboardSideTab } from '@/types'

const page = () => {
    return (
        <div>
            <Sidebar
                currentView="PASS_DASHBOARD"
                onNavigate={function (view: ViewState): void {
                    throw new Error("Function not implemented.");
                }}
                activeTab="Dashboard"
                setActiveTab={function (tab: DashboardSideTab): void {
                    throw new Error("Function not implemented.");
                }}
                onOpenAddReport={function (): void {
                    throw new Error("Function not implemented.");
                }}
                currentUserRole="patient"
                currentUserProfile={{
                    name: 'Hari',
                    patientId: '1',
                    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpF2T5v2g6kd6FOwUZpDVw_rQ1JenZaS5YMSnK3ysw6YGVGDjkKKXv1oB7c5Nyjv_zMbi3SPfHK556YnStrCs8ZReV9Fp2hmsX8YYECMqcNMvIGXzo5NZPXafYeMOUkt_HRVHck93wT2ho-8QIEuO-lZcTuNk9jkcTG0w0Xfr6bAoEwxQDu2vpCze4ZkLi4zRp87pWoo7Gsjq1PYKOFp0R_7QCuEFAIj6pzeEZa85VRy67EhbsDGyYQO1FwvcdSvKtbCkEuYAzBA'
                }}
                onLogout={function (): void {
                    throw new Error("Function not implemented.");
                }}
            />
        </div>
    )
}

export default page