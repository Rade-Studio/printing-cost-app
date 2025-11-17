"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Calculator, DollarSign, Package, Printer, Clock, FileText } from "lucide-react";
import { Quotation } from "@/lib/types";
import { useLocale } from "@/app/localContext";

interface QuotationDetailsModalProps {
  quotation: Quotation;
  isOpen: boolean;
  onClose: () => void;
  onLoadInCalculator: (quotation: Quotation) => void;
}

export function QuotationDetailsModal({ quotation, isOpen, onClose, onLoadInCalculator }: QuotationDetailsModalProps) {
  const { formatCurrency } = useLocale();

  // Función helper para formatear tiempo de impresión
  const formatPrintTime = (hours: number, minutes?: number | null): string => {
    if (minutes !== undefined && minutes !== null && minutes > 0) {
      // Usar campos separados si están disponibles
      const hoursInt = Math.floor(hours)
      const minutesInt = Math.round(minutes)
      if (hoursInt > 0 && minutesInt > 0) {
        return `${hoursInt}h ${minutesInt}m`
      } else if (hoursInt > 0) {
        return `${hoursInt}h`
      } else if (minutesInt > 0) {
        return `${minutesInt}m`
      }
      return "0h"
    } else {
      // Fallback: calcular desde horas decimales
      const hoursInt = Math.floor(hours)
      const minutesFromDecimal = Math.round((hours - hoursInt) * 60)
      if (hoursInt > 0 && minutesFromDecimal > 0) {
        return `${hoursInt}h ${minutesFromDecimal}m`
      } else if (hoursInt > 0) {
        return `${hoursInt}h`
      } else if (minutesFromDecimal > 0) {
        return `${minutesFromDecimal}m`
      }
      return "0h"
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative z-50 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background rounded-lg shadow-xl border m-4">
        <div className="sticky top-0 bg-background border-b p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold">{quotation.title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Información general */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Producto</p>
                  <p className="font-medium">{quotation.product?.name || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Impresora</p>
                  <p className="font-medium">{quotation.printer?.name || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cantidad</p>
                  <p className="font-medium">{quotation.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Creación</p>
                  <p className="font-medium">{new Date(quotation.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detalles de impresión */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Printer className="h-5 w-5" />
                Detalles de Impresión
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tiempo de Impresión</p>
                  <p className="font-medium font-mono text-lg">
                    {formatPrintTime(quotation.printTimeHours, quotation.printTimeMinutes)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Paquete de Trabajo</p>
                  <p className="font-medium">{quotation.workPackage?.name || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Horas de Trabajo</p>
                  <p className="font-medium">{quotation.workPackageHours.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Costos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Desglose de Costos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Costo de Material:</span>
                  <span>{formatCurrency(quotation.totalFilamentCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Costo de Energía:</span>
                  <span>{formatCurrency(quotation.totalEnergyCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Costo de Mano de Obra:</span>
                  <span>{formatCurrency(quotation.totalLaborCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Empaquetado:</span>
                  <span>{formatCurrency(quotation.packagingCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Costos Adicionales:</span>
                  <span>{formatCurrency(quotation.additionalCosts)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IVA ({quotation.taxRate}%):</span>
                  <span>{formatCurrency(quotation.taxAmount)}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t">
                  <span>Costo Total:</span>
                  <span>{formatCurrency(quotation.totalCost)}</span>
                </div>
                <div className="flex justify-between font-bold text-primary pt-2 border-t">
                  <span>Valor Final ({quotation.marginPercent}% margen):</span>
                  <span>{formatCurrency(quotation.finalValue)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            <Button onClick={() => onLoadInCalculator(quotation)}>
              <Calculator className="h-4 w-4 mr-2" />
              Cargar en Calculadora
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

