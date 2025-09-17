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

interface Filament {
  id: string
  type: string
  color: string
  costPerGram: number
}

interface WorkPackage {
  id: string
  name: string
  description: string
  calculationType: string
  value: number
}

interface SaleDetail {
  id?: string
  saleId: string
  filamentId: string
  productDescription: string
  weightGrams: number
  printTimeHours: number
  quantity: number
  comments: string
  workPackagePerHour: number
  workPackageId: string
  machineRateApplied: number
}

interface SaleDetailFormProps {
  saleId: string
  detail?: SaleDetail
  onSuccess: () => void
  onCancel: () => void
}

export function SaleDetailForm({ saleId, detail, onSuccess, onCancel }: SaleDetailFormProps) {
  const [filaments, setFilaments] = useState<Filament[]>([])
  const [workPackages, setWorkPackages] = useState<WorkPackage[]>([])
  const [formData, setFormData] = useState<SaleDetail>({
    saleId: saleId,
    filamentId: detail?.filamentId || "",
    productDescription: detail?.productDescription || "",
    weightGrams: detail?.weightGrams || 0,
    printTimeHours: detail?.printTimeHours || 0,
    quantity: detail?.quantity || 1,
    comments: detail?.comments || "",
    workPackagePerHour: detail?.workPackagePerHour || 0,
    workPackageId: detail?.workPackageId || "",
    machineRateApplied: detail?.machineRateApplied || 0,
  })
  const [calculatedCost, setCalculatedCost] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState("")
  const { formatCurrency } = useLocale()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [filamentsData, workPackagesData] = await Promise.all([
          apiClient.getFilaments(),
          apiClient.getWorkPackages(),
        ])
        setFilaments(filamentsData)
        setWorkPackages(workPackagesData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoadingData(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    calculateCost()
  }, [formData, filaments, workPackages])

  const calculateCost = () => {
    const selectedFilament = filaments.find((f) => f.id === formData.filamentId)
    const selectedWorkPackage = workPackages.find((wp) => wp.id === formData.workPackageId)

    if (!selectedFilament) {
      setCalculatedCost(0)
      return
    }

    // Costo del material
    const materialCost = ((formData.weightGrams || 0) * (selectedFilament.costPerGram || 0))

    // Costo de trabajo
    let workCost = 0
    if (selectedWorkPackage) {
      if (selectedWorkPackage.calculationType === "Fixed") {
        workCost = selectedWorkPackage.value || 0
      } else if (selectedWorkPackage.calculationType === "Multiply") {
        workCost = (formData.workPackagePerHour || 0) * (selectedWorkPackage.value || 0)
      }
    }

    // Costo de máquina
    const machineCost = (formData.machineRateApplied || 0)

    // Costo total por unidad
    const unitCost = materialCost + machineCost

    // Costo total considerando cantidad
    const totalCost = unitCost * (formData.quantity || 1) + workCost

    setCalculatedCost(totalCost)
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
          {/* Información del producto */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información del Producto</h3>
            <div className="space-y-2">
              <Label htmlFor="productDescription">Descripción del Producto</Label>
              <Textarea
                id="productDescription"
                placeholder="Describe el producto a imprimir..."
                value={formData.productDescription}
                onChange={(e) => handleChange("productDescription", e.target.value)}
                required
              />
            </div>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filament">Filamento</Label>
                <Select value={formData.filamentId} onValueChange={(value) => handleChange("filamentId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona filamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {filaments.map((filament) => (
                      <SelectItem key={filament.id} value={filament.id}>
                        {filament.type} - {filament.color} ({formatCurrency(filament.costPerGram || 0)}/g)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weightGrams">Peso (gramos)</Label>
                <Input
                  id="weightGrams"
                  type="number"
                  step="1"
                  placeholder="0"
                  value={formData.weightGrams}
                  onChange={(e) => handleChange("weightGrams", Number.parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="printTimeHours">Tiempo de Impresión (horas)</Label>
                <Input
                  id="printTimeHours"
                  type="number"
                  step="1"
                  placeholder="0"
                  value={formData.printTimeHours}
                  onChange={(e) => handleChange("printTimeHours", Number.parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
            </div>
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
              <div className="space-y-2">
                <Label htmlFor="machineRateApplied">Tarifa de Máquina (por hora)</Label>
                <Input
                  id="machineRateApplied"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={formData.machineRateApplied}
                  onChange={(e) => handleChange("machineRateApplied", Number.parseFloat(e.target.value) || 0)}
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
                    {workPackages.map((wp) => (
                      <SelectItem key={wp.id} value={wp.id}>
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
                  step="1"
                  placeholder="0"
                  value={formData.workPackagePerHour}
                  onChange={(e) => handleChange("workPackagePerHour", Number.parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          {/* Cálculo de costos */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Cálculo de Costos</h3>
            <div className="text-2xl font-bold text-primary">{ formatCurrency(calculatedCost || 0) }</div>
            <p className="text-sm text-muted-foreground">Costo total estimado</p>
            <p className="text-sm text-muted-foreground">No se incluye el costo de consumo de energia, por lo que el precio real estimado se calcula al guardar el producto.</p>
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
