"use client"

import React from "react"
import { usePathname } from "next/navigation"
import AppShell from "@/components/app-shell"

// Routes that should NOT render the AppShell (no sidebar/header)
const AUTH_ROUTES = new Set<string>([
  "/", // login page
])

export default function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname && AUTH_ROUTES.has(pathname)) {
    return <>{children}</>
  }

  return <AppShell>{children}</AppShell>
}

