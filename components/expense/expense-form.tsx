"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/lib/api"
import { Loader2, Receipt, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { getUserFriendlyMessage } from "@/lib/utils/error-utils"

interface Expense {
  id?: string
  description: string
  amount: number
  expenseDate: string
  category: string
}

interface ExpenseFormProps {
  expense?: Expense
  onSuccess: () => void
  onCancel: () => void
}

interface ValidationErrors {
  description?: string
  amount?: string
  expenseDate?: string
  category?: string
}

interface FieldValidation {
  isValid: boolean
  message?: string
}

const expenseCategories = [
  "Materiales",
  "Electricidad",
  "Mantenimiento",
  "Herramientas",
  "Software",
  "Marketing",
  "Transporte",
  "Oficina",
  "Servicios",
  "Otros",
]

export function ExpenseForm({ expense, onSuccess, onCancel }: ExpenseFormProps) {
  const [formData, setFormData] = useState<Expense>({
    description: expense?.description || "",
    amount: expense?.amount || 0,
    expenseDate: expense?.expenseDate ? expense.expenseDate.split("T")[0] : new Date().toISOString().split("T")[0],
    category: expense?.category || "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())

  // Funciones de validación
  const validateDescription = (description: string): FieldValidation => {
    if (!description.trim()) {
      return { isValid: false, message: "La descripción es requerida" }
    }
    if (description.trim().length < 5) {
      return { isValid: false, message: "La descripción debe tener al menos 5 caracteres" }
    }
    if (description.trim().length > 500) {
      return { isValid: false, message: "La descripción no puede exceder 500 caracteres" }
    }
    return { isValid: true }
  }

  const validateAmount = (amount: number): FieldValidation => {
    if (amount === 0 || isNaN(amount)) {
      return { isValid: false, message: "El monto debe ser mayor a 0" }
    }
    if (amount < 0) {
      return { isValid: false, message: "El monto no puede ser negativo" }
    }
    if (amount > 999999.99) {
      return { isValid: false, message: "El monto no puede exceder $999,999.99" }
    }
    return { isValid: true }
  }

  const validateExpenseDate = (expenseDate: string): FieldValidation => {
    if (!expenseDate) {
      return { isValid: false, message: "La fecha es requerida" }
    }
    
    const selectedDate = new Date(expenseDate)
    const today = new Date()
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(today.getFullYear() - 1)
    
    // Verificar que la fecha no sea futura
    if (selectedDate > today) {
      return { isValid: false, message: "La fecha no puede ser futura" }
    }
    
    // Verificar que la fecha no sea muy antigua (más de 1 año)
    if (selectedDate < oneYearAgo) {
      return { isValid: false, message: "La fecha no puede ser anterior a hace un año" }
    }
    
    return { isValid: true }
  }

  const validateCategory = (category: string): FieldValidation => {
    if (!category.trim()) {
      return { isValid: false, message: "La categoría es requerida" }
    }
    if (!expenseCategories.includes(category)) {
      return { isValid: false, message: "Selecciona una categoría válida" }
    }
    return { isValid: true }
  }

  const validateField = (field: keyof Expense, value: string | number): FieldValidation => {
    switch (field) {
      case 'description':
        return validateDescription(value as string)
      case 'amount':
        return validateAmount(value as number)
      case 'expenseDate':
        return validateExpenseDate(value as string)
      case 'category':
        return validateCategory(value as string)
      default:
        return { isValid: true }
    }
  }

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}
    let isValid = true

    const descriptionValidation = validateDescription(formData.description)
    if (!descriptionValidation.isValid) {
      errors.description = descriptionValidation.message
      isValid = false
    }

    const amountValidation = validateAmount(formData.amount)
    if (!amountValidation.isValid) {
      errors.amount = amountValidation.message
      isValid = false
    }

    const expenseDateValidation = validateExpenseDate(formData.expenseDate)
    if (!expenseDateValidation.isValid) {
      errors.expenseDate = expenseDateValidation.message
      isValid = false
    }

    const categoryValidation = validateCategory(formData.category)
    if (!categoryValidation.isValid) {
      errors.category = categoryValidation.message
      isValid = false
    }

    setValidationErrors(errors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Marcar todos los campos como tocados para mostrar errores
    setTouchedFields(new Set(['description', 'amount', 'expenseDate', 'category']))
    
    if (!validateForm()) {
      setError("Por favor, corrige los errores en el formulario antes de continuar.")
      return
    }
    
    setIsLoading(true)
    setError("")

    try {
      const expenseData = {
        ...formData,
        expenseDate: new Date(formData.expenseDate).toISOString(),
      }

      if (expense?.id) {
        await apiClient.updateExpense(expense.id, { ...expenseData, id: expense.id })
      } else {
        await apiClient.createExpense(expenseData)
      }
      onSuccess()
    } catch (err) {
      setError(getUserFriendlyMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof Expense, value: string | number) => {
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

  const isFormValid = (): boolean => {
    const descriptionValidation = validateDescription(formData.description)
    const amountValidation = validateAmount(formData.amount)
    const expenseDateValidation = validateExpenseDate(formData.expenseDate)
    const categoryValidation = validateCategory(formData.category)
    
    return descriptionValidation.isValid && 
           amountValidation.isValid && 
           expenseDateValidation.isValid && 
           categoryValidation.isValid
  }

  const isFieldValid = (field: keyof ValidationErrors): boolean => {
    if (!touchedFields.has(field)) return true
    return !validationErrors[field]
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          {expense ? "Editar Gasto" : "Nuevo Gasto"}
        </CardTitle>
        <CardDescription>
          {expense ? "Modifica la información del gasto" : "Registra un nuevo gasto del negocio"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              Descripción del Gasto *
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
              placeholder="Describe el gasto realizado..."
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
              className={touchedFields.has('description') && !isFieldValid('description') ? 'border-red-500 focus:border-red-500' : ''}
              required
            />
            {getFieldError('description') && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-3 w-3" />
                {getFieldError('description')}
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              {formData.description.length}/500 caracteres
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="flex items-center gap-2">
                Monto ($) *
                {touchedFields.has('amount') && (
                  isFieldValid('amount') ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )
                )}
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="1"
                max="999999.99"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleChange("amount", Number.parseFloat(e.target.value))}
                className={touchedFields.has('amount') && !isFieldValid('amount') ? 'border-red-500 focus:border-red-500' : ''}
                required
              />
              {getFieldError('amount') && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError('amount')}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="expenseDate" className="flex items-center gap-2">
                Fecha del Gasto *
                {touchedFields.has('expenseDate') && (
                  isFieldValid('expenseDate') ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )
                )}
              </Label>
              <Input
                id="expenseDate"
                type="date"
                value={formData.expenseDate}
                onChange={(e) => handleChange("expenseDate", e.target.value)}
                className={touchedFields.has('expenseDate') && !isFieldValid('expenseDate') ? 'border-red-500 focus:border-red-500' : ''}
                required
              />
              {getFieldError('expenseDate') && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError('expenseDate')}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="flex items-center gap-2">
              Categoría *
              {touchedFields.has('category') && (
                isFieldValid('category') ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )
              )}
            </Label>
            <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
              <SelectTrigger className={touchedFields.has('category') && !isFieldValid('category') ? 'border-red-500 focus:border-red-500' : ''}>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getFieldError('category') && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-3 w-3" />
                {getFieldError('category')}
              </div>
            )}
          </div>

          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading || !isFormValid()} 
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : expense ? (
                "Actualizar Gasto"
              ) : (
                "Registrar Gasto"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
