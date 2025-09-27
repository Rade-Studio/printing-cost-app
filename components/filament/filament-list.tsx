"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient, FilamentFilters, PaginatedResponse, PaginationMetadata } from "@/lib/api";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
} from "lucide-react";

import { useLocale } from "@/app/localContext";
import { Filament } from "@/lib/types";
import { MultiColorPicker } from "./multiply-color-picker";

interface FilamentListProps {
  onEdit: (filament: Filament) => void;
  onAdd: () => void;
  refreshTrigger: number;
}

export function FilamentList({
  onEdit,
  onAdd,
  refreshTrigger,
}: FilamentListProps) {
  // Estado de paginación
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [pagination, setPagination] = useState<PaginationMetadata>({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });
  
  // Estado de filtros
  const [filters, setFilters] = useState<FilamentFilters>({
    page: 1,
    pageSize: 10,
    searchTerm: "",
    sortBy: "type",
    sortDescending: false,
  });
  
  // Estado de UI
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [deleteFilament, setDeleteFilament] = useState<Filament | null>(null);
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(100);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  
  // Estado para debounce
  const [searchInput, setSearchInput] = useState("");
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { formatCurrency } = useLocale();

  const fetchFilaments = useCallback(async (currentFilters: FilamentFilters = filters, isSearch: boolean = false) => {
    try {
      if (isSearch) {
        setIsSearching(true);
      } else {
        setIsLoading(true);
      }
      
      const response = await apiClient.getFilaments(currentFilters);
      
      if (response) {
        const parsed = response.data.map((f) => ({
          ...f,
          color: typeof f.color === "string" ? f.color.split(",") : (f.color || []),
        }));

        setFilaments(parsed);
        setPagination(response.pagination);
        
        // Actualizar colores disponibles
        setAvailableColors(Array.from(new Set(parsed.flatMap((f) => f.color))));
      }
    } catch (error) {
      console.error("Error fetching filaments:", error);
    } finally {
      if (isSearch) {
        setIsSearching(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [filters]);

  useEffect(() => {
    fetchFilaments();
  }, [refreshTrigger, fetchFilaments]);

  // Funciones de manejo de filtros
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    
    // Limpiar timeout anterior
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Configurar nuevo timeout para debounce
    debounceTimeoutRef.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, searchTerm: value, page: 1 }));
    }, 500); // 500ms de delay
  };

  const handleSortChange = (sortBy: string) => {
    setFilters(prev => ({ ...prev, sortBy, page: 1 }));
  };

  const handleSortDirectionChange = (sortDescending: boolean) => {
    setFilters(prev => ({ ...prev, sortDescending, page: 1 }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setFilters(prev => ({ ...prev, pageSize, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };


  const handleLowStockFilter = (enabled: boolean) => {
    setShowLowStockOnly(enabled);
    setFilters(prev => ({ 
      ...prev, 
      threshold: enabled ? lowStockThreshold : undefined, 
      page: 1 
    }));
  };

  const clearFilters = () => {
    setShowLowStockOnly(false);
    setSelectedColor([]);
    setSearchInput("");
    
    // Limpiar timeout de debounce
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    setFilters({
      page: 1,
      pageSize: 10,
      searchTerm: "",
      sortBy: "type",
      sortDescending: false,
      color: undefined,
    });
  };

  // Aplicar filtros cuando cambien
  useEffect(() => {
    fetchFilaments(filters, true);
  }, [filters, fetchFilaments]);

  // Limpiar timeout al desmontar el componente
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleDelete = async (filament: Filament) => {
    try {
      if (!filament.id) {
        console.error("Filament ID is undefined, cannot delete.");
        return;
      }
      await apiClient.deleteFilament(filament.id!);
      await fetchFilaments(filters);
      setDeleteFilament(null);
    } catch (error) {
      console.error("Error deleting filament:", error);
    }
  };

  const getStockStatus = (stockGrams: number) => {
    if (stockGrams <= 100)
      return {
        label: "Crítico",
        color: "bg-red-100 text-red-800",
        icon: AlertTriangle,
      };
    if (stockGrams <= 500)
      return {
        label: "Bajo",
        color: "bg-yellow-100 text-yellow-800",
        icon: AlertTriangle,
      };
    return {
      label: "Disponible",
      color: "bg-green-100 text-green-800",
      icon: Package,
    };
  };

  const totalValue = filaments.reduce(
    (sum, filament) =>
      sum + (filament.costPerGram || 0) * (filament.stockGrams || 0),
    0
  );

  const lowStockCount = filaments.filter((f) => (f.stockGrams || 0) <= 500).length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Cargando filamentos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }


  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Filamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.totalCount}</div>
            <p className="text-xs text-muted-foreground">
              {pagination.totalCount === 1 ? 'Tipo diferente' : 'Tipos diferentes'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Valor Total del Inventario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalValue)}
            </div>
            <p className="text-xs text-muted-foreground">En stock actual</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {lowStockCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Requieren reposición
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Filamentos</CardTitle>
              <CardDescription>
                Gestiona tu inventario de filamentos para impresión 3D
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
              <Button onClick={onAdd} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Filamento
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="space-y-4 mb-6">
            {/* Fila 1: Búsqueda y filtros básicos */}
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar filamentos por tipo o color..."
                    value={searchInput}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Select value={filters.sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="type">Tipo</SelectItem>
                    <SelectItem value="costpergram">Costo por gramo</SelectItem>
                    <SelectItem value="stockgrams">Stock</SelectItem>
                    <SelectItem value="density">Densidad</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSortDirectionChange(!filters.sortDescending)}
                >
                  {filters.sortDescending ? "↓" : "↑"}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Por página:</span>
                <Select 
                  value={filters.pageSize?.toString() || "10"} 
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
                onChange={(colors) => {
                  setSelectedColor(colors);
                  // Aplicar filtro inmediatamente cuando se seleccionan colores
                  if (colors.length > 0) {
                    // Hacer join de todos los colores seleccionados con comas
                    const colorFilter = colors.join(",");
                    setFilters(prev => ({ 
                      ...prev, 
                      color: colorFilter, 
                      page: 1 
                    }));
                  } else {
                    // Si no hay colores seleccionados, quitar el filtro de color
                    setFilters(prev => ({ 
                      ...prev, 
                      color: undefined, 
                      page: 1 
                    }));
                  }
                }}
                availableColors={availableColors}
                limitSelection={10}
              />
              {selectedColor.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedColor([]);
                      setFilters(prev => ({ 
                        ...prev, 
                        color: undefined, 
                        page: 1 
                      }));
                    }}
                    className="text-xs"
                  >
                    Limpiar filtros
                  </Button>
                  <span className="text-xs text-gray-500">
                    Mostrando filamentos que contengan alguno de los colores seleccionados
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Panel de filtros avanzados */}
          {showFilters && (
            <div className="border rounded-lg p-4 mb-6 bg-muted/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Filtros Avanzados</h3>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Filtro de stock bajo */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Stock Bajo</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Umbral (gramos)"
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                      disabled={!showLowStockOnly}
                    />
                    <Button
                      variant={showLowStockOnly ? "default" : "outline"}
                      onClick={() => handleLowStockFilter(!showLowStockOnly)}
                    >
                      {showLowStockOnly ? "Activo" : "Inactivo"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {filaments.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {filters.searchTerm || filters.color || showLowStockOnly
                  ? "No se encontraron filamentos que coincidan con los filtros aplicados."
                  : "No hay filamentos registrados."}
              </p>
              {(filters.searchTerm || filters.color || showLowStockOnly) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearFilters}
                  className="mt-4"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead>Colores</TableHead>
                      <TableHead>Costo</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filaments.map((filament) => {
                      const stockStatus = getStockStatus(
                        filament.stockGrams || 0
                      );
                      const totalValue =
                        (filament.costPerGram || 0) * (filament.stockGrams || 0);
                      return (
                        <TableRow key={filament.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{filament.type}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {(Array.isArray(filament.color) ? filament.color : [filament.color]).map((c: string, i: number) => (
                                <div
                                  key={i}
                                  className="w-8 h-8 rounded-full border"
                                  style={{ backgroundColor: c }}
                                />
                              ))}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {formatCurrency(filament.costPerGram || 0)}/g
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatCurrency(
                                  (filament.costPerGram || 0) * 1000
                                )}
                                /kg
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {filament.stockGrams || 0}g
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {((filament.stockGrams || 0) / 1000).toFixed(1)}kg
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={stockStatus.color}>
                              <stockStatus.icon className="h-3 w-3 mr-1" />
                              {stockStatus.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">
                              {formatCurrency(totalValue)}
                            </p>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit(filament)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeleteFilament(filament)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Controles de paginación */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    {isSearching ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        Buscando...
                      </div>
                    ) : (
                      <>
                        Mostrando {((pagination.currentPage - 1) * pagination.pageSize) + 1} a{" "}
                        {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)} de{" "}
                        {pagination.totalCount} filamentos
                        {filters.searchTerm && (
                          <span className="ml-2 text-primary">
                            (búsqueda: "{filters.searchTerm}")
                          </span>
                        )}
                        {filters.color && (
                          <span className="ml-2 text-primary">
                            (colores: {filters.color.split(",").length > 1 
                              ? `${filters.color.split(",").length} seleccionados` 
                              : filters.color})
                          </span>
                        )}
                        {showLowStockOnly && (
                          <span className="ml-2 text-primary">
                            (stock bajo: ≤{lowStockThreshold}g)
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPreviousPage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const pageNumber = Math.max(1, Math.min(
                          pagination.totalPages - 4,
                          pagination.currentPage - 2
                        )) + i;
                        
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
                      disabled={!pagination.hasNextPage}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deleteFilament}
        onOpenChange={() => setDeleteFilament(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el
              filamento "{deleteFilament?.type} - {Array.isArray(deleteFilament?.color) ? deleteFilament?.color.join(", ") : deleteFilament?.color}" del
              inventario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteFilament && handleDelete(deleteFilament)}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
