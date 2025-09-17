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

interface Filament {
  Id: string
  Type: string
  Color: string
  CostPerGram: number
}

interface WorkPackage {
  Id: string
  Name: string
  Description: string
  CalculationType: string
  Value: number
}

interface SaleDetail {
  Id?: string
  SaleId: string
  FilamentId: string
  ProductDescription: string
  WeightGrams: number
  PrintTimeHours: number
  Quantity: number
  Comments: string
  WorkPackagePerHour: number
  WorkPackageId: string
  MachineRateApplied: number
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
    SaleId: saleId,
    FilamentId: detail?.FilamentId || "",
    ProductDescription: detail?.ProductDescription || "",
    WeightGrams: detail?.WeightGrams || 0,
    PrintTimeHours: detail?.PrintTimeHours || 0,
    Quantity: detail?.Quantity || 1,
    Comments: detail?.Comments || "",
    WorkPackagePerHour: detail?.WorkPackagePerHour || 0,
    WorkPackageId: detail?.WorkPackageId || "",
    MachineRateApplied: detail?.MachineRateApplied || 0,
  })
  const [calculatedCost, setCalculatedCost] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState("")

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
    const selectedFilament = filaments.find((f) => f.Id === formData.FilamentId)
    const selectedWorkPackage = workPackages.find((wp) => wp.Id === formData.WorkPackageId)

    if (!selectedFilament) {
      setCalculatedCost(0)
      return
    }

    // Costo del material
    const materialCost = ((formData.WeightGrams || 0) * (selectedFilament.CostPerGram || 0)) / 100

    // Costo de trabajo
    let workCost = 0
    if (selectedWorkPackage) {
      if (selectedWorkPackage.CalculationType === "Fixed") {
        workCost = selectedWorkPackage.Value || 0
      } else if (selectedWorkPackage.CalculationType === "Multiply") {
        workCost = (formData.PrintTimeHours || 0) * (selectedWorkPackage.Value || 0)
      }
    }

    // Costo de máquina
    const machineCost = ((formData.PrintTimeHours || 0) * (formData.MachineRateApplied || 0)) / 100

    // Costo total por unidad
    const unitCost = materialCost + workCost + machineCost

    // Costo total considerando cantidad
    const totalCost = unitCost * (formData.Quantity || 1)

    setCalculatedCost(totalCost)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      if (detail?.Id) {
        await apiClient.updateSaleDetail(saleId, detail.Id, { ...formData, Id: detail.Id })
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
                value={formData.ProductDescription}
                onChange={(e) => handleChange("ProductDescription", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="comments">Comentarios</Label>
              <Textarea
                id="comments"
                placeholder="Comentarios adicionales..."
                value={formData.Comments}
                onChange={(e) => handleChange("Comments", e.target.value)}
              />
            </div>
          </div>

          {/* Especificaciones técnicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Especificaciones Técnicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filament">Filamento</Label>
                <Select value={formData.FilamentId} onValueChange={(value) => handleChange("FilamentId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona filamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {filaments.map((filament) => (
                      <SelectItem key={filament.Id} value={filament.Id}>
                        {filament.Type} - {filament.Color} (${filament.CostPerGram}/g)
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
                  step="0.1"
                  placeholder="0"
                  value={formData.WeightGrams}
                  onChange={(e) => handleChange("WeightGrams", Number.parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="printTimeHours">Tiempo de Impresión (horas)</Label>
                <Input
                  id="printTimeHours"
                  type="number"
                  step="0.1"
                  placeholder="0"
                  value={formData.PrintTimeHours}
                  onChange={(e) => handleChange("PrintTimeHours", Number.parseFloat(e.target.value) || 0)}
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
                  value={formData.Quantity}
                  onChange={(e) => handleChange("Quantity", Number.parseInt(e.target.value) || 1)}
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
                  value={formData.MachineRateApplied}
                  onChange={(e) => handleChange("MachineRateApplied", Number.parseFloat(e.target.value) || 0)}
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
                <Select value={formData.WorkPackageId} onValueChange={(value) => handleChange("WorkPackageId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona paquete" />
                  </SelectTrigger>
                  <SelectContent>
                    {workPackages.map((wp) => (
                      <SelectItem key={wp.Id} value={wp.Id}>
                        {wp.Name} - {wp.CalculationType} (${wp.Value})
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
                  step="0.01"
                  placeholder="0"
                  value={formData.WorkPackagePerHour}
                  onChange={(e) => handleChange("WorkPackagePerHour", Number.parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          {/* Cálculo de costos */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Cálculo de Costos</h3>
            <div className="text-2xl font-bold text-primary">${(calculatedCost || 0).toFixed(2)}</div>
            <p className="text-sm text-muted-foreground">Costo total estimado</p>
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
