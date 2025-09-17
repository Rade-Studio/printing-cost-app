"use client"

import { useState } from "react"
import { FilamentList } from "@/components/filament-list"
import { FilamentForm } from "@/components/filament-form"

interface Filament {
  Id: string
  Type: string
  Color: string
  CostPerGram: number
  StockGrams: number
}

export default function FilamentosPage() {
  const [view, setView] = useState<"list" | "form">("list")
  const [editingFilament, setEditingFilament] = useState<Filament | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleAdd = () => {
    setEditingFilament(null)
    setView("form")
  }

  const handleEdit = (filament: Filament) => {
    setEditingFilament(filament)
    setView("form")
  }

  const handleSuccess = () => {
    setView("list")
    setEditingFilament(null)
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleCancel = () => {
    setView("list")
    setEditingFilament(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Filamentos</h1>
        <p className="text-muted-foreground">Gestiona tu inventario de materiales para impresión 3D</p>
      </div>

      {view === "list" ? (
        <FilamentList onEdit={handleEdit} onAdd={handleAdd} refreshTrigger={refreshTrigger} />
      ) : (
        <FilamentForm filament={editingFilament} onSuccess={handleSuccess} onCancel={handleCancel} />
      )}
    </div>
  )
}
