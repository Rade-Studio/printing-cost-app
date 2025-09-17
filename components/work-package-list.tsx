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
import { Search, Plus, Edit, Trash2, Briefcase, DollarSign, Clock } from "lucide-react"

interface WorkPackage {
  id: string
  name: string
  description: string
  calculationType: string
  value: number
}

interface WorkPackageListProps {
  onEdit: (workPackage: WorkPackage) => void
  onAdd: () => void
  refreshTrigger: number
}

export function WorkPackageList({ onEdit, onAdd, refreshTrigger }: WorkPackageListProps) {
  const [workPackages, setWorkPackages] = useState<WorkPackage[]>([])
  const [filteredWorkPackages, setFilteredWorkPackages] = useState<WorkPackage[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [deleteWorkPackage, setDeleteWorkPackage] = useState<WorkPackage | null>(null)

  const fetchWorkPackages = async () => {
    try {
      setIsLoading(true)
      const data = await apiClient.getWorkPackages()
      setWorkPackages(data)
      setFilteredWorkPackages(data)
    } catch (error) {
      console.error("Error fetching work packages:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkPackages()
  }, [refreshTrigger])

  useEffect(() => {
    const filtered = workPackages.filter(
      (wp) =>
        (wp.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (wp.description || "").toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredWorkPackages(filtered)
  }, [searchTerm, workPackages])

  const handleDelete = async (workPackage: WorkPackage) => {
    try {
      await apiClient.deleteWorkPackage(workPackage.id)
      await fetchWorkPackages()
      setDeleteWorkPackage(null)
    } catch (error) {
      console.error("Error deleting work package:", error)
    }
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
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Paquetes de Trabajo</CardTitle>
              <CardDescription>Configura los costos de mano de obra y servicios adicionales</CardDescription>
            </div>
            <Button onClick={onAdd} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Paquete
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar paquetes por nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredWorkPackages.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm
                  ? "No se encontraron paquetes que coincidan con tu búsqueda."
                  : "No hay paquetes de trabajo configurados."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paquete</TableHead>
                    <TableHead>Tipo de Cálculo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Ejemplo (2.5h)</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkPackages.map((wp) => (
                    <TableRow key={wp.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{wp.name}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">{wp.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={wp.calculationType === "Fixed" ? "default" : "secondary"}>
                          {wp.calculationType === "Fixed" ? (
                            <>
                              <DollarSign className="h-3 w-3 mr-1" />
                              Costo Fijo
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 mr-1" />
                              Por Horas
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          ${(wp.value || 0).toFixed(2)}
                          {wp.calculationType === "Multiply" && <span className="text-muted-foreground">/h</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-primary">
                          $
                          {wp.calculationType === "Fixed"
                            ? (wp.value || 0).toFixed(2)
                            : (2.5 * (wp.value || 0)).toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => onEdit(wp)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setDeleteWorkPackage(wp)}>
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

      <AlertDialog open={!!deleteWorkPackage} onOpenChange={() => setDeleteWorkPackage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el paquete de trabajo "
              {deleteWorkPackage?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteWorkPackage && handleDelete(deleteWorkPackage)}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
