'use client'

import axios from 'axios'
import { useEffect, useState, useRef, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/app/lib/store'
import { useCustomerStore } from '@/app/lib/store.customer'
import { useCartStore } from '@/app/lib/store.cart'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table'
import { Product } from '@/types/products'
import { toast } from 'sonner'
import Image from 'next/image'
import { MagnifyingGlass } from '@phosphor-icons/react'

interface Category {
  code: string
  name: string
}

function ProductList({ endpoint, groupCode = 0 }: { endpoint: string, groupCode?: string | number }) {
  const { token } = useAuthStore()
  const { selectedCustomer } = useCustomerStore()
  const [products, setProducts] = useState<Product[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observer = useRef<IntersectionObserver | null>(null)

  const lastItemRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || !hasMore || loading) return

      if (observer.current) observer.current.disconnect()

      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prev => prev + 1)
        }
      })

      observer.current.observe(node)
    },
    [hasMore, loading]
  )

  const fetchProducts = useCallback(async () => {
    if (!token || !hasMore || loading) return

    setLoading(true)

    try {
      const cardCode = selectedCustomer?.cardCode ?? '205'
      const priceList = selectedCustomer?.priceListNum ?? 1

      const res = await axios.get(
        `/api-proxy${endpoint}`,
        {
          params: {
            cardCode,
            priceList,
            groupCode,
            page,
            pageSize: 20,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const newItems: Product[] = res.data?.items ?? res.data ?? []

      if (newItems.length === 0) {
        setHasMore(false)
      } else {
        setProducts(prev => [...prev, ...newItems])
        setHasMore(newItems.length === 20)
      }
    } catch (err) {
      console.error(err)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [token, page, selectedCustomer, hasMore, endpoint, groupCode])

  /* Reset al cambiar cliente o categoría */
  useEffect(() => {
    setProducts([])
    setPage(1)
    setHasMore(true)
  }, [selectedCustomer?.cardCode, groupCode])

  useEffect(() => {
    fetchProducts()
  }, [page, fetchProducts])

  return (
    <div className="py-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products.map((product, i) => {
          const isLast = i === products.length - 1

          return (
            <div
              key={`${product.itemCode}-${i}`}
              ref={isLast ? lastItemRef : undefined}
              className="border rounded-lg p-4 flex flex-col gap-2"
            >
              <ProductCard product={product} />
            </div>
          )
        })}
      </div>

      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <p className="text-center text-muted-foreground mt-8">
          No hay más productos disponibles.
        </p>
      )}

      {!loading && products.length === 0 && (
        <p className="text-center text-muted-foreground mt-8">
          No se encontraron productos.
        </p>
      )}
    </div>
  )
}

function DiscountedProducts() {
  return <ProductList endpoint="/api/Catalog/products/discounted-by-customer" groupCode={0} />
}

function CategoryProducts({ groupCode }: { groupCode: string }) {
  return <ProductList endpoint="/api/Catalog/products/search" groupCode={groupCode} />
}

