"use client";

import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { createContext, useContext } from "react";

interface AuthContextType {
  session: Session | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <SessionProvider session={session}>
      <AuthContext.Provider value={{ session }}>{children}</AuthContext.Provider>
    </SessionProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
