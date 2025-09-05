import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const PROTECTED_PATHS = [
  "/dashboard",
  "/companies",
  "/users",
  "/roles",
  "/management",
  "/subscriptions",
  "/ads",
  "/products",
  "/support-tickets",
  "/admin",
]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow landing, API, Next static assets, and common static files
  const isStaticAsset =
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$/.test(pathname)

  if (pathname === "/" || pathname.startsWith("/api") || isStaticAsset) {
    return NextResponse.next()
  }

  const mustAuth = PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  if (!mustAuth) {
    return NextResponse.next()
  }

  // Read token from cookie (primary: authToken, fallback: admin_token)
  const token = req.cookies.get("authToken")?.value || req.cookies.get("admin_token")?.value
  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = "/"
    if (pathname && pathname !== "/") {
      url.searchParams.set("redirect", pathname)
    }
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}


