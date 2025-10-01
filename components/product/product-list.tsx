"use client"

import { useState, useEffect, useCallback } from "react"
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
import { Edit, Trash2, Briefcase, ExternalLink, ImageIcon } from "lucide-react"
import { Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { PaginatedTable, TableColumn, TableAction } from "@/components/shared/paginated-table"

interface ProductListProps {
  onEdit: (product: Product) => void
  onAdd: () => void
  refreshTrigger: number
}

export function ProductList({ onEdit, onAdd, refreshTrigger }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState<PaginationMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchProducts = useCallback(async (params: any) => {
    try {
      setIsLoading(true)
      const response = await apiClient.getProducts(params)
      if (response) {
        setProducts(response.data)
        setPagination(response.pagination)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleDelete = async (product: Product) => {
    if (!product.id) {
      console.error("Product ID is undefined, cannot delete.")
      return
    }
    try {
      await apiClient.deleteProduct(product.id)
      // Recargar datos después de eliminar
      fetchProducts({ page: 1, pageSize: 5, searchTerm: searchTerm, sortBy: "name", sortDescending: false })
      setDeleteProduct(null)
    } catch (error) {
      console.error("Error deleting product:", error)
    }
  }

  const handleSearchChange = (term: string) => {
    setSearchTerm(term)
  }

  // Configuración de columnas para la tabla
  const columns: TableColumn<Product>[] = [
    {
      key: "name",
      label: "Nombre",
      sortable: true,
      render: (product) => (
        <div className="flex items-center gap-3">
          {product.imageUrl ? (
            <img
              src={product.imageUrl || "/placeholder.svg"}
              alt={product.name}
              className="h-12 w-12 object-cover rounded-md border"
              onError={(e) => {
                e.currentTarget.style.display = "none"
                e.currentTarget.nextElementSibling?.classList.remove("hidden")
              }}
            />
          ) : null}
          <div className={`h-12 w-12 bg-muted rounded-md border flex items-center justify-center ${product.imageUrl ? "hidden" : ""}`}>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-base">{product.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description && product.description.length > 80 
                ? `${product.description.substring(0, 80)}...` 
                : product.description}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "links",
      label: "Enlaces",
      render: (product) => (
        <div className="flex flex-wrap gap-1">
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
      ),
    },
  ];

  // Configuración de acciones para la tabla
  const actions: TableAction<Product>[] = [
    {
      label: "Editar",
      icon: <Edit className="h-3 w-3" />,
      onClick: onEdit,
      variant: "outline",
      size: "sm",
    },
    {
      label: "Eliminar",
      icon: <Trash2 className="h-3 w-3" />,
      onClick: (product) => setDeleteProduct(product),
      variant: "outline",
      size: "sm",
    },
  ];

  return (
    <>
      <PaginatedTable
        data={products}
        pagination={pagination}
        isLoading={isLoading}
        title="Productos"
        description="Catálogo de productos para impresión 3D"
        columns={columns}
        actions={actions}
        emptyStateMessage="No hay productos registrados."
        emptyStateIcon={<Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />}
        onFetch={fetchProducts}
        onAdd={onAdd}
        refreshTrigger={refreshTrigger}
        initialPageSize={5}
        pageSizeOptions={[6, 12, 24, 48]}
        searchPlaceholder="Buscar productos por nombre o descripción..."
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        defaultSortBy="name"
        defaultSortDescending={false}
      />

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