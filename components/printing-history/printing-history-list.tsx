"use client";

import type React from "react";
import type { PrintingHistory } from "@/lib/types";
import type { PaginationRequest, PaginatedResponse, PaginationMetadata } from "@/lib/api";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api";
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  History,
  Filter,
  Search,
  Weight,
  Lightbulb,
  Calculator,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MultiColorPicker } from "../filament/multiply-color-picker";
import { useLocale } from "@/app/localContext";

interface PrintingHistoryListProps {
  onEdit: (printingHistory: PrintingHistory) => void;
  onAdd: () => void;
  refreshTrigger: number;
}

const printingTypes = [
  {
    value: "prototype",
    label: "Prototipo",
    color: "bg-blue-100 text-blue-800",
  },
  { value: "final", label: "Definitivo", color: "bg-green-100 text-green-800" },
  {
    value: "calibration",
    label: "Calibración",
    color: "bg-yellow-100 text-yellow-800",
  },
  { value: "test", label: "Prueba", color: "bg-orange-100 text-orange-800" },
  { value: "rework", label: "Retrabajo", color: "bg-red-100 text-red-800" },
  { value: "sample", label: "Muestra", color: "bg-purple-100 text-purple-800" },
  {
    value: "production",
    label: "Producción",
    color: "bg-indigo-100 text-indigo-800",
  },
  { value: "other", label: "Otro", color: "bg-gray-100 text-gray-800" },
];

