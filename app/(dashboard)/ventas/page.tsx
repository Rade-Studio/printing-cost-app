"use client"

import { useEffect, useState } from "react"
import { SaleList } from "@/components/sale-list"
import { SaleForm } from "@/components/sale-form"
import { SaleDetails } from "@/components/sale-details"
import { SaleDetailForm } from "@/components/sale-detail-form"
import { apiClient } from "@/lib/api"

interface Sale {
  Id: string
  ClientId: string
  Status: string
  EstimatedTotal: number
  FinalTotal: number
}

interface SaleDetail {
  Id: string
  SaleId: string
  FilamentId: string
  ProductDescription: string
  WeightGrams: number
  PrintTimeHours: number
  Quantity: number
  Comments: string
  WorkPackagePerHour: number
  WorkPackageId: string
  MachineRateApplied: number
}

type View = "list" | "form" | "details" | "detail-form"

export default function VentasPage() {
  const [view, setView] = useState<View>("list")
  const [editingSale, setEditingSale] = useState<Sale | null>(null)
  const [editingDetail, setEditingDetail] = useState<SaleDetail | null>(null)
  const [selectedSaleId, setSelectedSaleId] = useState<string>("")
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleAddSale = () => {
    setEditingSale(null)
    setView("form")
  }

  const handleEditSale = (sale: Sale) => {
    setEditingSale(sale)
    setView("form")
  }

  const handleViewDetails = (saleId: string) => {
    setSelectedSaleId(saleId)
    setView("details")
  }

  const handleAddDetail = () => {
    setEditingDetail(null)
    setView("detail-form")
  }

  const handleEditDetail = (detail: SaleDetail) => {
    setEditingDetail(detail)
    setView("detail-form")
  }

  const handleSaleSuccess = () => {
    setView("list")
    setEditingSale(null)
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleDetailSuccess = () => {
    setView("details")
    setEditingDetail(null)
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleCancel = () => {
    if (view === "detail-form") {
      setView("details")
    } else {
      setView("list")
    }
    setEditingSale(null)
    setEditingDetail(null)
  }

  const handleBackToList = () => {
    setView("list")
    setSelectedSaleId("")
  }

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
        />
      )}
    </div>
  )
}
