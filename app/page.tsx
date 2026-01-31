import LoginForm from "@/app/ui/login-form"
import Image from "next/image"

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center h-dvh bg-gray-50 font-sans">
      <div className="w-full bg-white overflow-hidden flex h-full">

        {/* Lado Izquierdo: Visual / Branding */}
        <div className="hidden lg:flex w-1/2 bg-linear-to-br from-[#1e517b] via-[#1A3D59] to-[#16334b] p-16 flex-col justify-between text-white relative">

          {/* Logo */}
          <div className="size-9">
            <Image
              alt="logo isync web cloud"
              src="/assets/iSync_logo.png"
              height={80}
              width={80}
              className="object-contain"
            />
          </div>

          {/* Texto Principal */}
          <div className="relative z-10 mb-8 space-y-6">
            <h2 className="text-2xl font-medium text-blue-100">Todo Sincronizado</h2>
            <h1 className="text-5xl font-extrabold leading-tight tracking-tight">
              Obten acceso de manera mas rapida en cualquier dispositivo
            </h1>
          </div>

          {/* Decoración: Círculos o blur */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-[100px] transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400 opacity-20 rounded-full blur-[80px]"></div>
        </div>

        {/* Lado Derecho: Formulario */}
        <div className="w-full lg:w-1/2 p-12 md:p-16 flex flex-col justify-center">
          <LoginForm />
        </div>

      </div>
    </main>
  )
}
