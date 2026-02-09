"use client"

import { useState, useRef, useEffect } from "react"
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCustomerStore } from "@/app/lib/store.customer"
import { useCartStore } from "@/app/lib/store.cart"
import { useAuthStore } from "@/app/lib/store"
import { X, Plus, Edit3, AlertCircle } from "lucide-react"
import { Pen, ShoppingCart, MapPinLine } from "@phosphor-icons/react"
import Image from "next/image"
import Link from "next/link"
import axios from "axios"
import { v4 as uuidv4 } from "uuid"
import { CustomerAddress } from "@/types/customers"

function CartISync() {
  const { selectedCustomer, selectedAddress, clearSelectedCustomer, setSelectedAddress } = useCustomerStore()
  const { productsInCart, removeProduct, clearCart, editMode, setEditMode, setDocEntry, docEntry } = useCartStore()
  const { token } = useAuthStore()

  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [showConfirmAlert, setShowConfirmAlert] = useState(false)
  const [showCancelOrderAlert, setShowCancelOrderAlert] = useState(false)
  const [showAddressDialog, setShowAddressDialog] = useState(false)

  const [showErrorAlert, setShowErrorAlert] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const [addresses, setAddresses] = useState<CustomerAddress[]>([])
  const [, setLoadingAddresses] = useState(false)
  const [orderInfo, setOrderInfo] = useState<{ docEntry?: string }>({})
  const [comments, setComments] = useState("")
  const [orderId, setOrderId] = useState<string | null>(null)

  const isProcessing = useRef(false)

  useEffect(() => {
    if (editMode) {
      setOrderId(null)
      return
    }

    if (productsInCart.length > 0 && !orderId) {
      setOrderId(uuidv4())
    } else if (productsInCart.length === 0 && orderId) {
      setOrderId(null)
    }
  }, [productsInCart, orderId, editMode])

  const subtotal = productsInCart.reduce(
    (acc, item) => acc + item.priceAfterVAT * item.quantity,
    0
  )
  const tax = subtotal * 0.15
  const total = subtotal

  const triggerError = (message: string) => {
    setErrorMessage(message)
    setShowErrorAlert(true)
  }

  const fetchAddresses = async () => {
    if (!selectedCustomer) return

    try {
      setLoadingAddresses(true)
      const { data } = await axios.get<CustomerAddress[]>(
        `/api-proxy/api/Customers/${selectedCustomer.cardCode}/addresses`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setAddresses(data)
    } catch {
      triggerError("No se pudieron cargar las direcciones del cliente.")
    } finally {
      setLoadingAddresses(false)
    }
  }

  const handleCancelOrder = () => {
    clearCart()
    clearSelectedCustomer()
    setEditMode(false)
    setComments("")
    setOrderId(null)
    setShowCancelOrderAlert(false)
  }

  const handleSubmitOrder = async () => {
    if (isProcessing.current) return

    if (!selectedCustomer) {
      triggerError("Debe seleccionar un cliente antes de continuar.")
      return
    }

    if (!selectedAddress) {
      triggerError("Debe seleccionar una dirección de entrega.")
      return
    }

    if (productsInCart.length === 0) {
      triggerError("El carrito está vacío.")
      return
    }

    try {
      isProcessing.current = true
      setIsLoading(true)

      const payload = {
        requestId: editMode ? null : orderId,
        cardCode: selectedCustomer.cardCode,
        payToCode: selectedAddress.addressName,
        comments: comments,
        lines: productsInCart.map(p => ({
          itemCode: p.itemCode,
          barCode: p.barCode,
          quantity: p.quantity,
          priceList: p.priceList,
          priceAfterVAT: p.priceAfterVAT,
          taxCode: p.taxCode
        }))
      }

      const response = await axios({
        method: editMode ? "PATCH" : "POST",
        url: editMode ? `/api-proxy/api/Quotations/${docEntry}` : `/api-proxy/api/Quotations/Order`,
        data: payload,
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000
      })

      setOrderInfo({ docEntry: response.data?.docEntry })
      clearCart()
      clearSelectedCustomer()
      setEditMode(false)
      setDocEntry("")
      setComments("")
      setShowSuccessAlert(true)
    } catch (error: any) {
      const msg = error.response?.data?.message || "Ocurrió un error inesperado al procesar el pedido."
      triggerError(msg)
    } finally {
      setIsLoading(false)
      isProcessing.current = false
      setShowConfirmAlert(false)
    }
  }

  return (
    <>
      <Drawer direction="right">
        <DrawerTrigger asChild>
          <span className="relative mr-3 cursor-pointer">
            {productsInCart.length > 0 &&
              (editMode ? <Pen size={24} /> : <ShoppingCart size={24} />)}
            {productsInCart.length > 0 && (
              <Badge className="absolute -top-2 -right-4 size-5 grid place-content-center text-[10px]">
                {productsInCart.length}
              </Badge>
            )}
          </span>
        </DrawerTrigger>

        <DrawerContent className="h-screen min-w-[80vw] right-0 left-auto rounded-none border-l">
          <div className="flex flex-col h-full bg-white justify-between">
            <DrawerHeader className="flex flex-row justify-between px-8 py-6">
              <DrawerTitle className="text-2xl font-semibold uppercase tracking-tight flex items-center gap-3">
                Carrito de Compras
                {editMode && (
                  <Badge
                    variant="outline"
                    className="border-amber-500 text-amber-600 animate-pulse flex gap-1 items-center py-1"
                  >
                    <Edit3 size={12} /> Editando Pedido # {docEntry}
                  </Badge>
                )}
              </DrawerTitle>
              <DrawerClose className="cursor-pointer">
                <X />
              </DrawerClose>
            </DrawerHeader>

            <div className="px-8 pb-4 flex gap-4">
              <Textarea
                placeholder="Instrucciones especiales, referencias o notas..."
                value={comments}
                onChange={e => setComments(e.target.value)}
                className="bg-gray-50 border-gray-200 rounded-2xl focus:border-black min-h-10 max-h-10 resize-none"
              />

              {editMode && (
                <Button
                  onClick={() => setShowCancelOrderAlert(true)}
                  variant="destructive"
                  className="rounded-full cursor-pointer min-h-10">
                  Cancelar Edicion de Pedido
                </Button>
              )}
            </div>

            <ScrollArea className="flex-1 max-h-100 min-h-100 px-6">
              <div className="space-y-8 py-4">
                {productsInCart.map(item => (
                  <div key={item.itemCode} className="flex gap-6 items-center">
                    <Image
                      src={`https://pub-266f56f2e24d4d3b8e8abdb612029f2f.r2.dev/${item.itemCode}.jpg`}
                      alt={item.itemCode}
                      width={80}
                      height={80}
                      className="object-contain"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.itemName}</p>
                      <p className="text-xs text-gray-400">
                        {item.itemCode}
                      </p>
                    </div>
                    <span>{item.quantity}</span>
                    <span>
                      {item.priceAfterVAT.toLocaleString("es-HN")} L
                    </span>
                    <button onClick={() => removeProduct(item.itemCode)}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="px-8 py-4 bg-[#fcfcfc] border-t border-gray-100">
              <div className="space-y-3 mb-2">
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-500">Ubicación</span>
                  <p>{selectedAddress?.addressName ?? ""}</p>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">
                    {subtotal.toLocaleString("es-HN", {
                      minimumFractionDigits: 2
                    })}{" "}
                    L
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">ISV</span>
                  <span className="font-medium">
                    {tax.toLocaleString("es-HN", {
                      minimumFractionDigits: 2
                    })}{" "}
                    L
                  </span>
                </div>

                <div className="flex justify-between text-lg pt-4 border-t border-gray-200">
                  <span className="font-light uppercase tracking-wider">
                    Total
                  </span>
                  <span className="font-bold">
                    {total.toLocaleString("es-HN", {
                      minimumFractionDigits: 2
                    })}{" "}
                    L
                  </span>
                </div>
              </div>

              <div className="flex flex-row gap-3">
                <Button
                  onClick={() => setShowConfirmAlert(true)}
                  className="flex-1 bg-brand-primary text-white hover:bg-brand-primary h-13 text-md tracking-[0.2em] rounded-full cursor-pointer disabled:bg-gray-300 disabled:text-gray-600"
                  disabled={productsInCart.length === 0 || isLoading || !selectedAddress}
                >
                  {isLoading
                    ? "Procesando..."
                    : editMode
                      ? "Actualizar Pedido"
                      : "Realizar Pedido"}
                </Button>

                <Button
                  onClick={() => {
                    fetchAddresses()
                    setShowAddressDialog(true)
                  }}
                  disabled={false}
                  className="size-13 rounded-full bg-brand-primary hover:bg-brand-primary p-0 grid place-content-center cursor-pointer disabled:bg-gray-300 disabled:text-gray-600">
                  <MapPinLine size={68} />
                </Button>

                <DrawerClose asChild>
                  <Link
                    href="/dashboard/orders/shop"
                    className="w-75 flex items-center bg-brand-primary rounded-full justify-center gap-2 text-xs uppercase text-white py-3 px-6"
                  >
                    <Plus size={14} /> Agregar Mas
                  </Link>
                </DrawerClose>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={showErrorAlert} onOpenChange={setShowErrorAlert}>
        <AlertDialogContent className="bg-[#ff9e9e] border-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle size={20} /> Error en la solicitud
            </AlertDialogTitle>
            <AlertDialogDescription className="text-red-700 pt-2">
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction variant="destructive" onClick={() => setShowErrorAlert(false)}>
              Entendido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showAddressDialog}
        onOpenChange={setShowAddressDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Seleccionar ubicación</AlertDialogTitle>
          </AlertDialogHeader>

          <ScrollArea className="max-h-75">
            <div className="space-y-2">
              {addresses.map(addr => (
                <button
                  key={addr.rowNum}
                  className="w-full border border-gray-200 rounded-md p-3 text-left hover:border-black"
                  onClick={() => {
                    setSelectedAddress(addr)
                    setShowAddressDialog(false)
                  }}
                >
                  <p className="text-sm font-medium">{addr.addressName}</p>
                  <p className="text-xs text-gray-400">
                    {addr.street} · {addr.ciudadName},{" "}
                    {addr.stateName}
                  </p>
                </button>
              ))}
            </div>
          </ScrollArea>

          <AlertDialogFooter>
            <AlertDialogCancel>Cerrar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showConfirmAlert}
        onOpenChange={setShowConfirmAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              {editMode
                ? "¿Deseas actualizar este pedido con los cambios actuales?"
                : "¿Seguro que quieres enviar este pedido?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitOrder}>
              Sí, enviar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showCancelOrderAlert}
        onOpenChange={setShowCancelOrderAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Vaciar carrito?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminarán todos los productos y se cancelará el proceso
              actual.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={handleCancelOrder}
            >
              Sí, vaciar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showSuccessAlert} onOpenChange={setShowSuccessAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-green-600">¡Éxito!</AlertDialogTitle>
            <AlertDialogDescription>
              El pedido ha sido {editMode ? "actualizado" : "creado"} correctamente con el número <strong>#{orderInfo.docEntry}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSuccessAlert(false)}>
              Aceptar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default CartISync;