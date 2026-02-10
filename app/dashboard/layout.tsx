"use client"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/app/dashboard/app-sidebar"
import AuthProvider from "@/app/ui/auth-provider"
import SessionSync from "@/app/ui/session-sync"
import CartISync from "@/components/Cart/page"
import { useCustomerStore } from "../lib/store.customer"
import { useCartStore } from "../lib/store.cart"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const { selectedCustomer } = useCustomerStore();
  const { productsInCart } = useCartStore();

  return (
    <AuthProvider>
      <SessionSync />
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <main className="flex-1 w-full bg-gray-50">
          <div className="p-4 border-b bg-white justify-between flex items-center gap-4">
            <SidebarTrigger />
            <span className="font-medium text-gray-400 uppercase tracking-widest text-xs">
              {productsInCart.length !== 0 ? selectedCustomer?.cardName : ""}
            </span>
            <CartISync />
          </div>
          <div className="p-8">
            {children}
          </div>
        </main>
      </SidebarProvider>
    </AuthProvider>
  )
}