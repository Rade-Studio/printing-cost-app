"use client"

import type React from "react"
import type { Client, Sale } from "@/lib/types"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/lib/api"
import { Loader2 } from "lucide-react"

interface SaleFormProps {
  sale?: Sale
  onSuccess: () => void
  onCancel: () => void
}

export function SaleForm({ sale, onSuccess, onCancel }: SaleFormProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [formData, setFormData] = useState<Sale>({
    clientId: sale?.clientId || "",
    status: sale?.status || "cotizacion",
    estimatedTotal: sale?.estimatedTotal || 0,
    finalTotal: sale?.finalTotal || 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingClients, setIsLoadingClients] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await apiClient.getClients()
        setClients(data)
      } catch (error) {
        console.error("Error fetching clients:", error)
      } finally {
        setIsLoadingClients(false)
      }
    }
    fetchClients()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      if (sale?.id) {
        await apiClient.updateSale(sale.id, { ...formData, id: sale.id })
      } else {
        await apiClient.createSale(formData)
      }
      onSuccess()
    } catch (err) {
      setError("Error al guardar la venta. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof Sale, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{sale ? "Editar Venta" : "Nueva Venta"}</CardTitle>
        <CardDescription>
          {sale ? "Modifica la información de la venta" : "Crea una nueva venta para un cliente"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client">Cliente</Label>
            {isLoadingClients ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <Select value={formData.clientId} onValueChange={(value) => handleChange("clientId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id || ""}>
                      {client.name} - {client.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cotizacion">Cotización</SelectItem>
                <SelectItem value="en_proceso">En Proceso</SelectItem>
                <SelectItem value="completada">Completada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimatedTotal">Total Estimado ($)</Label>
              <Input
                id="estimatedTotal"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.estimatedTotal || ""}
                onChange={(e) => handleChange("estimatedTotal", Number.parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="finalTotal">Total Final ($)</Label>
              <Input
                id="finalTotal"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.finalTotal || ""}
                onChange={(e) => handleChange("finalTotal", Number.parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading || isLoadingClients} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : sale ? (
                "Actualizar Venta"
              ) : (
                "Crear Venta"
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
