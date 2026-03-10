"use client"

import { useState, useEffect } from "react"
import { File, Image, Rows, Grid3X3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import axios, { isAxiosError } from "axios"
import { useAuthStore } from "@/app/lib/store"
import { PDFDownloadLink } from "@react-pdf/renderer"
import CatalogPdf from "@/components/CatalogPdf"

interface Product {
  itemCode: string
  itemName: string
  price: number
  groupName?: string
  inStock?: number
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [generating, setGenerating] = useState(false)
  const [page, setPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)

  const { token } = useAuthStore()

  const toggleProduct = (code: string) => {
    setSelectedProducts(prev =>
      prev.includes(code)
        ? prev.filter(p => p !== code)
        : [...prev, code]
    )
  }

  const selectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(products.map(p => p.itemCode))
    }
  }

  const handleGeneratePDF = async () => {
    setGenerating(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setGenerating(false)
    alert("Catálogo PDF generado (demo)")
  }

  async function fetchProducts(pageNumber: number) {
    try {
      const res = await axios.get(
        `/api-proxy/api/Catalog/products/search?search=1&priceList=1&groupCode=0&page=${pageNumber}&pageSize=60`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const items = res.data.items ?? res.data

      const mapped: Product[] = items.map((p: any) => ({
        itemCode: p.itemCode,
        itemName: p.itemName,
        price: p.price,
        groupName: p.groupName,
        inStock: p.inStock,
      }))

      if (pageNumber === 1) {
        setProducts(mapped)
      } else {
        setProducts(prev => [...prev, ...mapped])
      }

    } catch (error) {
      console.error(
        "Error fetching products:",
        isAxiosError(error) ? error.response?.data : error
      )
    }
  }

  const loadMore = async () => {
    setLoadingMore(true)
    const nextPage = page + 1
    await fetchProducts(nextPage)
    setPage(nextPage)
    setLoadingMore(false)
  }

  useEffect(() => {
    if (!token) return
    fetchProducts(1)
  }, [token])

  const selectedItems = products.filter(p =>
    selectedProducts.includes(p.itemCode)
  )

  return (
    <div className="p-8 max-w-full mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Generar Catálogo PDF</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Crea catálogos personalizados de productos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* PRODUCTOS */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Productos ({products.length})
                </CardTitle>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    className={viewMode === "grid" ? "bg-muted" : ""}
                  >
                    <Grid3X3 size={20} />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewMode("list")}
                    className={viewMode === "list" ? "bg-muted" : ""}
                  >
                    <Rows size={20} />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  {selectedProducts.length === products.length
                    ? "Deseleccionar todo"
                    : "Seleccionar todo"}
                </Button>

                <span className="text-sm text-muted-foreground self-center">
                  {selectedProducts.length} seleccionados
                </span>
              </div>

              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {products.map(product => (
                    <div
                      key={product.itemCode}
                      onClick={() => toggleProduct(product.itemCode)}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedProducts.includes(product.itemCode)
                        ? "border-primary bg-primary/5"
                        : "hover:border-muted-foreground"
                        }`}
                    >
                      <div className="aspect-square bg-muted rounded-md mb-2 flex items-center justify-center">
                        <Image size={32} className="text-muted-foreground" />
                      </div>

                      <p className="text-xs font-mono text-muted-foreground">
                        {product.itemCode}
                      </p>

                      <p className="font-medium text-sm truncate">
                        {product.itemName}
                      </p>

                      <p className="text-sm font-semibold">
                        L {product.price.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {products.map(product => (
                    <div
                      key={product.itemCode}
                      onClick={() => toggleProduct(product.itemCode)}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${selectedProducts.includes(product.itemCode)
                        ? "border-primary bg-primary/5"
                        : "hover:border-muted-foreground"
                        }`}
                    >
                      <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                        <Image size={20} className="text-muted-foreground" />
                      </div>

                      <div className="flex-1">
                        <p className="font-medium">{product.itemName}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.itemCode}
                        </p>
                      </div>

                      <p className="font-semibold">
                        L {product.price.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* BOTON CARGAR MAS */}
              <div className="flex justify-center mt-6">
                <Button onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? "Cargando..." : "Cargar más"}
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* FILTROS CATALOGO */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Opciones del Catálogo</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">

              <div>
                <label className="text-sm font-medium block mb-2">Título</label>
                <input
                  type="text"
                  defaultValue="Catálogo de Productos"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Incluir</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" defaultChecked /> Imagenes
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" defaultChecked /> Precios
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" defaultChecked /> Código
                  </label>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Diseño</label>
                <select className="w-full px-3 py-2 border rounded-md text-sm">
                  <option>Grid (Cuadrícula)</option>
                  <option>Lista</option>
                  <option>Compacto</option>
                </select>
              </div>

            </CardContent>
          </Card>

          {/* RESUMEN */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumen</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Productos</span>
                <span className="font-medium">
                  {selectedProducts.length}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Páginas estimadas</span>
                <span className="font-medium">
                  {Math.ceil(selectedProducts.length / 6)}
                </span>
              </div>

              <PDFDownloadLink
                document={
                  <CatalogPdf
                    products={selectedItems}
                    title="Catálogo de Productos"
                  />
                }
                fileName="catalogo-productos.pdf"
              >
                {({ loading }) => (
                  <Button
                    className="w-full gap-2"
                    disabled={selectedItems.length === 0}
                  >
                    {loading ? "Generando..." : (
                      <>
                        <File size={18} />
                        Generar PDF
                      </>
                    )}
                  </Button>
                )}
              </PDFDownloadLink>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}