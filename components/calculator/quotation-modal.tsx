"use client";

import type React from "react";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiClient } from "@/lib/api";
import { X, Loader2, Package, DollarSign, FileText, Printer, CheckCircle } from "lucide-react";
import { Quotation, Product, FilamentConsumption } from "@/lib/types";
import { getUserFriendlyMessage } from "@/lib/utils/error-utils";
import { useLocale } from "@/app/localContext";

interface QuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingQuotationId?: string;
  existingProductId?: string;
  onCreateNew?: () => void;
  calculationData: {
    printerId: string;
    printTimeHours: number;
    printTimeMinutes: number;
    filamentConsumptions: FilamentConsumption[];
    workPackageId: string;
    workPackageHours: number;
    quantity: number;
    taxRate: number;
    packagingCost: number;
    additionalCosts: number;
    totalFilamentCost: number;
    totalEnergyCost: number;
    totalLaborCost: number;
    subtotalCost: number;
    taxAmount: number;
    totalCost: number;
    finalCostWithMargin: number;
    marginPercent: number;
  };
}

const FINAL_VALUE_OPTIONS = [
  { label: "Competitivo", value: 25, multiplier: 1.25 },
  { label: "Estándar", value: 40, multiplier: 1.40 },
  { label: "Premium", value: 60, multiplier: 1.60 },
  { label: "Lujo", value: 80, multiplier: 1.80 },
];

