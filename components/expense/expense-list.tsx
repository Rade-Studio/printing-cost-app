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
import { Trash2, Receipt, Calendar, DollarSign, TrendingUp, TrendingDown } from "lucide-react"
import type { Expense } from "@/lib/types"
import { useLocale } from "@/app/localContext"
import { PaginatedTable, TableColumn, TableAction, TableSummaryCard } from "@/components/shared/paginated-table"

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
  Utilidad: "bg-teal-100 text-teal-800",
  Otros: "bg-slate-100 text-slate-800",
}

export function ExpenseList({ onEdit, onAdd, refreshTrigger }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [pagination, setPagination] = useState<PaginationMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [deleteExpense, setDeleteExpense] = useState<Expense | null>(null)
  const [allExpenses, setAllExpenses] = useState<Expense[]>([])
  const [hasLoadedAllExpenses, setHasLoadedAllExpenses] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { formatCurrency } = useLocale()

  const fetchExpenses = useCallback(async (params: any) => {
    try {
      setIsLoading(true)
      const response = await apiClient.getExpenses(params)
      if (response) {
        setExpenses(response.data)
        setPagination(response.pagination)
      }
    } catch (error) {
      console.error("Error fetching expenses:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Solo cargar todos los gastos una vez para las estadísticas
  const fetchAllExpenses = useCallback(async () => {
    if (hasLoadedAllExpenses) return // Evitar llamadas duplicadas
    
    try {
      const data = await apiClient.getAllExpenses()
      if (Array.isArray(data)) {
        setAllExpenses(data)
        setHasLoadedAllExpenses(true)
      } else {
        setAllExpenses([])
        setHasLoadedAllExpenses(true)
      }
    } catch (error) {
      console.error("Error fetching all expenses:", error)
      setAllExpenses([])
      setHasLoadedAllExpenses(true)
    }
  }, [hasLoadedAllExpenses])

  // Solo cargar todos los gastos cuando cambie refreshTrigger Y no se hayan cargado antes
  useEffect(() => {
    if (!hasLoadedAllExpenses) {
      fetchAllExpenses()
    }
  }, [refreshTrigger, fetchAllExpenses, hasLoadedAllExpenses])

  const handleDelete = async (expense: Expense) => {
    try {
      await apiClient.deleteExpense(expense.id!)
      // Recargar datos después de eliminar
      fetchExpenses({ page: 1, pageSize: 10, searchTerm: searchTerm, sortBy: "expensedate", sortDescending: true })
      // Actualizar las estadísticas también
      setHasLoadedAllExpenses(false) // Forzar recarga de estadísticas
      setDeleteExpense(null)
    } catch (error) {
      console.error("Error deleting expense:", error)
    }
  }

  const handleSearchChange = (term: string) => {
    setSearchTerm(term)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Función helper para cálculos seguros
  const safeCalculateTotal = (expenses: any) => {
    if (!Array.isArray(expenses)) {
      return 0
    }
    return expenses.reduce((sum, expense) => sum + (expense?.amount || 0), 0)
  }

  const safeFilterByMonth = (expenses: any, month: number, year: number) => {
    if (!Array.isArray(expenses)) {
      return []
    }
    return expenses.filter((expense) => {
      try {
        const expenseDate = new Date(expense?.expenseDate || "")
        return expenseDate.getMonth() === month && expenseDate.getFullYear() === year
      } catch (error) {
        return false
      }
    })
  }

  const totalExpenses = safeCalculateTotal(allExpenses)
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthlyExpenses = safeCalculateTotal(safeFilterByMonth(allExpenses, currentMonth, currentYear))

  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
  const lastMonthExpenses = safeCalculateTotal(safeFilterByMonth(allExpenses, lastMonth, lastMonthYear))

  const monthlyChange = lastMonthExpenses > 0 ? ((monthlyExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0

  // Configuración de columnas para la tabla
  const columns: TableColumn<Expense>[] = [
    {
      key: "description",
      label: "Descripción",
      sortable: true,
      render: (expense) => (
        <div>
          <p className="font-medium line-clamp-2">{expense.description}</p>
        </div>
      ),
    },
    {
      key: "category",
      label: "Categoría",
      sortable: true,
      render: (expense) => (
        <Badge className={categoryColors[expense.category || ""] || categoryColors.Otros}>
          {expense.category}
        </Badge>
      ),
    },
    {
      key: "expenseDate",
      label: "Fecha",
      sortable: true,
      render: (expense) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">
            {formatDate(expense.expenseDate || "")}
          </span>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Monto",
      sortable: true,
      render: (expense) => (
        <div className="flex items-center gap-1 font-medium">
          <span>{formatCurrency(expense.amount || 0)}</span>
        </div>
      ),
    },
  ];

  // Configuración de acciones para la tabla
  const actions: TableAction<Expense>[] = [
    {
      label: "Eliminar",
      icon: <Trash2 className="h-3 w-3" />,
      onClick: (expense) => setDeleteExpense(expense),
      variant: "outline",
      size: "sm",
    },
  ];

  // Tarjetas de resumen
  const summaryCards: TableSummaryCard[] = [
    {
      title: "Total de Gastos",
      value: formatCurrency(totalExpenses),
      subtitle: "Histórico",
    },
    {
      title: "Gastos del Mes",
      value: formatCurrency(monthlyExpenses),
      subtitle: "Mes actual",
    },
    {
      title: "Cambio Mensual",
      value: `${Math.abs(monthlyChange).toFixed(1)}%`,
      subtitle: "vs mes anterior",
      className: monthlyChange >= 0 ? "text-red-600" : "text-green-600",
      icon: monthlyChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />,
    },
  ];

  return (
    <>
      <PaginatedTable
        data={expenses}
        pagination={pagination}
        isLoading={isLoading}
        title="Gastos"
        description="Registro de gastos y costos operativos del negocio"
        columns={columns}
        actions={actions}
        emptyStateMessage="No hay gastos registrados."
        emptyStateIcon={<Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />}
        onFetch={fetchExpenses}
        onAdd={onAdd}
        refreshTrigger={refreshTrigger}
        initialPageSize={10}
        pageSizeOptions={[5, 10, 20, 50]}
        searchPlaceholder="Buscar gastos por descripción o categoría..."
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        defaultSortBy="expensedate"
        defaultSortDescending={true}
        summaryCards={summaryCards}
      />

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