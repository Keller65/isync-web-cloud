"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { RefreshCw, Bell, Database, LogOut, Wifi, Smartphone, Image as ImageIcon, Shield, Settings, Cpu } from "lucide-react"
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/app/lib/store"

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
    <div className="max-w-5xl mx-auto font-poppins pb-20 py-8 px-4">
      <header className="mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tight text-gray-900">Configuración</h1>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mt-1">
              Panel de control del sistema iSync Web
            </p>
          </div>
        </div>
      </header>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-gray-50 border-b rounded-none w-full justify-start h-auto p-0 mb-8 overflow-x-auto">
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
      className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-primary data-[state=active]:bg-white pb-4 px-6 text-xs uppercase tracking-widest font-medium transition-all text-gray-400 data-[state=active]:text-brand-primary data-[state=active]:shadow-none"
    >
      {label}
    </TabsTrigger>
  )
}

function NotificationSettings() {
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="h-1 bg-brand-primary" />
        <CardHeader className="pb-4">
          <CardTitle className="text-sm uppercase tracking-wider font-semibold flex items-center gap-2">
            <Bell className="w-4 h-4 text-brand-primary" />
            Comunicación
          </CardTitle>
          <CardDescription className="text-xs">Gestiona tus alertas y notificaciones del sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Bell size={18} className="text-brand-primary" />
              </div>
              <div>
                <Label className="text-sm font-medium">Notificaciones Push</Label>
                <p className="text-xs text-gray-400">Permitir avisos importantes del sistema</p>
              </div>
            </div>
            <Switch defaultChecked className="data-[state=checked]:bg-brand-primary" />
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <ImageIcon size={18} className="text-brand-primary" />
              </div>
              <div>
                <Label className="text-sm font-medium">Imágenes de Producto</Label>
                <p className="text-xs text-gray-400">Mostrar miniaturas en el catálogo</p>
              </div>
            </div>
            <Switch defaultChecked className="data-[state=checked]:bg-brand-primary" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SystemSettings({ syncLoading, handleSync, cacheSize }: any) {
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="h-1 bg-brand-primary" />
        <CardHeader className="pb-4">
          <CardTitle className="text-sm uppercase tracking-wider font-semibold flex items-center gap-2">
            <Cpu className="w-4 h-4 text-brand-primary" />
            Estado del Sistema
          </CardTitle>
          <CardDescription className="text-xs">Información técnica y mantenimiento del sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Wifi size={18} className="text-brand-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase text-gray-400">Dirección IP</p>
                <p className="text-xs font-semibold">192.168.1.45</p>
              </div>
              <div className="ml-auto">
                <span className="w-2 h-2 bg-brand-primary rounded-full block animate-pulse" />
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Smartphone size={18} className="text-brand-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase text-gray-400">Build Versión</p>
                <p className="text-xs font-semibold">1.1002.26-WEB</p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Database size={18} className="text-brand-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase text-gray-400">Caché Local</p>
                <p className="text-xs font-semibold">{cacheSize}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap gap-3">
            <Button
              className="bg-brand-primary hover:bg-brand-primary/90"
              onClick={handleSync}
              disabled={syncLoading}
            >
              <RefreshCw size={14} className={`mr-2 ${syncLoading && 'animate-spin'}`} />
              {syncLoading ? 'Sincronizando...' : 'Sincronizar Datos'}
            </Button>
            <Button variant="outline">
              Limpiar Caché
            </Button>
            <Button variant="outline" className="border-gray-200 text-gray-600 hover:bg-gray-50">
              Exportar Logs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SecuritySettings() {
  const router = useRouter();
  const { fullName } = useAuthStore();

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push(window.location.origin)
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="h-1 bg-brand-primary" />
        <CardHeader className="pb-4">
          <CardTitle className="text-sm uppercase tracking-wider font-semibold flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-primary" />
            Seguridad y Sesión
          </CardTitle>
          <CardDescription className="text-xs">
            Controla el acceso y la seguridad de tu cuenta en iSync Web
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-[10px] uppercase text-gray-400 mb-1">Usuario</p>
              <p className="text-xs font-semibold">{fullName || "Usuario"}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-[10px] uppercase text-gray-400 mb-1">Rol</p>
              <p className="text-xs font-semibold">Vendedor</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-[10px] uppercase text-gray-400 mb-1">Último acceso</p>
              <p className="text-xs font-semibold">09/02/2026 · 12:02 PM</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-gray-500">
              Sesión Activa
            </p>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Smartphone size={18} className="text-brand-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium">Chrome · Windows</p>
                  <p className="text-[10px] text-gray-400">IP: 192.168.1.45</p>
                </div>
              </div>
              <span className="text-[10px] uppercase bg-brand-primary/10 text-brand-primary px-2 py-1 rounded-full font-medium">
                Actual
              </span>
            </div>
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button
              onClick={handleSignOut}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              <LogOut size={14} className="mr-2" />
              Cerrar sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
