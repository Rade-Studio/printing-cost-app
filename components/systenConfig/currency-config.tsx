"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Globe, Check } from "lucide-react"
import { apiClient } from "@/lib/api"
import { useLocale } from "@/app/localContext"
import { useSystemConfig } from "@/app/systenConfigContext"
import { SystemConfig } from "@/lib/types"

const availableCurrencies = [
    { code: "COP", name: "Peso Colombiano", symbol: "$" },
    { code: "USD", name: "Dólar Estadounidense", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "MXN", name: "Peso Mexicano", symbol: "$" },
    { code: "ARS", name: "Peso Argentino", symbol: "$" },
    { code: "BRL", name: "Real Brasileño", symbol: "R$" },
]

export function CurrencyConfig() {
    const [currentCurrency, setCurrentCurrency] = useState<string>("COP")
    const [selectedCurrency, setSelectedCurrency] = useState<string>("COP")
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const { currency, setCurrency } = useLocale()
    const { refreshConfigs } = useSystemConfig()

    useEffect(() => {
        fetchCurrentCurrency()
    }, [])

    const fetchCurrentCurrency = async () => {
        try {
            setIsLoading(true)
            const configs = await apiClient.getSystemConfig()
            const currencyConfig = configs?.find(config => config.key === "DefaultCurrency")

            if (currencyConfig) {
                setCurrentCurrency(currencyConfig.value)
                setSelectedCurrency(currencyConfig.value)
                setCurrency(currencyConfig.value)
            } else {
                // Si no existe la configuración, crear una por defecto
                await apiClient.createSystemConfig({
                    key: "DefaultCurrency",
                    value: "COP"
                })
                setCurrentCurrency("COP")
                setSelectedCurrency("COP")
                setCurrency("COP")
            }
        } catch (error) {
            console.error("Error fetching currency config:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCurrencyChange = async () => {
        if (selectedCurrency === currentCurrency) return

        try {
            setIsSaving(true)

            // Buscar la configuración existente
            const configs = await apiClient.getSystemConfig()
            const currencyConfig = configs?.find(config => config.key === "DefaultCurrency")

            if (currencyConfig) {
                // Actualizar configuración existente
                await apiClient.updateSystemConfig(currencyConfig.id!, {
                    id: currencyConfig.id,
                    key: "DefaultCurrency",
                    value: selectedCurrency
                })
            } else {
                // Crear nueva configuración
                await apiClient.createSystemConfig({
                    key: "DefaultCurrency",
                    value: selectedCurrency
                })
            }

            // Actualizar estados locales
            setCurrentCurrency(selectedCurrency)
            setCurrency(selectedCurrency)
            
            // Refrescar el contexto de configuración del sistema
            await refreshConfigs()

        } catch (error) {
            console.error("Error updating currency:", error)
        } finally {
            setIsSaving(false)
        }
    }

    const hasChanges = selectedCurrency !== currentCurrency

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    <div>
                        <CardTitle>Configuración de Moneda</CardTitle>
                        <CardDescription>
                            Selecciona la moneda por defecto para cálculos y reportes
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Moneda Actual</label>
                    <Select
                        value={selectedCurrency}
                        onValueChange={setSelectedCurrency}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccionar moneda" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableCurrencies.map((currency) => (
                                <SelectItem key={currency.code} value={currency.code}>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{currency.symbol}</span>
                                        <span>{currency.name}</span>
                                        <span className="text-muted-foreground">({currency.code})</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {hasChanges && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <Check className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-700">
                            Cambios pendientes. Haz clic en "Guardar" para aplicar la nueva moneda.
                        </span>
                    </div>
                )}

                <div className="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setSelectedCurrency(currentCurrency)}
                        disabled={!hasChanges}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleCurrencyChange}
                        disabled={!hasChanges || isSaving}
                    >
                        {isSaving ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                    <p>La moneda seleccionada se aplicará a:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Cálculos de costos de impresión</li>
                        <li>Reportes de ventas</li>
                        <li>Facturación</li>
                        <li>Todos los valores monetarios del sistema</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    )
}
