"use client"

import { SessionProvider } from "next-auth/react"

interface AuthProviderProps {
  children: React.ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider
      refetchInterval={4 * 60 * 60}
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  )
}
