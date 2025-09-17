"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient } from "@/lib/api"
import { Loader2, Settings } from "lucide-react"

interface SystemConfig {
  Id?: string
  Key: string
  Value: string
}

interface SystemConfigFormProps {
  config?: SystemConfig
  onSuccess: () => void
  onCancel: () => void
}

const configDescriptions: Record<string, { label: string; description: string; type: string; unit?: string }> = {
  WorkPackagePerHour: {
    label: "Tarifa de Trabajo por Hora",
    description: "Tarifa base por hora de trabajo manual",
    type: "number",
    unit: "$/hora",
  },
  MachineRatePerHour: {
    label: "Tarifa de Máquina por Hora",
    description: "Costo de operación de la impresora 3D por hora",
    type: "number",
    unit: "$/hora",
  },
  ElectricityCostPerKwh: {
    label: "Costo de Electricidad",
    description: "Precio del kWh de electricidad",
    type: "number",
    unit: "$/kWh",
  },
  DefaultProfitMargin: {
    label: "Margen de Ganancia por Defecto",
    description: "Porcentaje de ganancia aplicado a los costos",
    type: "number",
    unit: "%",
  },
  MinimumOrderValue: {
    label: "Valor Mínimo de Pedido",
    description: "Monto mínimo para aceptar un pedido",
    type: "number",
    unit: "$",
  },
  CompanyName: {
    label: "Nombre de la Empresa",
    description: "Nombre que aparecerá en reportes y documentos",
    type: "text",
  },
  CompanyEmail: {
    label: "Email de la Empresa",
    description: "Email de contacto principal",
    type: "email",
  },
  CompanyPhone: {
    label: "Teléfono de la Empresa",
    description: "Número de teléfono de contacto",
    type: "text",
  },
}

export function SystemConfigForm({ config, onSuccess, onCancel }: SystemConfigFormProps) {
  const [formData, setFormData] = useState<SystemConfig>({
    Key: config?.Key || "",
    Value: config?.Value || "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      if (config?.Id) {
        await apiClient.updateSystemConfig(config.Id, { ...formData, Id: config.Id })
      } else {
        await apiClient.createSystemConfig(formData)
      }
      onSuccess()
    } catch (err) {
      setError("Error al guardar la configuración. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof SystemConfig, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const configInfo = configDescriptions[formData.Key]

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          {config ? "Editar Configuración" : "Nueva Configuración"}
        </CardTitle>
        <CardDescription>
          {config ? "Modifica el valor de la configuración" : "Agrega una nueva configuración del sistema"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="key">Clave de Configuración</Label>
            <select
              id="key"
              value={formData.Key}
              onChange={(e) => handleChange("Key", e.target.value)}
              className="w-full p-2 border border-input rounded-md bg-background"
              required
              disabled={!!config}
            >
              <option value="">Selecciona una configuración</option>
              {Object.entries(configDescriptions).map(([key, info]) => (
                <option key={key} value={key}>
                  {info.label}
                </option>
              ))}
            </select>
            {configInfo && <p className="text-sm text-muted-foreground">{configInfo.description}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">
              Valor
              {configInfo?.unit && <span className="text-muted-foreground"> ({configInfo.unit})</span>}
            </Label>
            <Input
              id="value"
              type={configInfo?.type || "text"}
              step={configInfo?.type === "number" ? "0.01" : undefined}
              placeholder={configInfo?.type === "number" ? "0.00" : "Ingresa el valor"}
              value={formData.Value}
              onChange={(e) => handleChange("Value", e.target.value)}
              required
            />
          </div>

          {/* Preview para configuraciones numéricas */}
          {configInfo?.type === "number" && formData.Value && (
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Vista previa:</span> {formData.Value} {configInfo.unit}
              </p>
            </div>
          )}

          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : config ? (
                "Actualizar Configuración"
              ) : (
                "Crear Configuración"
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
