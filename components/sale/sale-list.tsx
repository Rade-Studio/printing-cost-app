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
import { apiClient, PaginationRequest, PaginatedResponse, PaginationMetadata } from "@/lib/api"
import { Search, Plus, Edit, Trash2, Eye, DollarSign, ChevronDown, ChevronRight, Package, ChevronLeft, ChevronsLeft, ChevronsRight } from "lucide-react"
import type { Client, Sale, SaleDetail } from "@/lib/types"
import { useLocale } from "@/app/localContext"

interface SaleListProps {
  onEdit: (sale: Sale) => void
  onAdd: () => void
  onViewDetails: (saleId: string) => void
  refreshTrigger: number
}

const statusColors = {
  cotizacion: "bg-yellow-100 text-yellow-800",
  en_proceso: "bg-blue-100 text-blue-800",
  completada: "bg-green-100 text-green-800",
  cancelada: "bg-red-100 text-red-800",
  Pending: "bg-yellow-100 text-yellow-800",
  prueba_venta: "bg-purple-100 text-purple-800",
}

const statusLabels = {
  cotizacion: "Cotización",
  en_proceso: "En Proceso",
  completada: "Completada",
  cancelada: "Cancelada",
  Pending: "Pendiente",
  prueba_venta: "Prueba de Venta",
}

export function SaleList({ onEdit, onAdd, onViewDetails, refreshTrigger }: SaleListProps) {
  const [sales, setSales] = useState<Sale[] | null>([])
  const [pagination, setPagination] = useState<PaginationMetadata | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [deleteSale, setDeleteSale] = useState<Sale | null>(null)
  const [paginationParams, setPaginationParams] = useState<PaginationRequest>({
    page: 1,
    pageSize: 10,
    searchTerm: "",
    sortBy: "createdat",
    sortDescending: true
  })
  const [isSearching, setIsSearching] = useState(false)
  const { formatCurrency } = useLocale()

  const fetchData = async (params: PaginationRequest = paginationParams) => {
    try {
      setIsLoading(true)
      setIsSearching(true)
      const response = await apiClient.getSales(params)
      if (response) {
        setSales(response.data)
        setPagination(response.pagination)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
      setIsSearching(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [refreshTrigger])

  // Debounced search function with extended delay for better performance
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const trimmedSearchTerm = searchTerm.trim()
      
      // Only search if the search term has actually changed and we're not already searching
      if (trimmedSearchTerm !== paginationParams.searchTerm && !isSearching) {
        const newParams = {
          ...paginationParams,
          searchTerm: trimmedSearchTerm,
          page: 1 // Reset to first page when searching
        }
        setPaginationParams(newParams)
        fetchData(newParams)
      }
    }, 
    // Extended debounce strategy to reduce API calls:
    searchTerm === "" ? 200 : // Quick response when clearing (200ms)
    searchTerm.length < 3 ? 800 : // Short terms: 800ms delay
    searchTerm.length < 5 ? 1000 : // Medium terms: 1000ms delay  
    1200 // Long terms: 1200ms delay (1.2 seconds)
    )

    return () => clearTimeout(timeoutId)
  }, [searchTerm, isSearching])

  // Handle pagination changes
  const handlePageChange = (newPage: number) => {
    const newParams = { ...paginationParams, page: newPage }
    setPaginationParams(newParams)
    fetchData(newParams)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    const newParams = { ...paginationParams, pageSize: newPageSize, page: 1 }
    setPaginationParams(newParams)
    fetchData(newParams)
  }

  const handleSortChange = (sortBy: string) => {
    const newParams = { 
      ...paginationParams, 
      sortBy, 
      sortDescending: paginationParams.sortBy === sortBy ? !paginationParams.sortDescending : false,
      page: 1
    }
    setPaginationParams(newParams)
    fetchData(newParams)
  }

  const handleDelete = async (sale: Sale) => {
    try {
      await apiClient.deleteSale(sale.id!)
      await fetchData(paginationParams)
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
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              {isSearching ? (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              )}
              <Input
                placeholder="Buscar ventas por cliente, estado o ID... (búsqueda con delay extendido)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={isSearching}
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-xs text-muted-foreground">Buscando...</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <select
                value={paginationParams.sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="createdat">Fecha de creación</option>
                <option value="updatedat">Fecha de actualización</option>
                <option value="status">Estado</option>
                <option value="estimatedtotal">Total estimado</option>
                <option value="finaltotal">Total final</option>
                <option value="clientname">Nombre del cliente</option>
                <option value="clientemail">Email del cliente</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSortChange(paginationParams.sortBy || "createdat")}
                className="px-3"
              >
                {paginationParams.sortDescending ? "↓" : "↑"}
              </Button>
            </div>
          </div>

          {sales?.length === 0 ? (
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
                    <TableHead>Fecha de Creación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales?.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {sale.id ? sale.id.slice(0, 8) : "N/A"}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{sale.client?.name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[sale.status as keyof typeof statusColors] || "bg-gray-100"}>
                          {statusLabels[sale.status as keyof typeof statusLabels] || sale.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span>{formatCurrency(sale.estimatedTotal || 0)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{formatCurrency(sale.finalTotal || 0)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span>{sale.createdAt.slice(0, 10)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => onViewDetails(sale.id!)}>
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

          {/* Controles de paginación */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  Mostrando {((pagination.currentPage - 1) * pagination.pageSize) + 1} a{" "}
                  {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)} de{" "}
                  {pagination.totalCount} ventas
                </span>
                <select
                  value={paginationParams.pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="px-2 py-1 border border-input bg-background rounded text-sm"
                >
                  <option value={5}>5 por página</option>
                  <option value={10}>10 por página</option>
                  <option value={20}>20 por página</option>
                  <option value={50}>50 por página</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={!pagination.hasPreviousPage}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={pagination.currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="h-8 w-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={!pagination.hasNextPage}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
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
