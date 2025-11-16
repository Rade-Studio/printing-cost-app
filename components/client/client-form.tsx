"use client"

import type React from "react"
import type { Client } from "@/lib/types"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient } from "@/lib/api"
import { Loader2, AlertCircle, CheckCircle, XCircle, User, Mail, Phone, MapPin, Building } from "lucide-react"
import { getUserFriendlyMessage } from "@/lib/utils/error-utils"

interface ClientFormProps {
  client?: Client
  onSuccess: () => void
  onCancel: () => void
}

interface ValidationErrors {
  name?: string
  email?: string
  phone?: string
  address?: string
  city?: string
}

interface FieldValidation {
  isValid: boolean
  message?: string
}

export function ClientForm({ client, onSuccess, onCancel }: ClientFormProps) {
  const [formData, setFormData] = useState<Client>({
    name: client?.name || "",
    email: client?.email || "",
    phone: client?.phone || "",
    address: client?.address || "",
    city: client?.city || "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())

  // Funciones de validación
  const validateName = (name: string): FieldValidation => {
    if (!name.trim()) {
      return { isValid: false, message: "El nombre es requerido" }
    }
    if (name.trim().length < 2) {
      return { isValid: false, message: "El nombre debe tener al menos 2 caracteres" }
    }
    if (name.trim().length > 100) {
      return { isValid: false, message: "El nombre no puede exceder 100 caracteres" }
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(name.trim())) {
      return { isValid: false, message: "El nombre solo puede contener letras y espacios" }
    }
    return { isValid: true }
  }

  const validateEmail = (email: string): FieldValidation => {
    if (!email.trim()) {
      return { isValid: false, message: "El correo electrónico es requerido" }
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email.trim())) {
      return { isValid: false, message: "Formato de correo electrónico inválido" }
    }
    if (email.trim().length > 255) {
      return { isValid: false, message: "El correo electrónico no puede exceder 255 caracteres" }
    }
    return { isValid: true }
  }

  const validatePhone = (phone: string): FieldValidation => {
    if (!phone.trim()) {
      return { isValid: false, message: "El teléfono es requerido" }
    }
    // Permitir números, espacios, guiones, paréntesis y el símbolo +
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,20}$/
    if (!phoneRegex.test(phone.trim())) {
      return { isValid: false, message: "Formato de teléfono inválido. Use números, espacios, guiones y paréntesis" }
    }
    // Verificar que tenga al menos 7 dígitos numéricos
    const digitsOnly = phone.replace(/\D/g, '')
    if (digitsOnly.length < 7) {
      return { isValid: false, message: "El teléfono debe tener al menos 7 dígitos" }
    }
    if (digitsOnly.length > 15) {
      return { isValid: false, message: "El teléfono no puede tener más de 15 dígitos" }
    }
    return { isValid: true }
  }

  const validateAddress = (address: string): FieldValidation => {
    if (!address.trim()) {
      return { isValid: false, message: "La dirección es requerida" }
    }
    if (address.trim().length < 5) {
      return { isValid: false, message: "La dirección debe tener al menos 5 caracteres" }
    }
    if (address.trim().length > 200) {
      return { isValid: false, message: "La dirección no puede exceder 200 caracteres" }
    }
    return { isValid: true }
  }

  const validateCity = (city: string): FieldValidation => {
    if (!city.trim()) {
      return { isValid: false, message: "La ciudad es requerida" }
    }
    if (city.trim().length < 2) {
      return { isValid: false, message: "La ciudad debe tener al menos 2 caracteres" }
    }
    if (city.trim().length > 50) {
      return { isValid: false, message: "La ciudad no puede exceder 50 caracteres" }
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(city.trim())) {
      return { isValid: false, message: "La ciudad solo puede contener letras y espacios" }
    }
    return { isValid: true }
  }

  const validateField = (field: keyof Client, value: string): FieldValidation => {
    switch (field) {
      case 'name':
        return validateName(value)
      case 'email':
        return validateEmail(value)
      case 'phone':
        return validatePhone(value)
      case 'address':
        return validateAddress(value)
      case 'city':
        return validateCity(value)
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

    const emailValidation = validateEmail(formData.email)
    if (!emailValidation.isValid) {
      errors.email = emailValidation.message
      isValid = false
    }

    const phoneValidation = validatePhone(formData.phone)
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.message
      isValid = false
    }

    const addressValidation = validateAddress(formData.address)
    if (!addressValidation.isValid) {
      errors.address = addressValidation.message
      isValid = false
    }

    const cityValidation = validateCity(formData.city)
    if (!cityValidation.isValid) {
      errors.city = cityValidation.message
      isValid = false
    }

    setValidationErrors(errors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Marcar todos los campos como tocados para mostrar errores
    setTouchedFields(new Set(['name', 'email', 'phone', 'address', 'city']))
    
    if (!validateForm()) {
      setError("Por favor, corrige los errores en el formulario antes de continuar.")
      return
    }
    
    setIsLoading(true)
    setError("")

    try {
      if (client?.id) {
        await apiClient.updateClient(client.id, { ...formData, id: client.id })
      } else {
        await apiClient.createClient(formData)
      }
      onSuccess()
    } catch (err) {
      setError(getUserFriendlyMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof Client, value: string) => {
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
    const nameValidation = validateName(formData.name)
    const emailValidation = validateEmail(formData.email)
    const phoneValidation = validatePhone(formData.phone)
    const addressValidation = validateAddress(formData.address)
    const cityValidation = validateCity(formData.city)
    
    return nameValidation.isValid && 
           emailValidation.isValid && 
           phoneValidation.isValid && 
           addressValidation.isValid && 
           cityValidation.isValid
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Layout Horizontal Compacto */}
            <div className="space-y-6">
              {/* Primera Fila: Nombre y Email */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <User className="h-4 w-4" />
                    Nombre Completo *
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
                    placeholder="Juan Pérez"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={`h-11 ${touchedFields.has('name') && !isFieldValid('name') ? 'border-red-500 focus:border-red-500' : ''}`}
                    required
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      {formData.name.length}/100 caracteres
                    </p>
                    {getFieldError('name') && (
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        {getFieldError('name')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Mail className="h-4 w-4" />
                    Correo Electrónico *
                    {touchedFields.has('email') && (
                      isFieldValid('email') ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )
                    )}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="juan@email.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={`h-11 ${touchedFields.has('email') && !isFieldValid('email') ? 'border-red-500 focus:border-red-500' : ''}`}
                    required
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      Para comunicaciones y facturación
                    </p>
                    {getFieldError('email') && (
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        {getFieldError('email')}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Segunda Fila: Teléfono y Ciudad */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Phone className="h-4 w-4" />
                    Teléfono *
                    {touchedFields.has('phone') && (
                      isFieldValid('phone') ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )
                    )}
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className={`h-11 ${touchedFields.has('phone') && !isFieldValid('phone') ? 'border-red-500 focus:border-red-500' : ''}`}
                    required
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      Números, espacios, guiones y paréntesis
                    </p>
                    {getFieldError('phone') && (
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        {getFieldError('phone')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="city" className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Building className="h-4 w-4" />
                    Ciudad *
                    {touchedFields.has('city') && (
                      isFieldValid('city') ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )
                    )}
                  </Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="Ciudad"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className={`h-11 ${touchedFields.has('city') && !isFieldValid('city') ? 'border-red-500 focus:border-red-500' : ''}`}
                    required
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      {formData.city.length}/50 caracteres
                    </p>
                    {getFieldError('city') && (
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        {getFieldError('city')}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tercera Fila: Dirección */}
              <div className="space-y-3">
                <Label htmlFor="address" className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <MapPin className="h-4 w-4" />
                  Dirección Completa *
                  {touchedFields.has('address') && (
                    isFieldValid('address') ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )
                  )}
                </Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="Calle Principal 123, Colonia Centro"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className={`h-11 ${touchedFields.has('address') && !isFieldValid('address') ? 'border-red-500 focus:border-red-500' : ''}`}
                  required
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    {formData.address.length}/200 caracteres
                  </p>
                  {getFieldError('address') && (
                    <div className="flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="h-3 w-3" />
                      {getFieldError('address')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
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
                ) : client ? (
                  "Actualizar Cliente"
                ) : (
                  "Crear Cliente"
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
