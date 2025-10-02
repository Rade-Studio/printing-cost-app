"use client";

import type React from "react";
import type {
  Filament,
  Printer as PrinterType,
  WorkPackage,
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
import { Loader2, Calculator, Search, ChevronDown, Trash, RotateCcw, Printer, Clock, Package, HelpCircle, HelpCircle as Help, X, ChevronRight } from "lucide-react";
import { useLocale } from "@/app/localContext";
import { useSystemConfig } from "@/app/systenConfigContext";

// Componente de Tooltip personalizado
const CustomTooltip = ({ children, content }: { children: React.ReactNode; content: string }) => {
  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-3 bg-slate-900 dark:bg-slate-800 text-white text-sm rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out pointer-events-none z-50 max-w-xs whitespace-normal text-center border border-slate-700 backdrop-blur-sm">
        <div className="font-medium leading-relaxed">
          {content}
        </div>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-slate-900 dark:border-t-slate-800"></div>
      </div>
    </div>
  );
};

// Componente del Sidebar de Ayuda
const HelpSidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const faqData = [
    {
      category: "📊 Cómo se Calculan los Costos",
      items: [
        {
          question: "¿Cómo se calcula el costo de material?",
          answer: "Se multiplican los gramos de cada filamento por su costo por gramo. Ejemplo: 50g de PLA a $0.03/g = $1.50"
        },
        {
          question: "¿Cómo se calcula el costo de energía?",
          answer: "Se multiplica el consumo de la impresora (kWh) por el costo de electricidad por el tiempo de impresión. Ejemplo: 0.2 kWh × $0.15 × 5 horas = $0.15"
        },
        {
          question: "¿Qué incluye el costo de mano de obra?",
          answer: "Incluye el paquete de trabajo seleccionado, costos de empaquetado y cualquier costo adicional que agregues."
        },
        {
          question: "¿Cómo funciona el IVA?",
          answer: "Se aplica como porcentaje sobre el subtotal (material + energía + mano de obra). Se incluye automáticamente en el total final."
        }
      ]
    },
    {
      category: "🎯 Confiabilidad de los Cálculos",
      items: [
        {
          question: "¿Qué tan precisos son los cálculos?",
          answer: "Los cálculos son muy precisos basándose en los datos que ingreses. La precisión depende de la exactitud de los datos de consumo de filamento y tiempo."
        },
        {
          question: "¿Se consideran todos los costos?",
          answer: "Se incluyen material, energía, mano de obra, empaquetado y costos adicionales. No incluye depreciación de equipos o costos indirectos."
        },
        {
          question: "¿Cómo asegurar datos precisos?",
          answer: "Usa datos reales de tus impresiones anteriores, pesa el filamento usado, y mide tiempos reales de impresión."
        }
      ]
    },
    {
      category: "💰 Estrategias de Precios",
      items: [
        {
          question: "¿Qué margen de ganancia usar?",
          answer: "Competitivo (25%): Para ganar clientes. Estándar (40%): Equilibrio precio-ganancia. Premium (60%): Trabajos especializados. Lujo (80%): Proyectos únicos."
        },
        {
          question: "¿Cuándo usar cada nivel de precio?",
          answer: "Competitivo: Clientes nuevos, volumen alto. Estándar: Clientes regulares. Premium: Trabajos complejos, plazos cortos. Lujo: Prototipos únicos, materiales especiales."
        },
        {
          question: "¿Cómo justificar precios altos?",
          answer: "Destaca la calidad, precisión, materiales premium, post-procesamiento, diseño personalizado, y soporte técnico incluido."
        }
      ]
    },
    {
      category: "🚀 Consejos para Mejores Ventas",
      items: [
        {
          question: "¿Cómo presentar el presupuesto?",
          answer: "Muestra el desglose de costos, explica el valor agregado, ofrece opciones (básico/premium), y incluye tiempos de entrega."
        },
        {
          question: "¿Qué servicios adicionales ofrecer?",
          answer: "Diseño 3D, post-procesamiento, pintado, ensamblaje, empaquetado premium, garantía extendida, y soporte técnico."
        },
        {
          question: "¿Cómo manejar clientes que buscan precio bajo?",
          answer: "Ofrece alternativas: menos post-procesamiento, materiales estándar, tiempos de entrega más largos, o descuentos por volumen."
        },
        {
          question: "¿Cómo aumentar el valor percibido?",
          answer: "Documenta el proceso, muestra comparaciones con métodos tradicionales, incluye certificados de calidad, y ofrece revisiones gratuitas."
        }
      ]
    },
    {
      category: "⚡ Optimización de Costos",
      items: [
        {
          question: "¿Cómo reducir costos de material?",
          answer: "Optimiza el relleno, usa soportes mínimos, agrupa impresiones, negocia precios por volumen de filamento."
        },
        {
          question: "¿Cómo reducir tiempo de impresión?",
          answer: "Ajusta la resolución según necesidad, optimiza orientación de piezas, usa perfiles de velocidad apropiados."
        },
        {
          question: "¿Cuándo rechazar un trabajo?",
          answer: "Si el margen es menor al 20%, si requiere materiales no disponibles, o si el cliente no valora la calidad."
        }
      ]
    }
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-[480px] bg-gray-50 dark:bg-gray-100 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-300 bg-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Help className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Centro de Ayuda</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-gray-200 text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {faqData.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2">
                  {category.category}
                </h3>
                <div className="space-y-3">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                      <h4 className="font-medium text-gray-800 mb-2 flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        {item.question}
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed ml-6">
                        {item.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-300 bg-white">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-gray-700 text-center">
                💡 <strong className="text-blue-700">Tip:</strong> Usa los iconos de ayuda (?) junto a cada campo para obtener información específica.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

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

interface CalculatorFormData {
  printerId: string;
  printTimeHours: number;
  filamentConsumptions: FilamentConsumption[];
  workPackageId: string;
  workPackageHours: number;
  quantity: number;
  taxRate: number; // Tasa de IVA en %
  packagingCost: number; // Valor de empaquetado
  additionalCosts: number; // Costos adicionales
}

export function CostCalculator() {
  const [formData, setFormData] = useState<CalculatorFormData>({
    printerId: "",
    printTimeHours: 0,
    filamentConsumptions: [],
    workPackageId: "",
    workPackageHours: 0,
    quantity: 1,
    taxRate: 0,
    packagingCost: 0,
    additionalCosts: 0,
  });

  const [showHelpSidebar, setShowHelpSidebar] = useState(false);

  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [filamentPagination, setFilamentPagination] = useState<PaginationMetadata | null>(null);
  const [filamentParams, setFilamentParams] = useState<PaginationRequest>({
    page: 1,
    pageSize: 50,
    searchTerm: "",
  });
  const [printers, setPrinters] = useState<PrinterType[]>([]);
  const [printerPagination, setPrinterPagination] = useState<PaginationMetadata | null>(null);
  const [printerParams, setPrinterParams] = useState<PaginationRequest>({
    page: 1,
    pageSize: 50,
    searchTerm: "",
  });
  const [workPackages, setWorkPackages] = useState<WorkPackage[]>([]);
  const [printerSearchTerm, setPrinterSearchTerm] = useState("");
  const [isLoadingFilaments, setIsLoadingFilaments] = useState(false);
  const [isLoadingPrinters, setIsLoadingPrinters] = useState(false);
  const [isLoadingWorkPackages, setIsLoadingWorkPackages] = useState(false);
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [customMargin, setCustomMargin] = useState(30);
  
  const { formatCurrency } = useLocale();
  const { configs, refreshConfigs } = useSystemConfig();

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

  // Cargar paquetes de trabajo
  const loadWorkPackages = async () => {
    try {
      setIsLoadingWorkPackages(true);
      const response = await apiClient.getWorkPackages();
      if (response) {
        setWorkPackages(response || []);
      }
    } catch (err) {
      console.error("Error loading work packages:", err);
    } finally {
      setIsLoadingWorkPackages(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([
          loadPrinters(),
          loadFilaments(),
          loadWorkPackages(),
          refreshConfigs(),
        ]);
      } catch (err) {
        console.error("Error loading initial data:", err);
      }
    };

    loadInitialData();
  }, []);

  // Debounce para búsqueda de impresoras
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const newParams = {
        ...printerParams,
        searchTerm: printerSearchTerm,
        page: 1,
      };
      setPrinterParams(newParams);
      loadPrinters(newParams);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [printerSearchTerm]);

  // Cálculo reactivo de costos
  const calculatedResult = useMemo(() => {
    // Siempre retornar un resultado, incluso si faltan datos
    const printTimeHours = formData.printTimeHours || 0;
    const quantity = formData.quantity || 1;
    
    // Obtener impresora seleccionada
    const selectedPrinter = printers.find(p => p.id === formData.printerId);

    // Calcular costo de filamentos
    let totalFilamentCost = 0;
    let totalGramsUsed = 0;
    
    if (formData.filamentConsumptions?.length) {
      for (const consumption of formData.filamentConsumptions) {
        if (consumption.filamentId && consumption.gramsUsed) {
          const filament = filaments.find(f => f.id === consumption.filamentId);
          if (filament && filament.costPerGram) {
            totalFilamentCost += consumption.gramsUsed * filament.costPerGram;
            totalGramsUsed += consumption.gramsUsed;
          }
        }
      }
    }

    // Calcular costo de energía
    const energyCostPerKwh = Number(configs['ElectricityCostPerKwh'] || 0);
    const printerKwh = selectedPrinter?.kwhPerHour || 0;
    const totalEnergyCost = printerKwh * energyCostPerKwh * printTimeHours;

    // Calcular costo de mano de obra
    const selectedWorkPackage = workPackages.find(wp => wp.id === formData.workPackageId && formData.workPackageId !== "none");
    let workPackageCost = 0;
    
    if (selectedWorkPackage) {
      const workHours = formData.workPackageHours || 0;
      if (selectedWorkPackage.calculationType === "Fixed") {
        workPackageCost = selectedWorkPackage.value || 0;
      } else if (selectedWorkPackage.calculationType === "Multiply") {
        workPackageCost = workHours * (selectedWorkPackage.value || 0);
      }
    }

    // Agregar empaquetado y costos adicionales a mano de obra
    const packagingCost = formData.packagingCost || 0;
    const additionalCosts = formData.additionalCosts || 0;
    const totalLaborCost = workPackageCost + packagingCost + additionalCosts;

    // Costo total por unidad (filamentos + energía)
    const costPerUnit = totalFilamentCost + totalEnergyCost;
    
    // Costo total considerando cantidad y mano de obra (incluyendo empaquetado y adicionales)
    const subtotalCost = (costPerUnit * quantity) + totalLaborCost;
    
    // Calcular IVA si se especifica
    const taxRate = formData.taxRate || 0;
    const taxAmount = subtotalCost * (taxRate / 100);
    const totalCost = subtotalCost + taxAmount;

    // Calcular margen de ganancia
    const marginPercent = customMargin;
    const marginAmount = totalCost * marginPercent / 100;
    const finalCostWithMargin = totalCost + marginAmount;

    return {
      totalFilamentCost,
      totalEnergyCost,
      totalGramsUsed,
      workPackageCost,
      packagingCost,
      additionalCosts,
      totalLaborCost,
      costPerUnit,
      subtotalCost,
      taxRate,
      taxAmount,
      totalCost,
      marginAmount,
      finalCostWithMargin,
      quantity,
    };
  }, [
    formData.printerId,
    formData.printTimeHours,
    formData.filamentConsumptions,
    formData.workPackageId,
    formData.workPackageHours,
    formData.quantity,
    formData.taxRate,
    formData.packagingCost,
    formData.additionalCosts,
    printers,
    filaments,
    workPackages,
    configs,
    customMargin
  ]);

  // Actualizar el resultado cuando cambie el cálculo
  useEffect(() => {
    setCalculationResult(calculatedResult);
  }, [calculatedResult]);

  const handleConsumptionsChange = (next: FilamentConsumption[]) => {
    setFormData((prev) => ({
      ...prev,
      filamentConsumptions: next,
    }));
  };

  const addFilamentUsage = () => {
    const newUsage: FilamentConsumption = { filamentId: "", gramsUsed: undefined };
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
        const grams = typeof value === "number" ? value : Number.parseFloat(value);
        return { ...usage, gramsUsed: Number.isNaN(grams) ? undefined : grams };
      }

      return { ...usage, filamentId: String(value) };
    });

    handleConsumptionsChange(next);
  };

  const resetForm = () => {
    setFormData({
      printerId: "",
      printTimeHours: 0,
      filamentConsumptions: [],
      workPackageId: "",
      workPackageHours: 0,
      quantity: 1,
      taxRate: 0,
      packagingCost: 0,
      additionalCosts: 0,
    });
    setCalculationResult(null);
    setCustomMargin(30);
  };

  const totalGrams = useMemo(
    () => calculatedResult?.totalGramsUsed || 0,
    [calculatedResult]
  );

  const hasFilamentUsage = (formData.filamentConsumptions?.length ?? 0) > 0;

  // Cargar más filamentos cuando se necesite
  const loadMoreFilaments = () => {
    if (filamentPagination && filamentParams.page && filamentParams.page < filamentPagination.totalPages && !isLoadingFilaments) {
      const newParams = { ...filamentParams, page: filamentParams.page + 1 };
      setFilamentParams(newParams);
      loadFilaments(newParams);
    }
  };

  // Cargar más impresoras cuando se necesite
  const loadMorePrinters = () => {
    if (printerPagination && printerParams.page && printerParams.page < printerPagination.totalPages && !isLoadingPrinters) {
      const newParams = { ...printerParams, page: printerParams.page + 1 };
      setPrinterParams(newParams);
      loadPrinters(newParams);
    }
  };

  const handleChange = (
    field: keyof CalculatorFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header con botón de reset */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calculator className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Calculadora de Costos de Impresión 3D</h1>
            <p className="text-muted-foreground">
              Calcula rápidamente el costo de impresión sin necesidad de guardar datos
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={resetForm}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reiniciar
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Formulario */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              Detalles del Proyecto
            </CardTitle>
            <CardDescription>
              Configura los parámetros para calcular el costo de impresión
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Impresora */}
            <div className="space-y-2">
              <Label htmlFor="printerSearch" className="flex items-center gap-2">
                <Printer className="h-4 w-4 text-muted-foreground" />
                <span>Impresora</span>
                <CustomTooltip content="Selecciona la impresora 3D que utilizarás. Esto determina el consumo de energía por hora.">
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </CustomTooltip>
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="printerSearch"
                  placeholder="Buscar impresora..."
                  value={printerSearchTerm}
                  onChange={(e) => setPrinterSearchTerm(e.target.value)}
                  className="pl-10"
                />
                {isLoadingPrinters && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
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
                    <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                      {printerSearchTerm ? "No se encontraron impresoras" : "Cargando impresoras..."}
                    </div>
                  ) : (
                    printers.map((printer) => (
                      <SelectItem key={printer.id} value={printer.id!}>
                        <div className="flex flex-col">
                          <span className="font-medium">{printer.name}</span>
                          <span className="text-xs text-muted-foreground">{printer.model}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                  
                  {/* Botón para cargar más impresoras */}
                  {printerPagination && printerParams.page && printerParams.page < printerPagination.totalPages && (
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

            {/* Tiempo de impresión y cantidad */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="printTimeHours" className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Tiempo de Impresión</span>
                  <CustomTooltip content="Tiempo estimado que tardará la impresión en completarse. Se usa para calcular el costo de energía.">
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </CustomTooltip>
                </Label>
                <Input
                  id="printTimeHours"
                  type="number"
                  step="1"
                  placeholder="2.5"
                  value={formData.printTimeHours || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      handleChange("printTimeHours", 0);
                    } else {
                      const numValue = Number.parseFloat(value);
                      handleChange("printTimeHours", isNaN(numValue) ? 0 : numValue);
                    }
                  }}
                  required
                />
                <p className="text-xs text-muted-foreground">horas</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity" className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>Cantidad</span>
                  <CustomTooltip content="Número de piezas que deseas imprimir. Los costos se multiplicarán por esta cantidad.">
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </CustomTooltip>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    handleChange("quantity", e.target.value === "" ? 1 : Number.parseInt(e.target.value) || 1)
                  }
                  required
                />
              </div>
            </div>

            {/* Filamentos utilizados */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  Filamentos utilizados
                  <CustomTooltip content="Selecciona los tipos de filamento y especifica cuántos gramos usarás de cada uno para calcular el costo del material.">
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </CustomTooltip>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addFilamentUsage}
                  className="border-primary/20 hover:bg-primary/5"
                >
                  Agregar filamento
                </Button>
              </div>

              <div className="space-y-3">
                {hasFilamentUsage ? (
                  formData.filamentConsumptions?.map((usage, index) => (
                    <div
                      key={index}
                      className="grid gap-3 rounded-md border border-border bg-muted/20 p-3 sm:grid-cols-[minmax(0,1fr)_120px_auto] sm:items-center"
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
                                <span className="font-medium">{filament.type.toUpperCase()}</span>
                                <div className="flex gap-1 ml-2">
                                {typeof filament.color === 'string' ? filament.color
                                  .split(",")
                                  .map((c: string, i: number) => (
                                      <div
                                        key={i}
                                        className="w-4 h-4 rounded-full border"
                                        style={{ backgroundColor: c }}
                                      />
                                    )) : null}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                          
                          {/* Botón para cargar más filamentos */}
                          {filamentPagination && filamentParams.page && filamentParams.page < filamentPagination.totalPages && (
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
                                    Cargar más filamentos
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

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFilamentUsage(index)}
                        aria-label="Eliminar filamento"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Aún no se han agregado filamentos.
                  </p>
                )}
              </div>

              {hasFilamentUsage && (
                <p className="text-sm text-muted-foreground">
                  Total de gramos utilizados:{" "}
                  <span className="font-medium">{totalGrams.toFixed(2)}</span>
                </p>
              )}
            </div>

            {/* Paquete de trabajo */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                Paquete de Trabajo
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="workPackage" className="flex items-center gap-2">
                      <span>Paquete de Trabajo</span>
                      <CustomTooltip content="Selecciona un paquete de trabajo predefinido que incluye tarifas por diseño, modelado, post-procesamiento, etc.">
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </CustomTooltip>
                    </Label>
                    <Select 
                      value={formData.workPackageId} 
                      onValueChange={(value) => handleChange("workPackageId", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona paquete (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin paquete de trabajo</SelectItem>
                        {workPackages?.map((wp) => (
                          <SelectItem key={wp.id ?? ''} value={wp.id ?? ''}>
                            {wp.name} - {wp.calculationType} ({formatCurrency(wp.value)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {formData.workPackageId && formData.workPackageId !== "none" && (
                    <div className="space-y-2">
                      <Label htmlFor="workPackageHours" className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Horas de Trabajo</span>
                        <CustomTooltip content="Número de horas que dedicarás al trabajo adicional (diseño, post-procesamiento, etc.). Solo aplica para paquetes con tarifa por hora.">
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </CustomTooltip>
                      </Label>
                      <Input
                        id="workPackageHours"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="0"
                        value={formData.workPackageHours}
                        onChange={(e) => handleChange("workPackageHours",Number.parseFloat(e.target.value))}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Costos Adicionales */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                Costos Adicionales
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxRate" className="flex items-center gap-2">
                    <span>Tasa de IVA (%)</span>
                    <CustomTooltip content="Porcentaje de IVA que se aplicará al subtotal. Déjalo vacío si no aplica impuestos.">
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </CustomTooltip>
                  </Label>
                  <Input
                    id="taxRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="19"
                    value={formData.taxRate || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "") {
                        handleChange("taxRate", 0);
                      } else {
                        const numValue = Number.parseFloat(value);
                        handleChange("taxRate", isNaN(numValue) ? 0 : numValue);
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">Opcional</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="packagingCost" className="flex items-center gap-2">
                    <span>Empaquetado</span>
                    <CustomTooltip content="Costo adicional por materiales de empaquetado, cajas, protección, etc.">
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </CustomTooltip>
                  </Label>
                  <Input
                    id="packagingCost"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.packagingCost || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "") {
                        handleChange("packagingCost", 0);
                      } else {
                        const numValue = Number.parseFloat(value);
                        handleChange("packagingCost", isNaN(numValue) ? 0 : numValue);
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalCosts" className="flex items-center gap-2">
                    <span>Costos Adicionales</span>
                    <CustomTooltip content="Cualquier costo extra no contemplado en otras categorías (envío, materiales especiales, etc.).">
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </CustomTooltip>
                  </Label>
                  <Input
                    id="additionalCosts"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.additionalCosts || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "") {
                        handleChange("additionalCosts", 0);
                      } else {
                        const numValue = Number.parseFloat(value);
                        handleChange("additionalCosts", isNaN(numValue) ? 0 : numValue);
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Información de cálculo automático */}
            <div className="bg-muted/20 p-4 rounded-lg border border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calculator className="h-4 w-4" />
                <span>Los costos se calculan automáticamente mientras completas los campos</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        <div className="space-y-6">
          {/* Precios Sugeridos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Precios Sugeridos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Competitivo */}
                <div className="p-4 rounded-xl border-2 border-green-400 dark:border-green-600 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-black">Competitivo</span>
                    <span className="text-xs bg-black-400 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                      25%
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-black">
                      {formatCurrency((calculationResult?.totalCost || 0) * 1.25)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Por unidad: {formatCurrency(((calculationResult?.totalCost || 0) * 1.25) / (calculationResult?.quantity || 1))}
                    </p>
                  </div>
                </div>

                {/* Estándar */}
                <div className="p-4 rounded-xl border-2 border-cyan-300 dark:border-cyan-600 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-black">Estándar</span>
                    <span className="text-xs bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 px-2 py-1 rounded-full">
                      40%
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-black">
                      {formatCurrency((calculationResult?.totalCost || 0) * 1.40)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Por unidad: {formatCurrency(((calculationResult?.totalCost || 0) * 1.40) / (calculationResult?.quantity || 1))}
                    </p>
                  </div>
                </div>

                {/* Premium */}
                <div className="p-4 rounded-xl border-2 border-orange-300 dark:border-orange-600 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-black">Premium</span>
                    <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full">
                      60%
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-black">
                      {formatCurrency((calculationResult?.totalCost || 0) * 1.60)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Por unidad: {formatCurrency(((calculationResult?.totalCost || 0) * 1.60) / (calculationResult?.quantity || 1))}
                    </p>
                  </div>
                </div>

                {/* Lujo */}
                <div className="p-4 rounded-xl border-2 border-pink-300 dark:border-pink-600 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-black">Lujo</span>
                    <span className="text-xs bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 px-2 py-1 rounded-full">
                      80%
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-black">
                      {formatCurrency((calculationResult?.totalCost || 0) * 1.80)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Por unidad: {formatCurrency(((calculationResult?.totalCost || 0) * 1.80) / (calculationResult?.quantity || 1))}
                    </p>
                  </div>
                </div>
              </div>

              {/* Personalizado con slider */}
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-primary">Personalizado</span>
                  <span className="text-sm text-primary font-medium">
                    {customMargin}% margen de beneficio
                  </span>
                </div>
                
                {/* Slider para margen personalizado */}
                <div className="mb-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={customMargin}
                    onChange={(e) => setCustomMargin(Number(e.target.value))}
                    className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider focus:outline-none focus:ring-2 focus:ring-primary/50"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${customMargin}%, #e5e7eb ${customMargin}%, #e5e7eb 100%)`,
                      WebkitAppearance: 'none',
                      appearance: 'none'
                    }}
                  />
                  <style jsx>{`
                    .slider::-webkit-slider-thumb {
                      appearance: none;
                      height: 20px;
                      width: 20px;
                      border-radius: 50%;
                      background: #3b82f6;
                      cursor: pointer;
                      border: 2px solid #ffffff;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    }
                    .slider::-moz-range-thumb {
                      height: 20px;
                      width: 20px;
                      border-radius: 50%;
                      background: #3b82f6;
                      cursor: pointer;
                      border: 2px solid #ffffff;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    }
                  `}</style>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency((calculationResult?.totalCost || 0) * (1 + customMargin / 100))}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Por unidad: {formatCurrency(((calculationResult?.totalCost || 0) * (1 + customMargin / 100)) / (calculationResult?.quantity || 1))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Desglose de Costos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Desglose de Costos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Costo de Material */}
                <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <p className="text-sm text-muted-foreground">Costo de Material</p>
                      <CustomTooltip content="Incluye el costo de todos los filamentos utilizados. Se calcula multiplicando los gramos de cada filamento por su precio por gramo.">
                        <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                      </CustomTooltip>
                    </div>
                    <p className="text-xl font-bold text-foreground">
                      {calculationResult && calculationResult.totalFilamentCost > 0 ? formatCurrency(calculationResult.totalFilamentCost) : "—"}
                    </p>
                  </div>
                </div>

                {/* Costo de Mano de Obra */}
                <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <p className="text-sm text-muted-foreground">Costo de Mano de Obra</p>
                      <CustomTooltip content="Incluye paquetes de trabajo, diseño, post-procesamiento, empaquetado y cualquier costo adicional que hayas especificado.">
                        <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                      </CustomTooltip>
                    </div>
                    <p className="text-xl font-bold text-foreground">
                      {calculationResult && calculationResult.totalLaborCost > 0 ? formatCurrency(calculationResult.totalLaborCost) : "—"}
                    </p>
                    {calculationResult && calculationResult.totalLaborCost > 0 && (calculationResult.packagingCost > 0 || calculationResult.additionalCosts > 0) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Incluye empaquetado y adicionales
                      </p>
                    )}
                  </div>
                </div>

                {/* Costo de Máquina */}
                <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <p className="text-sm text-muted-foreground">Costo de Máquina</p>
                      <CustomTooltip content="Costo de energía eléctrica consumida por la impresora. Se calcula multiplicando el consumo en kWh por el precio de la electricidad y el tiempo de impresión.">
                        <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                      </CustomTooltip>
                    </div>
                    <p className="text-xl font-bold text-foreground">
                      {calculationResult && calculationResult.totalEnergyCost > 0 ? formatCurrency(calculationResult.totalEnergyCost) : "—"}
                    </p>
                  </div>
                </div>

                {/* Costo Total - donde estaba el subtotal */}
                <div className="bg-primary p-4 rounded-xl border-2 border-border shadow-sm">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <p className="text-sm text-primary-foreground font-medium">
                        Total {calculationResult?.taxRate && calculationResult?.taxRate > 0 ? "(con IVA)" : ""}
                      </p>
                      <CustomTooltip content="Suma de todos los costos: material + máquina + mano de obra. Si especificaste IVA, se incluye automáticamente en este total.">
                        <HelpCircle className="h-3 w-3 text-primary-foreground cursor-help opacity-80 hover:opacity-100" />
                      </CustomTooltip>
                    </div>
                    <p className="text-xl font-bold text-secondary">
                      {calculationResult && calculationResult.totalCost > 0 ? formatCurrency(calculationResult.totalCost) : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Botón flotante de ayuda */}
      <Button
        onClick={() => setShowHelpSidebar(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90 text-primary-foreground z-30 transition-all duration-300 hover:scale-110"
        size="icon"
      >
        <Help className="h-6 w-6" />
      </Button>

      {/* Sidebar de ayuda */}
      <HelpSidebar 
        isOpen={showHelpSidebar} 
        onClose={() => setShowHelpSidebar(false)} 
      />
    </div>
  );
}
