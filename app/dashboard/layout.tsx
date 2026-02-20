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
          <div className="p-4 z-50 flex-1 border-b bg-white w-full justify-between flex items-center gap-4 sticky top-0">
            <SidebarTrigger />
            <span className="font-medium text-black uppercase tracking-widest text-[14px]">
              {productsInCart.length !== 0 ? selectedCustomer?.cardName : ""}
            </span>
            <CartISync />
          </div>

          <div className="p-0">
            {children}
          </div>
        </main>
      </SidebarProvider>
    </AuthProvider>
  )
}