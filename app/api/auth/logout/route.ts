import { NextResponse } from "next/server"

function buildRedirectResponse(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const redirectParam = searchParams.get("redirect") || "/"
  const isInternal = redirectParam.startsWith("/")
  const target = isInternal ? redirectParam : "/"
  const response = NextResponse.redirect(`${origin}${target}`)
  const cookieOptions = { httpOnly: true, sameSite: "lax" as const, secure: true, path: "/", maxAge: 0 }
  response.cookies.set("authToken", "", cookieOptions)
  response.cookies.set("admin_token", "", cookieOptions)
  return response
}

export async function GET(request: Request) {
  return buildRedirectResponse(request)
}

export async function POST(request: Request) {
  return buildRedirectResponse(request)
}
