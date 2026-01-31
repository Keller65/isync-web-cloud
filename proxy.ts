import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  // req.auth contiene la sesión del usuario si está logueado
  const isLoggedIn = !!req.auth
  
  // Definir rutas
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard")
  const isOnHome = req.nextUrl.pathname === "/"

  // 1. Si está en una ruta protegida (dashboard) y NO está logueado -> Redirigir a Login (Home)
  if (isOnDashboard) {
    if (isLoggedIn) return NextResponse.next()
    return NextResponse.redirect(new URL("/", req.nextUrl))
  }

  // 2. Si está en la Home (Login) y YA está logueado -> Redirigir al Dashboard
  if (isOnHome) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
})

// Configuración del matcher para que el middleware no se ejecute en archivos estáticos o API pública innecesaria
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
