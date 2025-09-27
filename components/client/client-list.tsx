"use client"

import { useState, useEffect, useCallback } from "react"
import type { Client } from "@/lib/types"
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
import { Edit, Trash2, Mail, Phone, MapPin } from "lucide-react"
import { PaginatedTable, TableColumn, TableAction } from "@/components/shared/paginated-table"

interface ClientListProps {
  onEdit: (client: Client) => void
  onAdd: () => void
  refreshTrigger: number
}

export function ClientList({ onEdit, onAdd, refreshTrigger }: ClientListProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [pagination, setPagination] = useState<PaginationMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [deleteClient, setDeleteClient] = useState<Client | null>(null)

  const fetchClients = useCallback(async (params: any) => {
    try {
      setIsLoading(true)
      const response = await apiClient.getClients(params)
      if (response) {
        setClients(response.data)
        setPagination(response.pagination)
      }
    } catch (error) {
      console.error("Error fetching clients:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleDelete = async (client: Client) => {
    try {
      await apiClient.deleteClient(client.id!)
      // Recargar datos después de eliminar
      fetchClients({ page: 1, pageSize: 10, searchTerm: "", sortBy: "name", sortDescending: false })
      setDeleteClient(null)
    } catch (error) {
      console.error("Error deleting client:", error)
    }
  }

  // Configuración de columnas para la tabla
  const columns: TableColumn<Client>[] = [
    {
      key: "name",
      label: "Nombre",
      sortable: true,
      render: (client) => (
        <div>
          <p className="font-medium">{client.name}</p>
        </div>
      ),
    },
    {
      key: "contact",
      label: "Contacto",
      render: (client) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <span>{client.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-3 w-3 text-muted-foreground" />
            <span>{client.phone}</span>
          </div>
        </div>
      ),
    },
    {
      key: "location",
      label: "Ubicación",
      sortable: true,
      render: (client) => (
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <div>
            <p>{client.city}</p>
            <p className="text-muted-foreground text-xs">{client.address}</p>
          </div>
        </div>
      ),
    },
  ];

  // Configuración de acciones para la tabla
  const actions: TableAction<Client>[] = [
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
      onClick: (client) => setDeleteClient(client),
      variant: "outline",
      size: "sm",
    },
  ];

  return (
    <>
      <PaginatedTable
        data={clients}
        pagination={pagination}
        isLoading={isLoading}
        title="Clientes"
        description="Gestiona tu base de datos de clientes"
        columns={columns}
        actions={actions}
        emptyStateMessage="No hay clientes registrados."
        onFetch={fetchClients}
        onAdd={onAdd}
        refreshTrigger={refreshTrigger}
        initialPageSize={10}
        pageSizeOptions={[5, 10, 20, 50]}
        searchPlaceholder="Buscar clientes por nombre, email, teléfono o ciudad..."
        defaultSortBy="name"
        defaultSortDescending={false}
      />

      <AlertDialog open={!!deleteClient} onOpenChange={() => setDeleteClient(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el cliente "{deleteClient?.name}" de la
              base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteClient && handleDelete(deleteClient)}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}