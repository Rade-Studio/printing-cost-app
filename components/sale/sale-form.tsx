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
import { Loader2, Search, User, DollarSign, UserCheck, Calendar, CreditCard, Building2 } from "lucide-react"

interface SaleFormProps {
  sale?: Sale | null
  onSuccess: () => void
  onCancel: () => void
}

export function SaleForm({ sale, onSuccess, onCancel }: SaleFormProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [clientSearchTerm, setClientSearchTerm] = useState("")
  const [isSearchingClients, setIsSearchingClients] = useState(false)
  const [formData, setFormData] = useState<Partial<Sale>>({
    clientId: sale?.clientId || "",
    status: sale?.status || "cotizacion",
    estimatedTotal: sale?.estimatedTotal || 0,
    finalTotal: sale?.finalTotal || 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingClients, setIsLoadingClients] = useState(true)
  const [error, setError] = useState("")

  // Cargar clientes iniciales y búsqueda con debounce
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoadingClients(true)
        setIsSearchingClients(true)
        
        const response = await apiClient.getClients({
          page: 1,
          pageSize: 100, // Cargar más clientes inicialmente
          searchTerm: clientSearchTerm,
          sortBy: "name",
          sortDescending: false
        })
        
        if (response) {
          setClients(response.data)
        }
      } catch (error) {
        console.error("Error fetching clients:", error)
        setClients([])
      } finally {
        setIsLoadingClients(false)
        setIsSearchingClients(false)
      }
    }

    const timeoutId = setTimeout(fetchClients, clientSearchTerm ? 800 : 0) // Debounce solo para búsquedas
    return () => clearTimeout(timeoutId)
  }, [clientSearchTerm])

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

  const handleChange = (field: keyof Partial<Sale>, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    
    // Limpiar búsqueda cuando se selecciona un cliente
    if (field === "clientId") {
      setClientSearchTerm("")
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <Card className="shadow-xl border-0 bg-gradient-to-br from-card to-muted/20 overflow-hidden">
        <CardHeader className="px-6 py-4 bg-gradient-to-r from-primary to-primary/90 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg shadow-md">
              <CreditCard className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <CardTitle className="text-xl font-semibold">
                  {sale ? "Editar Venta" : "Nueva Venta"}
                </CardTitle>
                <div className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
                  {sale ? "Edición" : "Creación"}
                </div>
              </div>
              <CardDescription className="text-white/80 text-sm mt-1">
                {sale ? "Actualiza la información de la venta" : "Registra una nueva venta"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Layout Principal - Aprovecha el espacio horizontal */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Columna 1: Cliente */}
              <div className="xl:col-span-2">
                <div className="bg-card rounded-xl border border-border p-4 shadow-sm h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <UserCheck className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-card-foreground">Información del Cliente</h3>
                  </div>
                  
                  {isLoadingClients ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <span className="text-muted-foreground font-medium">Cargando clientes...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Buscador de clientes */}
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                        <Input
                          placeholder="Buscar cliente por nombre, email o teléfono..."
                          value={clientSearchTerm}
                          onChange={(e) => setClientSearchTerm(e.target.value)}
                          className="pl-12 h-12 text-base border-border focus:border-primary focus:ring-primary bg-input text-foreground placeholder:text-muted-foreground"
                        />
                        {isSearchingClients && (
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          </div>
                        )}
                      </div>
                      
                      {/* Selector de clientes */}
                      <div>
                        <Label className="text-sm font-medium text-card-foreground mb-2 block">Cliente Seleccionado</Label>
                        <Select value={formData.clientId} onValueChange={(value) => handleChange("clientId", value)}>
                          <SelectTrigger className="h-12 border-border focus:border-primary focus:ring-primary bg-input text-foreground">
                            <SelectValue placeholder="Selecciona un cliente de la lista" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {clients.length === 0 ? (
                              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                                <User className="h-5 w-5 mr-2" />
                                {clientSearchTerm ? "No se encontraron clientes" : "No hay clientes disponibles"}
                              </div>
                            ) : (
                              clients.map((client) => (
                                <SelectItem key={client.id} value={client.id || ""} className="py-3">
                                  <div className="flex flex-col">
                                    <span className="font-medium text-foreground">{client.name}</span>
                                    <span className="text-xs text-muted-foreground">{client.email}</span>
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Columna 2: Estado y Montos */}
              <div className="space-y-6">
                {/* Estado de la Venta */}
                <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Building2 className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-card-foreground">Estado</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-card-foreground">Estado Actual</Label>
                    <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                      <SelectTrigger className="h-12 border-border focus:border-primary focus:ring-primary bg-input text-foreground">
                        <SelectValue placeholder="Selecciona el estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cotizacion" className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span>Cotización</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="en_proceso" className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>En Proceso</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="completada" className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Completada</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="cancelada" className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span>Cancelada</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="prueba_venta" className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span>Prueba de Venta</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Montos */}
                <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <DollarSign className="h-5 w-5 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-card-foreground">Montos</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-card-foreground mb-2 block">Total Estimado</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                        <Input
                          id="estimatedTotal"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.estimatedTotal || ""}
                          onChange={(e) => handleChange("estimatedTotal", Number.parseFloat(e.target.value) || 0)}
                          className="pl-10 h-12 text-base border-border focus:border-primary focus:ring-primary bg-input text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-card-foreground mb-2 block">Total Final</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                        <Input
                          id="finalTotal"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.finalTotal || ""}
                          onChange={(e) => handleChange("finalTotal", Number.parseFloat(e.target.value) || 0)}
                          className="pl-10 h-12 text-base border-border focus:border-primary focus:ring-primary bg-input text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mensaje de Error */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-destructive rounded-full"></div>
                  <span className="text-destructive font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Botones de Acción */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
              <Button 
                type="submit" 
                disabled={isLoading || isLoadingClients} 
                className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Guardando...
                  </>
                ) : sale ? (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Actualizar Venta
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Crear Venta
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel} 
                disabled={isLoading}
                className="h-12 px-8 border-border text-foreground hover:bg-muted font-semibold rounded-xl transition-all duration-200"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
