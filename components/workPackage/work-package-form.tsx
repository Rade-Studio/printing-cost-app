"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/lib/api"
import { Loader2, Briefcase, Calculator } from "lucide-react"
import { useLocale } from "@/app/localContext"
import { WorkPackage } from "@/lib/types"

interface WorkPackageFormProps {
  workPackage?: WorkPackage
  onSuccess: () => void
  onCancel: () => void
}

export function WorkPackageForm({ workPackage, onSuccess, onCancel }: WorkPackageFormProps) {
  const [formData, setFormData] = useState<WorkPackage>({
    name: workPackage?.name || "",
    description: workPackage?.description || "",
    calculationType: workPackage?.calculationType || "Fixed",
    value: workPackage?.value || 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { formatCurrency } = useLocale()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      if (workPackage?.id) {
        await apiClient.updateWorkPackage(workPackage.id, { ...formData, id: workPackage.id })
      } else {
        await apiClient.createWorkPackage(formData)
      }
      onSuccess()
    } catch (err) {
      setError("Error al guardar el paquete de trabajo. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof WorkPackage, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getCalculationDescription = () => {
    switch (formData.calculationType) {
      case "Fixed":
        return "Se aplicará un costo fijo independientemente del tiempo de impresión"
      case "Multiply":
        return "Se multiplicará el valor por las horas de impresión"
      default:
        return ""
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          {workPackage ? "Editar Paquete de Trabajo" : "Nuevo Paquete de Trabajo"}
        </CardTitle>
        <CardDescription>
          {workPackage
            ? "Modifica la configuración del paquete de trabajo"
            : "Define un nuevo paquete de trabajo para calcular costos de mano de obra"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Paquete</Label>
            <Input
              id="name"
              type="text"
              placeholder="Ej: Diseño básico, Postprocesado, Soporte técnico"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describe qué incluye este paquete de trabajo..."
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calculationType">Tipo de Cálculo</Label>
              <Select
                value={formData.calculationType}
                onValueChange={(value) => handleChange("calculationType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fixed">Costo Fijo</SelectItem>
                  <SelectItem value="Multiply">Por Horas</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{getCalculationDescription()}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">
                Valor ($)
                {formData.calculationType === "Fixed" ? " - Costo Total" : " - Por Hora"}
              </Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.value}
                onChange={(e) => handleChange("value", Number.parseFloat(e.target.value))}
                required
              />
            </div>
          </div>

          {/* Ejemplo de cálculo */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Ejemplo de Cálculo
            </h3>
            <div className="text-sm">
              {formData.calculationType === "Fixed" ? (
                <p>
                  Para cualquier trabajo: <span className="font-medium">{formatCurrency(formData.value)}</span>
                </p>
              ) : (
                <div>
                  <p>Para un trabajo de 2.5 horas:</p>
                  <p>
                    2.5 × {formatCurrency((formData.value || 0))} ={" "}
                    <span className="font-medium">{formatCurrency((2.5 * (formData.value)))}</span>
                  </p>
                </div>
              )}
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
              ) : workPackage ? (
                "Actualizar Paquete"
              ) : (
                "Crear Paquete"
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
