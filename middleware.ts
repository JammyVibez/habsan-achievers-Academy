import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This middleware will protect routes based on user roles
export function middleware(request: NextRequest) {
  // TODO: Replace with actual session/token checking
  // For now, we'll allow all requests to pass through
  // When Supabase is integrated, check authentication here

  const { pathname } = request.nextUrl

  // Protected routes
  const adminRoutes = pathname.startsWith("/admin")
  const teacherRoutes = pathname.startsWith("/teacher")
  const studentRoutes = pathname.startsWith("/student")

  // TODO: Check if user is authenticated and has correct role
  // const session = await getSession(request)
  // if (!session) {
  //   return NextResponse.redirect(new URL('/login', request.url))
  // }

  // if (adminRoutes && session.user.role !== 'admin') {
  //   return NextResponse.redirect(new URL('/unauthorized', request.url))
  // }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/student/:path*"],
}
