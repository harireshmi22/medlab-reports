import React from 'react';
import Image from 'next/image';
import {
    LayoutDashboard,
    Users,
    FileText,
    PlusCircle,
    BarChart3,
    Settings,
    LogOut,
    FlaskConical,
    Activity,
    MessageSquare
} from 'lucide-react';
import { ViewState, DashboardSideTab } from '@/types';

interface SidebarProps {
    currentView: ViewState;
    onNavigate: (view: ViewState) => void;
    activeTab: DashboardSideTab;
    setActiveTab: (tab: DashboardSideTab) => void;
    onOpenAddReport: () => void;
    currentUserRole: 'patient' | 'admin';
    currentUserProfile?: {
        name: string;
        patientId?: string;
        avatar: string;
        email?: string;
        role?: string;
    };
    onLogout: () => void;
    isOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({
    currentView,
    onNavigate,
    activeTab,
    setActiveTab,
    onOpenAddReport,
    currentUserRole,
    currentUserProfile,
    onLogout,
    isOpen,
    onClose
}: SidebarProps) {

    // Side Navigation items
    const menuItems = [
        { id: 'Dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, allowedRoles: ['patient', 'admin'] },
        { id: 'Patients', label: 'Patients', icon: <Users className="w-5 h-5" />, allowedRoles: ['admin'] },
        { id: 'Reports', label: 'Reports', icon: <FileText className="w-5 h-5" />, allowedRoles: ['patient', 'admin'] },
        { id: 'Add Report', label: 'Add Report', icon: <PlusCircle className="w-5 h-5" />, allowedRoles: ['admin'], action: onOpenAddReport },
        { id: 'Settings', label: 'Settings', icon: <Settings className="w-5 h-5" />, allowedRoles: ['patient', 'admin'] }
    ];

    // Filtering items by current user role so we match exactly the respective mockups!
    const filteredMenuItems = menuItems.filter(item => item.allowedRoles.includes(currentUserRole));

    // Profile metadata
    const defaultUserProfile = currentUserRole === 'admin'
        ? {
            name: 'Dr. Sarah Chen',
            title: 'Lab Administrator',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTGD7gHvWcehi15F5euALOPYLsRRZKrx3Rx5F2OGleEbdAJz5ix4OaNSTcpmLhZzoAOvw8T9yqgRCn2FbBjc27daMYDWrZoVOJMi4bUVWsDUlnlQOQQfr6Ie-i6SDn_xzYF3EtekMNzO0xcLWj5DEsh3rENhV36FdxONoGigCFJBNHmCsglC7jxcig98bAWd0FQUaJnPqOdfKI3_YqRb2-lbV_x6jCqoF0WvseNkof0Iyj3XxQ-5XWyFA9FQGoBX1N5-ff7Y2QJQ'
        }
        : {
            name: 'John Doe',
            title: 'Patient',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpF2T5v2g6kd6FOwUZpDVw_rQ1JenZaS5YMSnK3ysw6YGVGDjkKKXv1oB7c5Nyjv_zMbi3SPfHK556YnStrCs8ZReV9Fp2hmsX8YYECMqcNMvIGXzo5NZPXafYeMOUkt_HRVHck93wT2ho-8QIEuO-lZcTuNk9jkcTG0w0Xfr6bAoEwxQDu2vpCze4ZkLi4zRp87pWoo7Gsjq1PYKOFp0R_7QCuEFAIj6pzeEZa85VRy67EhbsDGyYQO1FwvcdSvKtbCkEuYAzBA'
        };

    const userProfile = currentUserProfile
        ? {
            name: currentUserProfile.name,
            title: currentUserRole === 'admin' ? 'Lab Administrator' : 'Patient',
            avatar: currentUserProfile.avatar
        }
        : defaultUserProfile;

    const handleItemClick = (item: typeof menuItems[number]) => {
        if (item.action) {
            item.action();
        } else {
            setActiveTab(item.id as DashboardSideTab);
            // Automatically switch layout view based on tab if applicable
            if (item.id === 'Dashboard') {
                onNavigate(currentUserRole === 'admin' ? 'ADMIN_DASHBOARD' : 'PASS_DASHBOARD');
            } else if (item.id === 'Reports') {
                onNavigate('DEEP_REPORT');
            } else if (item.id === 'Settings' || item.id === 'Patients') {
                onNavigate(currentUserRole === 'admin' ? 'ADMIN_DASHBOARD' : 'PASS_DASHBOARD');
            }
        }
        onClose?.();
    };

    return (
        <>
            {/* Mobile background overlay */}
            {isOpen && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-30 md:hidden"
                />
            )}
            <aside className={`w-64 fixed left-0 top-0 bottom-0 bg-slate-50 border-r border-[#c1c6d5]/40 flex flex-col justify-between py-6 px-4 z-40 shadow-sm transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="flex-1 flex flex-col">
                    {/* Brand/Logo Header */}
                    <div className="flex items-center gap-3 px-2 mb-10 cursor-pointer" onClick={() => onNavigate('LANDING')}>
                        <div className="w-10 h-10 rounded-xl bg-[#004e9f] flex items-center justify-center text-white shadow-md shadow-[#004e9f]/25">
                            <FlaskConical className="w-5.5 h-5.5" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg text-[#004e9f] tracking-tight leading-none font-[family-name:var(--font-heading)]">MedLab Reports</h1>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Diagnostics Portal</p>
                        </div>
                    </div>

                    {/* Navigation Items */}
                    <nav className="space-y-1.5 flex-1">
                        {filteredMenuItems.map((item) => {
                            const isTabActive = activeTab === item.id;
                            // Also highlights based on actual active view boundaries
                            const highlightActive = isTabActive;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleItemClick(item)}
                                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all relative ${highlightActive
                                        ? 'text-[#004e9f] font-bold bg-[#d7e3ff]/30 shadow-sm shadow-[#004e9f]/5'
                                        : 'text-gray-600 hover:bg-[#edeeef]/60 hover:text-gray-900'
                                        }`}
                                >
                                    <div className={highlightActive ? 'text-[#004e9f]' : 'text-gray-400'}>
                                        {item.icon}
                                    </div>
                                    <span>{item.label}</span>
                                    {highlightActive && (
                                        <div className="absolute left-0 w-1 h-6 bg-[#004e9f] rounded-r-full" />
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Profile view (dynamic and matches pathology mockup nicely) */}
                <div className="mt-auto space-y-4">
                    {/* Logout button */}
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Exit Portal</span>
                    </button>

                    <div className="p-3.5 bg-white border border-[#c1c6d5]/30 rounded-xl flex items-center gap-3 shadow-inner">
                        <Image
                            alt="User profile photo"
                            className="w-10 h-10 rounded-full object-cover border-2 border-slate-100 shadow-sm"
                            src={userProfile.avatar}
                            width={40}
                            height={40}
                        />
                        <div className="overflow-hidden">
                            <p id="usr-profile-name" className="text-xs font-bold truncate text-[#191c1d] font-[family-name:var(--font-heading)]">{userProfile.name}</p>
                            <p className="text-[10px] text-gray-400 font-medium truncate mt-0.5">{userProfile.title}</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
