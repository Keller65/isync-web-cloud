'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import axios from 'axios'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthStore } from '@/app/lib/store'
import { useCustomerStore } from '@/app/lib/store.customer'
import { Skeleton } from '@/components/ui/skeleton'

interface Category {
  code: string
  name: string
}

interface Tier {
  qty: number
  price: number
  percent: number
  expiry: string
}

interface Product {
  itemCode: string
  itemName: string
  inStock: number
  price: number
  hasDiscount: boolean
  tiers?: Tier[]
  salesUnit: string
  image?: string
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

/* =======================
   PRODUCT CARD
======================= */

function ProductCard({ product }: { product: Product }) {
  const tier = product.tiers?.[0]
  const finalPrice = tier ? tier.price : product.price

  return (
    <>
      <div className="h-40 bg-muted rounded-md flex items-center justify-center relative overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.itemName}
            className="h-full w-full object-contain"
          />
        ) : (
          <span className="text-[10px] uppercase font-bold text-center px-2">
            {product.itemName}
          </span>
        )}

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
          ${finalPrice.toFixed(2)}
        </span>

        {tier && (
          <span className="line-through text-xs text-muted-foreground">
            ${product.price.toFixed(2)}
          </span>
        )}
      </div>
    </>
  )
}

/* =======================
   PAGE
======================= */

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
