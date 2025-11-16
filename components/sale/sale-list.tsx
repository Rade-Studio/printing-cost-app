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
import { Edit, Trash2 } from "lucide-react"
import type { Client, Sale, SaleDetail } from "@/lib/types"
import { useLocale } from "@/app/localContext"
import { PaginatedTable, TableColumn, TableAction } from "@/components/shared/paginated-table"

interface SaleListProps {
  onEdit: (sale: Sale) => void
  onAdd: () => void
  refreshTrigger: number
}

const statusColors = {
  cotizacion: "bg-yellow-100 text-yellow-800",
  en_proceso: "bg-blue-100 text-blue-800",
  completada: "bg-green-100 text-green-800",
  cancelada: "bg-red-100 text-red-800",
  Pending: "bg-yellow-100 text-yellow-800",
  prueba_venta: "bg-purple-100 text-purple-800",
}

const statusLabels = {
  cotizacion: "Cotización",
  en_proceso: "En Proceso",
  completada: "Completada",
  cancelada: "Cancelada",
  Pending: "Pendiente",
  prueba_venta: "Prueba de Venta",
}

export function SaleList({ onEdit, onAdd, refreshTrigger }: SaleListProps) {
  const [sales, setSales] = useState<Sale[]>([])
  const [pagination, setPagination] = useState<PaginationMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [deleteSale, setDeleteSale] = useState<Sale | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { formatCurrency } = useLocale()

  const fetchData = useCallback(async (params: any) => {
    try {
      setIsLoading(true)
      const response = await apiClient.getSales(params)
      if (response) {
        setSales(response.data)
        setPagination(response.pagination)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleDelete = async (sale: Sale) => {
    try {
      await apiClient.deleteSale(sale.id!)
      // Recargar datos después de eliminar
      fetchData({ page: 1, pageSize: 10, searchTerm: searchTerm, sortBy: "createdat", sortDescending: true })
      setDeleteSale(null)
    } catch (error) {
      console.error("Error deleting sale:", error)
    }
  }

  const handleSearchChange = (term: string) => {
    setSearchTerm(term)
  }

  // Configuración de columnas para la tabla
  const columns: TableColumn<Sale>[] = [
    {
      key: "id",
      label: "ID",
      render: (sale) => (
        <code className="text-xs bg-muted px-2 py-1 rounded">
          {sale.id ? sale.id.slice(0, 8) : "N/A"}
        </code>
      ),
    },
    {
      key: "client",
      label: "Cliente",
      render: (sale) => (
        <div>
          <p className="font-medium">{sale.client?.name || "Sin cliente"}</p>
          {sale.client?.email && (
            <p className="text-xs text-muted-foreground">{sale.client.email}</p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Estado",
      render: (sale) => (
        <Badge className={statusColors[sale.status as keyof typeof statusColors] || "bg-gray-100"}>
          {statusLabels[sale.status as keyof typeof statusLabels] || sale.status}
        </Badge>
      ),
    },
    {
      key: "estimatedTotal",
      label: "Total Estimado",
      render: (sale) => (
        <div className="flex items-center gap-1">
          <span>{formatCurrency(sale.estimatedTotal || 0)}</span>
        </div>
      ),
    },
    {
      key: "finalTotal",
      label: "Total Final",
      render: (sale) => (
        <div className="flex items-center gap-1">
          <span className="font-medium">{formatCurrency(sale.finalTotal || 0)}</span>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Fecha de Creación",
      render: (sale) => {
        const date = new Date(sale.createdAt);
        const formattedDate = date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        const formattedTime = date.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        });
        return (
          <div className="flex flex-col gap-1">
            <span>{formattedDate}</span>
            <span className="text-xs text-muted-foreground">{formattedTime}</span>
          </div>
        );
      },
    },
  ];

  // Configuración de acciones para la tabla
  const actions: TableAction<Sale>[] = [
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
      onClick: (sale) => setDeleteSale(sale),
      variant: "outline",
      size: "sm",
    },
  ];

  return (
    <>
      <PaginatedTable
        data={sales}
        pagination={pagination}
        isLoading={isLoading}
        title="Ventas"
        description="Gestiona todas las ventas y cotizaciones"
        columns={columns}
        actions={actions}
        emptyStateMessage="No hay ventas registradas."
        onFetch={fetchData}
        onAdd={onAdd}
        refreshTrigger={refreshTrigger}
        initialPageSize={10}
        pageSizeOptions={[5, 10, 20, 50]}
        searchPlaceholder="Buscar ventas por cliente, estado o ID..."
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        defaultSortBy="createdat"
        defaultSortDescending={true}
      />

      <AlertDialog open={!!deleteSale} onOpenChange={() => setDeleteSale(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la venta y todos sus detalles asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteSale && handleDelete(deleteSale)}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}