"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingCart,
  CreditCard,
  MapPin,
  MapIcon,
  Calendar,
  Clock,
  Users,
  Settings,
  Package,
  Search,
  User,
} from "lucide-react"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
  Command,
} from "@/components/ui/command"

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleSelect = (url: string) => {
    setOpen(false)
    router.push(url)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors border rounded-full px-3 py-1.5 bg-muted/50"
      >
        <Search size={16} />
        <span className="hidden md:inline">Buscar...</span>
        <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder="Escribe un comando o busca..." />
          <CommandList>
            <CommandEmpty>No se encontró ningún resultado.</CommandEmpty>
            <CommandGroup heading="Principal">
              <CommandItem onSelect={() => handleSelect("/dashboard")}>
                <LayoutDashboard size={18} />
                <span>Analíticas</span>
                <CommandShortcut>⌘A</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => handleSelect("/dashboard/orders")}>
                <ShoppingCart size={18} />
                <span>Pedidos</span>
                <CommandShortcut>⌘P</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => handleSelect("/dashboard/payments")}>
                <CreditCard size={18} />
                <span>Cobros</span>
                <CommandShortcut>⌘C</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => handleSelect("/dashboard/catalog")}>
                <Package size={18} />
                <span>Catálogo</span>
                <CommandShortcut>⌘S</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Visitas">
              <CommandItem onSelect={() => handleSelect("/dashboard/visitas")}>
                <MapPin size={18} />
                <span>General</span>
                <CommandShortcut>V G</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => handleSelect("/dashboard/visitas/maps")}>
                <MapIcon size={18} />
                <span>Mapas</span>
                <CommandShortcut>V M</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => handleSelect("/dashboard/visitas/visits")}>
                <Clock size={18} />
                <span>Registro</span>
                <CommandShortcut>V R</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => handleSelect("/dashboard/visitas/calendar")}>
                <Calendar size={18} />
                <span>Calendario</span>
                <CommandShortcut>V C</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Utilidades">
              <CommandItem onSelect={() => handleSelect("/dashboard/users")}>
                <User size={18} />
                <span>Usuarios</span>
                <CommandShortcut>U</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => handleSelect("/dashboard/locations")}>
                <MapPin size={18} />
                <span>Ubicaciones</span>
                <CommandShortcut>L</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Cuenta">
              <CommandItem onSelect={() => handleSelect("/dashboard/settings")}>
                <Settings size={18} />
                <span>Ajustes</span>
                <CommandShortcut>⌘,</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
