"use client"

import { useState, useCallback } from "react"
import { ExpenseList } from "@/components/expense/expense-list"
import { ExpenseForm } from "@/components/expense/expense-form"
import { Expense } from "@/lib/types"

export default function GastosPage() {
  const [view, setView] = useState<"list" | "form">("list")
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleAdd = useCallback(() => {
    setEditingExpense(null)
    setView("form")
  }, [])

  const handleEdit = useCallback((expense: Expense) => {
    setEditingExpense(expense)
    setView("form")
  }, [])

  const handleSuccess = useCallback(() => {
    setView("list")
    setEditingExpense(null)
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  const handleCancel = useCallback(() => {
    setView("list")
    setEditingExpense(null)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gastos</h1>
        <p className="text-muted-foreground">Registro y control de gastos operativos del negocio</p>
      </div>

      {view === "list" ? (
        <ExpenseList onEdit={handleEdit} onAdd={handleAdd} refreshTrigger={refreshTrigger} />
      ) : (
        <ExpenseForm expense={editingExpense} onSuccess={handleSuccess} onCancel={handleCancel} />
      )}
    </div>
  )
}
