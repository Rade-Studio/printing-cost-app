"use client";

import { useState, useEffect, useCallback } from "react";
import { PaginatedTable, TableColumn, TableAction } from "@/components/shared/paginated-table";
import { apiClient, PaginationRequest, PaginatedResponse } from "@/lib/api";
import { Quotation, Product } from "@/lib/types";
import { FileText, Eye, Trash2, Calculator, Calendar, Package } from "lucide-react";
import { useLocale } from "@/app/localContext";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { QuotationDetailsModal } from "./quotation-details-modal";

interface QuotationListProps {
  onEdit?: (quotation: Quotation) => void;
  onLoadInCalculator?: (quotation: Quotation) => void;
  refreshTrigger?: number;
}

export function QuotationList({ onEdit, onLoadInCalculator, refreshTrigger }: QuotationListProps) {
  const { formatCurrency } = useLocale();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [productFilter, setProductFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [deleteQuotation, setDeleteQuotation] = useState<Quotation | null>(null);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Cargar productos para el filtro
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await apiClient.getProducts({ page: 1, pageSize: 100 });
        if (response?.data) {
          setProducts(response.data);
        }
      } catch (error) {
        console.error("Error loading products:", error);
      }
    };
    loadProducts();
  }, []);

  const fetchQuotations = useCallback(async (params: PaginationRequest) => {
    setIsLoading(true);
    try {
      const filters = {
        ...params,
        productId: productFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };
      const response = await apiClient.getQuotations(filters);
      if (response) {
        setQuotations(response.data || []);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error("Error fetching quotations:", error);
    } finally {
      setIsLoading(false);
    }
  }, [productFilter, startDate, endDate]);

  useEffect(() => {
    fetchQuotations({ page: 1, pageSize: 10 });
  }, [refreshTrigger, productFilter, startDate, endDate]);

  const handleDelete = async () => {
    if (!deleteQuotation?.id) return;
    try {
      await apiClient.deleteQuotation(deleteQuotation.id);
      fetchQuotations({ page: 1, pageSize: 10 });
      setDeleteQuotation(null);
    } catch (error) {
      console.error("Error deleting quotation:", error);
    }
  };

  const handleViewDetails = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setShowDetailsModal(true);
  };

  const columns: TableColumn<Quotation>[] = [
    {
      key: "title",
      label: "Título",
      sortable: true,
      render: (q) => (
        <div className="font-medium">{q.title}</div>
      ),
    },
    {
      key: "product",
      label: "Producto",
      render: (q) => (
        <div>{q.product?.name || "—"}</div>
      ),
    },
    {
      key: "totalCost",
      label: "Costo Total",
      sortable: true,
      render: (q) => formatCurrency(q.totalCost),
    },
    {
      key: "finalValue",
      label: "Valor Final",
      sortable: true,
      render: (q) => formatCurrency(q.finalValue),
    },
    {
      key: "quantity",
      label: "Cantidad",
      render: (q) => q.quantity,
    },
    {
      key: "createdAt",
      label: "Fecha",
      sortable: true,
      render: (q) => new Date(q.createdAt).toLocaleDateString(),
    },
  ];

  const actions: TableAction<Quotation>[] = [
    {
      label: "Ver detalles",
      icon: <Eye className="h-4 w-4" />,
      onClick: handleViewDetails,
      variant: "outline",
      size: "sm",
    },
    {
      label: "Cargar en calculadora",
      icon: <Calculator className="h-4 w-4" />,
      onClick: (q) => onLoadInCalculator?.(q),
      variant: "default",
      size: "sm",
    },
    {
      label: "Eliminar",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (q) => setDeleteQuotation(q),
      variant: "destructive",
      size: "sm",
    },
  ];

  const customFilters = (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[200px]">
        <label className="text-sm font-medium mb-2 block">Producto</label>
        <select
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          className="w-full h-10 px-3 rounded-md border border-input bg-background"
        >
          <option value="">Todos los productos</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1 min-w-[150px]">
        <label className="text-sm font-medium mb-2 block">Fecha Inicio</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full h-10 px-3 rounded-md border border-input bg-background"
        />
      </div>
      <div className="flex-1 min-w-[150px]">
        <label className="text-sm font-medium mb-2 block">Fecha Fin</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full h-10 px-3 rounded-md border border-input bg-background"
        />
      </div>
      {(productFilter || startDate || endDate) && (
        <button
          onClick={() => {
            setProductFilter("");
            setStartDate("");
            setEndDate("");
          }}
          className="h-10 px-4 rounded-md border border-input bg-background hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  return (
    <>
      <PaginatedTable
        data={quotations}
        pagination={pagination}
        isLoading={isLoading}
        title="Cotizaciones"
        description="Historial de todas las cotizaciones guardadas"
        columns={columns}
        actions={actions}
        emptyStateMessage="No hay cotizaciones registradas."
        emptyStateIcon={<FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />}
        onFetch={fetchQuotations}
        refreshTrigger={refreshTrigger}
        initialPageSize={10}
        pageSizeOptions={[10, 20, 50]}
        searchPlaceholder="Buscar cotizaciones por título..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        defaultSortBy="createdAt"
        defaultSortDescending={true}
        customFilters={customFilters}
      />

      <AlertDialog open={!!deleteQuotation} onOpenChange={() => setDeleteQuotation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la cotización "{deleteQuotation?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedQuotation && (
        <QuotationDetailsModal
          quotation={selectedQuotation}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedQuotation(null);
          }}
          onLoadInCalculator={(q) => {
            onLoadInCalculator?.(q);
            setShowDetailsModal(false);
            setSelectedQuotation(null);
          }}
        />
      )}
    </>
  );
}

