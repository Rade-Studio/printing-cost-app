"use client"

import type React from "react"
import type { PrintingHistory, Filament, Printer, SaleDetail, Product, FilamentConsumption } from "@/lib/types"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/lib/api"
import { Loader2, History } from "lucide-react"
import { ProductSelect } from "../shared/select-product"
import MultiFilamentSelector from "./multi-filament-selector"

interface PrintingHistoryFormProps {
  printingHistory?: PrintingHistory
  onSuccess: () => void
  onCancel: () => void
  refreshTrigger?: number
}

const printingTypes = [
  { value: "prototype", label: "Prototipo" },
  { value: "final", label: "Definitivo" },
  { value: "calibration", label: "Calibración" },
  { value: "test", label: "Prueba" },
  { value: "rework", label: "Retrabajo" },
  { value: "sample", label: "Muestra" },
  { value: "production", label: "Producción" },
  { value: "other", label: "Otro" }
]

export function PrintingHistoryForm({ printingHistory, onSuccess, onCancel, refreshTrigger }: PrintingHistoryFormProps) {
  const [formData, setFormData] = useState<PrintingHistory>({
    printerId: printingHistory?.printerId || "",
    productId: printingHistory?.productId || "",
    totalCost: printingHistory?.totalCost || undefined,
    totalEnergyCost: printingHistory?.totalEnergyCost || undefined,
    totalFilamentCost: printingHistory?.totalFilamentCost || undefined,
    totalGramsUsed: printingHistory?.totalGramsUsed || undefined,
    printTimeHours: printingHistory?.printTimeHours || 0,
    type: printingHistory?.type || "prototype",
    filaments: printingHistory?.filaments || [],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [filaments, setFilaments] = useState<Filament[]>([])
  const [printers, setPrinters] = useState<Printer[]>([])
  const [products, setProducts] = useState<Product[]>([])

  // Cargar datos necesarios para los selects
  useEffect(() => {
    const loadData = async () => {
      try {
        const [filamentsData, printersData, productsData] = await Promise.all([
          apiClient.getFilaments(),
          apiClient.getPrinters(),
          apiClient.getProducts()
        ])
        
        setFilaments(filamentsData || [])
        setPrinters(printersData || [])
        setProducts(productsData || [])
        
      } catch (err) {
        console.error("Error loading data:", err)
      }
    }
    
    loadData()
  }, [refreshTrigger])

  const handleConsumptionsChange = (next: FilamentConsumption[]) => {
    setFormData(prev => ({ ...prev, filamentConsumptions: next }))
  }

  const getFilamentDescription = (f: Filament) => `${f.type ?? ""} ${f.color ?? ""}`.trim()

  // Ejemplo de “componente reactivo” que responde a los cambios:
  const totalGrams = useMemo(
    () => formData.filaments?.reduce((acc, x) => acc + (x.gramsUsed || 0), 0),
    [formData.filaments]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      if (printingHistory?.id) {
        await apiClient.updatePrintingHistory(printingHistory.id, { ...formData, id: printingHistory.id })
      } else {
        await apiClient.createPrintingHistory(formData)
      }
      onSuccess()
    } catch (err) {
      setError("Error al guardar el historial de impresión. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof PrintingHistory, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getPrinterDescription = (printerId: string) => {
    const printer = printers.find(p => p.id === printerId)
    return printer ? `${printer.name} - ${printer.model}` : "Selecciona una impresora"
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          {printingHistory ? "Editar Historial de Impresión" : "Nuevo Historial de Impresión"}
        </CardTitle>
        <CardDescription>
          {printingHistory ? "Modifica la información del historial de impresión" : "Registra una nueva impresión en el historial"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <ProductSelect products={products} formData={formData} handleChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Impresión</Label>
              <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  {printingTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <MultiFilamentSelector 
                filaments={filaments} 
                value={formData.filaments ?? []} 
                label="Filamentos" 
                onChange={handleConsumptionsChange} 
                getDescription={getFilamentDescription} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="printerId">Impresora</Label>
              <Select value={formData.printerId} onValueChange={(value) => handleChange("printerId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una impresora" />
                </SelectTrigger>
                <SelectContent>
                  {printers.map((printer) => (
                    <SelectItem key={printer.id} value={printer.id!}>
                      {getPrinterDescription(printer.id!)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="printTimeHours">Tiempo de Impresión (horas)</Label>
              <Input
                id="printTimeHours"
                type="number"
                step="0.1"
                placeholder="2.5"
                value={formData.printTimeHours}
                onChange={(e) => handleChange("printTimeHours", Number.parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          {/* Información calculada */}

          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : printingHistory ? (
                "Actualizar Historial"
              ) : (
                "Agregar al Historial"
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
