"use client"

import { useState } from "react"
import { SystemConfigList } from "@/components/systenConfig/system-config-list"
import { SystemConfigForm } from "@/components/systenConfig/system-config-form"
import { SystemConfig } from "@/lib/types"

export default function ConfiguracionPage() {
  const [view, setView] = useState<"list" | "form">("list")
  const [editingConfig, setEditingConfig] = useState<SystemConfig | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleAdd = () => {
    setEditingConfig(null)
    setView("form")
  }

  const handleEdit = (config: SystemConfig) => {
    setEditingConfig(config)
    setView("form")
  }

  const handleSuccess = () => {
    setView("list")
    setEditingConfig(null)
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleCancel = () => {
    setView("list")
    setEditingConfig(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configuración del Sistema</h1>
        <p className="text-muted-foreground">Parámetros globales para cálculos de costos y personalización</p>
      </div>

      {view === "list" ? (
        <SystemConfigList onEdit={handleEdit} onAdd={handleAdd} refreshTrigger={refreshTrigger} />
      ) : (
        <SystemConfigForm config={editingConfig} onSuccess={handleSuccess} onCancel={handleCancel} />
      )}
    </div>
  )
}
