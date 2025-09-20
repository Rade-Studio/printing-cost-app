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
import { Search, Plus, Edit, Trash2, Package, AlertTriangle } from "lucide-react"

import { useLocale } from "@/app/localContext"

interface Printer {
  id?: string
  name: string
  description: string
  model: string
  status: string
}

interface FilamentListProps {
  onEdit: (filament: Printer) => void
  onAdd: () => void
  refreshTrigger: number
}

export function PrinterList({ onEdit, onAdd, refreshTrigger }: FilamentListProps) {
  const [printers, setPrinters] = useState<Printer[] | null>([])
  const [filteredPrinters, setFilteredPrinters] = useState<Printer[] | null>([])
  const [activePrinters, setActivePrinters] = useState<number>(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [deletePrinter, setDeletePrinter] = useState<Printer | null>(null)
  const { formatCurrency } = useLocale()

  const fetchPrinters = async () => {
    try {
      setIsLoading(true)
      const data = await apiClient.getPrinters()
      const activePrinters = countActivePrinters(data)
      setActivePrinters(activePrinters)
      setPrinters(data)
      setFilteredPrinters(data)
    } catch (error) {
      console.error("Error fetching filaments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPrinters()
  }, [refreshTrigger])

  useEffect(() => {
    const filtered = printers?.filter(
      (printer) =>
        (printer.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (printer.model || "").toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredPrinters(filtered || null)
  }, [searchTerm, printers])

  const handleDelete = async (printer: Printer) => {
    if (!printer.id) {
      console.error("Printer ID is undefined, cannot delete.")
      return
    }

    try {
      await apiClient.deletePrinter(printer.id)
      await fetchPrinters()
      setDeletePrinter(null)
    } catch (error) {
      console.error("Error deleting printer:", error)
    }
  }

  const countActivePrinters = (printers: Printer[] | null) => {
    return printers?.filter((p) => p.status === "active").length || 0
  }


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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Impresoras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{printers?.length}</div>
            <p className="text-xs text-muted-foreground">Cantidad de impresoras</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Impresoras Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {activePrinters}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Impresoras</CardTitle>
              <CardDescription>Gestiona tu inventario de impresoras 3D</CardDescription>
            </div>
            <Button onClick={onAdd} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nueva Impresora
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar impresoras por nombre o modelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredPrinters?.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm
                  ? "No se encontraron impresoras que coincidan con tu búsqueda."
                  : "No hay impresoras registradas."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrinters?.map((printer) => {
                    return (
                      <TableRow key={printer.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {printer.name}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                            <p className="text-sm text-muted-foreground">{printer.description || "-"}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">
                            <p className="font-medium">{printer.model}</p>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{printer.status}</p>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => onEdit(printer)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setDeletePrinter(printer)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
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

      <AlertDialog open={!!deletePrinter} onOpenChange={() => setDeletePrinter(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la impresora "{deletePrinter?.name}" del inventario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletePrinter && handleDelete(deletePrinter)}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

