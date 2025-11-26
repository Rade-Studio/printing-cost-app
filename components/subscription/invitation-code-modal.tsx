"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { apiClient } from "@/lib/api"
import { Loader2, Gift, X } from "lucide-react"
import { getErrorMessage } from "@/lib/errors/error-messages"

interface InvitationCodeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function InvitationCodeModal({ open, onOpenChange, onSuccess }: InvitationCodeModalProps) {
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const formatInvitationCode = (value: string): string => {
    const cleaned = value.replace(/[-\s]/g, '').toUpperCase()
    if (cleaned.length <= 5) return cleaned
    if (cleaned.length <= 10) return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`
    if (cleaned.length <= 15) return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 10)}-${cleaned.slice(10)}`
    if (cleaned.length <= 20) return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 10)}-${cleaned.slice(10, 15)}-${cleaned.slice(15)}`
    if (cleaned.length <= 25) return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 10)}-${cleaned.slice(10, 15)}-${cleaned.slice(15, 20)}-${cleaned.slice(20)}`
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 10)}-${cleaned.slice(10, 15)}-${cleaned.slice(15, 20)}-${cleaned.slice(20, 25)}`
  }

  const handleCodeChange = (value: string) => {
    const formatted = formatInvitationCode(value)
    setCode(formatted)
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!code.trim()) {
      setError("Por favor ingresa un código de invitación")
      return
    }

    const normalizedCode = code.replace(/[-\s]/g, '')
    if (normalizedCode.length !== 25) {
      setError("El código de invitación debe tener 25 caracteres")
      return
    }

    setIsLoading(true)
    try {
      await apiClient.applyInvitationCode(code.trim())
      setCode("")
      onOpenChange(false)
      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      console.error("Error applying invitation code:", err)
      if (err instanceof Error) {
        const errorCode = (err as any).code
        if (errorCode) {
          setError(getErrorMessage(errorCode))
        } else {
          setError(err.message || "Error al aplicar el código de invitación. Por favor, intenta de nuevo.")
        }
      } else {
        setError("Error al aplicar el código de invitación. Por favor, intenta de nuevo.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setCode("")
      setError("")
      onOpenChange(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Aplicar código de invitación
          </AlertDialogTitle>
          <AlertDialogDescription>
            Ingresa tu código de invitación para extender tu suscripción. El código se aplicará a tu cuenta actual.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invitationCode" className="text-sm font-medium">
                Código de invitación
              </Label>
              <Input
                id="invitationCode"
                type="text"
                placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                className="h-11 font-mono text-sm"
                maxLength={29}
                disabled={isLoading}
                style={{
                  letterSpacing: code ? '0.05em' : 'normal'
                }}
              />
              {code && (
                <p className="text-xs text-muted-foreground">
                  Ingresa el código completo para aplicar la extensión de suscripción
                </p>
              )}
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                {error}
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !code.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aplicando...
                </>
              ) : (
                <>
                  <Gift className="mr-2 h-4 w-4" />
                  Aplicar código
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

