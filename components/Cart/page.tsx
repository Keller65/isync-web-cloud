"use client"

import { useState, useRef, useEffect } from 'react'
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useCustomerStore } from '@/app/lib/store.customer'
import { useCartStore } from '@/app/lib/store.cart'
import { X, Plus, Edit3, Trash2 } from "lucide-react"
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'
import { useAuthStore } from '@/app/lib/store'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from "@/components/ui/badge"
import { Pen, ShoppingCart } from '@phosphor-icons/react'
import Image from 'next/image'
import Link from 'next/link'
import axios from 'axios'

function CartISync() {
  const { selectedCustomer, selectedAddress, clearSelectedCustomer } = useCustomerStore();
  const { productsInCart, removeProduct, clearCart, editMode, setEditMode } = useCartStore();
  const { token } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);
  const [showCancelOrderAlert, setShowCancelOrderAlert] = useState(false);
  const [orderInfo, setOrderInfo] = useState<{ docEntry?: string }>({});
  const [comments, setComments] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);

  const isProcessing = useRef(false);

  useEffect(() => {
    if (editMode) {
      setOrderId(null);
      return;
    }

    if (productsInCart.length > 0 && !orderId) {
      setOrderId(uuidv4());
    } else if (productsInCart.length === 0 && orderId) {
      setOrderId(null);
    }
  }, [productsInCart, orderId, editMode]);

  const subtotal = productsInCart.reduce((acc, item) => acc + (item.priceAfterVAT * item.quantity), 0);
  const tax = subtotal * 0.15;
  const total = subtotal + tax;

  const handleCancelOrder = () => {
    clearCart();
    clearSelectedCustomer();
    setEditMode(false);
    setComments('');
    setOrderId(null);
    setShowCancelOrderAlert(false);
    toast.info("Pedido cancelado y carrito limpiado");
  };

  const handleSubmitOrder = async () => {
    if (isProcessing.current) return;

    if (!selectedCustomer || !selectedAddress || productsInCart.length === 0 || (!orderId && !editMode)) {
      toast.error("Faltan datos para procesar el pedido.");
      return;
    }

    try {
      isProcessing.current = true;
      setIsLoading(true);

      const payload = {
        requestId: editMode ? null : orderId,
        cardCode: selectedCustomer.cardCode,
        payToCode: selectedAddress.addressName,
        comments: comments || "",
        lines: productsInCart.map(p => ({
          itemCode: p.itemCode,
          barCode: p.barCode,
          quantity: p.quantity,
          priceList: p.priceList,
          priceAfterVAT: p.priceAfterVAT,
          taxCode: p.taxCode
        })),
      };

      const endpoint = editMode ? `/api-proxy/api/Quotations/Update` : `/api-proxy/api/Quotations/Order`;

      const response = await axios.post(endpoint, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'iSync-Web'
        },
        timeout: 60000,
      });

      setOrderInfo({
        docEntry: response.data?.docEntry || response.data?.DocEntry
      });

      setOrderId(null);
      clearCart();
      clearSelectedCustomer();
      setEditMode(false);
      setShowSuccessAlert(true);

    } catch (error: any) {
      toast.error(error.response?.data?.message || "Ocurrió un error al procesar el pedido");
    } finally {
      setIsLoading(false);
      isProcessing.current = false;
      setShowConfirmAlert(false);
    }
  };

  return (
    <>
      <Drawer direction="right">
        <DrawerTrigger asChild>
          <span className='relative mr-3 cursor-pointer'>
            {productsInCart.length > 0 && (editMode ? <Pen size={24} /> : <ShoppingCart size={24} />)}
            {productsInCart.length > 0 && (
              <Badge
                className={`absolute -top-2 -right-4 text-[10px] rounded-full size-5 grid place-content-center`}
                variant="default">
                {productsInCart.length}
              </Badge>
            )}
          </span>
        </DrawerTrigger>
        <DrawerContent className="h-screen min-w-[80vw] top-0 right-0 left-auto mt-0 w-full rounded-none border-l">
          <div className="flex flex-col h-full bg-white">

            <DrawerHeader className="flex flex-row items-center justify-between px-8 py-6 border-none">
              <div className="flex flex-col">
                <DrawerTitle className="text-2xl font-semibold uppercase tracking-tight flex items-center gap-3">
                  Carrito de Compras
                  {editMode && (
                    <Badge variant="outline" className="border-amber-500 text-amber-600 animate-pulse flex gap-1 items-center py-1">
                      <Edit3 size={12} /> Editando Pedido
                    </Badge>
                  )}
                </DrawerTitle>
                {orderId && !editMode && (
                  <span className="text-[10px] text-gray-400 font-mono">ID: {orderId}</span>
                )}
              </div>
              <DrawerClose className="opacity-50 hover:opacity-100 transition-opacity">
                <X className="h-5 w-5" />
              </DrawerClose>
            </DrawerHeader>

            <div className="p-4">
              <Textarea
                placeholder="Agrega un comentario a tu pedido..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="bg-white min-h-7.5"
              />
            </div>

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
                          alt={item.itemCode}
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
                            {item.priceAfterVAT.toLocaleString('es-HN')} L
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
                  onClick={() => setShowCancelOrderAlert(true)}
                  className="bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 size-13 cursor-pointer rounded-full transition-colors"
                  disabled={productsInCart.length === 0 || isLoading}
                >
                  <Trash2 size={18} />
                </Button>

                <Button
                  onClick={() => setShowConfirmAlert(true)}
                  className={`flex-1 text-white hover:bg-brand-primary cursor-pointer h-13 text-md tracking-[0.2em] rounded-full transition-colors bg-brand-primary disabled:bg-gray-300 disabled:text-gray-500`}
                  disabled={productsInCart.length === 0 || isLoading}
                >
                  {isLoading ? "Procesando..." : editMode ? "Actualizar Pedido" : "Realizar Pedido"}
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
            <AlertDialogTitle className="text-xl">
              {orderInfo.docEntry ? "Operación Exitosa" : "Pedido Realizado"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {editMode ? "Tu pedido ha sido actualizado correctamente." : "Tu pedido ha sido creado exitosamente."}
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

      <AlertDialog open={showConfirmAlert} onOpenChange={setShowConfirmAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Seguro que quieres enviar realizar este pedido?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-200 text-black rounded-full px-8 hover:bg-gray-300 border-none">
              No, cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-black text-white rounded-full px-8"
              onClick={handleSubmitOrder}
            >
              Sí, enviar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showCancelOrderAlert} onOpenChange={setShowCancelOrderAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Vaciar carrito?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminarán todos los productos y se cancelará el proceso actual.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-100 text-black rounded-full px-8 border-none">
              Volver
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 text-white rounded-full px-8 hover:bg-red-600"
              onClick={handleCancelOrder}
            >
              Sí, vaciar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default CartISync;