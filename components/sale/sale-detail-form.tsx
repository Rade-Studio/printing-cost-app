"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/lib/api"
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
  const [filaments, setFilaments] = useState<Filament[] | null>([])
  const [workPackages, setWorkPackages] = useState<WorkPackage[] | null>([])
  const [products, setProducts] = useState<Product[] | null>([])
  const [formData, setFormData] = useState<SaleDetail>(
    detail || {
      saleId: saleId,
      productId: '',
      filamentId: '',
      quantity: 1,
      comments: '',
      workPackageId: '',
      workPackagePerHour: 0,
    }
  )
  const [calculatedCost, setCalculatedCost] = useState(0)
  const [laborCost, setLaborCost] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState("")
  const { formatCurrency } = useLocale()
  const { configs, refreshConfigs, isLoading: isLoadingConfigs } = useSystemConfig()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [filamentsData, workPackagesData, productsData] = await Promise.all([
          apiClient.getFilaments(),
          apiClient.getWorkPackages(),
          apiClient.getProducts(),
        ])
        setFilaments(filamentsData)
        setWorkPackages(workPackagesData)
        setProducts(productsData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoadingData(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    refreshConfigs()
  }, [refreshTrigger])

  useEffect(() => {
    calculateCost()
  }, [formData, filaments, workPackages])

  const calculateCost = () => {
    const productSelected = products?.find((f) => f.id === formData?.productId)
    const selectedWorkPackage = workPackages?.find((wp) => wp.id === formData?.workPackageId)

    if (!productSelected) {
      setCalculatedCost(0)
      setLaborCost(0)
      return
    }

    // Costo de trabajo
    let workPackageCost = 0
    if (selectedWorkPackage) {
      if (selectedWorkPackage.calculationType === "Fixed") {
        workPackageCost = selectedWorkPackage.value || 0 
      } else if (selectedWorkPackage.calculationType === "Multiply") {
        workPackageCost = (formData?.workPackagePerHour || 0) * (selectedWorkPackage.value || 0)
      }
    }


    // Costo total considerando cantidad
    const totalCost = ((formData.PrintingHistory?.totalCost || 0 ) + workPackageCost) * formData?.quantity || 0
    const marginPercent = Number(
      Array.isArray(configs)
        ? configs.find(c => c.key === 'DefaultProfitMargin')?.value
        : undefined
    ) || 30

    const margin = totalCost * marginPercent / 100

    setLaborCost(workPackageCost)
    setCalculatedCost(totalCost + margin)
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
          <ProductSelect products={products} formData={formData} handleChange={handleChange} />

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


          {/* Cálculo de costos */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Cálculo de Costos</h3>
            <div className="text-2xl font-bold text-primary">{ formatCurrency(calculatedCost || 0) }</div>
          
            <p className="text-sm text-muted-foreground">Costo de mano de obra: {formatCurrency(laborCost || 0)}</p>
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
