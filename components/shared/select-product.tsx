import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

interface ProductSelectProps {
  products: any[]
  formData: any
  handleChange: (field: any, value: any) => void
  searchTerm?: string
  onSearchChange?: (value: string) => void
  isSearching?: boolean
}

export function ProductSelect({ 
  products, 
  formData, 
  handleChange, 
  searchTerm = "", 
  onSearchChange, 
  isSearching = false 
}: ProductSelectProps) {
  const [localSearch, setLocalSearch] = useState("")
  const [filtered, setFiltered] = useState(products)

  // Usar búsqueda externa si está disponible, sino usar búsqueda local
  const currentSearch = onSearchChange ? searchTerm : localSearch
  const handleSearchChange = onSearchChange || setLocalSearch

  useEffect(() => {
    if (onSearchChange) {
      // Si hay búsqueda externa, usar todos los productos (ya filtrados por la API)
      setFiltered(products)
    } else {
      // Búsqueda local como fallback
      setFiltered(
        products.filter((p: any) =>
          p.name.toLowerCase().includes(currentSearch.toLowerCase())
              || p.description.toLowerCase().includes(currentSearch.toLowerCase())
        )
      )
    }
  }, [currentSearch, products, onSearchChange])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="product">Producto</Label>
          {products.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No hay productos disponibles. Por favor, crea uno primero.
            </div>
          ) : (
            <Select
              value={formData.productId}
              onValueChange={(value) => handleChange("productId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un producto" />
              </SelectTrigger>
              <SelectContent>
                {/* Campo de búsqueda */}
                <div className="p-2">
                  <div className="relative">
                    <Input
                      placeholder="Buscar producto... (búsqueda con delay extendido)"
                      value={currentSearch}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="h-8 pr-8"
                      disabled={isSearching}
                    />
                    {isSearching && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      </div>
                    )}
                  </div>
                </div>

                {filtered.length === 0 ? (
                  <div className="px-2 py-2 text-sm text-muted-foreground">
                    {isSearching ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span>Buscando productos...</span>
                      </div>
                    ) : (
                      "Sin resultados"
                    )}
                  </div>
                ) : (
                  <>
                    {filtered.map((product: any) => (
                      <SelectItem key={product.id} value={product.id || ""}>
                        {product.name} - {product.description.substring(0, 30) + "..."}
                      </SelectItem>
                    ))}
                    {onSearchChange && currentSearch === "" && (
                      <div className="px-2 py-1 text-xs text-muted-foreground border-t">
                        {filtered.length > 10 
                          ? `Mostrando ${filtered.length} productos disponibles.`
                          : `Mostrando los primeros ${filtered.length} productos. Busca para ver más.`
                        }
                      </div>
                    )}
                    {onSearchChange && currentSearch !== "" && isSearching && (
                      <div className="px-2 py-1 text-xs text-muted-foreground border-t">
                        <div className="flex items-center gap-1">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                          <span>Buscando más productos...</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  )
}