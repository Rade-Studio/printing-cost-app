"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "./search-input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  X,
} from "lucide-react";
import { PaginationRequest, PaginationMetadata } from "@/lib/api";

export interface TableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

export interface TableAction<T> {
  label: string;
  icon: React.ReactNode;
  onClick: (item: T) => void;
  variant?: "default" | "outline" | "destructive";
  size?: "sm" | "default" | "lg";
  className?: string;
}

export interface TableSummaryCard {
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
  icon?: React.ReactNode;
}

export interface PaginatedTableProps<T> {
  // Datos y paginación
  data: T[];
  pagination: PaginationMetadata | null;
  isLoading: boolean;
  
  // Configuración de tabla
  title: string;
  description: string;
  columns: TableColumn<T>[];
  actions: TableAction<T>[];
  emptyStateMessage?: string;
  emptyStateIcon?: React.ReactNode;
  
  // Funciones de callback
  onFetch: (params: PaginationRequest) => Promise<void>;
  onAdd?: () => void;
  refreshTrigger?: number;
  
  // Configuración de paginación
  initialPageSize?: number;
  pageSizeOptions?: number[];
  
  // Configuración de búsqueda
  searchPlaceholder?: string;
  searchDebounceMs?: number;
  searchValue?: string;
  onSearchChange?: (searchTerm: string) => void;
  
  // Configuración de ordenamiento
  defaultSortBy?: string;
  defaultSortDescending?: boolean;
  
  // Filtros personalizados
  customFilters?: React.ReactNode;
  
  // Tarjetas de resumen
  summaryCards?: TableSummaryCard[];
  
  // Configuración adicional
  showFilters?: boolean;
  onToggleFilters?: () => void;
  filtersVisible?: boolean;
}

