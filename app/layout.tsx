import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner"
import "../app/globals.css";
import AuthProvider from "@/components/auth/auth-provider"
import SessionSync from "@/components/auth/session-sync"

export const metadata: Metadata = {
  title: "iSync Web - Todo Sincronizado",
  description: "iSync Web es una aplicacin de tareas que se sincroniza con iSync, permitiendo gestionar tus cotizaciones de manera eficiente y sin complicaciones.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">

        <AuthProvider>
          <SessionSync />
          <main>{children}</main>
        </AuthProvider>
        <Toaster theme="light" richColors closeButton position="top-right" />
      </body>
    </html>
  );
}
