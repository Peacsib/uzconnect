import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

const PUBLIC_ROUTES = ["/", "/login", "/register/supervisor", "/register/lecturer", "/forgot-password"]

const ROLE_ROUTES: Record<string, string> = {
  "/student": "STUDENT",
  "/supervisor": "SUPERVISOR",
  "/lecturer": "LECTURER",
  "/coordinator": "COORDINATOR",
}

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const pathname = nextUrl.pathname

  const isPublic = PUBLIC_ROUTES.some((r) => pathname === r)

  if (isPublic) {
    if (session?.user && pathname === "/login") {
      const role = (session.user.role as string)?.toLowerCase()
      return NextResponse.redirect(new URL(`/${role}`, nextUrl))
    }
    return NextResponse.next()
  }

  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  const userRole = session.user.role as string

  for (const [prefix, requiredRole] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(prefix) && userRole !== requiredRole) {
      const redirect = `/${userRole.toLowerCase()}`
      return NextResponse.redirect(new URL(redirect, nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}