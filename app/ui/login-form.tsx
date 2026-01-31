"use client"

import { useActionState } from "react"
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

export default function LoginForm() {
  const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined)

  return (
    <div className="w-full mx-auto">
      {/* Header del formulario */}
      <div className="mb-8">
        <div className="text-3xl font-bold text-blue-600 mb-2">*</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Login to your account</h2>
        <p className="text-gray-500">Access your tasks, notes, and projects anytime.</p>
      </div>

      <form action={dispatch} className="space-y-6">

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="employeeCode">
            Employee Code
          </label>
          <input
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 hover:bg-white"
            id="employeeCode"
            type="number"
            name="employeeCode"
            placeholder="Ex: 1234"
            required
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-semibold text-gray-700" htmlFor="password">
              Password
            </label>
            {/* Opcional: Link de recuperar contraseña */}
            {/* <a href="#" className="text-sm text-gray-400 hover:text-gray-600">Forgot?</a> */}
          </div>
          <input
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 hover:bg-white"
            id="password"
            type="password"
            name="password"
            placeholder="••••••••"
            required
            minLength={6}
          />
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
          className="w-full bg-[#1A3D59] cursor-pointer text-white font-semibold py-3 px-4 rounded-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={isPending}
        >
          {isPending ? "Iniciando Sesion..." : "Iniciar Sesion"}
        </button>

        {/* Footer opcional */}
        <p className="mt-8 text-center text-sm text-gray-500">
          Don&apos;t have an account? <span className="text-blue-600 font-medium cursor-pointer hover:underline">Sign up</span>
        </p>
      </form>

      <Drawer direction="right">
        <DrawerTrigger>Open</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Are you absolutely sure?</DrawerTitle>
            <DrawerDescription>This action cannot be undone.</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button>Guardar</Button>
            <DrawerClose>
              <Button className="flex-1" variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
