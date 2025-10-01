"use client"

import { useEffect, useState, useCallback } from "react"
import { SaleList } from "@/components/sale/sale-list"
import { SaleForm } from "@/components/sale/sale-form"
import { SaleDetails } from "@/components/sale/sale-details"
import { SaleDetailForm } from "@/components/sale/sale-detail-form"
import { Sale, SaleDetail } from "@/lib/types"

type View = "list" | "form" | "details" | "detail-form"

export default function VentasPage() {
  const [view, setView] = useState<View>("list")
  const [editingSale, setEditingSale] = useState<Sale | null>(null)
  const [editingDetail, setEditingDetail] = useState<SaleDetail | null>(null)
  const [selectedSaleId, setSelectedSaleId] = useState<string>("")
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleAddSale = useCallback(() => {
    setEditingSale(null)
    setView("form")
  }, [])

  const handleEditSale = useCallback((sale: Sale) => {
    setEditingSale(sale)
    setView("form")
  }, [])

  const handleViewDetails = useCallback((saleId: string) => {
    setSelectedSaleId(saleId)
    setView("details")
  }, [])

  const handleAddDetail = useCallback(() => {
    setEditingDetail(null)
    setView("detail-form")
  }, [])

  const handleEditDetail = useCallback((detail: SaleDetail) => {
    setEditingDetail(detail)
    setView("detail-form")
  }, [])

  const handleSaleSuccess = useCallback(() => {
    setView("list")
    setEditingSale(null)
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  const handleDetailSuccess = useCallback(() => {
    setView("details")
    setEditingDetail(null)
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  const handleCancel = useCallback(() => {
    if (view === "detail-form") {
      setView("details")
    } else {
      setView("list")
    }
    setEditingSale(null)
    setEditingDetail(null)
  }, [view])

  const handleBackToList = useCallback(() => {
    setView("list")
    setSelectedSaleId("")
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Ventas</h1>
        <p className="text-muted-foreground">Gestiona ventas, cotizaciones y calcula costos de impresión 3D</p>
      </div>

      {view === "list" && (
        <SaleList
          onEdit={handleEditSale}
          onAdd={handleAddSale}
          onViewDetails={handleViewDetails}
          refreshTrigger={refreshTrigger}
        />
      )}

      {view === "form" && <SaleForm sale={editingSale} onSuccess={handleSaleSuccess} onCancel={handleCancel} />}

      {view === "details" && (
        <SaleDetails
          saleId={selectedSaleId}
          onBack={handleBackToList}
          onAddDetail={handleAddDetail}
          onEditDetail={handleEditDetail}
          refreshTrigger={refreshTrigger}
        />
      )}

      {view === "detail-form" && (
        <SaleDetailForm
          saleId={selectedSaleId}
          detail={editingDetail}
          onSuccess={handleDetailSuccess}
          onCancel={handleCancel}
          refreshTrigger={refreshTrigger}
        />
      )}
    </div>
  )
}
