"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/lib/api"
import { Loader2, Package, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { useLocale } from "@/app/localContext"
import { Filament } from "@/lib/types"
import { MultiColorPicker } from "./multiply-color-picker"

interface FilamentFormProps {
  filament?: Filament
  onSuccess: () => void
  onCancel: () => void
}

interface ValidationErrors {
  type?: string
  color?: string
  costPerGram?: string
  density?: string
  stockGrams?: string
}

interface FieldValidation {
  isValid: boolean
  message?: string
}

const filamentTypes = [
  "PLA",
  "PLA+",
  "ABS",
  "PETG",
  "TPU",
  "ASA",
  "PC",
  "Nylon",
  "Relleno de Madera",
  "Relleno Metálico",
  "Fibra de Carbono",
  "Brilla en la Oscuridad",
  "Transparente",
  "Flexible",
]

export function FilamentForm({ filament, onSuccess, onCancel }: FilamentFormProps) {
  const [formData, setFormData] = useState<Filament>({
    type: filament?.type || "",
    color: filament?.color || [],
    costPerGram: filament?.costPerGram || 0,
    stockGrams: filament?.stockGrams || 0,
    density: filament?.density || 1,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const { formatCurrency } = useLocale()

  // Funciones de validación
  const validateType = (type: string): FieldValidation => {
    if (!type.trim()) {
      return { isValid: false, message: "El tipo de filamento es requerido" }
    }
    if (!filamentTypes.includes(type)) {
      return { isValid: false, message: "Selecciona un tipo de filamento válido" }
    }
    return { isValid: true }
  }

  const validateColor = (color: string[]): FieldValidation => {
    if (!color || color.length === 0) {
      return { isValid: false, message: "Debe seleccionar al menos un color" }
    }
    if (color.length > 5) {
      return { isValid: false, message: "Máximo 5 colores por filamento" }
    }
    return { isValid: true }
  }

  const validateCostPerGram = (costPerGram: number): FieldValidation => {
    if (costPerGram === 0 || isNaN(costPerGram)) {
      return { isValid: false, message: "El costo por gramo debe ser mayor a 0" }
    }
    if (costPerGram < 0.001) {
      return { isValid: false, message: "El costo mínimo es $0.001 por gramo" }
    }
    if (costPerGram > 300) {
      return { isValid: false, message: "El costo máximo es $300 por gramo" }
    }
    return { isValid: true }
  }

  const validateDensity = (density: number): FieldValidation => {
    if (density === 0 || isNaN(density)) {
      return { isValid: false, message: "La densidad debe ser mayor a 0" }
    }
    if (density < 0.5) {
      return { isValid: false, message: "La densidad mínima es 0.5 g/cm³" }
    }
    return { isValid: true }
  }

  const validateStockGrams = (stockGrams: number): FieldValidation => {
    if (stockGrams === 0 || isNaN(stockGrams)) {
      return { isValid: false, message: "El stock debe ser mayor a 0" }
    }
    if (stockGrams < 1) {
      return { isValid: false, message: "El stock mínimo es 1 gramo" }
    }
    if (stockGrams > 100000) {
      return { isValid: false, message: "El stock máximo es 100,000 gramos (100 kg)" }
    }
    return { isValid: true }
  }

  const validateField = (field: keyof Filament, value: string | number | string[]): FieldValidation => {
    switch (field) {
      case 'type':
        return validateType(value as string)
      case 'color':
        return validateColor(value as string[])
      case 'costPerGram':
        return validateCostPerGram(value as number)
      case 'density':
        return validateDensity(value as number)
      case 'stockGrams':
        return validateStockGrams(value as number)
      default:
        return { isValid: true }
    }
  }

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}
    let isValid = true

    const typeValidation = validateType(formData.type)
    if (!typeValidation.isValid) {
      errors.type = typeValidation.message
      isValid = false
    }

    const colorValidation = validateColor(formData.color as string[])
    if (!colorValidation.isValid) {
      errors.color = colorValidation.message
      isValid = false
    }

    const costValidation = validateCostPerGram(formData.costPerGram)
    if (!costValidation.isValid) {
      errors.costPerGram = costValidation.message
      isValid = false
    }

    const densityValidation = validateDensity(formData.density)
    if (!densityValidation.isValid) {
      errors.density = densityValidation.message
      isValid = false
    }

    const stockValidation = validateStockGrams(formData.stockGrams)
    if (!stockValidation.isValid) {
      errors.stockGrams = stockValidation.message
      isValid = false
    }

    setValidationErrors(errors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Marcar todos los campos como tocados para mostrar errores
    setTouchedFields(new Set(['type', 'color', 'costPerGram', 'density', 'stockGrams']))
    
    if (!validateForm()) {
      setError("Por favor, corrige los errores en el formulario antes de continuar.")
      return
    }
    
    setIsLoading(true)
    setError("")

    try {
      if (filament?.id) {
        await apiClient.updateFilament(filament.id, { 
          ...formData, 
          color: (formData.color as string[]).join(","),
          Id: filament.id 
        })
      } else {
        await apiClient.createFilament({ ...formData, color: (formData.color as string[]).join(",") })
      }
      onSuccess()
    } catch (err) {
      setError("Error al guardar el filamento. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof Filament, value: string | number | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    
    // Marcar el campo como tocado
    setTouchedFields((prev) => new Set(prev).add(field))
    
    // Validar el campo en tiempo real
    const validation = validateField(field, value)
    setValidationErrors((prev) => ({
      ...prev,
      [field]: validation.isValid ? undefined : validation.message
    }))
  }

  const getFieldError = (field: keyof ValidationErrors): string | undefined => {
    return touchedFields.has(field) ? validationErrors[field] : undefined
  }

  const isFieldValid = (field: keyof ValidationErrors): boolean => {
    if (!touchedFields.has(field)) return true
    return !validationErrors[field]
  }

  const isFormValid = (): boolean => {
    const typeValidation = validateType(formData.type)
    const colorValidation = validateColor(formData.color as string[])
    const costValidation = validateCostPerGram(formData.costPerGram)
    const densityValidation = validateDensity(formData.density)
    const stockValidation = validateStockGrams(formData.stockGrams)
    
    return typeValidation.isValid && 
           colorValidation.isValid && 
           costValidation.isValid && 
           densityValidation.isValid && 
           stockValidation.isValid
  }

  const costPerKg = (formData.costPerGram || 0) * 1000

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Layout Horizontal - 2 Columnas */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Columna Izquierda: Formulario */}
              <div className="space-y-6">
                {/* Identificación del Filamento */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Información del Filamento
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="type" className="flex items-center gap-2 text-sm font-medium text-foreground">
                        Tipo de Filamento *
                        {touchedFields.has('type') && (
                          isFieldValid('type') ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )
                        )}
                      </Label>
                      <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                        <SelectTrigger className={`h-11 ${touchedFields.has('type') && !isFieldValid('type') ? 'border-red-500 focus:border-red-500' : ''}`}>
                          <SelectValue placeholder="Selecciona el tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {filamentTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {getFieldError('type') && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError('type')}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="color" className="flex items-center gap-2 text-sm font-medium text-foreground">
                        Colores *
                        {touchedFields.has('color') && (
                          isFieldValid('color') ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )
                        )}
                      </Label>
                      <div className="min-h-[44px] flex items-center">
                        <MultiColorPicker value={formData.color as string[]} onChange={(colors) => handleChange("color", colors)} />
                      </div>
                      {getFieldError('color') && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError('color')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Especificaciones Técnicas */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Especificaciones Técnicas
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="costPerGram" className="flex items-center gap-2 text-sm font-medium text-foreground">
                        Costo por Gramo ($) *
                        {touchedFields.has('costPerGram') && (
                          isFieldValid('costPerGram') ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )
                        )}
                      </Label>
                      <Input
                        id="costPerGram"
                        type="number"
                        min="1"
                        max="300"
                        placeholder="80"
                        value={formData.costPerGram}
                        onChange={(e) => handleChange("costPerGram", Number.parseFloat(e.target.value))}
                        className={`h-11 ${touchedFields.has('costPerGram') && !isFieldValid('costPerGram') ? 'border-red-500 focus:border-red-500' : ''}`}
                        required
                      />
                      <div className="bg-muted/50 p-2 rounded-lg">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-semibold text-primary">${costPerKg.toFixed(2)}</span> por kg
                        </p>
                      </div>
                      {getFieldError('costPerGram') && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError('costPerGram')}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="density" className="flex items-center gap-2 text-sm font-medium text-foreground">
                        Densidad (g/cm³) *
                        {touchedFields.has('density') && (
                          isFieldValid('density') ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )
                        )}
                      </Label>
                      <Input
                        id="density"
                        type="number"
                        step="0.01"
                        min="0.5"
                        placeholder="1.23"
                        value={formData.density}
                        onChange={(e) => handleChange("density", Number.parseFloat(e.target.value))}
                        className={`h-11 ${touchedFields.has('density') && !isFieldValid('density') ? 'border-red-500 focus:border-red-500' : ''}`}
                        required
                      />
                      <div className="bg-muted/50 p-2 rounded-lg">
                        <p className="text-xs text-muted-foreground">
                          Densidad del material
                        </p>
                      </div>
                      {getFieldError('density') && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError('density')}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="stockGrams" className="flex items-center gap-2 text-sm font-medium text-foreground">
                        Stock (gramos) *
                        {touchedFields.has('stockGrams') && (
                          isFieldValid('stockGrams') ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )
                        )}
                      </Label>
                      <Input
                        id="stockGrams"
                        type="number"
                        min="1"
                        max="100000"
                        placeholder="1000"
                        value={formData.stockGrams}
                        onChange={(e) => handleChange("stockGrams", Number.parseInt(e.target.value))}
                        className={`h-11 ${touchedFields.has('stockGrams') && !isFieldValid('stockGrams') ? 'border-red-500 focus:border-red-500' : ''}`}
                        required
                      />
                      <div className="bg-muted/50 p-2 rounded-lg">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-semibold text-primary">{((formData.stockGrams || 0) / 1000).toFixed(2)} kg</span>
                        </p>
                      </div>
                      {getFieldError('stockGrams') && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError('stockGrams')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Resumen y Botones */}
              <div className="space-y-6">
                {/* Resumen del Rollo */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Resumen del Rollo
                  </h3>
                  
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-6 rounded-xl border border-primary/20">
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-background/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">Valor Total del Stock</p>
                        <p className="text-3xl font-bold text-primary">
                          {formatCurrency((formData.costPerGram || 0) * (formData.stockGrams || 0))}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-background/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">Peso Total</p>
                        <p className="text-3xl font-bold text-primary">
                          {((formData.stockGrams || 0) / 1000).toFixed(2)} kg
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      type="submit" 
                      disabled={isLoading || !isFormValid()} 
                      className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : filament ? (
                        "Actualizar Filamento"
                      ) : (
                        "Agregar Filamento"
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={onCancel} 
                      disabled={isLoading}
                      className="h-12 px-6"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mensaje de error general */}
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                {error}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
