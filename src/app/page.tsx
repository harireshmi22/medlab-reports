"use client"

import { useEffect, useState } from "react"
import LandingPage from "../components/Landing"
import Header from "../components/Header"
import Footer from "@/components/Footer"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUserRole, setCurrentUserRole] = useState<'patient' | 'admin'>('patient')
  const [currentUserProfile, setCurrentUserProfile] = useState({
    name: '',
    patientId: '',
    avatar: '',
    email: ''
  })

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    const role = localStorage.getItem("user_role") as 'patient' | 'admin' | null
    
    if (token && (role === 'patient' || role === 'admin')) {
      setTimeout(() => {
        setIsLoggedIn(true)
        setCurrentUserRole(role)
        
        if (role === 'admin') {
          setCurrentUserProfile({
            name: 'Dr. Sarah Chen',
            patientId: '',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTGD7gHvWcehi15F5euALOPYLsRRZKrx3Rx5F2OGleEbdAJz5ix4OaNSTcpmLhZzoAOvw8T9yqgRCn2FbBjc27daMYDWrZoVOJMi4bUVWsDUlnlQOQQfr6Ie-i6SDn_xzYF3EtekMNzO0xcLWj5DEsh3rENhV36FdxONoGigCFJBNHmCsglC7jxcig98bAWd0FQUaJnPqOdfKI3_YqRb2-lbV_x6jCqoF0WvseNkof0Iyj3XxQ-5XWyFA9FQGoBX1N5-ff7Y2QJQ',
            email: 'admin@medlabs.com'
          })
        } else {
          setCurrentUserProfile({
            name: 'Hari',
            patientId: '1',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpF2T5v2g6kd6FOwUZpDVw_rQ1JenZaS5YMSnK3ysw6YGVGDjkKKXv1oB7c5Nyjv_zMbi3SPfHK556YnStrCs8ZReV9Fp2hmsX8YYECMqcNMvIGXzo5NZPXafYeMOUkt_HRVHck93wT2ho-8QIEuO-lZcTuNk9jkcTG0w0Xfr6bAoEwxQDu2vpCze4ZkLi4zRp87pWoo7Gsjq1PYKOFp0R_7QCuEFAIj6pzeEZa85VRy67EhbsDGyYQO1FwvcdSvKtbCkEuYAzBA',
            email: 'patient@medlabs.com'
          })
        }
      }, 0)
    }
  }, [])

  const handleLogout = async () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_role")
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (err) {
      console.error("Logout error:", err)
    }
    setIsLoggedIn(false)
  }

  const handleNavigate = (view: string) => {
    if (view === 'ADMIN_DASHBOARD') {
      window.location.href = '/admin/dashboard'
    } else if (view === 'PASS_DASHBOARD') {
      window.location.href = '/patient/dashboard'
    } else if (view === 'LANDING') {
      window.location.href = '/'
    }
  }

  return (
    <main className="min-h-screen flex flex-col justify-between">
      <Header 
        isLoggedIn={isLoggedIn}
        currentUserRole={currentUserRole}
        currentUserProfile={currentUserProfile}
        onNavigate={handleNavigate}
      />
      <LandingPage 
        isLoggedIn={isLoggedIn}
        currentUserRole={currentUserRole}
        currentUserProfile={currentUserProfile}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />
      <Footer />
    </main>
  )
}
