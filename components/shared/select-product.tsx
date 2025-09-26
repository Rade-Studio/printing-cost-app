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

export function ProductSelect({ products, formData, handleChange }: any) {
  const [search, setSearch] = useState("")
  const [filtered, setFiltered] = useState(products)

  useEffect(() => {
    setFiltered(
      products.filter((p: any) =>
        p.name.toLowerCase().includes(search.toLowerCase())
            || p.description.toLowerCase().includes(search.toLowerCase())
      )
    )
  }, [search, products])

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
                  <Input
                    placeholder="Buscar producto..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-8"
                  />
                </div>

                {filtered.length === 0 ? (
                  <div className="px-2 py-2 text-sm text-muted-foreground">
                    Sin resultados
                  </div>
                ) : (
                  filtered.map((product: any) => (
                    <SelectItem key={product.id} value={product.id || ""}>
                      {product.name} - {product.description.substring(0, 30) + "..."}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  )
}