function ProductCard({ product }: { product: Product }) {
  const { addProduct, updateQuantity, productsInCart } = useCartStore()
  const [quantity, setQuantity] = useState(1)
  const [open, setOpen] = useState(false)
  const [alertInfo, setAlertInfo] = useState<{ title: string; description: string; onConfirm?: () => void; showCancel?: boolean } | null>(null);

  const [editablePrice, setEditablePrice] = useState(product.price)
  const [editablePriceText, setEditablePriceText] = useState(product.price.toFixed(2))
  const [isPriceValid, setIsPriceValid] = useState(true)
  const [isPriceManuallyEdited, setIsPriceManuallyEdited] = useState(false)
  const [applyTierDiscounts, setApplyTierDiscounts] = useState(true)

  const tier = product.tiers?.[0]
  const finalPrice = tier ? tier.price : product.price

  useEffect(() => {
    if (isPriceManuallyEdited) return

    let newUnitPrice
    if (applyTierDiscounts && product.tiers && product.tiers.length > 0) {
      const applicableTier = [...product.tiers]
        .filter(t => quantity >= t.qty)
        .sort((a, b) => b.qty - a.qty)[0]
      newUnitPrice = applicableTier ? applicableTier.price : product.price
    } else {
      newUnitPrice = product.price
    }

    setEditablePrice(newUnitPrice)
    setEditablePriceText(newUnitPrice.toFixed(2))
    setIsPriceValid(true)
  }, [quantity, applyTierDiscounts, product, isPriceManuallyEdited])

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPriceManuallyEdited(true)
    const text = e.target.value
    const cleanedText = text.replace(/[^0-9.]/g, '')
    const parts = cleanedText.split('.')
    let finalValueText = cleanedText
    if (parts.length > 2) {
      finalValueText = parts.slice(0, 2).join('.')
    }
    setEditablePriceText(finalValueText)
    const parsedValue = parseFloat(finalValueText)
    if (!isNaN(parsedValue)) {
      setEditablePrice(parsedValue)
    } else {
      setEditablePrice(0)
    }
  }

  const handlePriceBlur = () => {
    let finalValue = parseFloat(editablePriceText)
    if (isNaN(finalValue)) {
      finalValue = product.price
    } else {
      finalValue = parseFloat(finalValue.toFixed(2))
    }
    setEditablePrice(finalValue)
    setEditablePriceText(finalValue.toFixed(2))

    const applicableTier = product.tiers
      ?.filter(t => quantity >= t.qty)
      .sort((a, b) => b.qty - a.qty)[0]

    const minimumAllowedPrice = (applyTierDiscounts && applicableTier)
      ? applicableTier.price
      : product.price

    setIsPriceValid(finalValue >= minimumAllowedPrice)
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value
    const cleanedText = text.replace(/[^0-9]/g, '')

    if (cleanedText === '') {
      setQuantity(0)
    } else {
      const newQuantity = parseInt(cleanedText, 10)
      const maxStock = product.inStock || 0
      setQuantity(Math.max(0, Math.min(maxStock, isNaN(newQuantity) ? 0 : newQuantity)))
    }
  }

  const handleAddToCart = useCallback(() => {
    const finalUnitPrice = editablePrice

    if (!product || quantity <= 0 || !isPriceValid || finalUnitPrice <= 0) {
      setAlertInfo({
        title: 'Datos inválidos',
        description: 'Verifica la cantidad y el precio.',
        showCancel: false,
      })
      return
    }

    const maxStock = product.inStock || 0
    const itemInCart = productsInCart.find(
      p => p.itemCode === product.itemCode
    )

    const currentQty = itemInCart ? itemInCart.quantity : 0
    const totalQty = currentQty + quantity

    if (totalQty > maxStock) {
      setAlertInfo({
        title: 'Stock insuficiente',
        description: `Solo hay ${maxStock} unidades disponibles.`,
        showCancel: false,
      })
      return
    }

    const cartItem = {
      itemCode: product.itemCode,
      itemName: product.itemName,
      barCode: product.barCode ?? product.itemCode,
      quantity,
      priceList: product.price,        // PRECIO BASE REAL
      priceAfterVAT: finalUnitPrice,   // PRECIO FINAL (con descuento)
      unitPrice: finalUnitPrice,
      taxCode: product.taxType,
    }

    console.log('🛒 CARRITO → ASÍ SE GUARDA:', cartItem)

    if (itemInCart) {
      setAlertInfo({
        title: 'Producto ya en el carrito',
        description: `${product.itemName} ya está en el carrito. ¿Actualizar?`,
        showCancel: true,
        onConfirm: () => {
          updateQuantity(
            product.itemCode,
            totalQty,
            finalUnitPrice,
            product.inStock
          )
          setOpen(false)
        },
      })
    } else {
      addProduct(cartItem)
      setOpen(false)
    }
  }, [
    product,
    quantity,
    editablePrice,
    isPriceValid,
    productsInCart,
    addProduct,
    updateQuantity,
  ])

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <div className="h-40 bg-white rounded-md flex items-center justify-center relative overflow-hidden">
          <Image
            src={`https://pub-266f56f2e24d4d3b8e8abdb612029f2f.r2.dev/${product.itemCode}.jpg`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://pub-266f56f2e24d4d3b8e8abdb612029f2f.r2.dev/100000.jpg"
            }}
            alt={product.itemName}
            className="h-full w-full object-contain"
            height={400}
            width={400}
          />

          {product.inStock <= 0 && (
            <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
              <span className="text-xs font-bold bg-destructive text-white px-2 py-1 rounded">
                SIN STOCK
              </span>
            </div>
          )}
        </div>

        <h3 className="font-medium text-sm line-clamp-2 min-h-10">
          {product.itemName}
        </h3>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{product.itemCode}</span>
          <span className="bg-secondary px-2 rounded">
            {product.salesUnit}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-primary">
            L.{finalPrice.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>

          {tier && (
            <span className="line-through text-xs text-muted-foreground">
              L.{product.price.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          )}
        </div>

        <DialogTrigger asChild>
          <Button className="w-full text-sm rounded-full bg-brand-primary hover:bg-brand-primary/90 text-white shadow-none">
            Ver Detalles
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-250 p-0 overflow-hidden flex flex-col max-h-[90vh]">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl font-bold">{product.itemName}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Columna Izquierda: Imagen */}
              <div className="md:w-1/2">
                <div className="aspect-square bg-white rounded-lg flex items-center justify-center overflow-hidden border">
                  <Image
                    src={`https://pub-266f56f2e24d4d3b8e8abdb612029f2f.r2.dev/${product.itemCode}.jpg`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://pub-266f56f2e24d4d3b8e8abdb612029f2f.r2.dev/100000.jpg"
                    }}
                    alt={product.itemName}
                    className="w-full h-full object-contain p-4"
                    height={400}
                    width={400}
                  />
                </div>

                {product.tiers && product.tiers.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-muted-foreground uppercase">Precios por Volumen</p>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => {
                          setApplyTierDiscounts(!applyTierDiscounts)
                          setIsPriceManuallyEdited(false)
                        }}
                        className="h-auto p-0 text-[10px] font-bold text-primary hover:no-underline"
                      >
                        {applyTierDiscounts ? 'DESACTIVAR' : 'ACTIVAR'}
                      </Button>
                    </div>
                    <div className={`border rounded-md overflow-hidden transition-opacity ${!applyTierDiscounts ? 'opacity-50' : 'opacity-100'}`}>
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead className="h-9 text-xs font-bold uppercase">Cantidad</TableHead>
                            <TableHead className="h-9 text-xs font-bold uppercase text-right">Precio</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {product.tiers.map((t, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="py-2 text-sm">Desde {t.qty.toLocaleString()} un.</TableCell>
                              <TableCell className="py-2 text-sm font-bold text-right text-primary">
                                L.{t.price.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>

              {/* Columna Derecha: Datos */}
              <div className="md:w-1/2 flex flex-col gap-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase">Código</p>
                      <p className="text-sm font-medium">{product.itemCode}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase">Categoría</p>
                      <p className="text-sm font-medium">{product.groupName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase">Unidad</p>
                      <p className="text-sm font-medium">{product.salesUnit || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase">Disponibilidad</p>
                      <p className={`text-sm font-bold ${product.inStock > 0 ? 'text-green-600' : 'text-destructive'}`}>
                        {product.inStock > 0 ? `${product.inStock} en stock` : 'Agotado'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Precio de Venta</p>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">L.</span>
                        <Input
                          type="text"
                          className={`w-32 font-bold text-lg h-11 focus-visible:ring-primary ${!isPriceValid ? 'border-destructive bg-destructive/10 focus-visible:ring-destructive' : ''
                            }`}
                          value={editablePriceText}
                          onChange={handlePriceChange}
                          onBlur={handlePriceBlur}
                        />
                      </div>
                      {!isPriceValid && (
                        <p className="text-[10px] text-destructive font-medium">
                          El precio no puede ser menor al mínimo permitido.
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground">
                        Precio base original: L. {product.price.toLocaleString('es-HN', { minimumFractionDigits: 2 })} + {product.taxType}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Inventario General</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-muted/50 p-2 rounded-lg text-start">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Disponible</p>
                        <p className="text-sm font-bold">{product.inStock.toLocaleString()}</p>
                      </div>
                      <div className="bg-muted/50 p-2 rounded-lg text-start">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">En Pedido</p>
                        <p className="text-sm font-bold">{product.ordered.toLocaleString()}</p>
                      </div>
                      <div className="bg-muted/50 p-2 rounded-lg text-start">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Comprometido</p>
                        <p className="text-sm font-bold">{product.committed.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {product.ws && product.ws.length > 0 && (
                    <div className="pt-4 border-t">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Stock por Almacén</p>
                      <div className="space-y-1">
                        {product.ws.map((w, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{w.warehouseName}</span>
                            <span className="font-medium">{w.inStock.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Cantidad a comprar</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border rounded-lg overflow-hidden">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-none h-10 w-10"
                          onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        >
                          -
                        </Button>
                        <Input
                          type="text"
                          className="w-12 h-10 border-none rounded-none text-center font-bold text-lg focus-visible:ring-0 p-0"
                          value={quantity}
                          onChange={handleQuantityChange}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-none h-10 w-10"
                          onClick={() => {
                            const maxStock = product.inStock || 0
                            setQuantity(q => Math.min(maxStock, q + 1))
                          }}
                          disabled={quantity >= (product.inStock || 0)}
                        >
                          +
                        </Button>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {product.salesUnit}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto p-4 bg-muted/30 rounded-lg border border-dashed">
                  <p className="text-xs text-muted-foreground italic">
                    * El precio final puede variar según las promociones vigentes al momento de la facturación.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 border-t bg-background flex flex-row items-center justify-between sm:justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total estimado</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-brand-primary">L.{(editablePrice * quantity).toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="text-xs text-muted-foreground">LPS</span>
              </div>
            </div>
            <Button
              className="bg-brand-primary hover:bg-brand-primary/90 rounded-full px-6 py-3 h-auto text-xs font-bold shadow-lg transition-transform active:scale-95"
              onClick={handleAddToCart}
              disabled={product.inStock <= 0 || !isPriceValid}
            >
              Agregar al carrito
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!alertInfo} onOpenChange={(isOpen) => !isOpen && setAlertInfo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertInfo?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {alertInfo?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {alertInfo?.showCancel && <AlertDialogCancel>Cancelar</AlertDialogCancel>}
            <AlertDialogAction onClick={alertInfo?.onConfirm}>
              Aceptar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default function Page() {
  const { token } = useAuthStore()
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    if (!token) return

    axios
      .get<Category[]>('/api-proxy/sap/items/categories', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(res => setCategories(res.data))
      .catch(console.error)
  }, [token])

  if (!token) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          Inicia sesión para ver el catálogo.
        </p>
      </div>
    )
  }

  return (
    <Tabs defaultValue="ofertas" className="w-full">
      <InputGroup className="rounded-full h-12.5 mb-4 px-2">
        <InputGroupInput placeholder="Search..." />
        <InputGroupAddon>
          <MagnifyingGlass size={32} />
        </InputGroupAddon>
      </InputGroup>

      <TabsList className="w-full justify-start overflow-x-auto">
        <TabsTrigger value="ofertas">Ofertas</TabsTrigger>

        {categories.map(cat => (
          <TabsTrigger key={cat.code} value={cat.code}>
            {cat.name}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="ofertas">
        <DiscountedProducts />
      </TabsContent>

      {categories.map(cat => (
        <TabsContent key={cat.code} value={cat.code}>
          <CategoryProducts groupCode={cat.code} />
        </TabsContent>
      ))}
    </Tabs>
  )
}