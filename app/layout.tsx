import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner"
import "./globals.css";
import { SessionProvider } from "next-auth/react"
import SessionSync from "./ui/session-sync"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "iSync Web - Todo Sincronizado",
  description: "iSync Web es una aplicacin de tareas que se sincroniza con iSync, permitiendo gestionar tus cotizaciones de manera eficiente y sin complicaciones.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <SessionSync />
          <main>{children}</main>
        </SessionProvider>
        <Toaster theme="light" richColors closeButton position="top-right" />
      </body>
    </html>
  );
}
