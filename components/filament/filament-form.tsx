"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/lib/api"
import { Loader2, Package } from "lucide-react"
import { useLocale } from "@/app/localContext"
import { Filament } from "@/lib/types"
import { MultiColorPicker } from "./multiply-color-picker"

interface FilamentFormProps {
  filament?: Filament
  onSuccess: () => void
  onCancel: () => void
}

const filamentTypes = [
  "PLA",
  "PLA+",
  "ABS",
  "PETG",
  "TPU",
  "ASA",
  "PC",
  "Nylon",
  "Relleno de Madera",
  "Relleno Metálico",
  "Fibra de Carbono",
  "Brilla en la Oscuridad",
  "Transparente",
  "Flexible",
]

export function FilamentForm({ filament, onSuccess, onCancel }: FilamentFormProps) {
  const [formData, setFormData] = useState<Filament>({
    type: filament?.type || "",
    color: filament?.color || [],
    costPerGram: filament?.costPerGram || 0,
    stockGrams: filament?.stockGrams || 0,
    density: filament?.density || 1,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { formatCurrency } = useLocale()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      if (filament?.id) {
        await apiClient.updateFilament(filament.id, { 
          ...formData, 
          color: formData.color.join(","),
          Id: filament.id 
        })
      } else {
        await apiClient.createFilament(formData)
      }
      onSuccess()
    } catch (err) {
      setError("Error al guardar el filamento. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof Filament, value: string | number | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const costPerKg = (formData.costPerGram || 0) * 1000

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          {filament ? "Editar Filamento" : "Nuevo Filamento"}
        </CardTitle>
        <CardDescription>
          {filament ? "Modifica la información del filamento" : "Agrega un nuevo rollo de filamento a tu inventario"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Filamento</Label>
              <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  {filamentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <MultiColorPicker value={formData.color} onChange={(colors) => handleChange("color", colors)} />
              {/* <Input
                id="color"
                type="text"
                placeholder="Rojo, Azul, Verde..."
                value={formData.color}
                onChange={(e) => handleChange("color", e.target.value)}
                required
              /> */}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="costPerGram">Costo por Gramo ($)</Label>
              <Input
                id="costPerGram"
                type="number"
                step="0.001"
                placeholder="0.080"
                value={formData.costPerGram}
                onChange={(e) => handleChange("costPerGram", Number.parseFloat(e.target.value) || 0)}
                required
              />
              <p className="text-xs text-muted-foreground">Equivale a ${costPerKg.toFixed(2)} por kilogramo</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="density">Densidad (g/cm³)</Label>
              <Input
                id="density"
                type="number"
                step="1"
                placeholder="1.23"
                value={formData.density}
                onChange={(e) => handleChange("density", Number.parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stockGrams">Stock Disponible (gramos)</Label>
              <Input
                id="stockGrams"
                type="number"
                placeholder="1000"
                value={formData.stockGrams}
                onChange={(e) => handleChange("stockGrams", Number.parseInt(e.target.value) || 0)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Equivale a {((formData.stockGrams || 0) / 1000).toFixed(2)} kilogramos
              </p>
            </div>
          </div>

          {/* Información de costo total */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="text-sm font-semibold mb-2">Información del Rollo</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Valor Total del Stock:</p>
                <p className="font-medium">{formatCurrency((formData.costPerGram || 0) * (formData.stockGrams || 0))}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Peso Total:</p>
                <p className="font-medium">{((formData.stockGrams || 0) / 1000).toFixed(2)} kg</p>
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
              ) : filament ? (
                "Actualizar Filamento"
              ) : (
                "Agregar Filamento"
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
