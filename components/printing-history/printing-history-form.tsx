"use client";
import type React from "react";
import type {
  PrintingHistory,
  Filament,
  Printer,
  SaleDetail,
  Product,
  FilamentConsumption,
} from "@/lib/types";
import type { PaginationRequest, PaginatedResponse, PaginationMetadata } from "@/lib/api";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api";
import { Loader2, History, Trash, Search, ChevronDown } from "lucide-react";
import { ProductSelect } from "../shared/select-product";
import { useLocale } from "@/app/localContext";

interface PrintingHistoryFormProps {
  printingHistory?: PrintingHistory;
  onSuccess: () => void;
  onCancel: () => void;
  refreshTrigger?: number;
}

const printingTypes = [
  { value: "prototype", label: "Prototipo" },
  { value: "final", label: "Definitivo" },
  { value: "calibration", label: "Calibración" },
  { value: "test", label: "Prueba" },
  { value: "rework", label: "Retrabajo" },
  { value: "sample", label: "Muestra" },
  { value: "production", label: "Producción" },
  { value: "other", label: "Otro" },
];

export function PrintingHistoryForm({
  printingHistory,
  onSuccess,
  onCancel,
  refreshTrigger,
}: PrintingHistoryFormProps) {
  const [formData, setFormData] = useState<PrintingHistory>({
    printerId: printingHistory?.printerId || "",
    productId: printingHistory?.productId || undefined,
    totalCost: printingHistory?.totalCost || undefined,
    totalEnergyCost: printingHistory?.totalEnergyCost || undefined,
    totalFilamentCost: printingHistory?.totalFilamentCost || undefined,
    totalGramsUsed: printingHistory?.totalGramsUsed || undefined,
    printTimeHours: printingHistory?.printTimeHours || 0,
    type: printingHistory?.type || "prototype",
    filamentConsumptions: printingHistory?.filamentConsumptions || [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [filamentPagination, setFilamentPagination] = useState<PaginationMetadata | null>(null);
  const [filamentParams, setFilamentParams] = useState<PaginationRequest>({
    page: 1,
    pageSize: 50,
    searchTerm: "",
  });
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [printerPagination, setPrinterPagination] = useState<PaginationMetadata | null>(null);
  const [printerParams, setPrinterParams] = useState<PaginationRequest>({
    page: 1,
    pageSize: 50,
    searchTerm: "",
  });
  const [printerSearchTerm, setPrinterSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingFilaments, setIsLoadingFilaments] = useState(false);
  const [isLoadingPrinters, setIsLoadingPrinters] = useState(false);
  const { formatCurrency } = useLocale();

  // Cargar filamentos con paginación
  const loadFilaments = async (params: PaginationRequest = filamentParams) => {
    try {
      setIsLoadingFilaments(true);
      const response = await apiClient.getFilaments(params);
      if (response) {
        if (params.page === 1) {
          setFilaments(response.data || []);
        } else {
          setFilaments(prev => [...prev, ...(response.data || [])]);
        }
        setFilamentPagination(response.pagination || null);
      }
    } catch (err) {
      console.error("Error loading filaments:", err);
    } finally {
      setIsLoadingFilaments(false);
    }
  };

  // Cargar impresoras con paginación
  const loadPrinters = async (params: PaginationRequest = printerParams) => {
    try {
      setIsLoadingPrinters(true);
      const response = await apiClient.getPrinters(params);
      if (response) {
        if (params.page === 1) {
          setPrinters(response.data || []);
        } else {
          setPrinters(prev => [...prev, ...(response.data || [])]);
        }
        setPrinterPagination(response.pagination || null);
      }
    } catch (err) {
      console.error("Error loading printers:", err);
    } finally {
      setIsLoadingPrinters(false);
    }
  };

  // Cargar una impresora específica por ID
  const loadSpecificPrinter = async (printerId: string) => {
    try {
      setIsLoadingPrinters(true);
      const response = await apiClient.getPrinters({
        page: 1,
        pageSize: 100,
        searchTerm: printerId, // Buscar por ID
      });
      if (response) {
        const specificPrinter = response.data?.find(p => p.id === printerId);
        if (specificPrinter) {
          // Si encontramos la impresora específica, agregarla a la lista si no está
          setPrinters(prev => {
            const exists = prev.some(p => p.id === printerId);
            return exists ? prev : [...prev, specificPrinter];
          });
        }
      }
    } catch (err) {
      console.error("Error loading specific printer:", err);
    } finally {
      setIsLoadingPrinters(false);
    }
  };

  // Cargar productos con búsqueda
  const loadProducts = async (searchTerm: string = "") => {
    try {
      setIsLoadingProducts(true);
      const response = await apiClient.getProducts({
        page: 1,
        pageSize: 100,
        searchTerm: searchTerm,
      });
      if (response) {
        setProducts(response.data || []);
      }
    } catch (err) {
      console.error("Error loading products:", err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Cargar un producto específico por ID
  const loadSpecificProduct = async (productId: string) => {
    try {
      setIsLoadingProducts(true);
      const response = await apiClient.getProducts({
        page: 1,
        pageSize: 100,
        searchTerm: productId, // Buscar por ID
      });
      if (response) {
        const specificProduct = response.data?.find(p => p.id === productId);
        if (specificProduct) {
          // Si encontramos el producto específico, agregarlo a la lista si no está
          setProducts(prev => {
            const exists = prev.some(p => p.id === productId);
            return exists ? prev : [...prev, specificProduct];
          });
        }
      }
    } catch (err) {
      console.error("Error loading specific product:", err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Cargar impresoras, filamentos y productos
        loadPrinters();
        loadFilaments();
        loadProducts();
        
        // Si hay un producto seleccionado, asegurarse de que esté disponible
        if (formData.productId) {
          loadSpecificProduct(formData.productId);
        }
        
        // Si hay una impresora seleccionada, asegurarse de que esté disponible
        if (formData.printerId) {
          loadSpecificPrinter(formData.printerId);
        }
      } catch (err) {
        console.error("Error loading initial data:", err);
      }
    };

    loadInitialData();
  }, [refreshTrigger]);

  // Debounce para búsqueda de impresoras
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const newParams = {
        ...printerParams,
        searchTerm: printerSearchTerm,
        page: 1, // Reset a la primera página al buscar
      };
      setPrinterParams(newParams);
      loadPrinters(newParams);
    }, 300); // Búsqueda más rápida para impresoras

    return () => clearTimeout(timeoutId);
  }, [printerSearchTerm]);

  // Debounce para búsqueda de productos
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadProducts(productSearchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [productSearchTerm]);

  // Asegurar que el producto seleccionado esté disponible cuando se carguen los productos
  useEffect(() => {
    if (formData.productId && products.length > 0) {
      const selectedProduct = products.find(p => p.id === formData.productId);
      if (!selectedProduct && !isLoadingProducts) {
        // Si el producto seleccionado no está en la lista actual, buscarlo específicamente
        loadSpecificProduct(formData.productId);
      }
    }
  }, [products, formData.productId, isLoadingProducts]);

  // Asegurar que la impresora seleccionada esté disponible cuando se carguen las impresoras
  useEffect(() => {
    if (formData.printerId && printers.length > 0) {
      const selectedPrinter = printers.find(p => p.id === formData.printerId);
      if (!selectedPrinter && !isLoadingPrinters) {
        // Si la impresora seleccionada no está en la lista actual, buscarla específicamente
        loadSpecificPrinter(formData.printerId);
      }
    }
  }, [printers, formData.printerId, isLoadingPrinters]);

  const onCalculate = async () => {
    var data = {
      printerId: formData.printerId,
      printTimeHours: formData.printTimeHours,
      filamentConsumptions: formData.filamentConsumptions,
    };

    const result = await apiClient.calculatePrintingHistory(data);

    setFormData((prev) => ({
      ...prev,
      totalGramsUsed: result?.totalGramsUsed,
      totalEnergyCost: result?.totalEnergyCost,
      totalFilamentCost: result?.totalFilamentCost,
      totalCost: result?.totalCost,
    }));
  };

  const handleConsumptionsChange = (next: FilamentConsumption[]) => {
    const calculatedGrams = next.reduce(
      (acc, usage) => acc + (usage.gramsUsed ?? 0),
      0
    );

    setFormData((prev) => ({
      ...prev,
      filamentConsumptions: next,
      totalGramsUsed: next.length ? calculatedGrams : undefined,
    }));
  };

  const addFilamentUsage = () => {
    const newUsage: FilamentConsumption = { filamentId: "", gramsUsed: 0 };

    handleConsumptionsChange([
      ...(formData.filamentConsumptions ?? []),
      newUsage,
    ]);
  };

  const removeFilamentUsage = (index: number) => {
    handleConsumptionsChange(
      (formData.filamentConsumptions ?? []).filter((_, i) => i !== index)
    );
  };

  const updateFilamentUsage = (
    index: number,
    field: keyof FilamentConsumption,
    value: string | number
  ) => {
    const next = (formData.filamentConsumptions ?? []).map((usage, i) => {
      if (i !== index) {
        return usage;
      }

      if (field === "gramsUsed") {
        const grams =
          typeof value === "number" ? value : Number.parseFloat(value);

        return { ...usage, gramsUsed: Number.isNaN(grams) ? 0 : grams };
      }

      return { ...usage, filamentId: String(value) };
    });

    handleConsumptionsChange(next);
  };

  const totalGrams = useMemo(
    () =>
      formData.filamentConsumptions?.reduce(
        (acc, x) => acc + (x.gramsUsed || 0),
        0
      ),

    [formData.filamentConsumptions]
  );

  const hasFilamentUsage = (formData.filamentConsumptions?.length ?? 0) > 0;

  // Cargar más filamentos cuando se necesite
  const loadMoreFilaments = () => {
    if (filamentPagination && filamentParams.page < filamentPagination.totalPages && !isLoadingFilaments) {
      const newParams = { ...filamentParams, page: filamentParams.page + 1 };
      setFilamentParams(newParams);
      loadFilaments(newParams);
    }
  };

  // Cargar más impresoras cuando se necesite
  const loadMorePrinters = () => {
    if (printerPagination && printerParams.page < printerPagination.totalPages && !isLoadingPrinters) {
      const newParams = { ...printerParams, page: printerParams.page + 1 };
      setPrinterParams(newParams);
      loadPrinters(newParams);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    setError("");

    try {
      if (printingHistory?.id) {
        await apiClient.updatePrintingHistory(printingHistory.id, {
          ...formData,
          id: printingHistory.id,
        });
      } else {
        await apiClient.createPrintingHistory(formData);
      }

      onSuccess();
    } catch (err) {
      setError(
        "Error al guardar el historial de impresión. Por favor, intenta de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    field: keyof PrintingHistory,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getPrinterDescription = (printerId: string) => {
    const printer = printers.find((p) => p.id === printerId);

    return printer
      ? `${printer.name} - ${printer.model}`
      : "Selecciona una impresora";
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />

          {printingHistory
            ? "Editar Historial de Impresión"
            : "Nuevo Historial de Impresión"}
        </CardTitle>

        <CardDescription>
          {printingHistory
            ? "Modifica la información del historial de impresión"
            : "Registra una nueva impresión en el historial"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="productSearch">Producto</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="productSearch"
                  placeholder="Buscar producto..."
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  className="pl-10"
                />
                {isLoadingProducts && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
              <Select
                value={formData.productId || ""}
                onValueChange={(value) => handleChange("productId", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona un producto" />
                </SelectTrigger>
                <SelectContent>
                  {products.length === 0 ? (
                    <div className="flex items-center justify-center py-6 text-sm text-gray-500">
                      {productSearchTerm ? "No se encontraron productos" : "Cargando productos..."}
                    </div>
                  ) : (
                    products.map((product) => (
                      <SelectItem key={product.id} value={product.id!}>
                        <div className="flex flex-col">
                          <span className="font-medium">{product.name}</span>
                          <span className="text-xs text-gray-500">{product.description}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Impresión</Label>

              <Select
                value={formData.type}
                onValueChange={(value) => handleChange("type", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>

                <SelectContent>
                  {printingTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label className="text-base font-semibold">
                Filamentos utilizados
              </Label>

              <Button
                type="button"
                variant="outline"
                onClick={addFilamentUsage}
              >
                Agregar filamento
              </Button>
            </div>

            <div className="space-y-3">
              {hasFilamentUsage ? (
                formData.filamentConsumptions?.map((usage, index) => (
                  <div
                    key={index}
                    className="grid gap-3 rounded-md border border-border bg-muted/20 p-3 sm:grid-cols-[minmax(0,1fr)_160px_auto] sm:items-center"
                  >
                    <Select
                      value={usage.filamentId}
                      onValueChange={(value) =>
                        updateFilamentUsage(index, "filamentId", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un filamento" />
                      </SelectTrigger>

                      <SelectContent>
                        {filaments.map((filament) => (
                          <SelectItem key={filament.id!} value={filament.id!}>
                            <div className="flex items-center justify-between w-full">
                              {/* Descripción del filamento */}
                              <span className="font-medium">{filament.type.toUpperCase()}</span>

                              {/* Colores (máximo 3) */}
                              <div className="flex gap-1 ml-2">
                                {filament.color
                                  .split(",")
                                  .map((c: string, i: number) => (
                                    <div
                                      key={i}
                                      className="w-4 h-4 rounded-full border"
                                      style={{ backgroundColor: c }}
                                    />
                                  ))}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                        
                        {/* Botón para cargar más filamentos */}
                        {filamentPagination && filamentParams.page < filamentPagination.totalPages && (
                          <div className="p-2 border-t">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={loadMoreFilaments}
                              disabled={isLoadingFilaments}
                              className="w-full"
                            >
                              {isLoadingFilaments ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  Cargando...
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4 mr-2" />
                                  Cargar más filamentos ({filamentPagination.totalCount - filaments.length} restantes)
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </SelectContent>
                    </Select>

                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={usage.gramsUsed}
                      onChange={(e) =>
                        updateFilamentUsage(index, "gramsUsed", e.target.value)
                      }
                      placeholder="Gramos"
                      className="w-full"
                    />

                    {(formData.filamentConsumptions?.length ?? 0) > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFilamentUsage(index)}
                        aria-label="Eliminar filamento"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aún no se han agregado filamentos.
                </p>
              )}
            </div>

            {hasFilamentUsage ? (
              <p className="text-sm text-muted-foreground">
                Total de gramos utilizados:{" "}
                <span className="font-medium">{totalGrams?.toFixed(2)}</span>
              </p>
            ) : null}
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="printTimeHours">
                Tiempo de Impresión (horas)
              </Label>

              <Input
                id="printTimeHours"
                type="number"
                step="0.1"
                placeholder="2.5"
                value={formData.printTimeHours}
                onChange={(e) =>
                  handleChange(
                    "printTimeHours",
                    Number.parseFloat(e.target.value) || 0
                  )
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="printerSearch">Impresora</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="printerSearch"
                  placeholder="Buscar impresora..."
                  value={printerSearchTerm}
                  onChange={(e) => setPrinterSearchTerm(e.target.value)}
                  className="pl-10"
                />
                {isLoadingPrinters && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
              <Select
                value={formData.printerId}
                onValueChange={(value) => handleChange("printerId", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona una impresora" />
                </SelectTrigger>

                <SelectContent>
                  {printers.length === 0 ? (
                    <div className="flex items-center justify-center py-6 text-sm text-gray-500">
                      {printerSearchTerm ? "No se encontraron impresoras" : "Cargando impresoras..."}
                    </div>
                  ) : (
                    printers.map((printer) => (
                      <SelectItem key={printer.id} value={printer.id!}>
                        <div className="flex flex-col">
                          <span className="font-medium">{printer.name}</span>
                          <span className="text-xs text-gray-500">{printer.model}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                  
                  {/* Botón para cargar más impresoras */}
                  {printerPagination && printerParams.page < printerPagination.totalPages && (
                    <div className="p-2 border-t">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={loadMorePrinters}
                        disabled={isLoadingPrinters}
                        className="w-full"
                      >
                        {isLoadingPrinters ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Cargando...
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-2" />
                            Cargar más impresoras ({printerPagination.totalCount - printers.length} restantes)
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </section>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full md:flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : printingHistory ? (
                "Actualizar Historial"
              ) : (
                "Agregar al Historial"
              )}
            </Button>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="secondary"
                onClick={onCalculate}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                Calcular Costo
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
            </div>
          </div>

          {formData.totalCost && (
            <div className="bg-muted/40 p-6 rounded-2xl shadow-md border space-y-4">
              <h3 className="text-xl font-bold text-foreground tracking-tight">
                Resultados Calculados
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-background rounded-xl p-4 text-center shadow-sm">
                  <p className="text-sm text-muted-foreground">
                    Total gasto energía
                  </p>
                  <p className="text-lg font-semibold text-primary">
                    {formatCurrency(formData.totalEnergyCost || 0)}
                  </p>
                </div>
                <div className="bg-background rounded-xl p-4 text-center shadow-sm">
                  <p className="text-sm text-muted-foreground">
                    Total filamentos
                  </p>
                  <p className="text-lg font-semibold text-primary">
                    {formatCurrency(formData.totalFilamentCost || 0)}
                  </p>
                </div>
                <div className="bg-primary/10 rounded-xl p-4 text-center shadow-sm">
                  <p className="text-sm text-primary font-medium">
                    Total costo
                  </p>
                  <p className="text-xl font-bold text-primary">
                    {formatCurrency(formData.totalCost || 0)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
