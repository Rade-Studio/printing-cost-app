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

interface Filament {
  Id?: string
  Type: string
  Color: string
  CostPerGram: number
  StockGrams: number
}

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

const colors = [
  "Negro",
  "Blanco",
  "Rojo",
  "Azul",
  "Verde",
  "Amarillo",
  "Naranja",
  "Morado",
  "Rosa",
  "Gris",
  "Marrón",
  "Transparente",
  "Dorado",
  "Plateado",
  "Bronce",
]

export function FilamentForm({ filament, onSuccess, onCancel }: FilamentFormProps) {
  const [formData, setFormData] = useState<Filament>({
    Type: filament?.Type || "",
    Color: filament?.Color || "",
    CostPerGram: filament?.CostPerGram || 0,
    StockGrams: filament?.StockGrams || 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      if (filament?.Id) {
        await apiClient.updateFilament(filament.Id, { ...formData, Id: filament.Id })
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

  const handleChange = (field: keyof Filament, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const costPerKg = (formData.CostPerGram || 0) * 1000

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
              <Select value={formData.Type} onValueChange={(value) => handleChange("Type", value)}>
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
              <Select value={formData.Color} onValueChange={(value) => handleChange("Color", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el color" />
                </SelectTrigger>
                <SelectContent>
                  {colors.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="costPerGram">Costo por Gramo ($)</Label>
              <Input
                id="costPerGram"
                type="number"
                step="0.001"
                placeholder="0.080"
                value={formData.CostPerGram}
                onChange={(e) => handleChange("CostPerGram", Number.parseFloat(e.target.value) || 0)}
                required
              />
              <p className="text-xs text-muted-foreground">Equivale a ${costPerKg.toFixed(2)} por kilogramo</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stockGrams">Stock Disponible (gramos)</Label>
              <Input
                id="stockGrams"
                type="number"
                placeholder="1000"
                value={formData.StockGrams}
                onChange={(e) => handleChange("StockGrams", Number.parseInt(e.target.value) || 0)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Equivale a {((formData.StockGrams || 0) / 1000).toFixed(2)} kilogramos
              </p>
            </div>
          </div>

          {/* Información de costo total */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="text-sm font-semibold mb-2">Información del Rollo</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Valor Total del Stock:</p>
                <p className="font-medium">${((formData.CostPerGram || 0) * (formData.StockGrams || 0)).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Peso Total:</p>
                <p className="font-medium">{((formData.StockGrams || 0) / 1000).toFixed(2)} kg</p>
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
