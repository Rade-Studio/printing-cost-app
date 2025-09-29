"use client"

import { useState, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { apiClient, PaginationRequest, PaginatedResponse, PaginationMetadata } from "@/lib/api"
import { Edit, Trash2, Package } from "lucide-react"

import { useLocale } from "@/app/localContext"
import { Printer } from "@/lib/types"
import { PaginatedTable, TableColumn, TableAction, TableSummaryCard } from "@/components/shared/paginated-table"

interface PrinterListProps {
  onEdit: (printer: Printer) => void
  onAdd: () => void
  refreshTrigger: number
}

export function PrinterList({ onEdit, onAdd, refreshTrigger }: PrinterListProps) {
  const [printers, setPrinters] = useState<Printer[]>([])
  const [pagination, setPagination] = useState<PaginationMetadata | null>(null)
  const [activePrinters, setActivePrinters] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [deletePrinter, setDeletePrinter] = useState<Printer | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { formatCurrency } = useLocale()

  const fetchPrinters = useCallback(async (params: any) => {
    try {
      setIsLoading(true)
      const response = await apiClient.getPrinters(params)
      if (response) {
        setPrinters(response.data)
        setPagination(response.pagination)
        const activePrinters = countActivePrinters(response.data)
        setActivePrinters(activePrinters)
      }
    } catch (error) {
      console.error("Error fetching printers:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleDelete = async (printer: Printer) => {
    if (!printer.id) {
      console.error("Printer ID is undefined, cannot delete.")
      return
    }

    try {
      await apiClient.deletePrinter(printer.id)
      // Recargar datos después de eliminar
      fetchPrinters({ page: 1, pageSize: 10, searchTerm: searchTerm, sortBy: "name", sortDescending: false })
      setDeletePrinter(null)
    } catch (error) {
      console.error("Error deleting printer:", error)
    }
  }

  const countActivePrinters = (printers: Printer[]) => {
    return printers?.filter((p) => p.status === "active").length || 0
  }

  const handleSearchChange = (term: string) => {
    setSearchTerm(term)
  }

  // Configuración de columnas para la tabla
  const columns: TableColumn<Printer>[] = [
    {
      key: "name",
      label: "Nombre",
      sortable: true,
      render: (printer) => (
        <div>
          <p className="font-medium">{printer.name}</p>
        </div>
      ),
    },
    {
      key: "description",
      label: "Descripción",
      sortable: true,
      render: (printer) => (
        <p className="text-sm text-muted-foreground">{printer.description || "-"}</p>
      ),
    },
    {
      key: "model",
      label: "Modelo",
      sortable: true,
      render: (printer) => (
        <Badge className="bg-green-100 text-green-800">
          <p className="font-medium">{printer.model}</p>
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Estado",
      sortable: true,
      render: (printer) => (
        <p className="font-medium">{printer.status}</p>
      ),
    },
    {
      key: "kwhPerHour",
      label: "Consumo de Energía",
      sortable: true,
      render: (printer) => (
        <p className="font-medium">{printer.kwhPerHour.toFixed(2) + " kWh"}</p>
      ),
    },
  ];

  // Configuración de acciones para la tabla
  const actions: TableAction<Printer>[] = [
    {
      label: "Editar",
      icon: <Edit className="h-3 w-3" />,
      onClick: onEdit,
      variant: "outline",
      size: "sm",
    },
    {
      label: "Eliminar",
      icon: <Trash2 className="h-3 w-3" />,
      onClick: (printer) => setDeletePrinter(printer),
      variant: "outline",
      size: "sm",
    },
  ];

  // Tarjetas de resumen
  const summaryCards: TableSummaryCard[] = [
    {
      title: "Total de Impresoras",
      value: pagination?.totalCount || 0,
      subtitle: "Cantidad de impresoras",
    },
    {
      title: "Impresoras Activas",
      value: activePrinters,
      subtitle: "En funcionamiento",
      className: "text-yellow-600",
    },
  ];


  return (
    <>
      <PaginatedTable
        data={printers}
        pagination={pagination}
        isLoading={isLoading}
        title="Impresoras"
        description="Gestiona tu inventario de impresoras 3D"
        columns={columns}
        actions={actions}
        emptyStateMessage="No hay impresoras registradas."
        emptyStateIcon={<Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />}
        onFetch={fetchPrinters}
        onAdd={onAdd}
        refreshTrigger={refreshTrigger}
        initialPageSize={10}
        pageSizeOptions={[5, 10, 20, 50]}
        searchPlaceholder="Buscar impresoras por nombre o modelo..."
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        defaultSortBy="name"
        defaultSortDescending={false}
        summaryCards={summaryCards}
      />

      <AlertDialog open={!!deletePrinter} onOpenChange={() => setDeletePrinter(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la impresora "{deletePrinter?.name}" del inventario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletePrinter && handleDelete(deletePrinter)}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

