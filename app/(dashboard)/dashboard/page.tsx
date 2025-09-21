"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Package, TrendingUp, DollarSign, Activity, Printer, History, Wrench, Weight} from "lucide-react"
import { apiClient } from "@/lib/api"
import { Filament, Printer as PrinterType, Dashboard } from "@/lib/types"
import { Loader2 } from "lucide-react"
import { useLocale } from "@/app/localContext"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  
  // Datos del dashboard
  const [filaments, setFilaments] = useState<Filament[]>([])
  const [printers, setPrinters] = useState<PrinterType[]>([])
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const { formatCurrency } = useLocale()

  // Cargar todos los datos
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true)
        const [
          filamentsData,
          printersData,
          dashboardData
        ] = await Promise.all([
          apiClient.getFilaments(),
          apiClient.getPrinters(),
          apiClient.getDashboard()
        ])

        setFilaments(filamentsData || [])
        setPrinters(printersData || [])
        setDashboard(dashboardData || null)
      } catch (err) {
        setError("Error al cargar los datos del dashboard")
        console.error("Error loading dashboard data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  // Cálculos de estadísticas
  const totalClients = dashboard?.totalClients || 0
  const totalSales = dashboard?.totalSales || 0
  const totalFilaments = dashboard?.totalFilaments || 0
  const totalPrinters = dashboard?.totalPrinters || 0
  const totalPrintingHistory = dashboard?.totalPrintingHistories || 0
  const totalProducts = dashboard?.totalProducts || 0

  // Calcular totales de ventas
  const totalSalesAmount = dashboard?.totalSalesAmount || 0

  // Calcular gastos totales
  const totalExpensesAmount = dashboard?.totalExpensesAmount || 0

  // Calcular ganancia
  const profit = dashboard?.profit || 0

  // Filamentos con stock bajo (menos de 200g)
  const lowStockFilaments = dashboard?.lowStockFilamentsCount || 0

  // Impresoras activas
  const activePrinters = dashboard?.activePrintersCount || 0

  // Tiempo total de impresión
  const totalPrintTime = dashboard?.totalPrintTimeHours || 0

  // Volumen total impreso
  const totalFilamentGramsConsump = dashboard?.totalFilamentConsumptionGrams || 0

  // Ventas recientes (últimas 5)
  const recentSales = dashboard?.recentSales || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando dashboard...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Panel de Control</h1>
        <p className="text-muted-foreground text-lg">Bienvenido a PrintCost Pro - Gestiona tu negocio de impresión 3D</p>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Clientes Registrados</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalClients}</div>
            <p className="text-sm text-muted-foreground font-medium">Clientes en la base de datos</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Ventas Totales</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{formatCurrency(totalSalesAmount)}</div>
            <p className="text-sm text-muted-foreground font-medium">{totalSales} ventas registradas</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Filamentos en Stock</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalFilaments}</div>
            <p className="text-sm text-muted-foreground font-medium">
              {lowStockFilaments > 0 ? `${lowStockFilaments} con stock bajo` : 'Stock normal'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Ganancia Neta</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{formatCurrency(profit)}</div>
            <p className="text-sm text-muted-foreground font-medium">
              {profit >= 0 ? 'Ganancia positiva' : 'Pérdida registrada'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Segunda fila de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Impresoras Activas</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Printer className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{activePrinters}</div>
            <p className="text-sm text-muted-foreground font-medium">de {totalPrinters} impresoras</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Tiempo de Impresión</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <History className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalPrintTime.toFixed(1)}h</div>
            <p className="text-sm text-muted-foreground font-medium">Tiempo total impreso</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Peso Impreso</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Weight className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalFilamentGramsConsump.toFixed(2)}g</div>
            <p className="text-sm text-muted-foreground font-medium">Total Filamento Gastado</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Productos</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Wrench className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalProducts}</div>
            <p className="text-sm text-muted-foreground font-medium">Productos en catálogo</p>
          </CardContent>
        </Card>
      </div>

      {/* Actividad Reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Ventas Recientes</CardTitle>
                <CardDescription>Últimas transacciones completadas</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSales.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No hay ventas registradas
                </div>
              ) : (
                recentSales.map((sale, index) => (
                  <div key={sale.id || index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-semibold text-foreground">Venta #{sale.id?.slice(-6) || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">Cliente: {sale.client?.name || 'Sin nombre'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        {formatCurrency(sale.finalTotal || sale.estimatedTotal || 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {sale.status === 'completed' ? 'Completada' : 
                         sale.status === 'pending' ? 'Pendiente' : 
                         sale.status === 'cancelled' ? 'Cancelada' : sale.status}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Estado de los Filamentos</CardTitle>
                <CardDescription>Niveles de stock actuales</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filaments.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No hay filamentos registrados
                </div>
              ) : (
                filaments.slice(0, 3).map((filament) => {
                  const stockStatus = filament.stockGrams < 100 ? 'critical' : 
                                    filament.stockGrams < 200 ? 'low' : 'normal'
                  const statusColor = stockStatus === 'critical' ? 'text-red-600' : 
                                    stockStatus === 'low' ? 'text-amber-600' : 'text-emerald-600'
                  const statusText = stockStatus === 'critical' ? 'Crítico' : 
                                   stockStatus === 'low' ? 'Bajo' : 'Normal'
                  
                  return (
                    <div key={filament.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-semibold text-foreground">{filament.type} {filament.color}</p>
                        <p className="text-sm text-muted-foreground">Costo: {formatCurrency(filament.costPerGram)}/g</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${statusColor}`}>{filament.stockGrams}g</p>
                        <p className={`text-sm ${statusColor}`}>{statusText}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información Adicional */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Printer className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Estado de las Impresoras</CardTitle>
                <CardDescription>Estado actual del equipo</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {printers.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No hay impresoras registradas
                </div>
              ) : (
                printers.map((printer) => {
                  const statusColor = printer.status === 'active' ? 'text-emerald-600' : 
                                    printer.status === 'maintenance' ? 'text-amber-600' : 
                                    printer.status === 'broken' ? 'text-red-600' : 'text-gray-600'
                  const statusText = printer.status === 'active' ? 'Activa' : 
                                   printer.status === 'maintenance' ? 'Mantenimiento' : 
                                   printer.status === 'broken' ? 'Dañada' : 'Inactiva'
                  
                  return (
                    <div key={printer.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-semibold text-foreground">{printer.name}</p>
                        <p className="text-sm text-muted-foreground">{printer.model}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${statusColor}`}>{statusText}</p>
                        <p className="text-sm text-muted-foreground">{printer.description}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <History className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Resumen de Impresión</CardTitle>
                <CardDescription>Estadísticas de impresión</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <p className="text-2xl font-bold text-primary">{totalPrintingHistory}</p>
                  <p className="text-sm text-muted-foreground">Impresiones Totales</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <p className="text-2xl font-bold text-primary">{totalPrintTime.toFixed(1)}h</p>
                  <p className="text-sm text-muted-foreground">Tiempo Total</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <p className="text-2xl font-bold text-primary">{totalFilamentGramsConsump.toFixed(2)}g</p>
                  <p className="text-sm text-muted-foreground">Total Filamento Gastado</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <p className="text-2xl font-bold text-primary">
                    {totalPrintingHistory > 0 ? (totalPrintTime / totalPrintingHistory).toFixed(1) : 0}h
                  </p>
                  <p className="text-sm text-muted-foreground">Promedio por Impresión</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
