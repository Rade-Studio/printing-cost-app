"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient, PaginationRequest } from "@/lib/api"
import { ProductSelect } from "@/components/shared/select-product"
import { Product, SaleProduct } from "@/lib/types"
import { Plus, Trash2, Package, Loader2 } from "lucide-react"
import { useLocale } from "@/app/localContext"
import { useSystemConfig } from "@/app/systenConfigContext"

interface SaleProductsListProps {
  products: SaleProduct[]
  onProductsChange: (products: SaleProduct[]) => void
}

export function SaleProductsList({ products, onProductsChange }: SaleProductsListProps) {
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [productSearchTerm, setProductSearchTerm] = useState("")
  const [isSearchingProducts, setIsSearchingProducts] = useState(false)
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [newProduct, setNewProduct] = useState<Partial<SaleProduct>>({
    productId: "",
    quantity: 1,
    suggestedPrice: 0,
    finalPrice: 0,
  })
  const { formatCurrency } = useLocale()
  const { configs } = useSystemConfig()
  
  // Calcular margen de ganancia desde configuración
  const profitMargin = parseFloat(configs.DefaultProfitMargin || "20") / 100

  // Cargar productos disponibles
  const fetchProducts = async (searchTerm: string = "", pageSize: number = 50) => {
    try {
      setIsSearchingProducts(true)
      const params: PaginationRequest = {
        page: 1,
        pageSize: pageSize,
        searchTerm: searchTerm,
        sortBy: "name",
        sortDescending: false,
      }
      const response = await apiClient.getProducts(params)
      if (response) {
        setAvailableProducts(response.data)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setIsSearchingProducts(false)
    }
  }

  useEffect(() => {
    fetchProducts("", 50)
  }, [])

  // Debounce para búsqueda de productos
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (productSearchTerm.trim() !== "") {
        fetchProducts(productSearchTerm, 50)
      } else {
        fetchProducts("", 50)
      }
    }, 800)

    return () => clearTimeout(timeoutId)
  }, [productSearchTerm])

  // Calcular precio sugerido cuando se selecciona un producto
  useEffect(() => {
    if (newProduct.productId) {
      const selectedProduct = availableProducts.find((p) => p.id === newProduct.productId)
      if (selectedProduct?.finalValue) {
        // Valor sugerido = costo base sin margen (finalValue / (1 + profitMargin))
        const suggestedPrice = selectedProduct.finalValue / (1 + profitMargin)
        const finalPrice = selectedProduct.finalValue
        setNewProduct((prev) => ({
          ...prev,
          suggestedPrice: suggestedPrice, // Costo base sin margen
          finalPrice: finalPrice, // Valor final del producto
        }))
      } else {
        setNewProduct((prev) => ({
          ...prev,
          suggestedPrice: 0,
          finalPrice: prev.finalPrice || 0,
        }))
      }
    }
  }, [newProduct.productId, availableProducts, profitMargin])

  const handleAddProduct = () => {
    if (!newProduct.productId || !newProduct.quantity || newProduct.quantity <= 0) {
      return
    }

    const selectedProduct = availableProducts.find((p) => p.id === newProduct.productId)
    const productToAdd: SaleProduct = {
      productId: newProduct.productId,
      quantity: newProduct.quantity,
      suggestedPrice: newProduct.suggestedPrice || 0, // Costo base sin margen
      finalPrice: newProduct.finalPrice || selectedProduct?.finalValue || 0, // Valor final del producto
      product: selectedProduct,
    }

    onProductsChange([...products, productToAdd])
    setNewProduct({
      productId: "",
      quantity: 1,
      suggestedPrice: 0,
      finalPrice: 0,
    })
    setProductSearchTerm("")
    setIsAddingProduct(false)
  }

  const handleRemoveProduct = (index: number) => {
    const newProducts = products.filter((_, i) => i !== index)
    onProductsChange(newProducts)
  }

  const handleUpdateProduct = (index: number, field: keyof SaleProduct, value: any) => {
    const updatedProducts = [...products]
    
    // Si se actualiza la cantidad, mantener el precio unitario constante
    if (field === "quantity") {
      // El precio final por unidad no cambia, solo se actualiza la cantidad
      updatedProducts[index] = {
        ...updatedProducts[index],
        quantity: value as number,
      }
    } else if (field === "finalPrice") {
      // Cuando se actualiza el precio final, se actualiza el precio por unidad
      updatedProducts[index] = {
        ...updatedProducts[index],
        finalPrice: value as number, // Precio por unidad
      }
    } else {
      updatedProducts[index] = {
        ...updatedProducts[index],
        [field]: value,
      }
    }

    onProductsChange(updatedProducts)
  }

  // Calcular workPackage cost por unidad
  const calculateWorkPackageCost = (product: Product | undefined): number => {
    if (!product?.workPackage || !product.workPackagePerHour) return 0
    
    const workPackage = product.workPackage
    const workPackagePerHour = product.workPackagePerHour
    
    if (workPackage.calculationType === "Fixed") {
      return workPackage.value || 0
    } else if (workPackage.calculationType === "Multiply") {
      return (workPackage.value || 0) * workPackagePerHour
    }
    return 0
  }

  const calculateTotalEstimated = () => {
    return products.reduce((sum, p) => {
      const unitPrice = p.suggestedPrice || 0
      const workPackageCost = calculateWorkPackageCost(p.product)
      return sum + (unitPrice + workPackageCost) * p.quantity
    }, 0)
  }

  const calculateTotalFinal = () => {
    return products.reduce((sum, p) => {
      const unitPrice = p.finalPrice || 0
      const workPackageCost = calculateWorkPackageCost(p.product)
      return sum + (unitPrice + workPackageCost) * p.quantity
    }, 0)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Productos en la Venta</h3>
          <span className="text-sm text-muted-foreground">({products.length} producto{products.length !== 1 ? "s" : ""})</span>
        </div>
        <Button
          type="button"
          onClick={() => setIsAddingProduct(!isAddingProduct)}
          size="sm"
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Producto
        </Button>
      </div>

      {/* Formulario para agregar nuevo producto */}
      {isAddingProduct && (
        <Card className="border-2 border-dashed border-primary/30">
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Label>Producto</Label>
                <ProductSelect
                  products={availableProducts}
                  formData={{ productId: newProduct.productId || "" }}
                  handleChange={(field, value) => setNewProduct({ ...newProduct, productId: value })}
                  searchTerm={productSearchTerm}
                  onSearchChange={setProductSearchTerm}
                  isSearching={isSearchingProducts}
                />
              </div>

              <div>
                <Label>Cantidad</Label>
                <Input
                  type="number"
                  min="1"
                  value={newProduct.quantity || 1}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) || 1 })
                  }
                  placeholder="1"
                />
              </div>

              <div className="flex items-end gap-2">
                <Button
                  type="button"
                  onClick={handleAddProduct}
                  disabled={!newProduct.productId || !newProduct.quantity || isSearchingProducts}
                  className="flex-1"
                >
                  Agregar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddingProduct(false)
                    setNewProduct({ productId: "", quantity: 1, suggestedPrice: 0, finalPrice: 0 })
                    setProductSearchTerm("")
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>

            {newProduct.productId && (
              <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-md">
                <div>
                  <Label className="text-xs text-muted-foreground">Precio Sugerido (por unidad)</Label>
                  <div className="text-sm font-medium">
                    {(newProduct.suggestedPrice || 0) > 0
                      ? formatCurrency(newProduct.suggestedPrice || 0)
                      : "Sin precio sugerido"}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Precio Sugerido (total)</Label>
                  <div className="text-sm font-medium">
                    {(newProduct.suggestedPrice || 0) > 0
                      ? formatCurrency((newProduct.suggestedPrice || 0) * (newProduct.quantity || 1))
                      : "Sin precio sugerido"}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Lista de productos agregados */}
      {products.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay productos agregados a esta venta</p>
            <p className="text-sm text-muted-foreground mt-2">
              Haz clic en "Agregar Producto" para comenzar
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {products.map((product, index) => {
            const productInfo = product.product
            // Valor final del producto (editable)
            const unitFinalPrice = product.finalPrice || productInfo?.finalValue || 0
            // Valor sugerido (costo base sin margen) - readonly
            const suggestedPrice = product.suggestedPrice || (productInfo?.finalValue ? productInfo.finalValue / (1 + profitMargin) : 0)
            
            // Subtotal = valor final * cantidad
            const subtotal = unitFinalPrice * product.quantity

            return (
              <Card key={index} className="hover:shadow-md transition-shadow border-l-4 border-l-primary">
                <CardContent className="p-5">
                  {/* Primera fila: Información del producto */}
                  <div className="flex items-start justify-between mb-4 pb-4 border-b">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-base">{productInfo?.name || "Producto no encontrado"}</h4>
                        {productInfo?.finalValue ? (
                          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                            ✓ Con precio
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">
                            ⚠ Sin precio
                          </span>
                        )}
                      </div>
                      {productInfo?.description && (
                        <p className="text-sm text-muted-foreground">
                          {productInfo.description}
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveProduct(index)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Segunda fila: Grid de precios y cálculos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Cantidad */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">Cantidad</Label>
                      <Input
                        type="number"
                        min="1"
                        value={product.quantity}
                        onChange={(e) =>
                          handleUpdateProduct(index, "quantity", parseInt(e.target.value) || 1)
                        }
                        className="h-10"
                      />
                    </div>

                    {/* Valor Sugerido (readonly) */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">Valor Sugerido (unidad)</Label>
                      <div className="h-10 px-3 py-2 bg-muted/50 rounded-md text-sm font-medium flex items-center border">
                        {suggestedPrice > 0
                          ? formatCurrency(suggestedPrice)
                          : "Sin precio"}
                      </div>
                    </div>

                    {/* Valor Final (editable) */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">Valor Final (unidad)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={unitFinalPrice}
                        onChange={(e) => {
                          const newUnitPrice = parseFloat(e.target.value) || 0
                          handleUpdateProduct(index, "finalPrice", newUnitPrice)
                        }}
                        className="h-10"
                        placeholder="0.00"
                      />
                    </div>

                    {/* Subtotal */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">Subtotal</Label>
                      <div className="h-10 px-3 py-2 bg-primary/20 dark:bg-primary/30 rounded-md text-base font-bold flex items-center border-2 border-primary/30">
                        {formatCurrency(subtotal)}
                      </div>
                    </div>
                  </div>

                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

    </div>
  )
}

