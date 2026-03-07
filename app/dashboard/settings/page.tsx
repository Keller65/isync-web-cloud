"use client"

import { useState, useEffect, cloneElement } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import {
  RefreshCw, Bell, Database, LogOut, Wifi, Smartphone,
  Image as ImageIcon, Shield, Settings, Cpu, Key, Share2, Trash2, MapPin, Volume2, UserCircle, CheckCircle2, AlertTriangle
} from "lucide-react"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/app/lib/store"
import { cn } from "@/lib/utils"

// Definición de las secciones para la navegación lateral
const navItems = [
  { id: "notifications", label: "Notificaciones", icon: Bell },
  { id: "maps", label: "Mapas y Rastreo", icon: MapPin },
  { id: "system", label: "Sistema y Datos", icon: Cpu },
  { id: "security", label: "Cuenta y Seguridad", icon: Shield },
]

export default function SettingsPage() {
  const router = useRouter()
  const { fullName } = useAuthStore()
  const [activeSection, setActiveSection] = useState("notifications")

  // Estados de configuración (Persistidos en localStorage)
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showTraffic, setShowTraffic] = useState(false)
  const [mapStyle, setMapStyle] = useState<'color' | 'minimalista'>('color')

  // Estados de sistema
  const [syncLoading, setSyncLoading] = useState(false)
  const [exportingLogs, setExportingLogs] = useState(false)
  const [cacheSize, setCacheSize] = useState("0 MB")
  const [ipAddress, setIpAddress] = useState("192.168.1.1") // IP por defecto estática

  useEffect(() => {
    loadSettings()
    calculateCacheSize()
  }, [])

  const loadSettings = () => {
    setBiometricEnabled(localStorage.getItem('settings:biometricEnabled') === 'true')
    setPushEnabled(localStorage.getItem('settings:pushEnabled') !== 'false')
    setSoundEnabled(localStorage.getItem('settings:soundEnabled') !== 'false')
    setMapStyle((localStorage.getItem('settings:mapStyle') as any) || 'color')
    setShowTraffic(localStorage.getItem('settings:showTraffic') === 'true')
  }

  const calculateCacheSize = () => {
    let total = 0
    for (let x in localStorage) {
      if (localStorage.hasOwnProperty(x)) {
        total += ((localStorage[x].length + x.length) * 2)
      }
    }
    setCacheSize((total / (1024 * 1024)).toFixed(2) + " MB")
  }

  // --- Funciones de Acción ---
  const handleSync = () => {
    setSyncLoading(true)
    toast.promise(new Promise(resolve => setTimeout(resolve, 2000)), {
      loading: 'Sincronizando con el servidor...',
      success: () => {
        setSyncLoading(false)
        calculateCacheSize()
        return 'Datos actualizados correctamente'
      },
      error: 'Error en la sincronización',
    })
  }

  const toggleBiometric = async () => {
    if (!biometricEnabled) {
      if (window.PublicKeyCredential) {
        setBiometricEnabled(true)
        localStorage.setItem('settings:biometricEnabled', 'true')
        toast.success("Autenticación biométrica activada (Simulación)")
      } else {
        toast.error("Tu navegador no soporta autenticación biométrica")
      }
    } else {
      setBiometricEnabled(false)
      localStorage.setItem('settings:biometricEnabled', 'false')
      toast("Biometría desactivada")
    }
  }

  const handleClearCache = () => {
    const preserve = ['settings:', 'next-auth', 'auth-storage']
    Object.keys(localStorage).forEach(key => {
      if (!preserve.some(p => key.startsWith(p))) {
        localStorage.removeItem(key)
      }
    })
    calculateCacheSize()
    toast.success("Caché local limpiada", { icon: <Trash2 className="w-4 h-4 text-green-500"/> })
  }

  const handleExportLogs = () => {
    setExportingLogs(true)
    setTimeout(() => {
      const logContent = `iSync Web Logs - ${new Date().toISOString()}\nUser: ${fullName}\nIP: ${ipAddress}`
      const blob = new Blob([logContent], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `isync-web-logs-${Date.now()}.txt`
      a.click()
      setExportingLogs(false)
      toast.success("Logs exportados y listos para descargar")
    }, 1500)
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push("/")
  }

  // --- Renderizado de Secciones ---
  const renderContent = () => {
    switch (activeSection) {
      case "notifications": return (
        <SectionWrapper title="Preferencias de Notificación" description="Gestiona cómo y cuándo recibes alertas del sistema iSync.">
          <div className="space-y-3">
            <ToggleItem
              icon={<Bell />}
              title="Notificaciones Push Principales"
              desc="Recibir alertas globales, nuevos pedidos y actualizaciones de estado."
              checked={pushEnabled}
              onCheckedChange={(val: any) => { setPushEnabled(val); localStorage.setItem('settings:pushEnabled', String(val)) }}
            />
            <ToggleItem
              icon={<Volume2 />}
              title="Alertas Sonoras"
              desc="Reproducir un sonido corto para notificaciones críticas."
              checked={soundEnabled}
              disabled={!pushEnabled}
              onCheckedChange={(val: any) => { setSoundEnabled(val); localStorage.setItem('settings:soundEnabled', String(val)) }}
            />
            <ToggleItem
              icon={<ImageIcon />}
              title="Miniaturas en Notificaciones"
              desc="Mostrar imágenes de productos en las alertas emergentes (consume más datos)."
              checked={true}
            />
          </div>
        </SectionWrapper>
      )
      case "maps": return (
        <SectionWrapper title="Configuración de Mapas" description="Personaliza la visualización de la cartografía y rastreo.">
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-900">Estilo de Mapa Base</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MapStyleOption
                  id="color"
                  title="Estándar a Color"
                  desc="Visualización detallada por defecto."
                  mapStyle={mapStyle}
                  setMapStyle={setMapStyle}
                  iconColor="text-sky-600"
                />
                <MapStyleOption
                  id="minimalista"
                  title="Alto Contraste (Light)"
                  desc="Gama de grises para mejor legibilidad."
                  mapStyle={mapStyle}
                  setMapStyle={setMapStyle}
                  iconColor="text-gray-400"
                />
              </div>
            </div>
            <Separator />
            <ToggleItem
              icon={<RefreshCw />}
              title="Capa de Tráfico en Tiempo Real"
              desc="Superponer información vial sobre el mapa activo."
              checked={showTraffic}
              onCheckedChange={(val: any) => { setShowTraffic(val); localStorage.setItem('settings:showTraffic', String(val)) }}
            />
          </div>
        </SectionWrapper>
      )
      case "system": return (
        <SectionWrapper title="Estado y Mantenimiento" description="Información técnica del dispositivo y herramientas de depuración.">
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InfoStatCard icon={<Wifi />} label="Dirección IP" value={ipAddress} pulse />
              <InfoStatCard icon={<Smartphone />} label="Build Versión" value="1.10.02-WEB" />
              <InfoStatCard icon={<Database />} label="Caché Utilizada" value={cacheSize} />
            </div>
            <Separator />
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-900">Acciones de Mantenimiento</Label>
              <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <Button onClick={handleSync} disabled={syncLoading} className="bg-brand-primary hover:bg-brand-primary/90 flex-1 sm:flex-none">
                  <RefreshCw size={16} className={`mr-2 ${syncLoading && 'animate-spin'}`} />
                  {syncLoading ? 'Sincronizando...' : 'Sincronizar Ahora'}
                </Button>
                <Button variant="outline" onClick={handleClearCache} className="bg-white flex-1 sm:flex-none">
                  <Trash2 size={16} className="mr-2 text-gray-500" /> Limpiar Caché Local
                </Button>
                <Button variant="outline" onClick={handleExportLogs} disabled={exportingLogs} className="bg-white flex-1 sm:flex-none border-gray-200 text-gray-700 hover:bg-gray-50">
                  <Share2 size={16} className="mr-2 text-gray-500" /> {exportingLogs ? 'Exportando...' : 'Descargar Logs'}
                </Button>
              </div>
            </div>
          </div>
        </SectionWrapper>
      )
      case "security": return (
        <SectionWrapper title="Seguridad de la Cuenta" description="Gestiona el acceso y las credenciales de tu sesión activa.">
          <div className="space-y-6">
            <ToggleItem
              icon={<Key />}
              title="Acceso Biométrico (WebAuthn)"
              desc="Usar TouchID, FaceID o Windows Hello para iniciar sesión rápidamente."
              checked={biometricEnabled}
              onCheckedChange={toggleBiometric}
            />
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <UserCircle className="w-12 h-12 text-gray-400" strokeWidth={1}/>
                  <div>
                    <p className="text-sm font-semibold text-gray-950">{fullName || "Usuario iSync"}</p>
                    <p className="text-xs text-gray-500">Rol: Vendedor Pro · ID: IS-4509</p>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full w-fit">
                        <CheckCircle2 size={12}/>
                        Sesión activa en Chrome / Windows
                    </div>
                  </div>
                </div>
                <Button onClick={handleSignOut} variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700">
                  <LogOut size={16} className="mr-2" /> Cerrar Sesión
                </Button>
              </div>
              <div className="flex items-start gap-3 p-4 bg-amber-50 text-amber-800 rounded-lg border border-amber-100 text-xs">
                 <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0"/>
                 <div>
                    <span className="font-semibold">Nota de seguridad:</span> Tu sesión expira automáticamente tras 2 horas de inactividad. No compartas tus credenciales de acceso.
                 </div>
              </div>
            </div>
          </div>
        </SectionWrapper>
      )
      default: return null
    }
  }

  return (
    <div className="max-w-7xl mx-auto font-poppins pb-20 py-6 px-4 md:px-6">
      <header className="mb-8 border-b border-gray-100 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center shadow-md shadow-brand-primary/20">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tighter text-gray-950">Configuración</h1>
            <p className="text-sm text-gray-500 mt-1">Centro de control y preferencias de iSync Web System</p>
          </div>
        </div>
      </header>

      {/* Layout de Dos Columnas */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar de Navegación */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 border-b md:border-b-0 border-gray-100">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors w-full justify-start",
                    isActive
                      ? "bg-brand-primary/10 text-brand-primary"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-brand-primary" : "text-gray-400")} strokeWidth={isActive ? 2 : 1.5} />
                  {item.label}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Panel de Contenido Principal */}
        <main className="flex-1 bg-white">
          {renderContent()}
        </main>
      </div>

      <footer className="mt-16 pt-8 border-t border-gray-100 text-center">
        <p className="text-xs tracking-tight text-gray-400">
          © {new Date().getFullYear()} iSync Web · Enterprise Edition · Build {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'HEAD'}
        </p>
      </footer>
    </div>
  )
}

