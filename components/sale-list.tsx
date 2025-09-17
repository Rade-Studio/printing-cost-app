"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { apiClient } from "@/lib/api"
import { Search, Plus, Edit, Trash2, Eye, DollarSign } from "lucide-react"

interface Sale {
  Id: string
  ClientId: string
  Status: string
  EstimatedTotal: number
  FinalTotal: number
  ClientName?: string
}

interface SaleListProps {
  onEdit: (sale: Sale) => void
  onAdd: () => void
  onViewDetails: (saleId: string) => void
  refreshTrigger: number
}

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800",
  InProgress: "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
}

const statusLabels = {
  Pending: "Pendiente",
  InProgress: "En Progreso",
  Completed: "Completada",
  Cancelled: "Cancelada",
}

export function SaleList({ onEdit, onAdd, onViewDetails, refreshTrigger }: SaleListProps) {
  const [sales, setSales] = useState<Sale[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [filteredSales, setFilteredSales] = useState<Sale[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [deleteSale, setDeleteSale] = useState<Sale | null>(null)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [salesData, clientsData] = await Promise.all([apiClient.getSales(), apiClient.getClients()])

      // Enriquecer ventas con nombres de clientes
      const enrichedSales = salesData.map((sale: Sale) => {
        const client = clientsData.find((c: any) => c.Id === sale.ClientId)
        return {
          ...sale,
          ClientName: client?.Name || "Cliente no encontrado",
        }
      })

      setSales(enrichedSales)
      setClients(clientsData)
      setFilteredSales(enrichedSales)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [refreshTrigger])

  useEffect(() => {
    const filtered = sales.filter(
      (sale) =>
        sale.ClientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.Status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.Id.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredSales(filtered)
  }, [searchTerm, sales])

  const handleDelete = async (sale: Sale) => {
    try {
      await apiClient.deleteSale(sale.Id)
      await fetchData()
      setDeleteSale(null)
    } catch (error) {
      console.error("Error deleting sale:", error)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Ventas</CardTitle>
              <CardDescription>Gestiona todas las ventas y cotizaciones</CardDescription>
            </div>
            <Button onClick={onAdd} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nueva Venta
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar ventas por cliente, estado o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredSales.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? "No se encontraron ventas que coincidan con tu búsqueda." : "No hay ventas registradas."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Total Estimado</TableHead>
                    <TableHead>Total Final</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => (
                    <TableRow key={sale.Id}>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{sale.Id.slice(0, 8)}...</code>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{sale.ClientName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[sale.Status as keyof typeof statusColors] || "bg-gray-100"}>
                          {statusLabels[sale.Status as keyof typeof statusLabels] || sale.Status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          <span>{(sale.EstimatedTotal || 0).toFixed(2)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">{(sale.FinalTotal || 0).toFixed(2)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => onViewDetails(sale.Id)}>
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => onEdit(sale)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setDeleteSale(sale)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteSale} onOpenChange={() => setDeleteSale(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la venta y todos sus detalles asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteSale && handleDelete(deleteSale)}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
