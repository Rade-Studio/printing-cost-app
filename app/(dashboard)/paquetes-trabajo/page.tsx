"use client"

import { useState } from "react"
import { WorkPackageList } from "@/components/workPackage/work-package-list"
import { WorkPackageForm } from "@/components/workPackage/work-package-form"
import { WorkPackage } from "@/lib/types"

export default function PaquetesTrabajoPage() {
  const [view, setView] = useState<"list" | "form">("list")
  const [editingWorkPackage, setEditingWorkPackage] = useState<WorkPackage | undefined>(undefined)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleAdd = () => {
    setEditingWorkPackage(undefined)
    setView("form")
  }

  const handleEdit = (workPackage: WorkPackage) => {
    setEditingWorkPackage(workPackage)
    setView("form")
  }

  const handleSuccess = () => {
    setView("list")
    setEditingWorkPackage(undefined)
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleCancel = () => {
    setView("list")
    setEditingWorkPackage(undefined)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Paquetes de Trabajo</h1>
        <p className="text-muted-foreground">Configura los costos de mano de obra y servicios adicionales</p>
      </div>

      {view === "list" ? (
        <WorkPackageList onEdit={handleEdit} onAdd={handleAdd} refreshTrigger={refreshTrigger} />
      ) : (
        <WorkPackageForm workPackage={editingWorkPackage} onSuccess={handleSuccess} onCancel={handleCancel} />
      )}
    </div>
  )
}
