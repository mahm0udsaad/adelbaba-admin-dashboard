"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/login-form"

export default function Page() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("admin_token") || localStorage.getItem("authToken")
    if (token) {
      router.replace("/dashboard")
    } else {
      setChecking(false)
    }
  }, [router])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-amber-800">جارٍ التحميل...</div>
      </div>
    )
  }

  return <LoginForm onLoginSuccess={() => router.replace("/dashboard")} />
}
