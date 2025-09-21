"use client"

import type React from "react"
import type { PrintingHistory } from "@/lib/types"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/lib/api"
import { Loader2, Plus, Edit, Trash2, History, Filter, Search } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

interface PrintingHistoryListProps {
  onEdit: (printingHistory: PrintingHistory) => void
  onAdd: () => void
  refreshTrigger: number
}

const printingTypes = [
  { value: "prototype", label: "Prototipo", color: "bg-blue-100 text-blue-800" },
  { value: "final", label: "Definitivo", color: "bg-green-100 text-green-800" },
  { value: "calibration", label: "Calibración", color: "bg-yellow-100 text-yellow-800" },
  { value: "test", label: "Prueba", color: "bg-orange-100 text-orange-800" },
  { value: "rework", label: "Retrabajo", color: "bg-red-100 text-red-800" },
  { value: "sample", label: "Muestra", color: "bg-purple-100 text-purple-800" },
  { value: "production", label: "Producción", color: "bg-indigo-100 text-indigo-800" },
  { value: "other", label: "Otro", color: "bg-gray-100 text-gray-800" }
]

export function PrintingHistoryList({ onEdit, onAdd, refreshTrigger }: PrintingHistoryListProps) {
  const [printingHistories, setPrintingHistories] = useState<PrintingHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [printerFilter, setPrinterFilter] = useState("all")
  const [filamentFilter, setFilamentFilter] = useState("all")

  const loadPrintingHistories = async () => {
    try {
      setIsLoading(true)
      const data = await apiClient.getPrintingHistory()
      setPrintingHistories(data?.toReversed() || [])
    } catch (err) {
      setError("Error al cargar el historial de impresión")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPrintingHistories()
  }, [refreshTrigger])

  const handleDelete = async (id: string) => {
    try {
      await apiClient.deletePrintingHistory(id)
      loadPrintingHistories()
    } catch (err) {
      setError("Error al eliminar el historial de impresión")
    }
  }

  const getTypeInfo = (type: string) => {
    return printingTypes.find(t => t.value === type) || { label: type, color: "bg-gray-100 text-gray-800" }
  }

  const filteredHistories = printingHistories.filter(history => {
    const matchesSearch = 
      history.filament?.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      history.filament?.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
      history.printer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      history.printer?.model.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === "all" || history.type === typeFilter
    const matchesPrinter = printerFilter === "all" || history.printerId === printerFilter
    const matchesFilament = filamentFilter === "all" || history.filamentId === filamentFilter

    return matchesSearch && matchesType && matchesPrinter && matchesFilament
  })

  const uniquePrinters = Array.from(new Set(printingHistories.map(h => h.printerId)))
    .map(id => printingHistories.find(h => h.printerId === id)?.printer)
    .filter(Boolean)

  const uniqueFilaments = Array.from(new Set(printingHistories.map(h => h.filamentId)))
    .map(id => printingHistories.find(h => h.filamentId === id)?.filament)
    .filter(Boolean)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando historial de impresión...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de Impresión
          </CardTitle>
          <CardDescription>
            Registro de todas las impresiones realizadas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>

          {/* Resumen */}
          {filteredHistories.length > 0 && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Resumen</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total de impresiones:</p>
                  <p className="font-medium">{filteredHistories.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tiempo total:</p>
                  <p className="font-medium">
                    {filteredHistories.reduce((sum, h) => sum + h.printTimeHours, 0).toFixed(1)} h
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total de filamento gastado:</p>
                  <p className="font-medium">
                    {filteredHistories.reduce((sum, h) => sum + h.valueVolumePrinted, 0).toFixed(2)} g
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tiempo promedio:</p>
                  <p className="font-medium">
                    {(filteredHistories.reduce((sum, h) => sum + h.printTimeHours, 0) / filteredHistories.length).toFixed(1)} h
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Filtros */}
          <div className="flex flex-wrap gap-4 mb-6 mt-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por filamento, impresora..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {printingTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={printerFilter} onValueChange={setPrinterFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Impresora" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las impresoras</SelectItem>
                {uniquePrinters.map((printer) => (
                  <SelectItem key={printer?.id} value={printer?.id!}>
                    {printer?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filamentFilter} onValueChange={setFilamentFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los filamentos</SelectItem>
                {uniqueFilaments.map((filament) => (
                  <SelectItem key={filament?.id} value={filament?.id!}>
                    {filament?.type} - {filament?.color}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Botón agregar */}
          <div className="flex justify-end mb-4">
            <Button onClick={onAdd} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Agregar Impresión
            </Button>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md mb-4">
              {error}
            </div>
          )}

          {/* Tabla */}
          {filteredHistories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || typeFilter !== "all" || printerFilter !== "all" || filamentFilter !== "all" 
                ? "No se encontraron impresiones con los filtros aplicados"
                : "No hay historial de impresión registrado"
              }
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Filamento</TableHead>
                    <TableHead>Impresora</TableHead>
                    <TableHead>Tiempo (h)</TableHead>
                    <TableHead>Volumen (cm³)</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistories.map((history) => {
                    const typeInfo = getTypeInfo(history.type)
                    return (
                      <TableRow key={history.id}>
                        <TableCell>
                          <Badge className={typeInfo.color}>
                            {typeInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{history.filament?.type}</div>
                            <div className="text-sm text-muted-foreground">{history.filament?.color}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{history.printer?.name}</div>
                            <div className="text-sm text-muted-foreground">{history.printer?.model}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{history.printTimeHours}</TableCell>
                        <TableCell className="font-mono">{history.valueVolumePrinted}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEdit(history)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar impresión?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Se eliminará permanentemente
                                    este registro del historial de impresión.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(history.id!)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  )
}