export function PrintingHistoryList({
  onEdit,
  onAdd,
  refreshTrigger,
}: PrintingHistoryListProps) {
  const [printingHistories, setPrintingHistories] = useState<PrintingHistory[]>([]);
  const [pagination, setPagination] = useState<PaginationMetadata | null>(null);
  const [paginationParams, setPaginationParams] = useState<PaginationRequest>({
    page: 1,
    pageSize: 10,
    searchTerm: "",
    sortBy: "createdAt",
    sortDescending: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [printerFilter, setPrinterFilter] = useState("all");
  const [filamentFilter, setFilamentFilter] = useState("all");
  const [selectedColor, setSelectedColor] = useState<string[]>([]);
  const { formatCurrency } = useLocale();

  const loadPrintingHistories = async (params: PaginationRequest = paginationParams) => {
    try {
      setIsLoading(true);
      const response = await apiClient.getPrintingHistory(params);
      if (response) {
        setPrintingHistories(response.data || []);
        setPagination(response.pagination || null);
      }
    } catch (err) {
      setError("Error al cargar el historial de impresión");
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce para búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const newParams = {
        ...paginationParams,
        searchTerm: searchTerm,
        page: 1, // Reset a la primera página al buscar
      };
      setPaginationParams(newParams);
      loadPrintingHistories(newParams);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Aplicar filtros locales cuando cambien
  useEffect(() => {
    // Los filtros de tipo, impresora y colores se aplican localmente
    // ya que la paginación del servidor maneja la búsqueda de texto
  }, [typeFilter, printerFilter, selectedColor]);

  useEffect(() => {
    loadPrintingHistories();
  }, [refreshTrigger]);

  const handlePageChange = (newPage: number) => {
    const newParams = { ...paginationParams, page: newPage };
    setPaginationParams(newParams);
    loadPrintingHistories(newParams);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    const newParams = { ...paginationParams, pageSize: newPageSize, page: 1 };
    setPaginationParams(newParams);
    loadPrintingHistories(newParams);
  };

  const handleSort = (field: string) => {
    const newParams = {
      ...paginationParams,
      sortBy: field,
      sortDescending: paginationParams.sortBy === field ? !paginationParams.sortDescending : true,
      page: 1,
    };
    setPaginationParams(newParams);
    loadPrintingHistories(newParams);
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.deletePrintingHistory(id);
      loadPrintingHistories(paginationParams);
    } catch (err) {
      setError("Error al eliminar el historial de impresión");
    }
  };

  const getTypeInfo = (type: string) => {
    return (
      printingTypes.find((t) => t.value === type) || {
        label: type,
        color: "bg-gray-100 text-gray-800",
      }
    );
  };

  // Los filtros ahora se manejan en el servidor, pero mantenemos algunos filtros locales
  const filteredHistories = printingHistories.filter((history) => {
    const matchesType = typeFilter === "all" || history.type === typeFilter;
    const matchesPrinter =
      printerFilter === "all" || history.printerId === printerFilter;

    const matchesColor =
      selectedColor.length === 0 ||
      selectedColor.some((c) =>
        history.filamentConsumptions?.some((fc) => {
          const color = fc.filament?.color;
          return typeof color === 'string' 
            ? color.split(",").some((colorItem) => colorItem.toLowerCase().includes(c.toLowerCase()))
            : false;
        })
      );

    return matchesType && matchesPrinter && matchesColor;
  });

  const uniquePrinters = Array.from(
    new Set(printingHistories.map((h) => h.printerId))
  )
    .map((id) => printingHistories.find((h) => h.printerId === id)?.printer)
    .filter(Boolean);

  const uniqueColors = Array.from(
    new Set(
      printingHistories
        .map((h) =>
          h.filamentConsumptions
            ?.map((fc) => {
              const color = fc.filament?.color;
              return typeof color === 'string' ? color.split(",") : [];
            })
            .flat()
        )
        .flat()
    )
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando historial de impresión...</span>
      </div>
    );
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
              <h3 className="font-semibold mb-2">Resumen de la Página</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Impresiones en esta página:</p>
                  <p className="font-medium">{filteredHistories.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total registros:</p>
                  <p className="font-medium">{pagination?.totalCount || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Página actual:</p>
                  <p className="font-medium">{pagination?.currentPage || 1} de {pagination?.totalPages || 1}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tiempo total (página):</p>
                  <p className="font-medium">
                    {filteredHistories
                      .reduce((sum, h) => sum + h.printTimeHours, 0)
                      .toFixed(1)}{" "}
                    h
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Filtros */}
          <div className="space-y-4 mb-6 mt-4">
            {/* Fila 1: Búsqueda y filtros básicos */}
            <div className="flex flex-wrap gap-4">
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
            </div>
            
            {/* Fila 2: Filtro por colores */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Filtrar por colores de filamento</span>
                {selectedColor.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedColor.length} seleccionado{selectedColor.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              <MultiColorPicker
                value={selectedColor}
                onChange={setSelectedColor}
                availableColors={uniqueColors.filter((color): color is string => typeof color === 'string')}
                limitSelection={10}
              />
              {selectedColor.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedColor([])}
                    className="text-xs"
                  >
                    Limpiar filtros
                  </Button>
                  <span className="text-xs text-gray-500">
                    Mostrando impresiones que contengan alguno de los colores seleccionados
                  </span>
                </div>
              )}
            </div>
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
              {searchTerm ||
              typeFilter !== "all" ||
              printerFilter !== "all" ||
              filamentFilter !== "all"
                ? "No se encontraron impresiones con los filtros aplicados"
                : "No hay historial de impresión registrado"}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('type')}
                    >
                      <div className="flex items-center gap-2">
                        Tipo
                        {paginationParams.sortBy === 'type' && (
                          <span className="text-xs">
                            {paginationParams.sortDescending ? '↓' : '↑'}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Filamento</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('printerId')}
                    >
                      <div className="flex items-center gap-2">
                        Impresora
                        {paginationParams.sortBy === 'printerId' && (
                          <span className="text-xs">
                            {paginationParams.sortDescending ? '↓' : '↑'}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('printTimeHours')}
                    >
                      <div className="flex items-center gap-2">
                        Tiempo (h)
                        {paginationParams.sortBy === 'printTimeHours' && (
                          <span className="text-xs">
                            {paginationParams.sortDescending ? '↓' : '↑'}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('totalGramsUsed')}
                    >
                      <div className="flex items-center gap-2">
                        Gramos (cm³)
                        {paginationParams.sortBy === 'totalGramsUsed' && (
                          <span className="text-xs">
                            {paginationParams.sortDescending ? '↓' : '↑'}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('totalCost')}
                    >
                      <div className="flex items-center gap-2">
                        Costos
                        {paginationParams.sortBy === 'totalCost' && (
                          <span className="text-xs">
                            {paginationParams.sortDescending ? '↓' : '↑'}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistories.map((history) => {
                    const typeInfo = getTypeInfo(history.type);
                    return (
                      <TableRow key={history.id}>
                        <TableCell>
                          <Badge className={typeInfo.color}>
                            {typeInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="flex items-center justify-between w-full">
                              <div className="flex gap-1 ml-2">
                                {history.filamentConsumptions &&
                                  Array.from(
                                    new Set(
                                      history.filamentConsumptions
                                        .map((fc) => fc.filament?.color)
                                        .filter(Boolean)
                                        .flatMap((colorStr) => {
                                          return typeof colorStr === 'string' ? colorStr.split(",") : [];
                                        })
                                    )
                                  ).slice(0, 4).map((c: string, i: number) => (
                                    <div
                                      key={i}
                                      className="w-4 h-4 rounded-full border"
                                      style={{ backgroundColor: c }}
                                    />
                                  ))}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {history.printer?.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {history.printer?.model}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">
                          {history.printTimeHours}
                        </TableCell>
                        <TableCell className="font-mono">
                          {history.totalGramsUsed}
                        </TableCell>
                        <TableCell className="font-mono">
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <Weight className="h-3 w-3 text-muted-foreground" />
                              <span>
                                {formatCurrency(history.totalFilamentCost || 0)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Lightbulb className="h-3 w-3 text-muted-foreground" />
                              <span>
                                {formatCurrency(history.totalEnergyCost || 0)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calculator className="h-3 w-3 text-muted-foreground" />
                              <span>
                                {formatCurrency(history.totalCost || 0)}
                              </span>
                            </div>
                          </div>
                        </TableCell>
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
                                  <AlertDialogTitle>
                                    ¿Eliminar impresión?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Se
                                    eliminará permanentemente este registro del
                                    historial de impresión.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Cancelar
                                  </AlertDialogCancel>
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
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Controles de Paginación */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  Mostrando {((pagination.currentPage - 1) * (paginationParams.pageSize || 10)) + 1} a {Math.min(pagination.currentPage * (paginationParams.pageSize || 10), pagination.totalCount)} de {pagination.totalCount} registros
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const startPage = Math.max(1, pagination.currentPage - 2);
                    const pageNumber = startPage + i;
                    if (pageNumber > pagination.totalPages) return null;
                    
                    return (
                      <Button
                        key={pageNumber}
                        variant={pageNumber === pagination.currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNumber)}
                        className="w-8 h-8 p-0"
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
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Por página:</span>
                <Select
                  value={(paginationParams.pageSize || 10).toString()}
                  onValueChange={(value) => handlePageSizeChange(Number(value))}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
