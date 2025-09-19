"use client"

import { useState } from "react"
import { ClientList } from "@/components/client/client-list"
import { ClientForm } from "@/components/client/client-form"
import { Client } from "@/lib/types"

export default function ClientesPage() {
  const [view, setView] = useState<"list" | "form">("list")
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleAdd = () => {
    setEditingClient(null)
    setView("form")
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setView("form")
  }

  const handleSuccess = () => {
    setView("list")
    setEditingClient(null)
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleCancel = () => {
    setView("list")
    setEditingClient(null)
  }

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
