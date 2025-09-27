"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient, PaginationRequest, PaginatedResponse } from "@/lib/api"
import { Loader2, Calculator } from "lucide-react"
import { useLocale } from "@/app/localContext"
import { useSystemConfig } from "@/app/systenConfigContext"
import { ProductSelect } from "@/components/shared/select-product"
import type { Filament, Product, SaleDetail, WorkPackage } from "@/lib/types"

interface SaleDetailFormProps {
  saleId: string
  detail: SaleDetail | null
  onSuccess: () => void
  onCancel: () => void
  refreshTrigger: number 
}

export function SaleDetailForm({ saleId, detail, onSuccess, onCancel, refreshTrigger }: SaleDetailFormProps) {
  const [workPackages, setWorkPackages] = useState<WorkPackage[] | null>([])
  const [products, setProducts] = useState<Product[] | null>([])
  const [productSearchTerm, setProductSearchTerm] = useState("")
  const [isSearchingProducts, setIsSearchingProducts] = useState(false)
  const [formData, setFormData] = useState<SaleDetail>(
    detail || {
      saleId: saleId,
      productId: '',
      quantity: 1,
      comments: '',
      workPackageId: '',
      workPackagePerHour: 0,
      laborCost: 0,
      subTotal: 0,
    }
  )
  const [calculatedCost, setCalculatedCost] = useState(0)
  const [laborCost, setLaborCost] = useState(0)
  const [marginAmount, setMarginAmount] = useState(0)
  const [marginPercent, setMarginPercent] = useState(0)
  const [unitCost, setUnitCost] = useState(0)
  const [subtotal, setSubtotal] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState("")
  const { formatCurrency } = useLocale()
  const { configs, refreshConfigs, isLoading: isLoadingConfigs } = useSystemConfig()

  // Función para cargar productos con paginación
  const fetchProducts = async (searchTerm: string = "", pageSize: number = 10) => {
    try {
      setIsSearchingProducts(true)
      const params: PaginationRequest = {
        page: 1,
        pageSize: pageSize,
        searchTerm: searchTerm,
        sortBy: "name",
        sortDescending: false
      }
      const response = await apiClient.getProducts(params)
      if (response) {
        setProducts(response.data)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setIsSearchingProducts(false)
    }
  }

  // Función para asegurar que el producto seleccionado esté disponible
  const ensureSelectedProductIsAvailable = async (productId: string) => {
    if (!productId) return
    
    // Verificar si el producto ya está en la lista actual
    const isProductInList = products?.some(p => p.id === productId)
    if (isProductInList) return

    try {
      // Si no está en la lista, buscar específicamente ese producto
      const params: PaginationRequest = {
        page: 1,
        pageSize: 100, // Buscar en más productos
        searchTerm: "", // Sin filtro para obtener más productos
        sortBy: "name",
        sortDescending: true
      }
      const response = await apiClient.getProducts(params)
      if (response) {
        setProducts(response.data)
      }
    } catch (error) {
      console.error("Error fetching selected product:", error)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [workPackagesData] = await Promise.all([
          apiClient.getWorkPackages(),
        ])
        setWorkPackages(workPackagesData)
        
        // Si hay un producto seleccionado, cargar más productos para asegurar que esté disponible
        if (detail?.productId) {
          // Cargar más productos para incluir el seleccionado
          await fetchProducts("", 100)
        } else {
          // Cargar solo los primeros 10 productos inicialmente
          await fetchProducts("", 10)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoadingData(false)
      }
    }
    fetchData()
  }, [detail?.productId])

  useEffect(() => {
    refreshConfigs()
  }, [refreshTrigger])

  // Debounced search for products with extended delay
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (productSearchTerm.trim() !== "") {
        // Si hay término de búsqueda, buscar con más resultados
        fetchProducts(productSearchTerm, 50)
      } else {
        // Si no hay término, mostrar solo los primeros 10
        fetchProducts("", 10)
      }
    }, 
    // Extended debounce strategy to reduce API calls:
    productSearchTerm === "" ? 200 : // Quick response when clearing (200ms)
    productSearchTerm.length < 3 ? 800 : // Short terms: 800ms delay
    productSearchTerm.length < 5 ? 1000 : // Medium terms: 1000ms delay  
    1200 // Long terms: 1200ms delay (1.2 seconds)
    )

    return () => clearTimeout(timeoutId)
  }, [productSearchTerm])

  // Asegurar que el producto seleccionado esté disponible
  useEffect(() => {
    if (formData.productId && products) {
      ensureSelectedProductIsAvailable(formData.productId)
    }
  }, [formData.productId, products])

  useEffect(() => {
    calculateCost()
  }, [formData, products, workPackages])

  const calculateCost = () => {
    const productSelected = products?.find((f) => f.id === formData?.productId)
    const workPackageSelected = workPackages?.find((wp) => wp.id === formData?.workPackageId)
    
    // Actualizar el producto seleccionado para la vista
    setSelectedProduct(productSelected || null)

    if (!productSelected || !workPackageSelected) {
      setCalculatedCost(0)
      setLaborCost(0)
      setMarginAmount(0)
      setMarginPercent(0)
      setUnitCost(0)
      setSubtotal(0)
      return
    }

    // Costo total de impresión por unidad (incluye material + energía)
    const totalPrintingCostPerUnit = productSelected?.printingHistory?.totalCost || 0
    
    // Costo de mano de obra por unidad
    let workPackageCostPerUnit = 0
    if (workPackageSelected) {
      if (workPackageSelected.calculationType === "Fixed") {
        workPackageCostPerUnit = workPackageSelected.value || 0 
      } else if (workPackageSelected.calculationType === "Multiply") {
        workPackageCostPerUnit = (formData?.workPackagePerHour || 0) * (workPackageSelected.value || 0)
      }
    }

    // Costo unitario total (impresión + mano de obra)
    const unitCostTotal = totalPrintingCostPerUnit + workPackageCostPerUnit
    
    // Subtotal (costo unitario × cantidad)
    const subtotalValue = unitCostTotal * formData?.quantity
    
    // Margen de ganancia
    console.log("configs", )
    const marginPercentValue = Number(
        configs['DefaultProfitMargin'] || 30 
    ) 
    
    const marginAmountValue = subtotalValue * marginPercentValue / 100
    
    // Costo final con margen
    const finalCost = subtotalValue + marginAmountValue

    // Actualizar todos los estados
    setLaborCost(workPackageCostPerUnit * formData?.quantity)
    setUnitCost(unitCostTotal)
    setSubtotal(subtotalValue)
    setMarginAmount(marginAmountValue)
    setMarginPercent(marginPercentValue)
    setCalculatedCost(finalCost)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      if (detail?.id) {
        await apiClient.updateSaleDetail(saleId, detail.id, { ...formData, id: detail.id })
      } else {
        await apiClient.createSaleDetail(saleId, formData)
      }
      onSuccess()
    } catch (err) {
      setError("Error al guardar el detalle. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof SaleDetail, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (isLoadingData) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          {detail ? "Editar Detalle de Venta" : "Nuevo Detalle de Venta"}
        </CardTitle>
        <CardDescription>
          {detail
            ? "Modifica los detalles del producto y recalcula los costos"
            : "Agrega un producto a la venta y calcula automáticamente los costos"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Producto con buscador rapido de escribir */}
          <ProductSelect 
            products={products || []} 
            formData={formData} 
            handleChange={handleChange}
            searchTerm={productSearchTerm}
            onSearchChange={setProductSearchTerm}
            isSearching={isSearchingProducts}
          />

          {/* Información del producto */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="comments">Comentarios</Label>
              <Textarea
                id="comments"
                placeholder="Comentarios adicionales..."
                value={formData.comments}
                onChange={(e) => handleChange("comments", e.target.value)}
              />
            </div>
          </div>

          {/* Especificaciones técnicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Especificaciones Técnicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Cantidad</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={formData.quantity}
                  onChange={(e) => handleChange("quantity", Number.parseInt(e.target.value) || 1)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Paquete de trabajo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Paquete de Trabajo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workPackage">Paquete de Trabajo</Label>
                <Select value={formData.workPackageId} onValueChange={(value) => handleChange("workPackageId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona paquete" />
                  </SelectTrigger>
                  <SelectContent>
                    {workPackages?.map((wp) => (
                      <SelectItem key={wp.id ?? ''} value={wp.id ?? ''}>
                        {wp.name} - {wp.calculationType} ({formatCurrency(wp.value)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="workPackagePerHour">Tarifa por Hora</Label>
                <Input
                  id="workPackagePerHour"
                  type="number"
                  placeholder="0"
                  value={formData.workPackagePerHour}
                  onChange={(e) => handleChange("workPackagePerHour", Number.parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>


          {/* Cálculo de costos detallado */}
          <div className="bg-muted p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Cálculo de Costos Detallado
            </h3>
            
            <div className="space-y-4">
              {/* Valor de impresión unitario */}
              <div className="bg-background p-4 rounded-md border">
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Valor de Impresión Unitario</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Costo por unidad:</span>
                  <span className="font-bold text-lg">{formatCurrency(unitCost || 0)}</span>
                </div>
              </div>

              {/* Subtotal */}
              <div className="bg-background p-4 rounded-md border">
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Subtotal (Cantidad: {formData?.quantity || 0})</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total de impresión:</span>
                  <span className="font-bold text-lg">{formatCurrency(subtotal || 0)}</span>
                </div>
              </div>

              {/* Margen de ganancia */}
              <div className="bg-background p-4 rounded-md border">
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Margen de Ganancia</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Margen ({marginPercent || 0}%):</span>
                  <span className="font-medium text-green-600">{formatCurrency(marginAmount || 0)}</span>
                </div>
              </div>

              {/* Total final */}
              <div className="bg-primary/10 p-4 rounded-md border-2 border-primary/20">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">TOTAL FINAL:</span>
                  <span className="text-2xl font-bold text-primary">{formatCurrency(calculatedCost || 0)}</span>
                </div>
              </div>
            </div>
          </div>

          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : detail ? (
                "Actualizar Detalle"
              ) : (
                "Agregar Detalle"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
