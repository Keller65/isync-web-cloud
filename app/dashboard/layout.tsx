"use client"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/app/dashboard/app-sidebar"
import AuthProvider from "@/app/ui/auth-provider"
import SessionSync from "@/app/ui/session-sync"
import { Button } from "@/components/ui/button"
import CartIcon from "@/public/icons/CartIcon"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger, } from "@/components/ui/drawer"
import { useCustomerStore } from "../lib/store.customer"
import { useCartStore } from "../lib/store.cart"
import { Trash2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus } from "@phosphor-icons/react"
import Link from "next/link"
import { toast } from "sonner"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const { selectedCustomer } = useCustomerStore();
  const { productsInCart, removeProduct } = useCartStore();

  const totalCart = productsInCart.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);

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
              <DrawerTrigger className="cursor-pointer relative">
                <CartIcon />
                {productsInCart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                    {productsInCart.length}
                  </span>
                )}
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader className="border-b shrink-0">
                  <DrawerTitle className="text-xl font-bold">Carrito de Compras</DrawerTitle>
                  <DrawerDescription>
                    {productsInCart.length === 0
                      ? "Tu carrito está vacío."
                      : `Tienes ${productsInCart.length} productos seleccionados.`}
                  </DrawerDescription>
                </DrawerHeader>

                <div className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full w-full">
                    <div className="p-4 space-y-4">
                      {productsInCart.map((item) => (
                        <div key={item.itemCode} className="flex gap-4 items-start">
                          <div className="h-20 w-20 bg-white rounded-md shrink-0 overflow-hidden border">
                            <img
                              src={`https://pub-266f56f2e24d4d3b8e8abdb612029f2f.r2.dev/${item.itemCode}.jpg`}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://pub-266f56f2e24d4d3b8e8abdb612029f2f.r2.dev/100000.jpg"
                              }}
                              alt={item.itemName}
                              className="h-full w-full object-contain p-1"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold truncate leading-none mb-1">{item.itemName}</h4>
                            <div className="bg-gray-200 size-fit px-3 py-1 grid place-content-center rounded-full">
                              <p className="text-xs font-regular text-gray-500">{item.itemCode}</p>
                            </div>
                            <div className="flex items-center justify-between mt-auto">
                              <div className="text-xs flex flex-col gap-1">
                                <p className="font-light">Precio: <span className="font-bold">{item.unitPrice.toLocaleString('es-HN', { minimumFractionDigits: 2 })}</span></p>
                                <p className="font-light">Cantidad: <span className="font-bold">{item.quantity}</span></p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => removeProduct(item.itemCode)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div className="p-6 border-t bg-muted/20 shrink-0">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-muted-foreground">Total Estimado</span>
                    <span className="text-2xl font-semibold">
                      ${totalCart.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <DrawerFooter className="p-0 flex flex-row gap-2">
                    <Button onClick={() => toast.success("Pedido realizado con éxito", { position: "top-center" })} className="flex-1 bg-brand-primary hover:bg-brand-primary/90 h-12 text-sm font-semibold rounded-full shadow-lg" disabled={productsInCart.length === 0}>
                      Realizar Pedido
                    </Button>

                    <DrawerClose asChild>
                      <Link href="/dashboard/orders/shop" className="size-12 border border-gray-500 grid place-content-center rounded-full">
                        <Plus size={20} stroke="5" />
                      </Link>
                    </DrawerClose>
                  </DrawerFooter>
                </div>
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
