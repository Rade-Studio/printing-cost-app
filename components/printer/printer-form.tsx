"use client"

import type React from "react"
import type { Printer } from "@/lib/types"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/lib/api"
import { Loader2, Printer as PrinterIcon } from "lucide-react"

interface PrinterFormProps {
  printer?: Printer
  onSuccess: () => void
  onCancel: () => void
}

const printerStatuses = [
  { value: "active", label: "Activa" },
  { value: "maintenance", label: "Mantenimiento" },
  { value: "inactive", label: "Inactiva" },
  { value: "broken", label: "Dañada" }
]

const printerModels = [
  "Ender 3",
  "Ender 3 V2",
  "Ender 3 S1",
  "Ender 5",
  "Ender 5 Plus",
  "Prusa i3 MK3S+",
  "Prusa Mini+",
  "Ultimaker 3",
  "Ultimaker S3",
  "FlashForge Creator Pro",
  "Anycubic i3 Mega",
  "Creality CR-10",
  "Creality CR-10S",
  "Artillery Sidewinder X1",
  "Voron 2.4",
  "Voron Trident",
  "RatRig V-Core 3",
  "Custom/Other"
]

export function PrinterForm({ printer, onSuccess, onCancel }: PrinterFormProps) {
  // Determinar si el modelo es personalizado desde el inicio
  const isModelCustom = printer?.model ? !printerModels.includes(printer.model) : false
  
  const [formData, setFormData] = useState<Printer>({
    name: printer?.name || "",
    description: printer?.description || "",
    model: printer?.model || "",
    status: printer?.status || "active",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [customModel, setCustomModel] = useState(printer?.model && isModelCustom ? printer.model : "")
  const [isCustomModel, setIsCustomModel] = useState(isModelCustom)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      if (printer?.id) {
        await apiClient.updatePrinter(printer.id, { ...formData, id: printer.id })
      } else {
        await apiClient.createPrinter(formData)
      }
      onSuccess()
    } catch (err) {
      setError("Error al guardar la impresora. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof Printer, value: string) => {
    if (field === "model") {
      if (value === "Custom/Other") {
        setIsCustomModel(true)
        setCustomModel(formData.model || "")
      } else {
        setIsCustomModel(false)
        setCustomModel("")
        setFormData((prev) => ({ ...prev, [field]: value }))
      }
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
  }

  const handleCustomModelChange = (value: string) => {
    setCustomModel(value)
    setFormData((prev) => ({ ...prev, model: value }))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PrinterIcon className="h-5 w-5" />
          {printer ? "Editar Impresora" : "Nueva Impresora"}
        </CardTitle>
        <CardDescription>
          {printer ? "Modifica la información de la impresora" : "Agrega una nueva impresora a tu inventario"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Impresora</Label>
            <Input
              id="name"
              type="text"
              placeholder="Impresora Principal, Ender 3 Oficina..."
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              type="text"
              placeholder="Descripción breve de la impresora..."
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="model">Modelo</Label>
              <Select 
                value={isCustomModel ? "Custom/Other" : formData.model} 
                onValueChange={(value) => handleChange("model", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el modelo" />
                </SelectTrigger>
                <SelectContent>
                  {printerModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isCustomModel && (
                <Input
                  id="customModel"
                  type="text"
                  placeholder="Escribe el modelo personalizado..."
                  value={customModel}
                  onChange={(e) => handleCustomModelChange(e.target.value)}
                  required
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el estado" />
                </SelectTrigger>
                <SelectContent>
                  {printerStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              ) : printer ? (
                "Actualizar Impresora"
              ) : (
                "Agregar Impresora"
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
