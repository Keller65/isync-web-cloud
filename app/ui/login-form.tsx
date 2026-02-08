"use client"

import { useActionState, useState, useEffect } from "react"
import { authenticate } from "@/app/lib/actions"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCustomerStore } from "@/app/lib/store.customer"
import { Eye, EyeOff } from "lucide-react"

export default function LoginForm() {
  const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined)
  const { hostUrl, cloudflareUrl, setUrls } = useCustomerStore()
  const [tempHost, setTempHost] = useState(hostUrl)
  const [tempCloudflare, setTempCloudflare] = useState(cloudflareUrl)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    setTempHost(hostUrl)
    setTempCloudflare(cloudflareUrl)
  }, [hostUrl, cloudflareUrl])

  const handleSaveConfig = () => {
    setUrls(tempHost, tempCloudflare)
  }

  return (
    <div className="w-full mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Inicia sesión</h2>
        <p className="text-gray-500">Ahora accede a tu cuenta iSycn mas facil</p>
      </div>

      <form action={dispatch} className="space-y-6">
        <input
          type="hidden"
          name="hostUrl"
          value={process.env.NEXT_PUBLIC_API_HOST || ""}
        />
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="employeeCode">
            Código de Empleado
          </label>
          <input
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all bg-gray-50 hover:bg-white"
            id="employeeCode"
            type="number"
            name="employeeCode"
            placeholder="Ej: 1234"
            required
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-semibold text-gray-700" htmlFor="password">
              Contraseña
            </label>
          </div>
          <div className="relative">
            <input
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all bg-gray-50 hover:bg-white"
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="••••••••"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div aria-live="polite" aria-atomic="true">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100">
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-brand-primary cursor-pointer text-white font-semibold py-3 px-4 rounded-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={isPending}
        >
          {isPending ? "Iniciando Sesión..." : "Iniciar Sesión"}
        </button>
      </form>

      <Drawer direction="right">
        <DrawerTrigger asChild>
          <Button variant="outline" className="mt-4 w-full">Configuración de Red</Button>
        </DrawerTrigger>
        <DrawerContent className="h-full">
          <DrawerHeader>
            <DrawerTitle>Configuración de Conexión</DrawerTitle>
            <DrawerDescription>Ajusta las direcciones de los servidores.</DrawerDescription>
          </DrawerHeader>

          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="hostUrl" className="text-sm font-medium">URL del Host</label>
              <Input
                id="hostUrl"
                placeholder="https://tu-servidor.com"
                value={tempHost}
                onChange={(e) => setTempHost(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="cloudflareUrl" className="text-sm font-medium">URL de Cloudflare</label>
              <Input
                id="cloudflareUrl"
                placeholder="https://tu-app.workers.dev"
                value={tempCloudflare}
                onChange={(e) => setTempCloudflare(e.target.value)}
              />
            </div>
          </div>

          <DrawerFooter>
            <Button className="w-full" onClick={handleSaveConfig}>Guardar Configuración</Button>
            <DrawerClose asChild>
              <Button className="w-full" variant="outline">Cancelar</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}