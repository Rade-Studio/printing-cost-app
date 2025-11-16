"use client"

import type React from "react"
import type { Client, Sale, SaleProduct, SaleDetail } from "@/lib/types"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/lib/api"
import { SaleProductsList } from "@/components/sale/sale-products-list"
import { useLocale } from "@/app/localContext"
import { Loader2, Search, User, DollarSign, UserCheck, CreditCard, Building2, FileText } from "lucide-react"

interface SaleFormProps {
  sale?: Sale | null
  onSuccess: () => void
  onCancel: () => void
}

export function SaleForm({ sale, onSuccess, onCancel }: SaleFormProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [clientSearchTerm, setClientSearchTerm] = useState("")
  const [isSearchingClients, setIsSearchingClients] = useState(false)
  const [products, setProducts] = useState<SaleProduct[]>([])
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [formData, setFormData] = useState<Partial<Sale>>({
    clientId: sale?.clientId || null,
    status: sale?.status || "cotizacion",
    estimatedTotal: sale?.estimatedTotal || 0,
    finalTotal: sale?.finalTotal || 0,
    observations: sale?.observations || "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingClients, setIsLoadingClients] = useState(true)
  const [error, setError] = useState("")
  const { formatCurrency } = useLocale()

  // Cargar detalles de la venta si estamos editando
  useEffect(() => {
    const loadSaleDetails = async () => {
      if (sale?.id) {
        setIsLoadingDetails(true)
        try {
          const details = await apiClient.getSaleDetails(sale.id)
          if (details) {
            // Convertir SaleDetails a SaleProducts
            // El backend devuelve FinalPrice y SuggestedPrice como precios por unidad
            const saleProducts: SaleProduct[] = details.map((detail: SaleDetail) => ({
              id: detail.id,
              productId: detail.productId || "",
              quantity: detail.quantity,
              suggestedPrice: detail.suggestedPrice || 0, // Ya es precio por unidad
              finalPrice: detail.finalPrice || 0, // Ya es precio por unidad
              product: detail.product,
            }))
            setProducts(saleProducts)
          }
        } catch (error) {
          console.error("Error loading sale details:", error)
        } finally {
          setIsLoadingDetails(false)
        }
      }
    }
    loadSaleDetails()
  }, [sale?.id])

  // Cargar clientes iniciales y búsqueda con debounce
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoadingClients(true)
        setIsSearchingClients(true)

        const response = await apiClient.getClients({
          page: 1,
          pageSize: 100,
          searchTerm: clientSearchTerm,
          sortBy: "name",
          sortDescending: false,
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

    const timeoutId = setTimeout(fetchClients, clientSearchTerm ? 800 : 0)
    return () => clearTimeout(timeoutId)
  }, [clientSearchTerm])

  // Calcular workPackage cost por producto
  const calculateWorkPackageCost = (product: any): number => {
    if (!product?.workPackage || !product.workPackagePerHour) return 0
    
    const workPackage = product.workPackage
    const workPackagePerHour = product.workPackagePerHour
    
    if (workPackage.calculationType === "Fixed") {
      return workPackage.value || 0
    } else if (workPackage.calculationType === "Multiply") {
      return (workPackage.value || 0) * workPackagePerHour
    }
    return 0
  }

  // Calcular totales cuando cambian los productos
  useEffect(() => {
    const totalEstimated = products.reduce((sum, p) => {
      const unitPrice = p.suggestedPrice || 0
      const workPackageCost = calculateWorkPackageCost(p.product)
      return sum + (unitPrice + workPackageCost) * p.quantity
    }, 0)
    
    const totalFinal = products.reduce((sum, p) => {
      const unitPrice = p.finalPrice || 0
      const workPackageCost = calculateWorkPackageCost(p.product)
      return sum + (unitPrice + workPackageCost) * p.quantity
    }, 0)

    setFormData((prev) => ({
      ...prev,
      estimatedTotal: totalEstimated,
      finalTotal: totalFinal,
    }))
  }, [products])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const saleData = {
        ...formData,
        products: products.map((p) => ({
          productId: p.productId,
          quantity: p.quantity,
          suggestedPrice: p.suggestedPrice,
          finalPrice: p.finalPrice,
        })),
      }

      if (sale?.id) {
        await apiClient.updateSale(sale.id, { ...saleData, id: sale.id })
      } else {
        await apiClient.createSale(saleData)
      }
      onSuccess()
    } catch (err) {
      setError("Error al guardar la venta. Por favor, intenta de nuevo.")
      console.error("Error saving sale:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof Partial<Sale>, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Limpiar búsqueda cuando se selecciona un cliente
    if (field === "clientId") {
      setClientSearchTerm("")
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
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
            {/* Información General */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cliente (Opcional) */}
              <div className="lg:col-span-2">
                <div className="bg-card rounded-xl border border-border p-4 shadow-sm h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <UserCheck className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-card-foreground">Cliente (Opcional)</h3>
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
                        <Label className="text-sm font-medium text-card-foreground mb-2 block">
                          Cliente Seleccionado
                        </Label>
                        <Select
                          value={formData.clientId || "none"}
                          onValueChange={(value) => handleChange("clientId", value === "none" ? null : value)}
                        >
                          <SelectTrigger className="h-12 border-border focus:border-primary focus:ring-primary bg-input text-foreground">
                            <SelectValue placeholder="Selecciona un cliente (opcional)" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            <SelectItem value="none">Sin cliente</SelectItem>
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

              {/* Estado */}
              <div>
                <div className="bg-card rounded-xl border border-border p-4 shadow-sm h-full">
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
              </div>
            </div>

            {/* Observaciones */}
            <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">Observaciones</h3>
              </div>
              <Textarea
                placeholder="Ingresa observaciones adicionales sobre la venta..."
                value={formData.observations || ""}
                onChange={(e) => handleChange("observations", e.target.value)}
                className="min-h-[100px] resize-none"
                rows={4}
              />
            </div>

            {/* Productos en la Venta */}
            {isLoadingDetails ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
              </Card>
            ) : (
              <SaleProductsList products={products} onProductsChange={setProducts} />
            )}

            {/* Resumen de Totales */}
            <div className="bg-primary/10 rounded-xl border-2 border-primary/20 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Total Estimado
                  </Label>
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(formData.estimatedTotal || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Suma de precios sugeridos
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">Total Final</Label>
                  <div className="text-2xl font-bold">
                    {formatCurrency(formData.finalTotal || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Suma de precios finales
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">Diferencia</Label>
                  <div
                    className={`text-2xl font-bold ${
                      (formData.finalTotal || 0) - (formData.estimatedTotal || 0) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatCurrency((formData.finalTotal || 0) - (formData.estimatedTotal || 0))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Diferencia entre final y estimado
                  </p>
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
                disabled={isLoading || isLoadingClients || isLoadingDetails}
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
