"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, DollarSign, Package, FileText, TrendingUp, Loader2 } from "lucide-react"
import { Sale, Quotation } from "@/lib/types"
import { useLocale } from "@/app/localContext"
import { format } from "date-fns"
import { apiClient } from "@/lib/api"

interface SaleDetailsModalProps {
  sale: Sale
  isOpen: boolean
  onClose: () => void
}

export function SaleDetailsModal({ sale, isOpen, onClose }: SaleDetailsModalProps) {
  const { formatCurrency } = useLocale()
  const [fullSale, setFullSale] = useState<Sale | null>(null)
  const [quotations, setQuotations] = useState<Map<string, Quotation>>(new Map())
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingQuotations, setIsLoadingQuotations] = useState(false)

  // Cargar venta completa con productos cuando se abre el modal
  useEffect(() => {
    if (isOpen && sale?.id) {
      setIsLoading(true)
      apiClient.getSale(sale.id, true)
        .then((loadedSale) => {
          if (loadedSale) {
            setFullSale(loadedSale)
          } else {
            setFullSale(sale) // Fallback a la venta recibida
          }
        })
        .catch((error) => {
          console.error("Error loading sale details:", error)
          setFullSale(sale) // Fallback a la venta recibida
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else if (isOpen) {
      setFullSale(sale)
    }
  }, [isOpen, sale?.id])

  // Cargar cotizaciones para cada producto
  useEffect(() => {
    const loadQuotations = async () => {
      if (!fullSale?.products || fullSale.products.length === 0) return

      setIsLoadingQuotations(true)
      const quotationsMap = new Map<string, Quotation>()

      try {
        // Obtener cotizaciones para cada producto único
        const uniqueProductIds = [...new Set(fullSale.products.map(p => p.productId).filter(Boolean))]
        
        await Promise.all(
          uniqueProductIds.map(async (productId) => {
            try {
              // Obtener la cotización más reciente para este producto
              const response = await apiClient.getQuotations({
                page: 1,
                pageSize: 1,
                productId: productId,
                sortBy: "createdAt",
                sortDescending: true
              })
              
              if (response?.data && response.data.length > 0) {
                quotationsMap.set(productId, response.data[0])
              }
            } catch (error) {
              console.error(`Error loading quotation for product ${productId}:`, error)
            }
          })
        )

        setQuotations(quotationsMap)
      } catch (error) {
        console.error("Error loading quotations:", error)
      } finally {
        setIsLoadingQuotations(false)
      }
    }

    if (fullSale && isOpen) {
      loadQuotations()
    }
  }, [fullSale, isOpen])

  if (!isOpen) return null

  const displaySale = fullSale || sale

  // Calcular ganancia total usando cotizaciones
  const totalProfit = displaySale.products?.reduce((sum, p) => {
    if (!p.productId) return sum
    
    const quotation = quotations.get(p.productId)
    if (!quotation) {
      // Si no hay cotización, usar el cálculo anterior como fallback
      const suggestedPrice = p.suggestedPrice || 0
      const finalPrice = p.finalPrice || 0
      return sum + ((finalPrice - suggestedPrice) * p.quantity)
    }

    // Dividir el costo total y valor final por la cantidad de la cotización para obtener valores por unidad
    const costPerUnit = quotation.quantity > 0 ? quotation.totalCost / quotation.quantity : 0
    const finalValuePerUnit = quotation.quantity > 0 ? quotation.finalValue / quotation.quantity : 0

    // Ganancia = (valor final de venta) - (costo por unidad de cotización * cantidad vendida)
    const finalPrice = p.finalPrice || 0
    const totalRevenue = finalPrice * p.quantity
    const totalCost = costPerUnit * p.quantity
    const profit = totalRevenue - totalCost
    
    return sum + profit
  }, 0) || 0

  // Calcular costo total de producción
  const totalProductionCost = displaySale.products?.reduce((sum, p) => {
    if (!p.productId) return sum
    
    const quotation = quotations.get(p.productId)
    if (!quotation) return sum

    // Dividir el costo total por la cantidad de la cotización para obtener costo por unidad
    const costPerUnit = quotation.quantity > 0 ? quotation.totalCost / quotation.quantity : 0
    return sum + (costPerUnit * p.quantity)
  }, 0) || 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative z-50 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background rounded-lg shadow-xl border m-4">
        <div className="sticky top-0 bg-background border-b p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Detalles de Venta</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Información General */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de Creación</p>
                    <p className="font-medium">
                      {format(new Date(displaySale.createdAt), "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                  {displaySale.observations && (
                    <div>
                      <p className="text-sm text-muted-foreground">Observaciones</p>
                      <p className="font-medium">{displaySale.observations}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Productos Vendidos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Productos Vendidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : displaySale.products && displaySale.products.length > 0 ? (
                <div className="space-y-4">
                  {displaySale.products.map((product, index) => {
                    const finalPrice = product.finalPrice || 0
                    const subtotal = finalPrice * product.quantity
                    
                    // Obtener cotización del producto
                    const quotation = product.productId ? quotations.get(product.productId) : null
                    // Dividir el costo total por la cantidad de la cotización para obtener costo por unidad
                    const productionCost = quotation && quotation.quantity > 0 
                      ? quotation.totalCost / quotation.quantity 
                      : 0
                    const totalProductionCostForProduct = productionCost * product.quantity
                    const profit = subtotal - totalProductionCostForProduct

                    return (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-base">
                              {product.product?.name || "Producto no encontrado"}
                            </h4>
                            {product.product?.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {product.product.description}
                              </p>
                            )}
                            {quotation && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Cotización: {quotation.title}
                              </p>
                            )}
                            {!quotation && product.productId && (
                              <p className="text-xs text-yellow-600 mt-1">
                                ⚠ No se encontró cotización para este producto
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-3 border-t">
                          <div>
                            <p className="text-xs text-muted-foreground">Cantidad</p>
                            <p className="font-medium">{product.quantity}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Costo Producción (unidad)</p>
                            <p className="font-medium text-orange-600">
                              {quotation ? formatCurrency(productionCost) : "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Valor Final (unidad)</p>
                            <p className="font-medium text-green-600">
                              {formatCurrency(finalPrice)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Ganancia</p>
                            <p className={`font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(profit)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Subtotal</p>
                            <p className="font-bold text-primary">
                              {formatCurrency(subtotal)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No hay productos en esta venta
                </p>
              )}
            </CardContent>
          </Card>

          {/* Resumen Financiero */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Resumen Financiero
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingQuotations ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                  <span className="text-sm text-muted-foreground">Cargando costos de producción...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Costo Total de Producción</span>
                    <span className="font-medium text-orange-600">
                      {formatCurrency(totalProductionCost)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Total Final de Venta</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(displaySale.finalTotal || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-primary/5 rounded-lg px-4">
                    <span className="font-semibold flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Ganancia Total
                    </span>
                    <span className={`font-bold text-lg ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(totalProfit)}
                    </span>
                  </div>
                  {totalProductionCost === 0 && (
                    <p className="text-xs text-yellow-600 mt-2">
                      ⚠ No se encontraron cotizaciones para calcular el costo de producción
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={onClose}>Cerrar</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

