"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Search, Plus, Edit, Trash2, Briefcase, ExternalLink, ImageIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Product } from "@/lib/types"

interface ProductListProps {
  onEdit: (product: Product) => void
  onAdd: () => void
  refreshTrigger: number
}

export function ProductList({ onEdit, onAdd, refreshTrigger }: ProductListProps) {
  const [products, setProducts] = useState<Product[] | null>([])
  const [pagination, setPagination] = useState<PaginationMetadata | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null)
  const [paginationParams, setPaginationParams] = useState<PaginationRequest>({
    page: 1,
    pageSize: 5,
    searchTerm: "",
    sortBy: "name",
    sortDescending: false
  })
  const [isSearching, setIsSearching] = useState(false)

  const fetchProducts = async (params: PaginationRequest = paginationParams) => {
    try {
      setIsLoading(true)
      setIsSearching(true)
      const response = await apiClient.getProducts(params)
      if (response) {
        setProducts(response.data)
        setPagination(response.pagination)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setIsLoading(false)
      setIsSearching(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [refreshTrigger])

  // Debounced search function with intelligent delay
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
        fetchProducts(newParams)
      }
    }, 
    // Dynamic delay based on search term length and type
    searchTerm === "" ? 50 : // Very fast when clearing
    searchTerm.length < 3 ? 300 : // Medium delay for short terms
    500 // Normal delay for longer terms
    )

    return () => clearTimeout(timeoutId)
  }, [searchTerm, isSearching])

  // Handle pagination changes
  const handlePageChange = (newPage: number) => {
    const newParams = { ...paginationParams, page: newPage }
    setPaginationParams(newParams)
    fetchProducts(newParams)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    const newParams = { ...paginationParams, pageSize: newPageSize, page: 1 }
    setPaginationParams(newParams)
    fetchProducts(newParams)
  }

  const handleSortChange = (sortBy: string) => {
    const newParams = { 
      ...paginationParams, 
      sortBy, 
      sortDescending: paginationParams.sortBy === sortBy ? !paginationParams.sortDescending : false,
      page: 1
    }
    setPaginationParams(newParams)
    fetchProducts(newParams)
  }

  const handleDelete = async (product: Product) => {
    if (!product.id) {
      console.error("Product ID is undefined, cannot delete.")
      return
    }
    try {
      await apiClient.deleteProduct(product.id)
      await fetchProducts(paginationParams)
      setDeleteProduct(null)
    } catch (error) {
      console.error("Error deleting product:", error)
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
              <CardTitle>Productos</CardTitle>
              <CardDescription>Catálogo de productos para impresión 3D</CardDescription>
            </div>
            <Button onClick={onAdd} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Producto
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
                placeholder="Buscar productos por nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={isSearching}
              />
            </div>
            <div className="flex gap-2">
              <select
                value={paginationParams.sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="name">Nombre</option>
                <option value="description">Descripción</option>
                <option value="createdat">Fecha de creación</option>
                <option value="updatedat">Fecha de actualización</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSortChange(paginationParams.sortBy || "name")}
                className="px-3"
              >
                {paginationParams.sortDescending ? "↓" : "↑"}
              </Button>
            </div>
          </div>

          {products?.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm
                  ? "No se encontraron productos que coincidan con tu búsqueda."
                  : "No hay productos registrados."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products?.map((product) => (
                <Card key={product.id} className="overflow-hidden h-72 flex flex-col relative">
                  {/* Imagen en esquina superior derecha */}
                  <div className="absolute top-3 right-3 z-10">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl || "/placeholder.svg"}
                        alt={product.name}
                        className="h-12 w-12 object-cover rounded-md border-2 border-background shadow-sm"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                          e.currentTarget.nextElementSibling?.classList.remove("hidden")
                        }}
                      />
                    ) : null}
                    <div className={`h-12 w-12 bg-muted rounded-md border-2 border-background shadow-sm flex flex-col items-center justify-center ${product.imageUrl ? "hidden" : ""}`}>
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  {/* Contenido del card */}
                  <CardContent className="p-4 flex-1 flex flex-col pr-20">
                    {/* Título con espacio para la imagen */}
                    <div className="space-y-2 flex-1">
                      <h3 className="font-semibold text-base line-clamp-2 leading-tight pr-2">{product.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {product.description && product.description.length > 80 
                          ? `${product.description.substring(0, 80)}...` 
                          : product.description}
                      </p>
                    </div>

                    {/* Enlaces externos - más compactos */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {product.modelUrl && (
                        <Button variant="outline" size="sm" asChild className="text-xs h-7 px-2">
                          <a href={product.modelUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Modelo
                          </a>
                        </Button>
                      )}
                      {product.externalLink && (
                        <Button variant="outline" size="sm" asChild className="text-xs h-7 px-2">
                          <a href={product.externalLink} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Enlace
                          </a>
                        </Button>
                      )}
                    </div>

                    {/* Botones de acción - más compactos */}
                    <div className="flex justify-end gap-1 mt-3 pt-2 border-t">
                      <Button variant="outline" size="sm" onClick={() => onEdit(product)} className="h-7 w-7 p-0">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setDeleteProduct(product)} className="h-7 w-7 p-0">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Controles de paginación */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  Mostrando {((pagination.currentPage - 1) * pagination.pageSize) + 1} a{" "}
                  {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)} de{" "}
                  {pagination.totalCount} productos
                </span>
                <select
                  value={paginationParams.pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="px-2 py-1 border border-input bg-background rounded text-sm"
                >
                  <option value={6}>6 por página</option>
                  <option value={12}>12 por página</option>
                  <option value={24}>24 por página</option>
                  <option value={48}>48 por página</option>
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

      <AlertDialog open={!!deleteProduct} onOpenChange={() => setDeleteProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el producto "{deleteProduct?.name}" del
              catálogo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteProduct && handleDelete(deleteProduct)}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
