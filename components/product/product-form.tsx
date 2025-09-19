"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient } from "@/lib/api"
import { Loader2, Briefcase, ImageIcon, FileText } from "lucide-react"

interface Product {
  id?: string
  name: string
  description: string
  modelUrl: string
  imageUrl: string
}

interface ProductFormProps {
  product?: Product
  onSuccess: () => void
  onCancel: () => void
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState<Product>({
    name: product?.name || "",
    description: product?.description || "",
    modelUrl: product?.modelUrl || "",
    imageUrl: product?.imageUrl || "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      if (product?.id) {
        await apiClient.updateProduct(product.id, { ...formData, Id: product.id })
      } else {
        await apiClient.createProduct(formData)
      }
      onSuccess()
    } catch (err) {
      setError("Error al guardar el producto. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof Product, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          {product ? "Editar Producto" : "Nuevo Producto"}
        </CardTitle>
        <CardDescription>
          {product ? "Modifica la información del producto" : "Agrega un nuevo producto a tu catálogo de impresión 3D"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Producto</Label>
            <Input
              id="name"
              type="text"
              placeholder="Ej: Figura decorativa, Prototipo funcional, Repuesto automotriz"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describe las características, dimensiones, uso previsto y cualquier detalle relevante del producto..."
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              URL de la Imagen
            </Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://ejemplo.com/imagen-del-producto.jpg"
              value={formData.imageUrl}
              onChange={(e) => handleChange("imageUrl", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              URL de una imagen que muestre el producto terminado o el diseño
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="modelUrl" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              URL del Modelo 3D
            </Label>
            <Input
              id="modelUrl"
              type="url"
              placeholder="https://ejemplo.com/modelo.stl"
              value={formData.modelUrl}
              onChange={(e) => handleChange("modelUrl", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              URL del archivo STL, OBJ u otro formato de modelo 3D para impresión
            </p>
          </div>

          {/* Vista previa de imagen */}
          {formData.imageUrl && (
            <div className="space-y-2">
              <Label>Vista Previa de la Imagen</Label>
              <div className="border rounded-lg p-4 bg-muted">
                <img
                  src={formData.imageUrl || "/placeholder.svg"}
                  alt="Vista previa del producto"
                  className="max-w-full h-32 object-contain mx-auto rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              </div>
            </div>
          )}

          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : product ? (
                "Actualizar Producto"
              ) : (
                "Crear Producto"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
