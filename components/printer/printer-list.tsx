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
import { Search, Plus, Edit, Trash2, Package, AlertTriangle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

import { useLocale } from "@/app/localContext"
import { Printer } from "@/lib/types"

interface PrinterListProps {
  onEdit: (printer: Printer) => void
  onAdd: () => void
  refreshTrigger: number
}

export function PrinterList({ onEdit, onAdd, refreshTrigger }: PrinterListProps) {
  const [printers, setPrinters] = useState<Printer[] | null>([])
  const [pagination, setPagination] = useState<PaginationMetadata | null>(null)
  const [activePrinters, setActivePrinters] = useState<number>(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [deletePrinter, setDeletePrinter] = useState<Printer | null>(null)
  const [paginationParams, setPaginationParams] = useState<PaginationRequest>({
    page: 1,
    pageSize: 10,
    searchTerm: "",
    sortBy: "name",
    sortDescending: false
  })
  const { formatCurrency } = useLocale()

  const fetchPrinters = async (params: PaginationRequest = paginationParams) => {
    try {
      setIsLoading(true)
      const response = await apiClient.getPrinters(params)
      if (response) {
        setPrinters(response.data)
        setPagination(response.pagination)
        const activePrinters = countActivePrinters(response.data)
        setActivePrinters(activePrinters)
      }
    } catch (error) {
      console.error("Error fetching printers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPrinters()
  }, [refreshTrigger])

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const newParams = {
        ...paginationParams,
        searchTerm: searchTerm,
        page: 1 // Reset to first page when searching
      }
      setPaginationParams(newParams)
      fetchPrinters(newParams)
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const handleDelete = async (printer: Printer) => {
    if (!printer.id) {
      console.error("Printer ID is undefined, cannot delete.")
      return
    }

    try {
      await apiClient.deletePrinter(printer.id)
      await fetchPrinters(paginationParams)
      setDeletePrinter(null)
    } catch (error) {
      console.error("Error deleting printer:", error)
    }
  }

  const handlePageChange = (newPage: number) => {
    const newParams = { ...paginationParams, page: newPage }
    setPaginationParams(newParams)
    fetchPrinters(newParams)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    const newParams = { ...paginationParams, pageSize: newPageSize, page: 1 }
    setPaginationParams(newParams)
    fetchPrinters(newParams)
  }

  const handleSort = (sortBy: string) => {
    const newParams = {
      ...paginationParams,
      sortBy: sortBy,
      sortDescending: paginationParams.sortBy === sortBy ? !paginationParams.sortDescending : false,
      page: 1
    }
    setPaginationParams(newParams)
    fetchPrinters(newParams)
  }

  const countActivePrinters = (printers: Printer[] | null) => {
    return printers?.filter((p) => p.status === "active").length || 0
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Impresoras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination?.totalCount || 0}</div>
            <p className="text-xs text-muted-foreground">Cantidad de impresoras</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Impresoras Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {activePrinters}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Impresoras</CardTitle>
              <CardDescription>Gestiona tu inventario de impresoras 3D</CardDescription>
            </div>
            <Button onClick={onAdd} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nueva Impresora
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar impresoras por nombre o modelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {printers?.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm
                  ? "No se encontraron impresoras que coincidan con tu búsqueda."
                  : "No hay impresoras registradas."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center gap-2">
                        Nombre
                        {paginationParams.sortBy === "name" && (
                          <span className="text-xs">
                            {paginationParams.sortDescending ? "↓" : "↑"}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("description")}
                    >
                      <div className="flex items-center gap-2">
                        Descripción
                        {paginationParams.sortBy === "description" && (
                          <span className="text-xs">
                            {paginationParams.sortDescending ? "↓" : "↑"}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("model")}
                    >
                      <div className="flex items-center gap-2">
                        Modelo
                        {paginationParams.sortBy === "model" && (
                          <span className="text-xs">
                            {paginationParams.sortDescending ? "↓" : "↑"}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center gap-2">
                        Estado
                        {paginationParams.sortBy === "status" && (
                          <span className="text-xs">
                            {paginationParams.sortDescending ? "↓" : "↑"}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("kwhperhour")}
                    >
                      <div className="flex items-center gap-2">
                        Consumo de Energía
                        {paginationParams.sortBy === "kwhperhour" && (
                          <span className="text-xs">
                            {paginationParams.sortDescending ? "↓" : "↑"}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {printers?.map((printer) => {
                    return (
                      <TableRow key={printer.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {printer.name}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                            <p className="text-sm text-muted-foreground">{printer.description || "-"}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">
                            <p className="font-medium">{printer.model}</p>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{printer.status}</p>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{printer.kwhPerHour.toFixed(2) + " kWh"}</p>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => onEdit(printer)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setDeletePrinter(printer)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="flex items-center space-x-2">
                <p className="text-sm text-muted-foreground">
                  Mostrando {((pagination.currentPage - 1) * pagination.pageSize) + 1} a{" "}
                  {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)} de{" "}
                  {pagination.totalCount} resultados
                </p>
                <div className="flex items-center space-x-2">
                  <label htmlFor="pageSize" className="text-sm text-muted-foreground">
                    Por página:
                  </label>
                  <select
                    id="pageSize"
                    value={paginationParams.pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="h-8 w-16 rounded border border-input bg-background px-2 text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={!pagination.hasPreviousPage}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPreviousPage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNumber;
                    if (pagination.totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (pagination.currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                      pageNumber = pagination.totalPages - 4 + i;
                    } else {
                      pageNumber = pagination.currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNumber}
                        variant={pagination.currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNumber)}
                        className="h-8 w-8"
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={!pagination.hasNextPage}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deletePrinter} onOpenChange={() => setDeletePrinter(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la impresora "{deletePrinter?.name}" del inventario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletePrinter && handleDelete(deletePrinter)}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

