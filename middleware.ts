import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const sessionCookie = request.cookies.get("afps_session")
  let sessionData = null
  if (sessionCookie?.value) {
    try {
      sessionData = JSON.parse(sessionCookie.value)
    } catch (e) {
      /* ignore */
    }
  }

  const publicPaths = ["/login", "/cadastro", "/api/auth/callback"]

  if (
    !sessionData &&
    !publicPaths.some((p) => pathname.startsWith(p)) &&
    pathname !== "/logo-afps.png" &&
    !pathname.startsWith("/_next/static") &&
    !pathname.startsWith("/_next/image")
  ) {
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }
  if (sessionData && pathname === "/login") {
    const dashboardUrl = new URL("/dashboard", request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo-afps.png).*)"],
}
