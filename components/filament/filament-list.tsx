"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  Filter,
} from "lucide-react";

import { useLocale } from "@/app/localContext";
import { Filament } from "@/lib/types";
import { MultiColorPicker } from "./multiply-color-picker";
import { PaginatedTable, TableColumn, TableAction, TableSummaryCard } from "@/components/shared/paginated-table";

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
  // Estado de datos
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [pagination, setPagination] = useState<PaginationMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteFilament, setDeleteFilament] = useState<Filament | null>(null);
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(100);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { formatCurrency } = useLocale();

  const fetchFilaments = useCallback(async (params: any) => {
    try {
      setIsLoading(true);
      
      const filters: FilamentFilters = {
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        searchTerm: params.searchTerm || "",
        sortBy: params.sortBy || "type",
        sortDescending: params.sortDescending || false,
        color: selectedColor.length > 0 ? selectedColor.join(",") : undefined,
        threshold: showLowStockOnly ? lowStockThreshold : undefined,
      };
      
      console.log("Fetching filaments with filters:", filters);
      
      const response = await apiClient.getFilaments(filters);
      
      if (response) {
        const parsed = response.data.map((f) => ({
          ...f,
          color: typeof f.color === "string" ? f.color.split(",") : (f.color || []),
        }));

        console.log("Received filaments:", parsed.length, "with low stock filter:", showLowStockOnly);
        
        setFilaments(parsed);
        setPagination(response.pagination);
        
        // Actualizar colores disponibles
        setAvailableColors(Array.from(new Set(parsed.flatMap((f) => f.color))));
      }
    } catch (error) {
      console.error("Error fetching filaments:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedColor, showLowStockOnly, lowStockThreshold]);

  const handleLowStockFilter = (enabled: boolean) => {
    setShowLowStockOnly(enabled);
    // Disparar una nueva búsqueda inmediatamente cuando se cambie el filtro
    fetchFilaments({ 
      page: 1, 
      pageSize: 10, 
      searchTerm: searchTerm, 
      sortBy: "type", 
      sortDescending: false 
    });
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleDelete = async (filament: Filament) => {
    try {
      if (!filament.id) {
        console.error("Filament ID is undefined, cannot delete.");
        return;
      }
      await apiClient.deleteFilament(filament.id!);
      // Recargar datos después de eliminar
      fetchFilaments({ page: 1, pageSize: 10, searchTerm: searchTerm, sortBy: "type", sortDescending: false });
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

  // Configuración de columnas para la tabla
  const columns: TableColumn<Filament>[] = [
    {
      key: "type",
      label: "Material",
      sortable: true,
      render: (filament) => (
        <div>
          <p className="font-medium">{filament.type}</p>
        </div>
      ),
    },
    {
      key: "color",
      label: "Colores",
      render: (filament) => (
        <div className="flex gap-1">
          {(Array.isArray(filament.color) ? filament.color : [filament.color]).map((c: string, i: number) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full border"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      ),
    },
    {
      key: "costPerGram",
      label: "Costo",
      sortable: true,
      render: (filament) => (
        <div>
          <p className="font-medium">
            {formatCurrency(filament.costPerGram || 0)}/g
          </p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency((filament.costPerGram || 0) * 1000)}/kg
          </p>
        </div>
      ),
    },
    {
      key: "stockGrams",
      label: "Stock",
      sortable: true,
      render: (filament) => (
        <div>
          <p className="font-medium">
            {filament.stockGrams || 0}g
          </p>
          <p className="text-sm text-muted-foreground">
            {((filament.stockGrams || 0) / 1000).toFixed(1)}kg
          </p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Estado",
      render: (filament) => {
        const stockStatus = getStockStatus(filament.stockGrams || 0);
        return (
          <Badge className={stockStatus.color}>
            <stockStatus.icon className="h-3 w-3 mr-1" />
            {stockStatus.label}
          </Badge>
        );
      },
    },
    {
      key: "totalValue",
      label: "Valor Total",
      render: (filament) => {
        const totalValue = (filament.costPerGram || 0) * (filament.stockGrams || 0);
        return <p className="font-medium">{formatCurrency(totalValue)}</p>;
      },
    },
  ];

  // Configuración de acciones para la tabla
  const actions: TableAction<Filament>[] = [
    {
      label: "Editar",
      icon: <Edit className="h-3 w-3" />,
      onClick: onEdit,
      variant: "outline",
      size: "sm",
    },
    {
      label: "Eliminar",
      icon: <Trash2 className="h-3 w-3" />,
      onClick: (filament) => setDeleteFilament(filament),
      variant: "outline",
      size: "sm",
    },
  ];

  // Tarjetas de resumen
  const summaryCards: TableSummaryCard[] = [
    {
      title: "Total de Filamentos",
      value: pagination?.totalCount || 0,
      subtitle: pagination?.totalCount === 1 ? 'Tipo diferente' : 'Tipos diferentes',
    },
    {
      title: "Valor Total del Inventario",
      value: formatCurrency(totalValue),
      subtitle: "En stock actual",
    },
    {
      title: "Stock Bajo",
      value: lowStockCount,
      subtitle: "Requieren reposición",
      className: "text-yellow-600",
    },
  ];

  // Filtros personalizados
  const customFilters = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Filtro de stock bajo */}
      <div>
        <label className="text-sm font-medium mb-2 block">
          Stock Bajo
          {showLowStockOnly && (
            <span className="ml-2 text-xs text-muted-foreground">
              (≤ {lowStockThreshold}g)
            </span>
          )}
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Umbral (gramos)"
            value={lowStockThreshold}
            onChange={(e) => {
              const newThreshold = Number(e.target.value);
              setLowStockThreshold(newThreshold);
              // Si el filtro está activo, actualizar inmediatamente
              if (showLowStockOnly) {
                setTimeout(() => {
                  fetchFilaments({ 
                    page: 1, 
                    pageSize: 10, 
                    searchTerm: searchTerm, 
                    sortBy: "type", 
                    sortDescending: false 
                  });
                }, 500); // Debounce de 500ms
              }
            }}
            disabled={!showLowStockOnly}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <Button
            variant={showLowStockOnly ? "default" : "outline"}
            onClick={() => handleLowStockFilter(!showLowStockOnly)}
            className="min-w-[100px]"
          >
            {showLowStockOnly ? "Activo" : "Inactivo"}
          </Button>
        </div>
      </div>

      {/* Filtro por colores */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filtrar por colores</span>
        </div>
        <MultiColorPicker
          value={selectedColor}
          onChange={setSelectedColor}
          availableColors={availableColors}
          limitSelection={10}
        />
      </div>
    </div>
  );

  return (
    <>
      <PaginatedTable
        data={filaments}
        pagination={pagination}
        isLoading={isLoading}
        title="Filamentos"
        description="Gestiona tu inventario de filamentos para impresión 3D"
        columns={columns}
        actions={actions}
        emptyStateMessage="No hay filamentos registrados."
        emptyStateIcon={<Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />}
        onFetch={fetchFilaments}
        onAdd={onAdd}
        refreshTrigger={refreshTrigger}
        initialPageSize={10}
        pageSizeOptions={[5, 10, 20, 50]}
        searchPlaceholder="Buscar filamentos por tipo o color..."
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        defaultSortBy="type"
        defaultSortDescending={false}
        customFilters={customFilters}
        summaryCards={summaryCards}
        showFilters={true}
        onToggleFilters={() => setShowFilters(!showFilters)}
        filtersVisible={showFilters}
      />

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
