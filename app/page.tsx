"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { LoginForm } from "@/components/login-form"

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="text-amber-800">جارٍ التحميل...</div>
    </div>
  )
}

function LoginGate() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [checking, setChecking] = useState(true)
  const redirectParam = searchParams?.get("redirect")
  const sessionParam = searchParams?.get("session")
  const forcedRedirect = Boolean(redirectParam) || sessionParam === "expired"
  const nextPath = redirectParam && redirectParam.startsWith("/") ? redirectParam : "/dashboard"

  useEffect(() => {
    const token = localStorage.getItem("admin_token") || localStorage.getItem("authToken")
    if (!token) {
      setChecking(false)
      return
    }

    if (forcedRedirect) {
      localStorage.removeItem("admin_token")
      localStorage.removeItem("authToken")
      setChecking(false)
      return
    }

    router.replace(nextPath)
  }, [forcedRedirect, nextPath, router])

  if (checking) {
    return <LoadingScreen />
  }

  return <LoginForm onLoginSuccess={() => router.replace(nextPath)} />
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <LoginGate />
    </Suspense>
  )
}
