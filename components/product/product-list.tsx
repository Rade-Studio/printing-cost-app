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
import { apiClient } from "@/lib/api"
import { Search, Plus, Edit, Trash2, Briefcase, ExternalLink, ImageIcon } from "lucide-react"
import { Product } from "@/lib/types"

interface ProductListProps {
  onEdit: (product: Product) => void
  onAdd: () => void
  refreshTrigger: number
}

export function ProductList({ onEdit, onAdd, refreshTrigger }: ProductListProps) {
  const [products, setProducts] = useState<Product[] | null>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[] | null>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null)

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const data = await apiClient.getProducts()
      setProducts(data)
      setFilteredProducts(data)
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [refreshTrigger])

  useEffect(() => {
    const filtered = products?.filter(
      (product) =>
        (product.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description || "").toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredProducts(filtered || [])
  }, [searchTerm, products])

  const handleDelete = async (product: Product) => {
    if (!product.id) {
      console.error("Product ID is undefined, cannot delete.")
      return
    }
    try {
      await apiClient.deleteProduct(product.id)
      await fetchProducts()
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
          <div className="flex items-center gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar productos por nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredProducts?.length === 0 ? (
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
              {filteredProducts?.map((product) => (
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
