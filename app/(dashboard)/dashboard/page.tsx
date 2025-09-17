"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Package, TrendingUp, DollarSign, Activity } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-lg">Welcome to PrintCost Pro - Manage your 3D printing business</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Active Clients</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">24</div>
            <p className="text-sm text-emerald-600 font-medium">+2 from last month</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Monthly Sales</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">$12,450</div>
            <p className="text-sm text-emerald-600 font-medium">+15% from last month</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Filaments in Stock</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">18</div>
            <p className="text-sm text-muted-foreground font-medium">3 different types</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Monthly Profit</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">$8,920</div>
            <p className="text-sm text-emerald-600 font-medium">+22% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Recent Sales</CardTitle>
                <CardDescription>Latest transactions completed</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-semibold text-foreground">Decorative Figure</p>
                  <p className="text-sm text-muted-foreground">Client: Juan Pérez</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">$450</p>
                  <p className="text-sm text-muted-foreground">Today</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-semibold text-foreground">Industrial Prototype</p>
                  <p className="text-sm text-muted-foreground">Client: María García</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">$1,200</p>
                  <p className="text-sm text-muted-foreground">Yesterday</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-semibold text-foreground">Automotive Part</p>
                  <p className="text-sm text-muted-foreground">Client: Carlos López</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">$320</p>
                  <p className="text-sm text-muted-foreground">2 days ago</p>
                </div>
              </div>
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
                <CardTitle className="text-lg">Filament Status</CardTitle>
                <CardDescription>Current stock levels</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-semibold text-foreground">PLA Black</p>
                  <p className="text-sm text-muted-foreground">1.75mm</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-600">850g</p>
                  <p className="text-sm text-emerald-600">Available</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-semibold text-foreground">ABS White</p>
                  <p className="text-sm text-muted-foreground">1.75mm</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-amber-600">320g</p>
                  <p className="text-sm text-amber-600">Low stock</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-semibold text-foreground">PETG Clear</p>
                  <p className="text-sm text-muted-foreground">1.75mm</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">50g</p>
                  <p className="text-sm text-red-600">Critical</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
