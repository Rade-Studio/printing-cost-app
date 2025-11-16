"use client"

import type React from "react"
import type { Printer } from "@/lib/types"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/lib/api"
import { Loader2, Printer as PrinterIcon, AlertCircle, CheckCircle, XCircle, Zap } from "lucide-react"
import { getUserFriendlyMessage } from "@/lib/utils/error-utils"

interface PrinterFormProps {
  printer?: Printer
  onSuccess: () => void
  onCancel: () => void
}

interface ValidationErrors {
  name?: string
  description?: string
  model?: string
  status?: string
  kwhPerHour?: string
}

interface FieldValidation {
  isValid: boolean
  message?: string
}

const printerStatuses = [
  { value: "active", label: "Activa" },
  { value: "maintenance", label: "Mantenimiento" },
  { value: "inactive", label: "Inactiva" },
  { value: "broken", label: "Dañada" }
]

const printerModels = [
  "Ender 3",
  "Ender 3 V2",
  "Ender 3 S1",
  "Ender 5",
  "Ender 5 Plus",
  "Prusa i3 MK3S+",
  "Prusa Mini+",
  "Ultimaker 3",
  "Ultimaker S3",
  "FlashForge Creator Pro",
  "Anycubic i3 Mega",
  "Creality CR-10",
  "Creality CR-10S",
  "Artillery Sidewinder X1",
  "Voron 2.4",
  "Voron Trident",
  "RatRig V-Core 3",
  "Custom/Other"
]

