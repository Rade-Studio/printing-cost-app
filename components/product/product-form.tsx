"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/lib/api"
import { Loader2, Briefcase, ImageIcon, FileText, AlertCircle, CheckCircle, XCircle, ExternalLink, Clock } from "lucide-react"
import { Product, WorkPackage } from "@/lib/types"
import { getUserFriendlyMessage } from "@/lib/utils/error-utils"

interface ProductFormProps {
  product?: Product
  onSuccess: () => void
  onCancel: () => void
}

interface ValidationErrors {
  name?: string
  description?: string
  imageUrl?: string
  modelUrl?: string
}

interface FieldValidation {
  isValid: boolean
  message?: string
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState<Product>({
    name: product?.name || "",
    description: product?.description || "",
    modelUrl: product?.modelUrl || "",
    imageUrl: product?.imageUrl || "",
    workPackageId: product?.workPackageId || null,
    workPackagePerHour: product?.workPackagePerHour || null,
  })
  const [workPackages, setWorkPackages] = useState<WorkPackage[]>([])
  const [isLoadingWorkPackages, setIsLoadingWorkPackages] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())

  // Cargar WorkPackages
  useEffect(() => {
    const loadWorkPackages = async () => {
      setIsLoadingWorkPackages(true)
      try {
        const packages = await apiClient.getWorkPackages()
        if (packages) {
          setWorkPackages(packages)
        }
      } catch (error) {
        console.error("Error loading work packages:", error)
      } finally {
        setIsLoadingWorkPackages(false)
      }
    }
    loadWorkPackages()
  }, [])

  // Funciones de validación
  const validateName = (name: string): FieldValidation => {
    if (!name.trim()) {
      return { isValid: false, message: "El nombre del producto es requerido" }
    }
    if (name.trim().length < 3) {
      return { isValid: false, message: "El nombre debe tener al menos 3 caracteres" }
    }
    if (name.trim().length > 100) {
      return { isValid: false, message: "El nombre no puede exceder 100 caracteres" }
    }
    if (!/^[a-zA-Z0-9\s\-_.,áéíóúÁÉÍÓÚñÑ]+$/.test(name.trim())) {
      return { isValid: false, message: "El nombre contiene caracteres no válidos" }
    }
    return { isValid: true }
  }

  const validateDescription = (description: string): FieldValidation => {
    if (!description.trim()) {
      return { isValid: false, message: "La descripción es requerida" }
    }
    if (description.trim().length < 20) {
      return { isValid: false, message: "La descripción debe tener al menos 20 caracteres" }
    }
    if (description.trim().length > 1000) {
      return { isValid: false, message: "La descripción no puede exceder 1000 caracteres" }
    }
    return { isValid: true }
  }

  const validateImageUrl = (imageUrl: string): FieldValidation => {
    if (!imageUrl.trim()) {
      return { isValid: true } // Opcional
    }
    
    const urlPattern = /^https?:\/\/.+\..+/
    if (!urlPattern.test(imageUrl.trim())) {
      return { isValid: false, message: "La URL de imagen debe ser válida (http:// o https://)" }
    }
    
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i
    if (!imageExtensions.test(imageUrl.trim())) {
      return { isValid: false, message: "La URL debe apuntar a una imagen (jpg, png, gif, webp, svg)" }
    }
    
    return { isValid: true }
  }

  const validateModelUrl = (modelUrl: string): FieldValidation => {
    if (!modelUrl.trim()) {
      return { isValid: true } // Opcional
    }
    
    const urlPattern = /^https?:\/\/.+\..+/
    if (!urlPattern.test(modelUrl.trim())) {
      return { isValid: false, message: "La URL del modelo debe ser válida (http:// o https://)" }
    }
    
    const modelExtensions = /\.(stl|obj|3mf|ply|blend|fbx|dae)(\?.*)?$/i
    if (!modelExtensions.test(modelUrl.trim())) {
      return { isValid: false, message: "La URL debe apuntar a un modelo 3D (stl, obj, 3mf, ply, blend, fbx, dae)" }
    }
    
    return { isValid: true }
  }

  const validateField = (field: keyof Product, value: string): FieldValidation => {
    switch (field) {
      case 'name':
        return validateName(value)
      case 'description':
        return validateDescription(value)
      case 'imageUrl':
        return validateImageUrl(value)
      case 'modelUrl':
        return validateModelUrl(value)
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

    const imageUrlValidation = validateImageUrl(formData.imageUrl)
    if (!imageUrlValidation.isValid) {
      errors.imageUrl = imageUrlValidation.message
      isValid = false
    }

    const modelUrlValidation = validateModelUrl(formData.modelUrl)
    if (!modelUrlValidation.isValid) {
      errors.modelUrl = modelUrlValidation.message
      isValid = false
    }

    setValidationErrors(errors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Marcar todos los campos como tocados para mostrar errores
    setTouchedFields(new Set(['name', 'description', 'imageUrl', 'modelUrl']))
    
    if (!validateForm()) {
      setError("Por favor, corrige los errores en el formulario antes de continuar.")
      return
    }
    
    setIsLoading(true)
    setError("")

    try {
      if (product?.id) {
        await apiClient.updateProduct(product.id, { ...formData, id: product.id })
      } else {
        await apiClient.createProduct(formData)
      }
      onSuccess()
    } catch (err) {
      setError(getUserFriendlyMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof Product, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    
    // Marcar el campo como tocado
    setTouchedFields((prev) => new Set(prev).add(field as string))
    
    // Validar el campo en tiempo real (solo para campos string)
    if (typeof value === 'string') {
      const validation = validateField(field, value)
      setValidationErrors((prev) => ({
        ...prev,
        [field]: validation.isValid ? undefined : validation.message
      }))
    }
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
    const imageUrlValidation = validateImageUrl(formData.imageUrl)
    const modelUrlValidation = validateModelUrl(formData.modelUrl)
    
    return nameValidation.isValid && 
           descriptionValidation.isValid && 
           imageUrlValidation.isValid && 
           modelUrlValidation.isValid
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
                    <Briefcase className="h-5 w-5 text-primary" />
                    Información del Producto
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-foreground">
                        Nombre del Producto *
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
                        placeholder="Ej: Figura decorativa, Prototipo funcional, Repuesto automotriz"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className={`h-11 ${touchedFields.has('name') && !isFieldValid('name') ? 'border-red-500 focus:border-red-500' : ''}`}
                        required
                      />
                      <div className="bg-muted/50 p-2 rounded-lg">
                        <p className="text-xs text-muted-foreground">
                          {formData.name.length}/100 caracteres
                        </p>
                      </div>
                      {getFieldError('name') && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError('name')}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="description" className="flex items-center gap-2 text-sm font-medium text-foreground">
                        Descripción *
                        {touchedFields.has('description') && (
                          isFieldValid('description') ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )
                        )}
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Describe las características, dimensiones, uso previsto y cualquier detalle relevante del producto..."
                        value={formData.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                        rows={4}
                        className={`${touchedFields.has('description') && !isFieldValid('description') ? 'border-red-500 focus:border-red-500' : ''}`}
                        required
                      />
                      <div className="bg-muted/50 p-2 rounded-lg">
                        <p className="text-xs text-muted-foreground">
                          {formData.description.length}/1000 caracteres
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

                {/* URLs y Recursos */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Recursos del Producto
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label htmlFor="imageUrl" className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <ImageIcon className="h-4 w-4" />
                        URL de la Imagen
                        {touchedFields.has('imageUrl') && (
                          isFieldValid('imageUrl') ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )
                        )}
                      </Label>
                      <Input
                        id="imageUrl"
                        type="url"
                        placeholder="https://ejemplo.com/imagen-del-producto.jpg"
                        value={formData.imageUrl}
                        onChange={(e) => handleChange("imageUrl", e.target.value)}
                        className={`h-11 ${touchedFields.has('imageUrl') && !isFieldValid('imageUrl') ? 'border-red-500 focus:border-red-500' : ''}`}
                      />
                      <div className="bg-muted/50 p-2 rounded-lg">
                        <p className="text-xs text-muted-foreground">
                          Formatos soportados: JPG, PNG, GIF, WebP, SVG
                        </p>
                      </div>
                      {getFieldError('imageUrl') && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError('imageUrl')}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="modelUrl" className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <FileText className="h-4 w-4" />
                        URL del Modelo 3D
                        {touchedFields.has('modelUrl') && (
                          isFieldValid('modelUrl') ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )
                        )}
                      </Label>
                      <Input
                        id="modelUrl"
                        type="url"
                        placeholder="https://ejemplo.com/modelo.stl"
                        value={formData.modelUrl}
                        onChange={(e) => handleChange("modelUrl", e.target.value)}
                        className={`h-11 ${touchedFields.has('modelUrl') && !isFieldValid('modelUrl') ? 'border-red-500 focus:border-red-500' : ''}`}
                      />
                      <div className="bg-muted/50 p-2 rounded-lg">
                        <p className="text-xs text-muted-foreground">
                          Formatos soportados: STL, OBJ, 3MF, PLY, Blend, FBX, DAE
                        </p>
                      </div>
                      {getFieldError('modelUrl') && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError('modelUrl')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* WorkPackage */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Paquete de Trabajo
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="workPackageId" className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Clock className="h-4 w-4" />
                        Paquete de Trabajo (Opcional)
                      </Label>
                      {isLoadingWorkPackages ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Cargando paquetes...
                        </div>
                      ) : (
                        <Select
                          value={formData.workPackageId || "none"}
                          onValueChange={(value) => handleChange("workPackageId", value === "none" ? null : value)}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Selecciona un paquete de trabajo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Sin paquete de trabajo</SelectItem>
                            {workPackages.map((wp) => (
                              <SelectItem key={wp.id} value={wp.id || ""}>
                                {wp.name} - {wp.calculationType === "Fixed" ? "Costo Fijo" : "Por Horas"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <div className="bg-muted/50 p-2 rounded-lg">
                        <p className="text-xs text-muted-foreground">
                          Selecciona un paquete de trabajo para calcular costos de mano de obra
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="workPackagePerHour" className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Clock className="h-4 w-4" />
                        Horas por Paquete (Opcional)
                      </Label>
                      <Input
                        id="workPackagePerHour"
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="0"
                        value={formData.workPackagePerHour || ""}
                        onChange={(e) => handleChange("workPackagePerHour", e.target.value ? parseInt(e.target.value) : null)}
                        className="h-11"
                      />
                      <div className="bg-muted/50 p-2 rounded-lg">
                        <p className="text-xs text-muted-foreground">
                          Número de horas de trabajo para este producto
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Vista Previa y Botones */}
              <div className="space-y-6">
                {/* Vista Previa */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    Vista Previa
                  </h3>
                  
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-6 rounded-xl border border-primary/20">
                    <div className="space-y-4">
                      {/* Vista previa de imagen */}
                      {formData.imageUrl && isFieldValid('imageUrl') ? (
                        <div className="text-center p-4 bg-background/50 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-3">Imagen del Producto</p>
                          <div className="border rounded-lg p-4 bg-muted">
                            <img
                              src={formData.imageUrl}
                              alt="Vista previa del producto"
                              className="max-w-full h-32 object-contain mx-auto rounded"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                                e.currentTarget.nextElementSibling?.classList.remove('hidden')
                              }}
                            />
                            <div className="hidden text-sm text-muted-foreground">
                              No se pudo cargar la imagen
                            </div>
                          </div>
                          <div className="mt-2">
                            <a 
                              href={formData.imageUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Ver imagen completa
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-4 bg-background/50 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-2">Imagen del Producto</p>
                          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 bg-muted/30">
                            <ImageIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Agrega una URL de imagen para ver la vista previa</p>
                          </div>
                        </div>
                      )}

                      {/* Información del modelo */}
                      {formData.modelUrl && isFieldValid('modelUrl') && (
                        <div className="text-center p-4 bg-background/50 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-2">Modelo 3D</p>
                          <div className="flex items-center justify-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <a 
                              href={formData.modelUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline"
                            >
                              Descargar modelo
                            </a>
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          </div>
                        </div>
                      )}
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
                      ) : product ? (
                        "Actualizar Producto"
                      ) : (
                        "Crear Producto"
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
