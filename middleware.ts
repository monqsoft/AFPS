import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Try to get session. In middleware, direct cookie access is standard.
  // The getSession helper might need adjustment if it relies on 'next/headers' which is not available here.
  // For simplicity, let's assume a way to check cookie existence.
  const sessionCookie = request.cookies.get("afps_session")
  let sessionData = null
  if (sessionCookie?.value) {
    try {
      sessionData = JSON.parse(sessionCookie.value)
    } catch (e) {
      /* ignore */
    }
  }

  const publicPaths = ["/login", "/api/auth/callback"] // Add any other public paths

  // If trying to access a protected route without a session, redirect to login
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

  // If has session and tries to access login page, redirect to dashboard
  if (sessionData && pathname === "/login") {
    const dashboardUrl = new URL("/dashboard", request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  // TODO: Add role-based access control if needed
  // Example: if (sessionData?.role !== 'admin' && pathname.startsWith('/gerenciamento')) { ... }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|logo-afps.png).*)",
  ],
}
