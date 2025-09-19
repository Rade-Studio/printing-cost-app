"use client"

import { useState } from "react"
import { ProductList } from "@/components/product/product-list"
import { ProductForm } from "@/components/product/product-form"
import { Product } from "@/lib/types"

export default function ProductosPage() {
  const [view, setView] = useState<"list" | "form">("list")
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleAdd = () => {
    setEditingProduct(null)
    setView("form")
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setView("form")
  }

  const handleSuccess = () => {
    setView("list")
    setEditingProduct(null)
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleCancel = () => {
    setView("list")
    setEditingProduct(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Productos</h1>
        <p className="text-muted-foreground">Catálogo de productos disponibles para impresión 3D</p>
      </div>

      {view === "list" ? (
        <ProductList onEdit={handleEdit} onAdd={handleAdd} refreshTrigger={refreshTrigger} />
      ) : (
        <ProductForm product={editingProduct} onSuccess={handleSuccess} onCancel={handleCancel} />
      )}
    </div>
  )
}