export function PrinterForm({ printer, onSuccess, onCancel }: PrinterFormProps) {
  // Determinar si el modelo es personalizado desde el inicio
  const isModelCustom = printer?.model ? !printerModels.includes(printer.model) : false
  
  const [formData, setFormData] = useState<Printer>({
    name: printer?.name || "",
    description: printer?.description || "",
    model: printer?.model || "",
    status: printer?.status || "active",
    kwhPerHour: printer?.kwhPerHour || 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [customModel, setCustomModel] = useState(printer?.model && isModelCustom ? printer.model : "")
  const [isCustomModel, setIsCustomModel] = useState(isModelCustom)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())

  // Funciones de validación
  const validateName = (name: string): FieldValidation => {
    if (!name.trim()) {
      return { isValid: false, message: "El nombre de la impresora es requerido" }
    }
    if (name.trim().length < 2) {
      return { isValid: false, message: "El nombre debe tener al menos 2 caracteres" }
    }
    if (name.trim().length > 50) {
      return { isValid: false, message: "El nombre no puede exceder 50 caracteres" }
    }
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(name.trim())) {
      return { isValid: false, message: "El nombre solo puede contener letras, números, espacios, guiones y guiones bajos" }
    }
    return { isValid: true }
  }

  const validateDescription = (description: string): FieldValidation => {
    if (description && description.length > 200) {
      return { isValid: false, message: "La descripción no puede exceder 200 caracteres" }
    }
    return { isValid: true }
  }

  const validateModel = (model: string): FieldValidation => {
    if (!model.trim()) {
      return { isValid: false, message: "El modelo de la impresora es requerido" }
    }
    if (model.trim().length < 2) {
      return { isValid: false, message: "El modelo debe tener al menos 2 caracteres" }
    }
    if (model.trim().length > 50) {
      return { isValid: false, message: "El modelo no puede exceder 50 caracteres" }
    }
    return { isValid: true }
  }

  const validateStatus = (status: string): FieldValidation => {
    const validStatuses = ["active", "maintenance", "inactive", "broken"]
    if (!status) {
      return { isValid: false, message: "El estado de la impresora es requerido" }
    }
    if (!validStatuses.includes(status)) {
      return { isValid: false, message: "Selecciona un estado válido" }
    }
    return { isValid: true }
  }

  const validateKwhPerHour = (kwhPerHour: number): FieldValidation => {
    if (kwhPerHour === 0 || isNaN(kwhPerHour)) {
      return { isValid: false, message: "El consumo de energía debe ser mayor a 0" }
    }
    if (kwhPerHour < 0.1) {
      return { isValid: false, message: "El consumo mínimo es 0.1 kWh/hora" }
    }
    if (kwhPerHour > 5.0) {
      return { isValid: false, message: "El consumo máximo es 5.0 kWh/hora" }
    }
    return { isValid: true }
  }

  const validateField = (field: keyof Printer, value: string | number): FieldValidation => {
    switch (field) {
      case 'name':
        return validateName(value as string)
      case 'description':
        return validateDescription(value as string)
      case 'model':
        return validateModel(value as string)
      case 'status':
        return validateStatus(value as string)
      case 'kwhPerHour':
        return validateKwhPerHour(value as number)
      default:
        return { isValid: true }
    }
  }

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}
    let isValid = true

    const nameValidation = validateName(formData.name)
    if (!nameValidation.isValid) {
      errors.name = nameValidation.message
      isValid = false
    }

    const descriptionValidation = validateDescription(formData.description)
    if (!descriptionValidation.isValid) {
      errors.description = descriptionValidation.message
      isValid = false
    }

    const modelValidation = validateModel(formData.model)
    if (!modelValidation.isValid) {
      errors.model = modelValidation.message
      isValid = false
    }

    const statusValidation = validateStatus(formData.status)
    if (!statusValidation.isValid) {
      errors.status = statusValidation.message
      isValid = false
    }

    const kwhValidation = validateKwhPerHour(formData.kwhPerHour)
    if (!kwhValidation.isValid) {
      errors.kwhPerHour = kwhValidation.message
      isValid = false
    }

    setValidationErrors(errors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Marcar todos los campos como tocados para mostrar errores
    setTouchedFields(new Set(['name', 'description', 'model', 'status', 'kwhPerHour']))
    
    if (!validateForm()) {
      setError("Por favor, corrige los errores en el formulario antes de continuar.")
      return
    }
    
    setIsLoading(true)
    setError("")

    try {
      if (printer?.id) {
        await apiClient.updatePrinter(printer.id, { ...formData, id: printer.id })
      } else {
        await apiClient.createPrinter(formData)
      }
      onSuccess()
    } catch (err) {
      setError(getUserFriendlyMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof Printer, value: string) => {
    if (field === "model") {
      if (value === "Custom/Other") {
        setIsCustomModel(true)
        setCustomModel(formData.model || "")
      } else {
        setIsCustomModel(false)
        setCustomModel("")
        setFormData((prev) => ({ ...prev, [field]: value }))
      }
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
    
    // Marcar el campo como tocado
    setTouchedFields((prev) => new Set(prev).add(field))
    
    // Validar el campo en tiempo real
    const validation = validateField(field, value)
    setValidationErrors((prev) => ({
      ...prev,
      [field]: validation.isValid ? undefined : validation.message
    }))
  }

  const handleCustomModelChange = (value: string) => {
    setCustomModel(value)
    setFormData((prev) => ({ ...prev, model: value }))
    
    // Marcar el campo como tocado
    setTouchedFields((prev) => new Set(prev).add('model'))
    
    // Validar el campo en tiempo real
    const validation = validateModel(value)
    setValidationErrors((prev) => ({
      ...prev,
      model: validation.isValid ? undefined : validation.message
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
    const nameValidation = validateName(formData.name)
    const descriptionValidation = validateDescription(formData.description)
    const modelValidation = validateModel(formData.model)
    const statusValidation = validateStatus(formData.status)
    const kwhValidation = validateKwhPerHour(formData.kwhPerHour)
    
    return nameValidation.isValid && 
           descriptionValidation.isValid && 
           modelValidation.isValid && 
           statusValidation.isValid && 
           kwhValidation.isValid
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Layout Horizontal - 2 Columnas */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Columna Izquierda: Formulario */}
              <div className="space-y-6">
                {/* Información Básica */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <PrinterIcon className="h-5 w-5 text-primary" />
                    Información Básica
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-foreground">
                        Nombre de la Impresora *
                        {touchedFields.has('name') && (
                          isFieldValid('name') ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )
                        )}
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Impresora Principal, Ender 3 Oficina..."
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className={`h-11 ${touchedFields.has('name') && !isFieldValid('name') ? 'border-red-500 focus:border-red-500' : ''}`}
                        required
                      />
                      {getFieldError('name') && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError('name')}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="description" className="flex items-center gap-2 text-sm font-medium text-foreground">
                        Descripción
                        {touchedFields.has('description') && (
                          isFieldValid('description') ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )
                        )}
                      </Label>
                      <Input
                        id="description"
                        type="text"
                        placeholder="Descripción breve de la impresora..."
                        value={formData.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                        className={`h-11 ${touchedFields.has('description') && !isFieldValid('description') ? 'border-red-500 focus:border-red-500' : ''}`}
                      />
                      <div className="bg-muted/50 p-2 rounded-lg">
                        <p className="text-xs text-muted-foreground">
                          {formData.description.length}/200 caracteres
                        </p>
                      </div>
                      {getFieldError('description') && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError('description')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Especificaciones Técnicas */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <PrinterIcon className="h-5 w-5 text-primary" />
                    Especificaciones Técnicas
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="model" className="flex items-center gap-2 text-sm font-medium text-foreground">
                        Modelo *
                        {touchedFields.has('model') && (
                          isFieldValid('model') ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )
                        )}
                      </Label>
                      <Select 
                        value={isCustomModel ? "Custom/Other" : formData.model} 
                        onValueChange={(value) => handleChange("model", value)}
                      >
                        <SelectTrigger className={`h-11 ${touchedFields.has('model') && !isFieldValid('model') ? 'border-red-500 focus:border-red-500' : ''}`}>
                          <SelectValue placeholder="Selecciona el modelo" />
                        </SelectTrigger>
                        <SelectContent>
                          {printerModels.map((model) => (
                            <SelectItem key={model} value={model}>
                              {model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {isCustomModel && (
                        <Input
                          id="customModel"
                          type="text"
                          placeholder="Escribe el modelo personalizado..."
                          value={customModel}
                          onChange={(e) => handleCustomModelChange(e.target.value)}
                          className={`h-11 ${touchedFields.has('model') && !isFieldValid('model') ? 'border-red-500 focus:border-red-500' : ''}`}
                          required
                        />
                      )}
                      {getFieldError('model') && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError('model')}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="status" className="flex items-center gap-2 text-sm font-medium text-foreground">
                        Estado *
                        {touchedFields.has('status') && (
                          isFieldValid('status') ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )
                        )}
                      </Label>
                      <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                        <SelectTrigger className={`h-11 ${touchedFields.has('status') && !isFieldValid('status') ? 'border-red-500 focus:border-red-500' : ''}`}>
                          <SelectValue placeholder="Selecciona el estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {printerStatuses.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {getFieldError('status') && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError('status')}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="kwhPerHour" className="flex items-center gap-2 text-sm font-medium text-foreground">
                      Consumo de Energía (kWh/hora) *
                      {touchedFields.has('kwhPerHour') && (
                        isFieldValid('kwhPerHour') ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )
                      )}
                    </Label>
                    <Input
                      id="kwhPerHour"
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="5.0"
                      placeholder="0.5"
                      value={formData.kwhPerHour}
                      onChange={(e) => handleChange("kwhPerHour", e.target.value)}
                      className={`h-11 ${touchedFields.has('kwhPerHour') && !isFieldValid('kwhPerHour') ? 'border-red-500 focus:border-red-500' : ''}`}
                      required
                    />
                    <div className="bg-muted/50 p-2 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        Consumo típico: 0.2-2.0 kWh/hora para impresoras 3D
                      </p>
                    </div>
                    {getFieldError('kwhPerHour') && (
                      <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                        <AlertCircle className="h-3 w-3" />
                        {getFieldError('kwhPerHour')}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Resumen y Botones */}
              <div className="space-y-6">
                {/* Resumen de la Impresora */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <PrinterIcon className="h-5 w-5 text-primary" />
                    Resumen de la Impresora
                  </h3>
                  
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-6 rounded-xl border border-primary/20">
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-background/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">Estado Actual</p>
                        <p className="text-2xl font-bold text-primary capitalize">
                          {printerStatuses.find(s => s.value === formData.status)?.label || 'No definido'}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-background/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">Consumo de Energía</p>
                        <p className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                          <Zap className="h-5 w-5" />
                          {formData.kwhPerHour || 0} kWh/h
                        </p>
                      </div>
                      <div className="text-center p-4 bg-background/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">Modelo</p>
                        <p className="text-lg font-semibold text-primary">
                          {formData.model || 'No seleccionado'}
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
                      ) : printer ? (
                        "Actualizar Impresora"
                      ) : (
                        "Agregar Impresora"
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
