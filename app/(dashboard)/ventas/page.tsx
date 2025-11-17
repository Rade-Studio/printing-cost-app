"use client"

import { useState, useCallback } from "react"
import { SaleList } from "@/components/sale/sale-list"
import { SaleForm } from "@/components/sale/sale-form"
import { SaleDetailsModal } from "@/components/sale/sale-details-modal"
import { Sale } from "@/lib/types"

type View = "list" | "form"

export default function VentasPage() {
  const [view, setView] = useState<View>("list")
  const [editingSale, setEditingSale] = useState<Sale | null>(null)
  const [viewingSale, setViewingSale] = useState<Sale | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleAddSale = useCallback(() => {
    setEditingSale(null)
    setView("form")
  }, [])

  const handleViewSale = useCallback((sale: Sale) => {
    setViewingSale(sale)
  }, [])

  const handleSaleSuccess = useCallback(() => {
    setView("list")
    setEditingSale(null)
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  const handleCancel = useCallback(() => {
    setView("list")
    setEditingSale(null)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Ventas</h1>
        <p className="text-muted-foreground">Gestiona ventas, cotizaciones y calcula costos de impresión 3D</p>
      </div>

      {view === "list" && (
        <SaleList
          onView={handleViewSale}
          onAdd={handleAddSale}
          refreshTrigger={refreshTrigger}
        />
      )}

      {view === "form" && <SaleForm sale={editingSale} onSuccess={handleSaleSuccess} onCancel={handleCancel} />}

      {viewingSale && (
        <SaleDetailsModal
          isOpen={!!viewingSale}
          onClose={() => setViewingSale(null)}
          sale={viewingSale}
        />
      )}
    </div>
  )
}
