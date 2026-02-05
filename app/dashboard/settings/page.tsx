"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger, } from "@/components/ui/tabs"
import { toast } from "sonner"

export default function SettingsPage() {
  const handleSave = () => {
    toast.success("Cambios guardados correctamente")
  }

  return (
    <div className="max-w-5xl mx-auto font-poppins">
      <div className="mb-10">
        <h1 className="text-4xl font-light uppercase tracking-tighter text-gray-900">Configuración</h1>
        <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mt-2">
          Gestión de cuenta y preferencias del sistema
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-transparent border-b rounded-none w-full justify-start h-auto p-0 mb-8">
          <TabsTrigger
            value="general"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent pb-3 px-6 text-[10px] uppercase tracking-widest font-medium transition-all font-poppins"
          >
            General
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent pb-3 px-6 text-[10px] uppercase tracking-widest font-medium transition-all font-poppins"
          >
            Notificaciones
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent pb-3 px-6 text-[10px] uppercase tracking-widest font-medium transition-all font-poppins"
          >
            Seguridad
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-0 space-y-6">
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-sm uppercase tracking-wider font-semibold font-poppins">Perfil del Negocio</CardTitle>
              <CardDescription className="text-xs font-poppins">Actualiza la información que aparecerá en tus facturas.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label htmlFor="store-name" className="text-[10px] uppercase tracking-widest text-gray-500 font-poppins">Nombre de la Tienda</Label>
                  <Input id="store-name" defaultValue="iSync Web Cloud" className="rounded-none border-gray-200 focus-visible:ring-0 focus-visible:border-black font-poppins" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-[10px] uppercase tracking-widest text-gray-500 font-poppins">Moneda Base</Label>
                  <Input id="currency" defaultValue="Lempira Hondureño (L)" disabled className="rounded-none bg-gray-50 border-gray-200 font-poppins" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rtn" className="text-[10px] uppercase tracking-widest text-gray-500 font-poppins">RTN / Identificación Fiscal</Label>
                <Input id="rtn" placeholder="0801-XXXX-XXXXXX" className="rounded-none border-gray-200 focus-visible:ring-0 focus-visible:border-black font-poppins" />
              </div>
            </CardContent>
          </Card>

          <Separator className="my-8" />

          <div className="flex justify-end gap-4">
            <Button variant="outline" className="rounded-none text-xs uppercase tracking-widest px-8 font-poppins">Cancelar</Button>
            <Button onClick={handleSave} className="rounded-none bg-black hover:bg-gray-800 text-white text-xs uppercase tracking-widest px-10 font-poppins transition-all shadow-none">Guardar</Button>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-0">
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-sm uppercase tracking-wider font-semibold font-poppins">Preferencias de Alerta</CardTitle>
              <CardDescription className="text-xs font-poppins">Recibe actualizaciones sobre inventario y ventas.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-2">
              <div className="flex items-center justify-between p-4 border border-gray-100 mb-2">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium font-poppins">Reporte diario por email</Label>
                  <p className="text-xs text-gray-400 font-poppins">Recibe un resumen de todas las ventas de Lempiras al final del día.</p>
                </div>
                <Switch className="data-[state=checked]:bg-black" />
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-100">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium font-poppins">Alertas de Stock Bajo</Label>
                  <p className="text-xs text-gray-400 font-poppins">Notificar cuando un producto tenga menos de 5 unidades.</p>
                </div>
                <Switch defaultChecked className="data-[state=checked]:bg-black" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-0">
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-sm uppercase tracking-wider font-semibold font-poppins">Acceso</CardTitle>
              <CardDescription className="text-xs font-poppins">Configura la seguridad de tu terminal.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-4 max-w-sm">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-gray-500 font-poppins">PIN de Autorización</Label>
                <Input type="password" placeholder="****" className="rounded-none border-gray-200 focus-visible:ring-0 focus-visible:border-black text-center text-xl tracking-[0.5em] font-poppins" />
              </div>
              <Button variant="outline" className="w-full rounded-none text-xs uppercase tracking-widest font-poppins">Cambiar Contraseña</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}