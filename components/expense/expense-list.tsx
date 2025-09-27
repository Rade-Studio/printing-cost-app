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
import { apiClient, PaginationRequest, PaginatedResponse, PaginationMetadata } from "@/lib/api"
import { Search, Plus, Edit, Trash2, Receipt, Calendar, DollarSign, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import type { Expense } from "@/lib/types"
import { useLocale } from "@/app/localContext"

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
  Utilidad: "bg-teal-100 text-teal-800", // Agregado categoría Utilidad según API
  Otros: "bg-slate-100 text-slate-800",
}

export function ExpenseList({ onEdit, onAdd, refreshTrigger }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[] | null>([])
  const [pagination, setPagination] = useState<PaginationMetadata | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [deleteExpense, setDeleteExpense] = useState<Expense | null>(null)
  const [paginationParams, setPaginationParams] = useState<PaginationRequest>({
    page: 1,
    pageSize: 10,
    searchTerm: "",
    sortBy: "expensedate",
    sortDescending: true
  })
  const { formatCurrency } = useLocale()
  

  const fetchExpenses = async (params: PaginationRequest = paginationParams) => {
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
  }

  useEffect(() => {
    fetchExpenses()
  }, [refreshTrigger])

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const newParams = {
        ...paginationParams,
        searchTerm: searchTerm,
        page: 1 // Reset to first page when searching
      }
      setPaginationParams(newParams)
      fetchExpenses(newParams)
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const handleDelete = async (expense: Expense) => {
    try {
      await apiClient.deleteExpense(expense.id!)
      await fetchExpenses(paginationParams)
      setDeleteExpense(null)
    } catch (error) {
      console.error("Error deleting expense:", error)
    }
  }

  const handlePageChange = (newPage: number) => {
    const newParams = { ...paginationParams, page: newPage }
    setPaginationParams(newParams)
    fetchExpenses(newParams)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    const newParams = { ...paginationParams, pageSize: newPageSize, page: 1 }
    setPaginationParams(newParams)
    fetchExpenses(newParams)
  }

  const handleSort = (sortBy: string) => {
    const newParams = {
      ...paginationParams,
      sortBy: sortBy,
      sortDescending: paginationParams.sortBy === sortBy ? !paginationParams.sortDescending : false,
      page: 1
    }
    setPaginationParams(newParams)
    fetchExpenses(newParams)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Para las estadísticas, necesitamos obtener todos los gastos (sin paginación)
  const [allExpenses, setAllExpenses] = useState<Expense[]>([])
  
  const fetchAllExpenses = async () => {
    try {
      const data = await apiClient.getAllExpenses()
      console.log("All expenses data:", data, "Type:", typeof data, "Is array:", Array.isArray(data))
      
      // Asegurar que siempre sea un array
      if (Array.isArray(data)) {
        setAllExpenses(data)
      } else {
        console.warn("API returned non-array data, setting empty array")
        setAllExpenses([])
      }
    } catch (error) {
      console.error("Error fetching all expenses:", error)
      setAllExpenses([])
    }
  }

  useEffect(() => {
    fetchAllExpenses()
  }, [refreshTrigger])

  // Función helper para cálculos seguros
  const safeCalculateTotal = (expenses: any) => {
    if (!Array.isArray(expenses)) {
      console.warn("safeCalculateTotal: expenses is not an array", expenses)
      return 0
    }
    return expenses.reduce((sum, expense) => sum + (expense?.amount || 0), 0)
  }

  const safeFilterByMonth = (expenses: any, month: number, year: number) => {
    if (!Array.isArray(expenses)) {
      console.warn("safeFilterByMonth: expenses is not an array", expenses)
      return []
    }
    return expenses.filter((expense) => {
      try {
        const expenseDate = new Date(expense?.expenseDate || "")
        return expenseDate.getMonth() === month && expenseDate.getFullYear() === year
      } catch (error) {
        console.warn("Error parsing expense date:", expense?.expenseDate)
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
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">Histórico</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gastos del Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthlyExpenses)}</div>
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

          {expenses?.length === 0 ? (
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
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("description")}
                    >
                      <div className="flex items-center gap-2">
                        Descripción
                        {paginationParams.sortBy === "description" && (
                          <span className="text-xs">
                            {paginationParams.sortDescending ? "↓" : "↑"}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("category")}
                    >
                      <div className="flex items-center gap-2">
                        Categoría
                        {paginationParams.sortBy === "category" && (
                          <span className="text-xs">
                            {paginationParams.sortDescending ? "↓" : "↑"}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("expensedate")}
                    >
                      <div className="flex items-center gap-2">
                        Fecha
                        {paginationParams.sortBy === "expensedate" && (
                          <span className="text-xs">
                            {paginationParams.sortDescending ? "↓" : "↑"}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("amount")}
                    >
                      <div className="flex items-center gap-2">
                        Monto
                        {paginationParams.sortBy === "amount" && (
                          <span className="text-xs">
                            {paginationParams.sortDescending ? "↓" : "↑"}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses?.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium line-clamp-2">{expense.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={categoryColors[expense.category || ""] || categoryColors.Otros}>
                          {expense.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {formatDate(expense.expenseDate || "")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 font-medium">
                          <span>{formatCurrency(expense.amount || 0)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {/* <Button variant="outline" size="sm" onClick={() => onEdit(expense)}>
                            <Edit className="h-3 w-3" />
                          </Button> */}
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

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="flex items-center space-x-2">
                <p className="text-sm text-muted-foreground">
                  Mostrando {((pagination.currentPage - 1) * pagination.pageSize) + 1} a{" "}
                  {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)} de{" "}
                  {pagination.totalCount} resultados
                </p>
                <div className="flex items-center space-x-2">
                  <label htmlFor="pageSize" className="text-sm text-muted-foreground">
                    Por página:
                  </label>
                  <select
                    id="pageSize"
                    value={paginationParams.pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="h-8 w-16 rounded border border-input bg-background px-2 text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={!pagination.hasPreviousPage}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPreviousPage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNumber;
                    if (pagination.totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (pagination.currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                      pageNumber = pagination.totalPages - 4 + i;
                    } else {
                      pageNumber = pagination.currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNumber}
                        variant={pagination.currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNumber)}
                        className="h-8 w-8"
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={!pagination.hasNextPage}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
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