export function PaginatedTable<T extends { id?: string }>({
  data,
  pagination,
  isLoading,
  title,
  description,
  columns,
  actions,
  emptyStateMessage = "No hay datos para mostrar.",
  emptyStateIcon,
  onFetch,
  onAdd,
  refreshTrigger,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  searchPlaceholder = "Buscar...",
  searchDebounceMs = 500,
  searchValue = "",
  onSearchChange,
  defaultSortBy = "createdAt",
  defaultSortDescending = false,
  customFilters,
  summaryCards,
  showFilters = false,
  onToggleFilters,
  filtersVisible = false,
}: PaginatedTableProps<T>) {
  // Estado de paginación y filtros
  const [paginationParams, setPaginationParams] = useState<PaginationRequest>({
    page: 1,
    pageSize: initialPageSize,
    searchTerm: searchValue,
    sortBy: defaultSortBy,
    sortDescending: defaultSortDescending,
  });

  // Función para obtener datos
  const fetchData = useCallback(async (params: PaginationRequest) => {
    try {
      await onFetch(params);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [onFetch]);

  // Efecto para cargar datos iniciales y cuando cambie refreshTrigger
  useEffect(() => {
    fetchData(paginationParams);
  }, [refreshTrigger, fetchData]);

  // Efecto para sincronizar con el valor de búsqueda externo
  useEffect(() => {
    if (searchValue !== paginationParams.searchTerm) {
      setPaginationParams(prev => ({ ...prev, searchTerm: searchValue, page: 1 }));
    }
  }, [searchValue, paginationParams.searchTerm]);

  // Aplicar filtros cuando cambien (sin dependencia circular)
  useEffect(() => {
    fetchData(paginationParams);
  }, [paginationParams.page, paginationParams.pageSize, paginationParams.searchTerm, paginationParams.sortBy, paginationParams.sortDescending, fetchData]);

  // Funciones de manejo de paginación
  const handlePageChange = (page: number) => {
    setPaginationParams(prev => ({ ...prev, page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPaginationParams(prev => ({ ...prev, pageSize, page: 1 }));
  };

  const handleSortChange = (sortBy: string) => {
    setPaginationParams(prev => ({ 
      ...prev, 
      sortBy, 
      sortDescending: prev.sortBy === sortBy ? !prev.sortDescending : defaultSortDescending,
      page: 1 
    }));
  };

  const clearFilters = () => {
    // Limpiar búsqueda externa si hay callback
    if (onSearchChange) {
      onSearchChange("");
    }
    
    setPaginationParams({
      page: 1,
      pageSize: initialPageSize,
      searchTerm: "",
      sortBy: defaultSortBy,
      sortDescending: defaultSortDescending,
    });
  };

  // Estado de carga
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Cargando {title.toLowerCase()}...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Tarjetas de resumen */}
      {summaryCards && summaryCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {summaryCards.map((card, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {card.icon}
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${card.className || ""}`}>
                  {card.value}
                </div>
                {card.subtitle && (
                  <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            <div className="flex gap-2">
              {showFilters && onToggleFilters && (
                <Button
                  variant="outline"
                  onClick={onToggleFilters}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filtros
                </Button>
              )}
              {onAdd && (
                <Button onClick={onAdd} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nuevo
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="space-y-4 mb-6">
            {/* Fila 1: Búsqueda y controles básicos */}
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <SearchInput
                  placeholder={searchPlaceholder}
                  debounceMs={searchDebounceMs}
                  onSearchChange={(term) => {
                    // Actualizar el estado interno inmediatamente
                    setPaginationParams(prev => ({ ...prev, searchTerm: term, page: 1 }));
                    // Notificar al componente padre
                    onSearchChange?.(term);
                  }}
                  value={paginationParams.searchTerm || ""}
                />
              </div>
              
              <div className="flex gap-2">
                <Select 
                  value={paginationParams.pageSize?.toString() || initialPageSize.toString()} 
                  onValueChange={(value) => handlePageSizeChange(Number(value))}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizeOptions.map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Filtros personalizados */}
            {customFilters && filtersVisible && (
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Filtros Avanzados</h3>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Limpiar
                  </Button>
                </div>
                {customFilters}
              </div>
            )}
          </div>

          {/* Tabla */}
          {data.length === 0 ? (
            <div className="text-center py-8">
              {emptyStateIcon}
              <p className="text-muted-foreground mt-4">
                {searchValue || filtersVisible
                  ? "No se encontraron resultados que coincidan con los filtros aplicados."
                  : emptyStateMessage}
              </p>
              {(searchValue || filtersVisible) && (
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
                      {columns.map((column) => (
                        <TableHead
                          key={column.key}
                          className={`${column.sortable ? "cursor-pointer hover:bg-muted/50" : ""} ${column.className || ""}`}
                          onClick={column.sortable ? () => handleSortChange(column.key) : undefined}
                        >
                          <div className="flex items-center gap-2">
                            {column.label}
                            {column.sortable && paginationParams.sortBy === column.key && (
                              <span className="text-xs">
                                {paginationParams.sortDescending ? "↓" : "↑"}
                              </span>
                            )}
                          </div>
                        </TableHead>
                      ))}
                      {actions.length > 0 && (
                        <TableHead className="text-right">Acciones</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((item) => (
                      <TableRow key={item.id}>
                        {columns.map((column) => (
                          <TableCell key={column.key} className={column.className}>
                            {column.render ? column.render(item) : (item as any)[column.key]}
                          </TableCell>
                        ))}
                        {actions.length > 0 && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {actions.map((action, index) => (
                                <Button
                                  key={index}
                                  variant={action.variant || "outline"}
                                  size={action.size || "sm"}
                                  onClick={() => action.onClick(item)}
                                  className={action.className}
                                >
                                  {action.icon}
                                </Button>
                              ))}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Controles de paginación */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {((pagination.currentPage - 1) * pagination.pageSize) + 1} a{" "}
                    {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)} de{" "}
                    {pagination.totalCount} registros
                    {searchValue && (
                      <span className="ml-2 text-primary">
                        (búsqueda: "{searchValue}")
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
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
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
