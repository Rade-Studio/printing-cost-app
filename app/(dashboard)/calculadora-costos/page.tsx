"use client"

import { CostCalculator } from "@/components/calculator/cost-calculator"
import { Suspense, useState, useEffect } from "react"

function CalculadoraCostosContent() {
  // Usar window.location para obtener parámetros de URL (compatible con client components)
  const [quotationId, setQuotationId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("quotationId");
      setQuotationId(id || undefined);
    }
  }, []);

  return (
    <div className="space-y-6">
      <CostCalculator quotationId={quotationId} />
    </div>
  )
}

export default function CalculadoraCostosPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <CalculadoraCostosContent />
    </Suspense>
  )
}
