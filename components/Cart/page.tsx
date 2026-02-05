"use client"

import { useState, useRef } from 'react'
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { useCustomerStore } from '@/app/lib/store.customer'
import { useCartStore } from '@/app/lib/store.cart'
import { X, Plus } from "lucide-react"
import CartIcon from '@/public/icons/CartIcon'
import { ScrollArea } from '@/components/ui/scroll-area'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { useAuthStore } from '@/app/lib/store'

function CartISync() {
  const { selectedCustomer, selectedAddress, clearSelectedCustomer } = useCustomerStore();
  const { productsInCart, removeProduct, clearCart } = useCartStore();
  const { token } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [orderInfo, setOrderInfo] = useState<{ docEntry?: string }>({});

  const isProcessing = useRef(false);

  const subtotal = productsInCart.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  const tax = subtotal * 0.15;
  const total = subtotal + tax;

  const handleSubmitOrder = async () => {
    if (isProcessing.current) return;

    if (!selectedCustomer || !selectedAddress || productsInCart.length === 0) {
      toast.error("Faltan datos para procesar el pedido. Asegúrese de seleccionar un cliente y una dirección de entrega.");
      return;
    }

    try {
      isProcessing.current = true;
      setIsLoading(true);

      const payload = {
        requestId: uuidv4(),
        cardCode: selectedCustomer.cardCode,
        comments: "",
        lines: productsInCart.map(p => ({
          itemCode: p.itemCode,
          barCode: p.barCode || 'N/D',
          quantity: p.quantity,
          priceList: p.unitPrice,
          priceAfterVAT: p.unitPrice,
          taxCode: p.taxCode
        })),
        payToCode: selectedAddress.addressName,
      };

      console.log('📤 Enviando pedido:', payload);

      const response = await axios.post(`/api-proxy/api/Quotations/Order`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000,
      });

      console.log('✅ Respuesta de la API:', response.data);

      setOrderInfo({
        docEntry: response.data?.docEntry || response.data?.DocEntry
      });

      clearCart();
      clearSelectedCustomer();

      setShowSuccessAlert(true);

    } catch (error: any) {
      console.error('❌ Error en petición:', error);
      toast.error(error.response?.data?.message || "Ocurrió un error al procesar el pedido");
    } finally {
      setIsLoading(false);
      isProcessing.current = false;
    }
  };

  return (
    <>
      <Drawer direction="right">
        <DrawerTrigger asChild>
          <button className="cursor-pointer relative p-2 hover:bg-gray-100 rounded-full transition-colors">
            <CartIcon />
            {productsInCart.length > 0 && (
              <span className="absolute top-0 right-0 bg-black text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {productsInCart.length}
              </span>
            )}
          </button>
        </DrawerTrigger>
        <DrawerContent className="h-screen min-w-[80vw] top-0 right-0 left-auto mt-0 w-full rounded-none border-l">
          <div className="flex flex-col h-full bg-white">

            <DrawerHeader className="flex flex-row items-center justify-between px-8 py-6 border-none">
              <DrawerTitle className="text-2xl font-semibold uppercase tracking-tight">
                Carrito de Compras
              </DrawerTitle>
              <DrawerClose className="opacity-50 hover:opacity-100 transition-opacity">
                <X className="h-5 w-5" />
              </DrawerClose>
            </DrawerHeader>

            <div className="px-8 pb-4 flex justify-between text-[10px] uppercase tracking-widest text-gray-400 border-b border-gray-100 mb-4">
              <span>Item</span>
              <div className="flex gap-16 mr-12">
                <span>Cantidad</span>
                <span>Precio</span>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full px-8">
                <div className="space-y-8 py-4">
                  {productsInCart.map((item) => (
                    <div key={item.itemCode} className="flex gap-6 items-center group">
                      <div className="h-24 w-20 bg-[#f9f9f9] rounded-sm shrink-0 flex items-center justify-center overflow-hidden">
                        <Image
                          src={`https://pub-266f56f2e24d4d3b8e8abdb612029f2f.r2.dev/${item.itemCode}.jpg`}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://pub-266f56f2e24d4d3b8e8abdb612029f2f.r2.dev/100000.jpg"
                          }}
                          alt={item.itemName}
                          className="h-full w-full object-contain mix-blend-multiply p-2"
                          height={80}
                          width={80}
                        />
                      </div>

                      <div className="flex-1 flex flex-col">
                        <h4 className="text-sm font-medium text-gray-900 leading-tight">{item.itemName}</h4>
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 mt-1">{item.itemCode}</p>
                      </div>

                      <div className="flex items-center gap-12">
                        <div className="flex items-center justify-center w-8 h-8 border border-gray-200 rounded-full">
                          <span className="text-xs font-medium">{item.quantity}</span>
                        </div>

                        <div className="w-16 text-right">
                          <span className="text-sm font-medium">
                            {item.unitPrice.toLocaleString('es-HN')} L
                          </span>
                        </div>

                        <button
                          onClick={() => removeProduct(item.itemCode)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                        >
                          <X className="h-4 w-4 text-gray-300 hover:text-black" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="px-8 py-4 bg-[#fcfcfc] border-t border-gray-100">
              <div className="space-y-3 mb-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Cliente</span>
                  <span className="font-medium">{selectedCustomer?.cardName || "N/D"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">{subtotal.toLocaleString('es-HN', { minimumFractionDigits: 2 })} L</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">ISV</span>
                  <span className="font-medium">{tax.toLocaleString('es-HN', { minimumFractionDigits: 2 })} L</span>
                </div>
                <div className="flex justify-between text-lg pt-4 border-t border-gray-200">
                  <span className="font-light uppercase tracking-wider">Total</span>
                  <span className="font-bold">{total.toLocaleString('es-HN', { minimumFractionDigits: 2 })} L</span>
                </div>
              </div>

              <div className="flex flex-1 flex-row gap-3">
                <Button
                  onClick={handleSubmitOrder}
                  className="flex-1 bg-brand-primary text-white h-14 text-md tracking-[0.2em] rounded-full hover:bg-zinc-800"
                  disabled={productsInCart.length === 0 || isLoading}
                >
                  {isLoading ? "Procesando..." : "Realizar Pedido"}
                </Button>

                <DrawerClose asChild>
                  <Link
                    href="/dashboard/orders/shop"
                    className="w-75 flex items-center bg-gray-200 rounded-full justify-center gap-2 text-xs uppercase text-gray-400 py-3 hover:text-black transition-colors px-6"
                  >
                    <Plus size={14} /> Continuar
                  </Link>
                </DrawerClose>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={showSuccessAlert} onOpenChange={setShowSuccessAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Pedido Realizado</AlertDialogTitle>
            <AlertDialogDescription>
              Tu pedido ha sido creado exitosamente
              {orderInfo.docEntry && <span className="font-bold block mt-2 text-black">Número de SAP: {orderInfo.docEntry}</span>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              className="bg-black text-white rounded-full px-8"
              onClick={() => window.open(`/dashboard/orders/3439`)}
            >
              Ver Pedido
            </AlertDialogAction>
            <AlertDialogAction
              className="bg-black text-white rounded-full px-8"
              onClick={() => setShowSuccessAlert(false)}
            >
              Cerrar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default CartISync