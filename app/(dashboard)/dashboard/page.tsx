"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ShoppingCart, Package, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general de tu negocio de impresión 3D</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+2 desde el mes pasado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas del Mes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,450</div>
            <p className="text-xs text-muted-foreground">+15% desde el mes pasado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filamentos en Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">3 tipos diferentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancia Mensual</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$8,920</div>
            <p className="text-xs text-muted-foreground">+22% desde el mes pasado</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ventas Recientes</CardTitle>
            <CardDescription>Últimas transacciones realizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Figura decorativa</p>
                  <p className="text-sm text-muted-foreground">Cliente: Juan Pérez</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">$450</p>
                  <p className="text-sm text-muted-foreground">Hoy</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Prototipo industrial</p>
                  <p className="text-sm text-muted-foreground">Cliente: María García</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">$1,200</p>
                  <p className="text-sm text-muted-foreground">Ayer</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Repuesto automotriz</p>
                  <p className="text-sm text-muted-foreground">Cliente: Carlos López</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">$320</p>
                  <p className="text-sm text-muted-foreground">2 días</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado de Filamentos</CardTitle>
            <CardDescription>Niveles de stock actuales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">PLA Negro</p>
                  <p className="text-sm text-muted-foreground">1.75mm</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">850g</p>
                  <p className="text-sm text-muted-foreground">Disponible</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">ABS Blanco</p>
                  <p className="text-sm text-muted-foreground">1.75mm</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-yellow-600">320g</p>
                  <p className="text-sm text-muted-foreground">Bajo stock</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">PETG Transparente</p>
                  <p className="text-sm text-muted-foreground">1.75mm</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-red-600">50g</p>
                  <p className="text-sm text-muted-foreground">Crítico</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
