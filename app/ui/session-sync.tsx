"use client"

import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { useAuthStore } from "@/app/lib/store"

export default function SessionSync() {
  const { data: session } = useSession()
  const setAuth = useAuthStore((state) => state.setAuth)

  useEffect(() => {
    if (session?.user) {
      setAuth({
        token: session.user.token,
        salesPersonCode: session.user.salesPersonCode,
        fullName: session.user.fullName,
      })
    }
  }, [session, setAuth])

  return null // Este componente no renderiza nada visual
}
