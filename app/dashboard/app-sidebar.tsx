"use client"

import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import Avvvatars from "avvvatars-react"
import { Cardholder, ChartLineUp, GearSix, ShoppingCart, CaretUpDown, SignOut, Users, MapTrifoldIcon, Calendar, MapPin, Path, List, Clock } from "@phosphor-icons/react"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarGroup, SidebarGroupLabel, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Collapsible, CollapsibleContent, CollapsibleTrigger, } from "@/components/ui/collapsible"

const items = [
  {
    title: "Principal",
    items: [
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
        title: "Cobros",
        url: "/dashboard/payments",
        icon: Cardholder,
      },
    ]
  },
  {
    title: "Visitas",
    url: "/dashboard/visitas",
    icon: MapPin,
    subItems: [
      { title: "General", url: "/dashboard/visitas", icon: List },
      { title: "Mapas", url: "/dashboard/visitas/maps", icon: MapTrifoldIcon },
      { title: "Registro", url: "/dashboard/visitas/visits", icon: Clock },
      { title: "Calendario", url: "/dashboard/visitas/calendar", icon: Calendar },
    ]
  },
  {
    title: "Utilidades",
    items: [
      {
        title: "Usuarios",
        url: "/dashboard/users",
        icon: Users,
      },
    ]
  },
  {
    title: "Cuenta",
    items: [
      {
        title: "Ajustes",
        url: "/dashboard/settings",
        icon: GearSix,
      },
    ]
  }
]

export function AppSidebar() {
  const { data: session } = useSession()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push(window.location.origin)
  }

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-brand-primary">
                <Image
                  alt="logo isync"
                  src="/assets/iSync_logo.png"
                  height={24}
                  width={24}
                  priority
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">iSync Web</span>
                <span className="truncate text-xs text-muted-foreground">WCS Soluciones</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {items.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarMenu>
              {'subItems' in group && group.subItems ? (
                <Collapsible key={group.title} asChild className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={group.title}>
                        <group.icon size={20} />
                        <span>{group.title}</span>
                        <Path className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" size={14} />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {group.subItems.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                              <Link href={subItem.url}>
                                {subItem.icon && <subItem.icon size={16} />}
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                'items' in group && group.items?.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <Link href={item.url}>
                        <item.icon size={20} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <Avvvatars value={session?.user?.email ?? ''} style="shape" size={32} />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{session?.user?.name}</span>
                    <span className="truncate text-xs text-muted-foreground">Manager</span>
                  </div>
                  <CaretUpDown size={16} className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg" side="top" align="end">
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <SignOut size={16} className="mr-2" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
