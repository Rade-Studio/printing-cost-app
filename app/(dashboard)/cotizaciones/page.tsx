"use client";

import { useState, useCallback } from "react";
import { QuotationList } from "@/components/calculator/quotation-list";
import { Quotation } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function CotizacionesPage() {
  const router = useRouter();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleLoadInCalculator = useCallback((quotation: Quotation) => {
    // Redirigir a la calculadora con los datos de la cotización
    // Los datos se pasarán mediante query params o estado global
    router.push("/calculadora-costos?quotationId=" + quotation.id);
  }, [router]);

  const handleEdit = useCallback((quotation: Quotation) => {
    // Por ahora, solo cargar en calculadora para editar
    handleLoadInCalculator(quotation);
  }, [handleLoadInCalculator]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Cotizaciones</h1>
        <p className="text-muted-foreground">
          Historial de todas las cotizaciones guardadas. Puedes cargar cualquier cotización en la calculadora para editarla o crear una nueva.
        </p>
      </div>

      <QuotationList 
        onEdit={handleEdit}
        onLoadInCalculator={handleLoadInCalculator}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
}

