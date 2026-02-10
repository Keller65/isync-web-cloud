import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner"
import "./globals.css";
import { auth } from "@/auth";
import { AuthProvider } from "../context/auth-context";

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
  const session = await auth();
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider session={session}> {children} </AuthProvider>
        <Toaster theme="light" richColors closeButton position="top-right" />
      </body>
    </html>
  );
}
