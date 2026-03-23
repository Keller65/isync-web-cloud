"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { Howl } from "howler"
import { useSession } from "next-auth/react"

let successSound: Howl | null = null
let errorSound: Howl | null = null

const getSuccessSound = () => {
  if (!successSound) {
    successSound = new Howl({
      src: ["/sound/success.mp3"],
      volume: 0.5,
    });
  }
  return successSound
}

const getErrorSound = () => {
  if (!errorSound) {
    errorSound = new Howl({
      src: ["/sound/error.mp3"],
      volume: 0.5,
    });
  }
  return errorSound
}

function CartISync() {
  const router = useRouter()
  const { selectedCustomer, selectedAddress, clearSelectedCustomer, setSelectedAddress, sellerDifferent, selectedSlpCode } = useCustomerStore()
  const { productsInCart, removeProduct, clearCart, editMode, setEditMode, setDocEntry, docEntry, open, setOpen } = useCartStore()
  const { data: session } = useSession()
  const u_WhsCode = useAuthStore((state) => state.u_WhsCode)
  const u_SerieCot = useAuthStore((state) => state.u_SerieCot)
  const token = useAuthStore((state) => state.token)
  const salesPersonCode = useAuthStore((state) => state.salesPersonCode)

  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [showConfirmAlert, setShowConfirmAlert] = useState(false)
  const [showCancelOrderAlert, setShowCancelOrderAlert] = useState(false)
  const [showAddressDialog, setShowAddressDialog] = useState(false)

  const [showErrorAlert, setShowErrorAlert] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [showEditCustomerDialog, setShowEditCustomerDialog] = useState(false)
  const [editCustomerName, setEditCustomerName] = useState("")
  const [editCustomerRTN, setEditCustomerRTN] = useState("")

  const [addresses, setAddresses] = useState<CustomerAddress[]>([])
  const [, setLoadingAddresses] = useState(false)
  const [orderInfo, setOrderInfo] = useState<{ docEntry?: string }>({})
  const [comments, setComments] = useState("")
  const [orderId, setOrderId] = useState<string | null>(null)

  const isProcessing = useRef(false)

  useEffect(() => {
    if (productsInCart.length === 0 && open) {
      setOpen(false)
    }
  }, [productsInCart.length, open, setOpen])

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

  const { taxableAmount, tax } = productsInCart.reduce(
    (acc, item) => {
      const price = (item.priceAfterVAT ?? item.unitPriceNoVAT ?? item.priceList ?? 0)
      const quantity = item.quantity ?? 0
      const totalPrice = price * quantity

      const isExempt = item.taxCode === "EXO" || item.taxCode === "EXE"

      if (!isExempt) {
        acc.taxableAmount += totalPrice
      }

      return acc
    },
    { taxableAmount: 0, tax: 0 }
  )

  const subtotal = productsInCart.reduce(
    (acc, item) => {
      const price = (item.priceAfterVAT ?? item.unitPriceNoVAT ?? item.priceList ?? 0)
      return acc + price * (item.quantity ?? 0)
    },
    0
  )

  const calculatedTax = taxableAmount * 0.15
  const total = subtotal + calculatedTax

  const triggerError = (message: string) => {
    setErrorMessage(message)
    setShowErrorAlert(true)
    getErrorSound().play();
  }

  const fetchAddresses = async () => {
    if (!selectedCustomer) return

    try {
      setLoadingAddresses(true)
      const { data } = await axios.get<CustomerAddress[]>(
        `/api-proxy/api/Customers/${selectedCustomer.cardCode}/addresses`,
        { headers: { Authorization: `Bearer ${session?.user.token}` } }
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
    setOpen(false)
    router.replace("/dashboard/orders")
  }

  const handleSubmitOrder = async () => {
    if (isProcessing.current) return

    if (!selectedCustomer) {
      triggerError("Debe seleccionar un cliente antes de continuar.")
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
        ...(editMode ? {} : { requestId: orderId }),
        cardCode: selectedCustomer.cardCode,
        cardName: selectedCustomer.editRTN && editCustomerName ? editCustomerName : selectedCustomer.cardName,
        u_RTN: selectedCustomer.editRTN && editCustomerRTN ? editCustomerRTN : selectedCustomer.federalTaxID,
        salesPersonCode: sellerDifferent ? selectedSlpCode : salesPersonCode,
        payToCode: selectedAddress?.addressName ?? '',
        comments: comments,
        series: u_SerieCot ?? undefined,
        u_Referido: selectedCustomer.referidoCode,
        lines: productsInCart.map((p) => {
          const line: any = {
            itemCode: p.itemCode,
            quantity: p.quantity,
            unitPriceNoVAT: p.unitPriceNoVAT,
            basePriceNoVAT: p.basePriceNoVAT,
            taxCode: p.taxCode,
            warehouseCode: u_WhsCode
          }
          if (p.barCode) line.barCode = p.barCode
          if (p.priceList) line.priceList = p.priceList
          if (p.priceAfterVAT) line.priceAfterVAT = p.priceAfterVAT
          return line
        })
      }

      console.log("Enviando payload:", payload)
      console.log("URL:", editMode ? `/api-proxy/api/Quotations/${docEntry}` : '/api-proxy/api/Quotations')
      console.log("Method:", editMode ? "PATCH" : "POST")

      const response = await axios({
        method: editMode ? "PATCH" : "POST",
        url: editMode ? `/api-proxy/api/Quotations/${docEntry}` : `/api-proxy/api/Quotations`,
        data: payload,
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000
      })

      setOrderInfo({ docEntry: response.data?.docEntry })
      console.log("Pedido Enviado con exito", payload)
      setShowSuccessAlert(true)
      getSuccessSound().play();
      setOpen(false)
    } catch (error: any) {
      const msg = error.response?.data?.message || "Ocurrió un error inesperado al procesar el pedido."
      triggerError(msg)
    } finally {
      setIsLoading(false)
      isProcessing.current = false
      setShowConfirmAlert(false)
    }
  }

  const handleSuccess = () => {
    setShowSuccessAlert(false)
    clearCart()
    clearSelectedCustomer()
    setEditMode(false)
    setDocEntry("")
    setComments("")
    router.push("/dashboard/orders")
  }

  return (
    <>
      <Drawer open={open} onOpenChange={setOpen} direction="right">
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

        <DrawerContent className="h-screen min-w-[60vw] right-0 left-auto rounded-none border-l">
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
                      src={`https://pub-266f56f2e24d4d3b8e8abdb612029f2f.r2.dev/100000.jpg`}
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
                    <span>{item.taxCode}</span>
                    <span>
                      L. {(item.priceAfterVAT ?? item.unitPriceNoVAT ?? item.priceList ?? 0).toLocaleString("es-HN")}
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
                    L.
                    {subtotal.toLocaleString("es-HN", {
                      minimumFractionDigits: 2
                    })}{" "}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">ISV</span>
                  <span className="font-medium">
                    L.
                    {calculatedTax.toLocaleString("es-HN", {
                      minimumFractionDigits: 2
                    })}{" "}
                  </span>
                </div>

                <div className="flex justify-between text-lg pt-4 border-t border-gray-200">
                  <span className="font-light uppercase tracking-wider">
                    Total
                  </span>
                  <span className="font-bold">
                    L.
                    {total.toLocaleString("es-HN", {
                      minimumFractionDigits: 2
                    })}{" "}
                  </span>
                </div>
              </div>

              <div className="flex flex-row gap-3">
                <Button
                  onClick={() => {
                    if (selectedCustomer?.editRTN) {
                      setEditCustomerName(selectedCustomer.cardName)
                      setEditCustomerRTN(selectedCustomer.federalTaxID)
                      setShowEditCustomerDialog(true)
                    } else {
                      setShowConfirmAlert(true)
                    }
                  }}
                  className="flex-1 font-normal bg-brand-primary text-white hover:bg-brand-primary h-13 text-md tracking-[0.3px] rounded-full cursor-pointer disabled:bg-gray-300 disabled:text-gray-600"
                  disabled={productsInCart.length === 0 || isLoading}
                >
                  {isLoading
                    ? "Procesando..."
                    : editMode
                      ? "Actualizar Pedido"
                      : "Realizar Pedido"}
                </Button>

                <DrawerClose asChild>
                  <Link
                    href="/dashboard/orders/shop"
                    className="w-fit flex items-center bg-brand-primary rounded-full justify-center gap-2 text-xs uppercase text-white py-3 px-8"
                  >
                    <Plus size={14} /> Agregar Mas
                  </Link>
                </DrawerClose>

                <Button
                  onClick={() => {
                    fetchAddresses()
                    setShowAddressDialog(true)
                  }}
                  disabled={false}
                  className="size-13 rounded-full bg-brand-primary hover:bg-brand-primary p-0 grid place-content-center cursor-pointer disabled:bg-gray-300 disabled:text-gray-600">
                  <MapPinLine size={68} />
                </Button>
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
        <AlertDialogContent className="bg-green-300">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-green-600">{editMode ? "¡Pedido Actualizado!" : "¡Pedido Creado!"}</AlertDialogTitle>
            <AlertDialogDescription className="text-green-600">
              El pedido ha sido {editMode ? "actualizado correctamente" : <>creado correctamente con el número <strong>#{orderInfo.docEntry}</strong></>}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleSuccess}>
              Aceptar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedCustomer?.editRTN && (
        <AlertDialog open={showEditCustomerDialog} onOpenChange={setShowEditCustomerDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Editar Datos del Cliente</AlertDialogTitle>
              <AlertDialogDescription>
                Actualice el nombre y RTN del cliente según sea necesario.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre del Cliente</label>
                <input
                  type="text"
                  value={editCustomerName}
                  onChange={(e) => setEditCustomerName(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-md"
                  placeholder="Nombre del cliente"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">RTN</label>
                <input
                  type="text"
                  value={editCustomerRTN}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 14)
                    setEditCustomerRTN(value)
                  }}
                  className="w-full p-2 border border-gray-200 rounded-md"
                  placeholder="Ingrese 14 dígitos"
                />
                <p className="text-xs text-gray-400">{editCustomerRTN.length}/14 caracteres</p>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setEditCustomerName(selectedCustomer?.cardName ?? "")
                setEditCustomerRTN(selectedCustomer?.federalTaxID ?? "")
              }}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                className={editCustomerName.trim().length === 0 || editCustomerRTN.length !== 14 ? "bg-gray-200 text-gray-500 hover:bg-gray-200" : ""}
                disabled={editCustomerName.trim().length === 0 || editCustomerRTN.length !== 14}
                onClick={() => {
                  if (editCustomerRTN.length !== 14) {
                    triggerError("El RTN debe tener exactamente 14 dígitos.")
                    return
                  }
                  setShowEditCustomerDialog(false)
                  setShowConfirmAlert(true)
                }}
              >
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}

export default CartISync;