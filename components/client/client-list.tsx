"use client"

import { useState, useEffect } from "react"
import type { Client } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Search, Plus, Edit, Trash2, Mail, Phone, MapPin, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface ClientListProps {
  onEdit: (client: Client) => void
  onAdd: () => void
  refreshTrigger: number
}

export function ClientList({ onEdit, onAdd, refreshTrigger }: ClientListProps) {
  const [clients, setClients] = useState<Client[] | null>([])
  const [pagination, setPagination] = useState<PaginationMetadata | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [deleteClient, setDeleteClient] = useState<Client | null>(null)
  const [paginationParams, setPaginationParams] = useState<PaginationRequest>({
    page: 1,
    pageSize: 10,
    searchTerm: "",
    sortBy: "name",
    sortDescending: false
  })

  const fetchClients = async (params: PaginationRequest = paginationParams) => {
    try {
      setIsLoading(true)
      const response = await apiClient.getClients(params)
      if (response) {
        setClients(response.data)
        setPagination(response.pagination)
      }
    } catch (error) {
      console.error("Error fetching clients:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
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
      fetchClients(newParams)
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const handleDelete = async (client: Client) => {
    try {
      await apiClient.deleteClient(client.id!)
      await fetchClients(paginationParams)
      setDeleteClient(null)
    } catch (error) {
      console.error("Error deleting client:", error)
    }
  }

  const handlePageChange = (newPage: number) => {
    const newParams = { ...paginationParams, page: newPage }
    setPaginationParams(newParams)
    fetchClients(newParams)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    const newParams = { ...paginationParams, pageSize: newPageSize, page: 1 }
    setPaginationParams(newParams)
    fetchClients(newParams)
  }

  const handleSort = (sortBy: string) => {
    const newParams = {
      ...paginationParams,
      sortBy: sortBy,
      sortDescending: paginationParams.sortBy === sortBy ? !paginationParams.sortDescending : false,
      page: 1
    }
    setPaginationParams(newParams)
    fetchClients(newParams)
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
              <CardTitle>Clientes</CardTitle>
              <CardDescription>Gestiona tu base de datos de clientes</CardDescription>
            </div>
            <Button onClick={onAdd} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Cliente
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar clientes por nombre, email, teléfono o ciudad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {clients?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm
                  ? "No se encontraron clientes que coincidan con tu búsqueda."
                  : "No hay clientes registrados."}
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
                      onClick={() => handleSort("email")}
                    >
                      <div className="flex items-center gap-2">
                        Contacto
                        {paginationParams.sortBy === "email" && (
                          <span className="text-xs">
                            {paginationParams.sortDescending ? "↓" : "↑"}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("city")}
                    >
                      <div className="flex items-center gap-2">
                        Ubicación
                        {paginationParams.sortBy === "city" && (
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
                  {clients?.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{client.name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span>{client.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{client.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <div>
                            <p>{client.city}</p>
                            <p className="text-muted-foreground text-xs">{client.address}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => onEdit(client)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setDeleteClient(client)}>
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

      <AlertDialog open={!!deleteClient} onOpenChange={() => setDeleteClient(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el cliente "{deleteClient?.name}" de la
              base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteClient && handleDelete(deleteClient)}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
