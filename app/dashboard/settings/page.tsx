"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { RefreshCw, Bell, Database, LogOut, Wifi, Smartphone, Image as ImageIcon } from "lucide-react"
import { useAuth } from "@/context/auth-context";
import { signOut } from "next-auth/react";

export default function SettingsPage() {
  const [syncLoading, setSyncLoading] = useState(false)
  const [cacheSize, setCacheSize] = useState("1.2 MB")

  const handleSync = () => {
    setSyncLoading(true)
    setTimeout(() => {
      setSyncLoading(false)
      toast.success("Sincronización completada: Datos actualizados")
    }, 2000)
  }

  return (
    <div className="max-w-5xl mx-auto font-poppins pb-20">
      <header className="mb-10">
        <h1 className="text-4xl font-light uppercase tracking-tighter text-gray-900">Configuración</h1>
        <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mt-2">
          Panel de control del sistema iSync Web
        </p>
      </header>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-transparent border-b rounded-none w-full justify-start h-auto p-0 mb-8 overflow-x-auto">
          <TabHeader value="notifications" label="Notificaciones" />
          <TabHeader value="system" label="Sistema" />
          <TabHeader value="security" label="Seguridad" />
        </TabsList>

        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="system">
          <SystemSettings
            syncLoading={syncLoading}
            handleSync={handleSync}
            cacheSize={cacheSize}
          />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>
      </Tabs>

      <footer className="mt-12 pt-8 border-t border-gray-100 text-center">
        <p className="text-[10px] uppercase tracking-widest text-gray-400">
          © {new Date().getFullYear()} iSync Web - Todos los derechos reservados
        </p>
      </footer>
    </div>
  )
}

function TabHeader({ value, label }: { value: string, label: string }) {
  return (
    <TabsTrigger
      value={value}
      className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent pb-3 px-6 text-[10px] uppercase tracking-widest font-medium transition-all"
    >
      {label}
    </TabsTrigger>
  )
}

function NotificationSettings() {
  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-sm uppercase tracking-wider font-semibold">Comunicación</CardTitle>
        <CardDescription className="text-xs">Gestiona tus alertas y sonidos.</CardDescription>
      </CardHeader>
      <CardContent className="px-0 space-y-3">
        <div className="flex items-center justify-between p-4 border border-gray-100">
          <div className="flex gap-4 items-center">
            <Bell size={18} className="text-gray-400" />
            <div>
              <Label className="text-sm font-medium">Notificaciones Push</Label>
              <p className="text-xs text-gray-400">Permitir avisos importantes del sistema</p>
            </div>
          </div>
          <Switch defaultChecked className="data-[state=checked]:bg-black" />
        </div>
        <div className="flex items-center justify-between p-4 border border-gray-100">
          <div className="flex gap-4 items-center">
            <ImageIcon size={18} className="text-gray-400" />
            <div>
              <Label className="text-sm font-medium">Imágenes de Producto</Label>
              <p className="text-xs text-gray-400">Mostrar miniaturas en el catálogo</p>
            </div>
          </div>
          <Switch defaultChecked className="data-[state=checked]:bg-black" />
        </div>
      </CardContent>
    </Card>
  )
}

function SystemSettings({ syncLoading, handleSync, cacheSize }: any) {
  return (
    <div className="space-y-6">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-sm uppercase tracking-wider font-semibold">Estado del Sistema</CardTitle>
        </CardHeader>
        <CardContent className="px-0 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-100 flex items-center gap-3">
              <Wifi size={16} className="text-gray-400" />
              <div>
                <p className="text-[10px] uppercase text-gray-400">Dirección IP</p>
                <p className="text-xs font-medium">192.168.1.45</p>
              </div>
            </div>
            <div className="p-4 border border-gray-100 flex items-center gap-3">
              <Smartphone size={16} className="text-gray-400" />
              <div>
                <p className="text-[10px] uppercase text-gray-400">Build Versión</p>
                <p className="text-xs font-medium">1.1002.26-WEB</p>
              </div>
            </div>
            <div className="p-4 border border-gray-100 flex items-center gap-3">
              <Database size={16} className="text-gray-400" />
              <div>
                <p className="text-[10px] uppercase text-gray-400">Caché Local</p>
                <p className="text-xs font-medium">{cacheSize}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <Button
              variant="outline"
              className="rounded-none text-[10px] uppercase tracking-widest border-gray-200"
              onClick={handleSync}
              disabled={syncLoading}
            >
              <RefreshCw size={14} className={`mr-2 ${syncLoading && 'animate-spin'}`} />
              {syncLoading ? 'Sincronizando...' : 'Sincronizar Datos'}
            </Button>
            <Button variant="outline" className="rounded-none text-[10px] uppercase tracking-widest border-gray-200">
              Limpiar Caché
            </Button>
            <Button variant="outline" className="rounded-none text-[10px] uppercase tracking-widest border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700">
              Exportar Logs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SecuritySettings() {
  const { session } = useAuth();
  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-sm uppercase tracking-wider font-semibold">
          Seguridad y Sesión
        </CardTitle>
        <CardDescription className="text-xs">
          Controla el acceso y la seguridad de tu cuenta en iSync Web
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0 space-y-6">

        {/* Estado de sesión */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoItem label="Usuario" value={session?.user?.name || ""} />
          <InfoItem label="Rol" value="Vendedor" />
          <InfoItem label="Último acceso" value="09/02/2026 · 12:02 PM" />
        </div>

        {/* Sesiones */}
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-widest text-gray-500">
            Sesion Activa
          </p>

          <div className="p-4 border border-gray-100 flex justify-between items-center">
            <div>
              <p className="text-xs font-medium">Chrome · Windows</p>
              <p className="text-[10px] text-gray-400">IP: 192.168.1.45</p>
            </div>
            <span className="text-[10px] uppercase text-green-600">
              Actual
            </span>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Logout */}
        <Button
          onClick={() => signOut({ callbackUrl: "/" })}
          variant="destructive"
          className="rounded-full text-xs uppercase tracking-widest cursor-pointer bg-red-600 shadow-none"
        >
          <LogOut size={14} className="mr-2" />
          Cerrar sesión
        </Button>
      </CardContent>
    </Card>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 border border-gray-100">
      <p className="text-[10px] uppercase tracking-widest text-gray-400">
        {label}
      </p>
      <p className="text-xs font-medium">{value}</p>
    </div>
  )
}