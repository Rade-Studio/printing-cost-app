"use client"

import { useState, useCallback } from "react"
import { ClientList } from "@/components/client/client-list"
import { ClientForm } from "@/components/client/client-form"
import { Client } from "@/lib/types"

export default function ClientesPage() {
  const [view, setView] = useState<"list" | "form">("list")
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleAdd = useCallback(() => {
    setEditingClient(undefined)
    setView("form")
  }, [])

  const handleEdit = useCallback((client: Client) => {
    setEditingClient(client)
    setView("form")
  }, [])

  const handleSuccess = useCallback(() => {
    setView("list")
    setEditingClient(undefined)
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  const handleCancel = useCallback(() => {
    setView("list")
    setEditingClient(undefined)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
        <p className="text-muted-foreground">Gestiona tu base de datos de clientes</p>
      </div>

      {view === "list" ? (
        <ClientList onEdit={handleEdit} onAdd={handleAdd} refreshTrigger={refreshTrigger} />
      ) : (
        <ClientForm client={editingClient} onSuccess={handleSuccess} onCancel={handleCancel} />
      )}
    </div>
  )
}
