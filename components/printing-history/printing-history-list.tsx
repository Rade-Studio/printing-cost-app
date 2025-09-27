"use client";

import type React from "react";
import type { PrintingHistory } from "@/lib/types";
import type { PaginationRequest, PaginatedResponse, PaginationMetadata } from "@/lib/api";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api";
import {
  Edit,
  Trash2,
  History,
  Weight,
  Lightbulb,
  Calculator,
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
import { PaginatedTable, TableColumn, TableAction, TableSummaryCard } from "@/components/shared/paginated-table";

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [printerFilter, setPrinterFilter] = useState("all");
  const [selectedColor, setSelectedColor] = useState<string[]>([]);
  const { formatCurrency } = useLocale();

  const loadPrintingHistories = useCallback(async (params: any) => {
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
  }, []);

  const handleDelete = async (history: PrintingHistory) => {
    try {
      await apiClient.deletePrintingHistory(history.id!);
      // Recargar datos después de eliminar
      loadPrintingHistories({ page: 1, pageSize: 10, searchTerm: "", sortBy: "createdAt", sortDescending: true });
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

  // Configuración de columnas para la tabla
  const columns: TableColumn<PrintingHistory>[] = [
    {
      key: "type",
      label: "Tipo",
      sortable: true,
      render: (history) => {
        const typeInfo = getTypeInfo(history.type);
        return (
          <Badge className={typeInfo.color}>
            {typeInfo.label}
          </Badge>
        );
      },
    },
    {
      key: "filament",
      label: "Filamento",
      render: (history) => (
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
      ),
    },
    {
      key: "printerId",
      label: "Impresora",
      sortable: true,
      render: (history) => (
        <div>
          <div className="font-medium">
            {history.printer?.name}
          </div>
          <div className="text-sm text-muted-foreground">
            {history.printer?.model}
          </div>
        </div>
      ),
    },
    {
      key: "printTimeHours",
      label: "Tiempo (h)",
      sortable: true,
      render: (history) => (
        <span className="font-mono">{history.printTimeHours}</span>
      ),
    },
    {
      key: "totalGramsUsed",
      label: "Gramos (cm³)",
      sortable: true,
      render: (history) => (
        <span className="font-mono">{history.totalGramsUsed}</span>
      ),
    },
    {
      key: "totalCost",
      label: "Costos",
      sortable: true,
      render: (history) => (
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
      ),
    },
  ];

  // Configuración de acciones para la tabla
  const actions: TableAction<PrintingHistory>[] = [
    {
      label: "Editar",
      icon: <Edit className="h-4 w-4" />,
      onClick: onEdit,
      variant: "outline",
      size: "sm",
    },
    {
      label: "Eliminar",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (history) => handleDelete(history),
      variant: "outline",
      size: "sm",
    },
  ];

  // Filtros personalizados
  const customFilters = (
    <div className="space-y-4">
      <div className="flex gap-4">
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
      
      {/* Filtro por colores */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium text-gray-700">Filtrar por colores de filamento</span>
        </div>
        <MultiColorPicker
          value={selectedColor}
          onChange={setSelectedColor}
          availableColors={uniqueColors.filter((color): color is string => typeof color === 'string')}
          limitSelection={10}
        />
      </div>
    </div>
  );

  return (
    <>
      <PaginatedTable
        data={filteredHistories}
        pagination={pagination}
        isLoading={isLoading}
        title="Historial de Impresión"
        description="Registro de todas las impresiones realizadas en el sistema"
        columns={columns}
        actions={actions}
        emptyStateMessage="No hay historial de impresión registrado."
        emptyStateIcon={<History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />}
        onFetch={loadPrintingHistories}
        onAdd={onAdd}
        refreshTrigger={refreshTrigger}
        initialPageSize={10}
        pageSizeOptions={[5, 10, 20, 50]}
        searchPlaceholder="Buscar por filamento, impresora..."
        defaultSortBy="createdAt"
        defaultSortDescending={true}
        customFilters={customFilters}
        showFilters={true}
        onToggleFilters={() => {}}
        filtersVisible={true}
      />
    </>
  );
}