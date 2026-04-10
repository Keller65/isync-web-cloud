"use client"

import { useSession, signOut } from "next-auth/react"
import { useEffect } from "react"
import { useAuthStore } from "@/app/lib/store"
import { useRouter } from "next/navigation"

export default function SessionSync() {
  const { data: session } = useSession()
  const setAuth = useAuthStore((state) => state.setAuth)
  const router = useRouter()

  useEffect(() => {
    if (session?.user) {
      // Verificar si token ha expirado
      if (session.user.expiresAt && Date.now() > session.user.expiresAt) {
        // Token expiró - limpiar credenciales y redirigir a login
        setAuth({
          token: null,
          salesPersonCode: null,
          fullName: null,
          u_WhsCode: null,
          u_SerieCot: null,
        })
        router.push("/")
      } else {
        setAuth({
          token: session.user.token,
          salesPersonCode: session.user.salesPersonCode,
          fullName: session.user.fullName,
          u_WhsCode: session.user.u_WhsCode,
          u_SerieCot: session.user.u_SerieCot,
        })
      }
    }
  }, [session, setAuth, router])

  return null // Este componente no renderiza nada visual
}
