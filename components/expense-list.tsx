"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { apiClient } from "@/lib/api"
import { Search, Plus, Edit, Trash2, Receipt, Calendar, DollarSign, TrendingUp, TrendingDown } from "lucide-react"

interface Expense {
  Id: string
  Description: string
  Amount: number
  ExpenseDate: string
  Category: string
}

interface ExpenseListProps {
  onEdit: (expense: Expense) => void
  onAdd: () => void
  refreshTrigger: number
}

const categoryColors: Record<string, string> = {
  Materiales: "bg-blue-100 text-blue-800",
  Electricidad: "bg-yellow-100 text-yellow-800",
  Mantenimiento: "bg-red-100 text-red-800",
  Herramientas: "bg-green-100 text-green-800",
  Software: "bg-purple-100 text-purple-800",
  Marketing: "bg-pink-100 text-pink-800",
  Transporte: "bg-indigo-100 text-indigo-800",
  Oficina: "bg-gray-100 text-gray-800",
  Servicios: "bg-orange-100 text-orange-800",
  Otros: "bg-slate-100 text-slate-800",
}

export function ExpenseList({ onEdit, onAdd, refreshTrigger }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [deleteExpense, setDeleteExpense] = useState<Expense | null>(null)

  const fetchExpenses = async () => {
    try {
      setIsLoading(true)
      const data = await apiClient.getExpenses()
      setExpenses(data)
      setFilteredExpenses(data)
    } catch (error) {
      console.error("Error fetching expenses:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [refreshTrigger])

  useEffect(() => {
    const filtered = expenses.filter(
      (expense) =>
        (expense.Description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (expense.Category || "").toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredExpenses(filtered)
  }, [searchTerm, expenses])

  const handleDelete = async (expense: Expense) => {
    try {
      await apiClient.deleteExpense(expense.Id)
      await fetchExpenses()
      setDeleteExpense(null)
    } catch (error) {
      console.error("Error deleting expense:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.Amount, 0)
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthlyExpenses = expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.ExpenseDate)
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
    })
    .reduce((sum, expense) => sum + expense.Amount, 0)

  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
  const lastMonthExpenses = expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.ExpenseDate)
      return expenseDate.getMonth() === lastMonth && expenseDate.getFullYear() === lastMonthYear
    })
    .reduce((sum, expense) => sum + expense.Amount, 0)

  const monthlyChange = lastMonthExpenses > 0 ? ((monthlyExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Histórico</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gastos del Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Mes actual</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cambio Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold flex items-center gap-1 ${monthlyChange >= 0 ? "text-red-600" : "text-green-600"}`}
            >
              {monthlyChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {Math.abs(monthlyChange).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">vs mes anterior</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Gastos</CardTitle>
              <CardDescription>Registro de gastos y costos operativos del negocio</CardDescription>
            </div>
            <Button onClick={onAdd} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Gasto
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar gastos por descripción o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredExpenses.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "No se encontraron gastos que coincidan con tu búsqueda." : "No hay gastos registrados."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses
                    .sort((a, b) => new Date(b.ExpenseDate).getTime() - new Date(a.ExpenseDate).getTime())
                    .map((expense) => (
                      <TableRow key={expense.Id}>
                        <TableCell>
                          <div>
                            <p className="font-medium line-clamp-2">{expense.Description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={categoryColors[expense.Category] || categoryColors.Otros}>
                            {expense.Category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{formatDate(expense.ExpenseDate)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 font-medium">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            <span>{(expense.Amount || 0).toFixed(2)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => onEdit(expense)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setDeleteExpense(expense)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteExpense} onOpenChange={() => setDeleteExpense(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente este gasto del registro.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteExpense && handleDelete(deleteExpense)}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
