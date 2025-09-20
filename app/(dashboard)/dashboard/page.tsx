"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Package, TrendingUp, DollarSign, Activity, Printer, History, Wrench } from "lucide-react"
import { apiClient } from "@/lib/api"
import { Client, Sale, Filament, Printer as PrinterType, PrintingHistory, Expense, WorkPackage, Product } from "@/lib/types"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  
  // Datos del dashboard
  const [clients, setClients] = useState<Client[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [filaments, setFilaments] = useState<Filament[]>([])
  const [printers, setPrinters] = useState<PrinterType[]>([])
  const [printingHistory, setPrintingHistory] = useState<PrintingHistory[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [workPackages, setWorkPackages] = useState<WorkPackage[]>([])
  const [products, setProducts] = useState<Product[]>([])

  // Cargar todos los datos
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true)
        const [
          clientsData,
          salesData,
          filamentsData,
          printersData,
          printingHistoryData,
          expensesData,
          workPackagesData,
          productsData
        ] = await Promise.all([
          apiClient.getClients(),
          apiClient.getSales(),
          apiClient.getFilaments(),
          apiClient.getPrinters(),
          apiClient.getPrintingHistory(),
          apiClient.getExpenses(),
          apiClient.getWorkPackages(),
          apiClient.getProducts()
        ])

        setClients(clientsData || [])
        setSales(salesData || [])
        setFilaments(filamentsData || [])
        setPrinters(printersData || [])
        setPrintingHistory(printingHistoryData || [])
        setExpenses(expensesData || [])
        setWorkPackages(workPackagesData || [])
        setProducts(productsData || [])
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
  const totalClients = clients.length
  const totalSales = sales.length
  const totalFilaments = filaments.length
  const totalPrinters = printers.length
  const totalPrintingHistory = printingHistory.length
  const totalExpenses = expenses.length
  const totalWorkPackages = workPackages.length
  const totalProducts = products.length

  // Ventas del mes actual
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthlySales = sales.filter(sale => {
    const saleDate = new Date(sale.id || '') // Asumiendo que el ID contiene fecha o hay un campo de fecha
    return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear
  })

  // Calcular totales de ventas
  const totalSalesAmount = sales.reduce((sum, sale) => sum + (sale.finalTotal || sale.estimatedTotal || 0), 0)
  const monthlySalesAmount = monthlySales.reduce((sum, sale) => sum + (sale.finalTotal || sale.estimatedTotal || 0), 0)

  // Calcular gastos totales
  const totalExpensesAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  // Calcular ganancia
  const profit = totalSalesAmount - totalExpensesAmount

  // Filamentos con stock bajo (menos de 200g)
  const lowStockFilaments = filaments.filter(filament => filament.stockGrams < 200)

  // Impresoras activas
  const activePrinters = printers.filter(printer => printer.status === 'active')

  // Tiempo total de impresión
  const totalPrintTime = printingHistory.reduce((sum, history) => sum + history.printTimeHours, 0)

  // Volumen total impreso
  const totalVolumePrinted = printingHistory.reduce((sum, history) => sum + history.valueVolumePrinted, 0)

  // Ventas recientes (últimas 5)
  const recentSales = sales.slice(0, 5)

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
            <div className="text-3xl font-bold text-foreground">${totalSalesAmount.toLocaleString()}</div>
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
              {lowStockFilaments.length > 0 ? `${lowStockFilaments.length} con stock bajo` : 'Stock normal'}
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
            <div className="text-3xl font-bold text-foreground">${profit.toLocaleString()}</div>
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
            <div className="text-3xl font-bold text-foreground">{activePrinters.length}</div>
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
            <CardTitle className="text-sm font-semibold text-muted-foreground">Volumen Impreso</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalVolumePrinted.toFixed(0)}cm³</div>
            <p className="text-sm text-muted-foreground font-medium">Volumen total impreso</p>
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
                      <p className="text-sm text-muted-foreground">Cliente: {sale.clientName || 'Sin nombre'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        ${(sale.finalTotal || sale.estimatedTotal || 0).toLocaleString()}
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
                        <p className="text-sm text-muted-foreground">Costo: ${filament.costPerGram.toFixed(3)}/g</p>
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
                  <p className="text-2xl font-bold text-primary">{totalVolumePrinted.toFixed(0)}cm³</p>
                  <p className="text-sm text-muted-foreground">Volumen Total</p>
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
