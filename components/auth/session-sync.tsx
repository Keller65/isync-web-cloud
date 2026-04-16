"use client"

import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { useAuthStore } from "@/lib/store"
import { useRouter } from "next/navigation"

export default function SessionSync() {
  const { data: session, status } = useSession()
  const setAuth = useAuthStore((state) => state.setAuth)
  const router = useRouter()

  const clearAuth = () => {
    setAuth({
      token: null,
      salesPersonCode: null,
      fullName: null,
      u_WhsCode: null,
      u_SerieCot: null,
    })
  }

  useEffect(() => {
    if (status === "loading") return

    if (status === "unauthenticated") {
      clearAuth()
      router.push("/")
      return
    }

    if (session?.user) {
      setAuth({
        token: session.user.token,
        salesPersonCode: session.user.salesPersonCode,
        fullName: session.user.fullName,
        u_WhsCode: session.user.u_WhsCode,
        u_SerieCot: session.user.u_SerieCot,
      })
    }
  }, [session, status])

  return null
}