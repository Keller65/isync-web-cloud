"use client"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/app/dashboard/app-sidebar"
import AuthProvider from "@/app/ui/auth-provider"
import SessionSync from "@/app/ui/session-sync"
import { Button } from "@/components/ui/button"
import CartIcon from "@/public/icons/CartIcon"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger, } from "@/components/ui/drawer"
import { useCustomerStore } from "../lib/store.customer"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const { selectedCustomer } = useCustomerStore();
  
  return (
    <AuthProvider>
      <SessionSync />
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 w-full bg-gray-50">
          <div className="p-4 border-b bg-white justify-between flex items-center gap-4">
            <SidebarTrigger />
            <span className="font-semibold text-gray-500">iSync Web Cloud - {selectedCustomer?.cardName}</span>
            <Drawer direction="right">
              <DrawerTrigger className="cursor-pointer">
                <CartIcon />
              </DrawerTrigger>
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
          <div className="p-8">
            {children}
          </div>
        </main>
      </SidebarProvider>
    </AuthProvider>
  )
}
