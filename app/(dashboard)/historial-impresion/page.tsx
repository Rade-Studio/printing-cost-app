"use client"

import { useState } from "react"
import { PrintingHistoryList } from "@/components/printing-history/printing-history-list"
import { PrintingHistoryForm } from "@/components/printing-history/printing-history-form"
import { PrintingHistory } from "@/lib/types"

export default function HistorialImpresionPage() {
  const [view, setView] = useState<"list" | "form">("list")
  const [editingPrintingHistory, setEditingPrintingHistory] = useState<PrintingHistory | undefined>(undefined)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleAdd = () => {
    setEditingPrintingHistory(undefined)
    setView("form")
  }

  const handleEdit = (printingHistory: PrintingHistory) => {
    setEditingPrintingHistory(printingHistory)
    setView("form")
  }

  const handleSuccess = () => {
    setView("list")
    setEditingPrintingHistory(undefined)
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleCancel = () => {
    setView("list")
    setEditingPrintingHistory(undefined)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Historial de Impresión</h1>
        <p className="text-muted-foreground">Registro detallado de todas las impresiones realizadas en el sistema</p>
      </div>

      {view === "list" ? (
        <PrintingHistoryList onEdit={handleEdit} onAdd={handleAdd} refreshTrigger={refreshTrigger} />
      ) : (
        <PrintingHistoryForm 
          printingHistory={editingPrintingHistory} 
          onSuccess={handleSuccess} 
          onCancel={handleCancel}
          refreshTrigger={refreshTrigger}
        />
      )}
    </div>
  )
}