export function QuotationModal({ isOpen, onClose, onSuccess, existingQuotationId, existingProductId, onCreateNew, calculationData }: QuotationModalProps) {
  const { formatCurrency } = useLocale();
  const [title, setTitle] = useState("");
  const [createProduct, setCreateProduct] = useState(false);
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productImageUrl, setProductImageUrl] = useState("");
  const [productModelUrl, setProductModelUrl] = useState("");
  const [selectedFinalValue, setSelectedFinalValue] = useState<number>(40); // Estándar por defecto
  const [customFinalValue, setCustomFinalValue] = useState<number>(0);
  const [createPrintingHistory, setCreatePrintingHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [existingProduct, setExistingProduct] = useState<Product | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);

  // Calcular valor final basado en selección
  const finalValue = useMemo(() => {
    if (selectedFinalValue === 0 && customFinalValue > 0) {
      // Personalizado: valor absoluto
      return customFinalValue;
    }
    const option = FINAL_VALUE_OPTIONS.find(opt => opt.value === selectedFinalValue);
    if (option) {
      return calculationData.totalCost * option.multiplier;
    }
    return calculationData.finalCostWithMargin;
  }, [selectedFinalValue, customFinalValue, calculationData]);

  // Cargar producto existente cuando se está editando una cotización
  useEffect(() => {
    const loadExistingProduct = async () => {
      if (existingQuotationId && existingProductId) {
        setIsLoadingProduct(true);
        try {
          const product = await apiClient.getProduct(existingProductId);
          if (product) {
            setExistingProduct(product);
          }
        } catch (err) {
          console.error("Error loading product:", err);
        } finally {
          setIsLoadingProduct(false);
        }
      } else {
        setExistingProduct(null);
      }
    };

    if (isOpen) {
      loadExistingProduct();
    }
  }, [isOpen, existingQuotationId, existingProductId]);

  useEffect(() => {
    if (isOpen) {
      // Resetear valores cuando se abre el modal
      setTitle("");
      // Si hay una cotización existente, NO permitir crear producto nuevo
      setCreateProduct(false);
      setProductName("");
      setProductDescription("");
      setProductImageUrl("");
      setProductModelUrl("");
      setSelectedFinalValue(40);
      setCustomFinalValue(0);
      setCreatePrintingHistory(false);
      setError("");
      setSuccessMessage("");
    }
  }, [isOpen, existingQuotationId]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("El título de la cotización es requerido");
      return;
    }

    if (createProduct && !productName.trim()) {
      setError("El nombre del producto es requerido cuando se crea un producto");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const quotationData = {
        title: title.trim(),
        clientId: null,
        productId: existingProductId || null,
        printerId: calculationData.printerId,
        printTimeHours: calculationData.printTimeHours,
        printTimeMinutes: calculationData.printTimeMinutes,
        quantity: calculationData.quantity,
        taxRate: calculationData.taxRate,
        packagingCost: calculationData.packagingCost,
        additionalCosts: calculationData.additionalCosts,
        workPackageId: calculationData.workPackageId && calculationData.workPackageId !== "none" ? calculationData.workPackageId : null,
        workPackageHours: calculationData.workPackageHours,
        totalFilamentCost: calculationData.totalFilamentCost,
        totalEnergyCost: calculationData.totalEnergyCost,
        totalLaborCost: calculationData.totalLaborCost,
        subtotalCost: calculationData.subtotalCost,
        taxAmount: calculationData.taxAmount,
        totalCost: calculationData.totalCost,
        finalValue: finalValue,
        marginPercent: selectedFinalValue === 0 ? customFinalValue : selectedFinalValue,
        filamentConsumptions: calculationData.filamentConsumptions.map(fc => ({
          filamentId: fc.filamentId,
          gramsUsed: fc.gramsUsed || 0,
        })),
        createProduct: createProduct,
        productData: createProduct ? {
          name: productName.trim(),
          description: productDescription.trim(),
          imageUrl: productImageUrl.trim() || "",
          modelUrl: productModelUrl.trim() || "",
          workPackageId: calculationData.workPackageId && calculationData.workPackageId !== "none" ? calculationData.workPackageId : null,
          workPackagePerHour: calculationData.workPackageHours > 0 ? Math.round(calculationData.workPackageHours) : null,
          packagingCost: calculationData.packagingCost,
          additionalCosts: calculationData.additionalCosts,
          finalValue: finalValue,
        } : null,
        createPrintingHistory: createPrintingHistory,
      };

      if (existingQuotationId) {
        // Actualizar cotización existente
        await apiClient.updateQuotation(existingQuotationId, {
          ...quotationData,
          id: existingQuotationId,
        });
        setSuccessMessage("Cotización actualizada exitosamente");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        // Crear nueva cotización
        await apiClient.createQuotation(quotationData);
        setSuccessMessage("Cotización creada exitosamente");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError(getUserFriendlyMessage(err));
      console.error("Error creating quotation:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative z-50 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background rounded-lg shadow-xl border m-4">
        <div className="sticky top-0 bg-background border-b p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold">Guardar Cotización</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg flex items-center gap-2">
              <X className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 p-4 rounded-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {existingQuotationId && onCreateNew && (
            <div className="flex items-center justify-between gap-4 p-3 bg-muted/50 dark:bg-muted/30 border border-border rounded-lg">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded-md shrink-0">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    Editando cotización existente
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Los cambios se guardarán en la cotización actual
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onCreateNew();
                  setError("");
                  setSuccessMessage("");
                }}
                className="h-8 text-xs shrink-0"
              >
                <X className="h-3.5 w-3.5 mr-1.5" />
                Crear nueva
              </Button>
            </div>
          )}

          {/* Título de cotización */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Información de la Cotización
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título de la Cotización *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Cotización para cliente XYZ - Pieza ABC"
                />
              </div>
            </CardContent>
          </Card>

          {/* Producto asociado o creación de producto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {existingQuotationId && existingProduct ? "Producto Asociado" : "Crear Producto"}
              </CardTitle>
            </CardHeader>
            {existingQuotationId && existingProduct ? (
              <CardContent className="space-y-4">
                {isLoadingProduct ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="p-4 bg-muted/50 rounded-lg border">
                    <div className="space-y-2">
                      <div>
                        <Label className="text-sm text-muted-foreground">Nombre del Producto</Label>
                        <p className="font-semibold text-base">{existingProduct.name}</p>
                      </div>
                      {existingProduct.description && (
                        <div>
                          <Label className="text-sm text-muted-foreground">Descripción</Label>
                          <p className="text-sm">{existingProduct.description}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                        <div>
                          <Label className="text-sm text-muted-foreground">Valor Final</Label>
                          <p className="font-semibold text-primary">
                            {existingProduct.finalValue ? formatCurrency(existingProduct.finalValue) : "—"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Empaquetado</Label>
                          <p className="font-semibold">
                            {existingProduct.packagingCost ? formatCurrency(existingProduct.packagingCost) : "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            ) : (
              <>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="createProduct"
                      checked={createProduct}
                      onChange={(e) => setCreateProduct(e.target.checked)}
                      className="h-4 w-4"
                      disabled={!!existingQuotationId}
                    />
                    <Label htmlFor="createProduct" className={`cursor-pointer ${existingQuotationId ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      Crear producto desde esta cotización
                    </Label>
                  </div>
                </CardContent>
                {createProduct && (
                  <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Nombre del Producto *</Label>
                    <Input
                      id="productName"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="Nombre del producto"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productDescription">Descripción</Label>
                    <Input
                      id="productDescription"
                      value={productDescription}
                      onChange={(e) => setProductDescription(e.target.value)}
                      placeholder="Descripción del producto"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productImageUrl">URL de Imagen</Label>
                    <Input
                      id="productImageUrl"
                      value={productImageUrl}
                      onChange={(e) => setProductImageUrl(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productModelUrl">URL del Modelo 3D</Label>
                    <Input
                      id="productModelUrl"
                      value={productModelUrl}
                      onChange={(e) => setProductModelUrl(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {/* Empaquetado y costos adicionales (readonly) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <Label className="text-sm text-muted-foreground">Empaquetado</Label>
                    <p className="text-lg font-semibold">{formatCurrency(calculationData.packagingCost)}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Costos Adicionales</Label>
                    <p className="text-lg font-semibold">{formatCurrency(calculationData.additionalCosts)}</p>
                  </div>
                </div>

                {/* Selector de valor final */}
                <div className="space-y-4">
                  <Label>Valor Final del Producto</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {FINAL_VALUE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setSelectedFinalValue(option.value);
                          setCustomFinalValue(0);
                        }}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedFinalValue === option.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="text-sm font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.value}%</div>
                        <div className="text-sm font-bold mt-1">
                          {formatCurrency(calculationData.totalCost * option.multiplier)}
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {/* Opción personalizada */}
                  <div className="p-4 border-2 border-dashed rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="radio"
                        id="customValue"
                        checked={selectedFinalValue === 0}
                        onChange={() => setSelectedFinalValue(0)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="customValue" className="cursor-pointer">
                        Personalizado
                      </Label>
                    </div>
                    {selectedFinalValue === 0 && (
                      <div className="mt-2 space-y-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={customFinalValue}
                          onChange={(e) => setCustomFinalValue(Number(e.target.value))}
                          placeholder="Valor final del producto"
                        />
                        <p className="text-sm text-muted-foreground">
                          Este será el valor final por unidad del producto
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-primary/5 rounded-lg">
                    <Label className="text-sm text-muted-foreground">Valor Final Seleccionado</Label>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(finalValue)}</p>
                  </div>
                </div>
              </CardContent>
                )}
              </>
            )}
          </Card>

          {/* Opción de crear registro de impresión */}
          {(createProduct || existingQuotationId) && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Printer className="h-5 w-5" />
                    Registro de Impresión
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="createPrintingHistory"
                      checked={createPrintingHistory}
                      onChange={(e) => setCreatePrintingHistory(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="createPrintingHistory" className="cursor-pointer">
                      {existingQuotationId ? "Crear nuevo registro de impresión" : "Crear registro de impresión vinculado"}
                    </Label>
                  </div>
                </div>
                <CardDescription>
                  {existingQuotationId 
                    ? "Opcional: Crea un nuevo registro de impresión basado en esta cotización"
                    : "Opcional: Crea un registro de impresión asociado al producto"}
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* Resumen de costos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Resumen de Costos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Costo de Material:</span>
                <span>{formatCurrency(calculationData.totalFilamentCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Costo de Energía:</span>
                <span>{formatCurrency(calculationData.totalEnergyCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Costo de Mano de Obra:</span>
                <span>{formatCurrency(calculationData.totalLaborCost)}</span>
              </div>
              <div className="flex justify-between font-semibold pt-2 border-t">
                <span>Total:</span>
                <span>{formatCurrency(calculationData.totalCost)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Guardar Cotización
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

