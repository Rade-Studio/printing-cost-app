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
import { Search, Plus, Edit, Trash2, Settings, DollarSign, Percent, Mail, Phone, Building } from "lucide-react"
import { useLocale } from "@/app/localContext"
import { SystemConfig } from "@/lib/types"

interface SystemConfigListProps {
  onEdit: (config: SystemConfig) => void
  onAdd: () => void
  refreshTrigger: number
}

const configInfo: Record<string, { label: string; description: string; icon: any; unit?: string; type: string }> = {
  WorkPackagePerHour: {
    label: "Tarifa de Trabajo por Hora",
    description: "Tarifa base por hora de trabajo manual",
    icon: DollarSign,
    unit: "$/hora",
    type: "currency",
  },
  MachineRatePerHour: {
    label: "Tarifa de Máquina por Hora",
    description: "Costo de operación de la impresora 3D por hora",
    icon: DollarSign,
    unit: "$/hora",
    type: "currency",
  },
  ElectricityCostPerKwh: {
    label: "Costo de Electricidad",
    description: "Precio del kWh de electricidad",
    icon: DollarSign,
    unit: "$/kWh",
    type: "currency",
  },
  DefaultProfitMargin: {
    label: "Margen de Ganancia por Defecto",
    description: "Porcentaje de ganancia aplicado a los costos",
    icon: Percent,
    unit: "%",
    type: "percentage",
  },
  MinimumOrderValue: {
    label: "Valor Mínimo de Pedido",
    description: "Monto mínimo para aceptar un pedido",
    icon: DollarSign,
    unit: "$",
    type: "currency",
  },
  CompanyName: {
    label: "Nombre de la Empresa",
    description: "Nombre que aparecerá en reportes y documentos",
    icon: Building,
    type: "text",
  },
  CompanyEmail: {
    label: "Email de la Empresa",
    description: "Email de contacto principal",
    icon: Mail,
    type: "email",
  },
  CompanyPhone: {
    label: "Teléfono de la Empresa",
    description: "Número de teléfono de contacto",
    icon: Phone,
    type: "phone",
  },
}

export function SystemConfigList({ onEdit, onAdd, refreshTrigger }: SystemConfigListProps) {
  const [configs, setConfigs] = useState<SystemConfig[] | null>([])
  const [filteredConfigs, setFilteredConfigs] = useState<SystemConfig[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [deleteConfig, setDeleteConfig] = useState<SystemConfig | null>(null)
  const { formatCurrency } = useLocale()

  const fetchConfigs = async () => {
    try {
      setIsLoading(true)
      const data = await apiClient.getSystemConfig()
      setConfigs(data || [])
      setFilteredConfigs(data || [])
    } catch (error) {
      console.error("Error fetching system configs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchConfigs()
  }, [refreshTrigger])

  useEffect(() => {
    const filtered = configs?.filter((config) => {
      const info = configInfo[config.key]
      return (
        (config.key || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (info?.label || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (config.value || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
    })
    setFilteredConfigs(filtered || [])
  }, [searchTerm, configs])

  const handleDelete = async (config: SystemConfig) => {
    if (!config.id) return
    try {
      await apiClient.deleteSystemConfig(config.id)
      await fetchConfigs()
      setDeleteConfig(null)
    } catch (error) {
      console.error("Error deleting system config:", error)
    }
  }

  const formatValue = (config: SystemConfig) => {
    const info = configInfo[config.key]
    if (!info) return config.value

    switch (info.type) {
      case "currency":
        const numValue = formatCurrency(Number.parseFloat(config.value) || 0)
        return `${numValue}`
      case "percentage":
        return `${config.value}%`
      default:
        return config.value
    }
  }

  const getConfigCategory = (key: string | undefined) => {
    if (key?.includes("Company")) return "Empresa"
    if (key?.includes("Rate") || key?.includes("Cost") || key?.includes("Margin") || key?.includes("Value")) return "Costos"
    return "General"
  }

  const groupedConfigs = filteredConfigs.reduce(
    (groups, config) => {
      const category = getConfigCategory(config.key)
      if (!groups[category]) groups[category] = []
      groups[category].push(config)
      return groups
    },
    {} as Record<string, SystemConfig[]>,
  )

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
              <CardTitle>Configuraciones del Sistema</CardTitle>
              <CardDescription>Parámetros globales para cálculos y personalización</CardDescription>
            </div>
            <Button onClick={onAdd} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nueva Configuración
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar configuraciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredConfigs.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm
                  ? "No se encontraron configuraciones que coincidan con tu búsqueda."
                  : "No hay configuraciones del sistema."}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedConfigs).map(([category, categoryConfigs]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Badge variant="outline">{category}</Badge>
                  </h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Configuración</TableHead>
                          <TableHead>Valor Actual</TableHead>
                          <TableHead>Descripción</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categoryConfigs.map((config) => {
                          const info = configInfo[config.key]
                          const IconComponent = info?.icon || Settings
                          return (
                            <TableRow key={config.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <IconComponent className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium">{info?.label || config.key}</p>
                                    <code className="text-xs text-muted-foreground">{config.key}</code>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{formatValue(config)}</div>
                              </TableCell>
                              <TableCell>
                                <p className="text-sm text-muted-foreground">
                                  {info?.description || "Sin descripción"}
                                </p>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" size="sm" onClick={() => onEdit(config)}>
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => setDeleteConfig(config)}>
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteConfig} onOpenChange={() => setDeleteConfig(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la configuración "
              {deleteConfig && configInfo[deleteConfig.key]?.label}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfig && handleDelete(deleteConfig)}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
