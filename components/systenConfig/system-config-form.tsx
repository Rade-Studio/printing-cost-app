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
  id?: string
  key: string
  value: string
}

interface SystemConfigFormProps {
  config?: SystemConfig
  existingConfigs?: SystemConfig[]
  onSuccess: () => void
  onCancel: () => void
}

const configDescriptions: Record<string, { label: string; description: string; type: string; unit?: string }> = {
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
}

export function SystemConfigForm({ config, existingConfigs = [], onSuccess, onCancel }: SystemConfigFormProps) {
  const [formData, setFormData] = useState<SystemConfig>({
    key: config?.key || "",
    value: config?.value || "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      if (config?.id) {
        await apiClient.updateSystemConfig(config.id, { ...formData, Id: config.id })
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

  const configInfo = configDescriptions[formData.key]

  // Filtrar configuraciones disponibles (excluir las que ya existen)
  const availableConfigs = Object.entries(configDescriptions).filter(([key]) => {
    // Si estamos editando, permitir la configuración actual
    if (config?.key === key) return true
    // Si no estamos editando, excluir las configuraciones existentes
    return !existingConfigs.some(existing => existing.key === key)
  })

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
              value={formData.key}
              onChange={(e) => handleChange("key", e.target.value)}
              className="w-full p-2 border border-input rounded-md bg-background"
              required
              disabled={!!config}
            >
              <option value="">Selecciona una configuración</option>
              {availableConfigs.map(([key, info]) => (
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
              value={formData.value}
              onChange={(e) => handleChange("value", e.target.value)}
              required
            />
          </div>

          {/* Preview para configuraciones numéricas */}
          {configInfo?.type === "number" && formData.value && (
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Vista previa:</span> {formData.value} {configInfo.unit}
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
