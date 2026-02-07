"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { signOut, useSession } from "next-auth/react"
import { Cardholder, ChartLineUp, GearSix, ShoppingCart, CaretUpDown } from "@phosphor-icons/react"
import Image from "next/image"
import Avvvatars from "avvvatars-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Items del menú
const items = [
  {
    title: "Analiticas",
    url: "/dashboard",
    icon: ChartLineUp,
  },
  {
    title: "Pedidos",
    url: "/dashboard/orders",
    icon: ShoppingCart,
  },
  {
    title: "Payments",
    url: "/dashboard/payments",
    icon: Cardholder,
  },
  // {
  //   title: "Catalog",
  //   url: "/dashboard/catalog",
  //   icon: FileText,
  // },
  // {
  //   title: "Locations",
  //   url: "/dashboard/locations",
  //   icon: MapPin,
  // },
  {
    title: "Ajustes",
    url: "/dashboard/settings",
    icon: GearSix,
  },
]

export function AppSidebar() {
  const { data: session } = useSession()

  return (
    <Sidebar>
      <SidebarHeader className="flex-row items-center">
        <div className="p-1.5 size-9 bg-brand-primary rounded-lg">
          <Image
            alt="logo isync web cloud"
            src="/assets/iSync_logo.png"
            height={80}
            width={80}
            priority
            quality={100}
            className="object-contain"
          />
        </div>
        <h1 className="font-bold leading-tight tracking-tight">iSync Web</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon size={40} />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-x-3 w-full" asChild>
            <span className="flex items-center gap-x-3 w-full">
              <Avvvatars value={session?.user?.email ?? ''} style="shape" size={40} />
              <div className="text-left">
                <p className="text-sm font-semibold">{session?.user?.name}</p>
                <p className="text-xs text-gray-500">{session?.user?.email}</p>
              </div>
              <CaretUpDown className="ml-auto w-4 h-4" />
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem onClick={() => signOut()}>
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
