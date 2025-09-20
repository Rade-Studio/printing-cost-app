"use client"

import { useState } from "react"
import { PrinterList } from "@/components/printer/printer-list"
import { PrinterForm } from "@/components/printer/printer-form"
import { Printer } from "@/lib/types"

export default function ImpresorasPage() {
  const [view, setView] = useState<"list" | "form">("list")
  const [editingPrinter, setEditingPrinter] = useState<Printer | undefined>(undefined)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleAdd = () => {
    setEditingPrinter(undefined)
    setView("form")
  }

  const handleEdit = (printer: Printer) => {
    setEditingPrinter(printer)
    setView("form")
  }

  const handleSuccess = () => {
    setView("list")
    setEditingPrinter(undefined)
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleCancel = () => {
    setView("list")
    setEditingPrinter(undefined)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Impresoras</h1>
        <p className="text-muted-foreground">Gestiona tu inventario de impresoras 3D</p>
      </div>

      {view === "list" ? (
        <PrinterList onEdit={handleEdit} onAdd={handleAdd} refreshTrigger={refreshTrigger} />
      ) : (
        <PrinterForm printer={editingPrinter} onSuccess={handleSuccess} onCancel={handleCancel} />
      )}
    </div>
  )
}