// --- Componentes Auxiliares de Diseño ---

interface WrapperProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function SectionWrapper({ title, description, children }: WrapperProps) {
  return (
    <Card className="border-gray-100 shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-6">
        <CardTitle className="text-xl font-semibold tracking-tight text-gray-950">{title}</CardTitle>
        <CardDescription className="text-sm text-gray-500 pt-1">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {children}
      </CardContent>
    </Card>
  )
}

function ToggleItem({ icon, title, desc, checked, onCheckedChange, disabled = false }: any) {
  return (
    <div className={cn(
      "flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all",
      disabled && 'opacity-50 cursor-not-allowed'
    )}>
      <div className="flex gap-4 items-center">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 shrink-0 border border-gray-200/50">
          {cloneElement(icon, { size: 18, strokeWidth: 1.5 })}
        </div>
        <div>
          <Label className="text-sm font-semibold text-gray-900">{title}</Label>
          <p className="text-xs text-gray-500">{desc}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} className="data-[state=checked]:bg-brand-primary" />
    </div>
  )
}

function MapStyleOption({ id, title, desc, mapStyle, setMapStyle, iconColor }: any) {
  const active = mapStyle === id
  return (
    <button
      onClick={() => { setMapStyle(id); localStorage.setItem('settings:mapStyle', id) }}
      className={cn(
        "group p-4 rounded-xl border-2 transition-all text-left flex items-start gap-3 w-full",
        active
          ? 'border-brand-primary bg-brand-primary/5 shadow-inner'
          : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
      )}
    >
      <div className={cn("w-8 h-8 rounded-lg bg-white flex items-center justify-center border shadow-sm shrink-0 mt-0.5", iconColor, active ? 'border-brand-primary/20': 'border-gray-100')}>
        <MapPin size={16} strokeWidth={active? 2: 1.5} />
      </div>
      <div>
        <p className={cn("text-sm font-semibold", active ? 'text-brand-primary' : 'text-gray-900')}>{title}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
      {active && <CheckCircle2 className="w-4 h-4 text-brand-primary ml-auto shrink-0 mt-0.5"/>}
    </button>
  )
}

function InfoStatCard({ icon, label, value, pulse = false }: any) {
  return (
    <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-gray-200 transition-colors">
      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-brand-primary shrink-0 border border-gray-200/50">
        {cloneElement(icon, { size: 18, strokeWidth: 1.5 })}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] uppercase tracking-wider font-medium text-gray-400 truncate">{label}</p>
        <p className="text-sm font-bold text-gray-950 truncate">{value}</p>
      </div>
      {pulse && (
        <div className="relative flex h-2 w-2 ml-auto shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
        </div>
      )}
    </div>
  )
}