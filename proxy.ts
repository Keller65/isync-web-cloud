import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth?.user

  const { pathname } = req.nextUrl

  const isOnDashboard = pathname.startsWith("/dashboard")
  const isOnHome = pathname === "/"

  if (isOnDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.nextUrl))
  }

  if (isOnHome && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
}
