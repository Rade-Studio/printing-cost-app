"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/lib/api"
import { Loader2, Receipt } from "lucide-react"

interface Expense {
  id?: string
  description: string
  amount: number
  expenseDate: string
  category: string
}

interface ExpenseFormProps {
  expense?: Expense
  onSuccess: () => void
  onCancel: () => void
}

const expenseCategories = [
  "Materiales",
  "Electricidad",
  "Mantenimiento",
  "Herramientas",
  "Software",
  "Marketing",
  "Transporte",
  "Oficina",
  "Servicios",
  "Otros",
]

export function ExpenseForm({ expense, onSuccess, onCancel }: ExpenseFormProps) {
  const [formData, setFormData] = useState<Expense>({
    description: expense?.description || "",
    amount: expense?.amount || 0,
    expenseDate: expense?.expenseDate ? expense.expenseDate.split("T")[0] : new Date().toISOString().split("T")[0],
    category: expense?.category || "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validar que se haya seleccionado una categoría
    if (!formData.category) {
      setError("Por favor, selecciona una categoría para el gasto.")
      setIsLoading(false)
      return
    }

    try {
      const expenseData = {
        ...formData,
        expenseDate: new Date(formData.expenseDate).toISOString(),
      }

      if (expense?.id) {
        await apiClient.updateExpense(expense.id, { ...expenseData, id: expense.id })
      } else {
        await apiClient.createExpense(expenseData)
      }
      onSuccess()
    } catch (err) {
      setError("Error al guardar el gasto. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof Expense, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          {expense ? "Editar Gasto" : "Nuevo Gasto"}
        </CardTitle>
        <CardDescription>
          {expense ? "Modifica la información del gasto" : "Registra un nuevo gasto del negocio"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descripción del Gasto</Label>
            <Textarea
              id="description"
              placeholder="Describe el gasto realizado..."
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleChange("amount", Number.parseFloat(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expenseDate">Fecha del Gasto</Label>
              <Input
                id="expenseDate"
                type="date"
                value={formData.expenseDate}
                onChange={(e) => handleChange("expenseDate", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading || !formData.category} 
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : expense ? (
                "Actualizar Gasto"
              ) : (
                "Registrar Gasto"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
