"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthService, type AuthError } from "@/lib/auth"
import { getErrorMessage } from "@/lib/errors/error-messages"
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react"

const MIN_PASSWORD_LENGTH = 6

function describeResetError(error: AuthError): string {
  if (error.identityErrors.includes("InvalidToken")) {
    return "El enlace no es válido, ya se usó o expiró. Solicita uno nuevo."
  }
  if (error.identityErrors.includes("PasswordTooShort")) {
    return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
  }
  return error.code ? getErrorMessage(error.code) : "No pudimos actualizar la contraseña. Intenta de nuevo."
}

export function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") ?? ""
  const token = searchParams.get("token") ?? ""

  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isDone, setIsDone] = useState(false)

  const hasValidLink = email !== "" && token !== ""

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`)
      return
    }
    if (password !== passwordConfirmation) {
      setError("Las contraseñas no coinciden.")
      return
    }

    setIsLoading(true)
    try {
      await AuthService.resetPassword(email, token, password)
      setIsDone(true)
    } catch (err) {
      setError(describeResetError(err as AuthError))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Crear contraseña nueva</h1>
          {hasValidLink && !isDone && (
            <p className="text-sm text-muted-foreground">
              Para la cuenta <strong>{email}</strong>
            </p>
          )}
        </div>

        {!hasValidLink ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-destructive">
              El enlace está incompleto. Ábrelo de nuevo desde el correo o solicita uno nuevo.
            </p>
            <Button asChild className="w-full h-11">
              <Link href="/recuperar-contrasena">Solicitar un enlace nuevo</Link>
            </Button>
          </div>
        ) : isDone ? (
          <div className="space-y-4 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
            <p className="text-sm">Tu contraseña se actualizó. Ya puedes iniciar sesión con ella.</p>
            <Button asChild className="w-full h-11">
              <Link href="/login">Iniciar sesión</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Contraseña nueva
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-11"
                  autoComplete="new-password"
                  minLength={MIN_PASSWORD_LENGTH}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Mínimo {MIN_PASSWORD_LENGTH} caracteres.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password-confirmation" className="text-sm font-medium">
                Confirmar contraseña
              </Label>
              <Input
                id="password-confirmation"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="h-11"
                autoComplete="new-password"
                required
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20 space-y-1">
                <p>{error}</p>
                {error.includes("Solicita uno nuevo") && (
                  <Link href="/recuperar-contrasena" className="text-primary hover:underline font-medium">
                    Solicitar un enlace nuevo
                  </Link>
                )}
              </div>
            )}

            <Button type="submit" className="w-full h-11 font-medium" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar contraseña"
              )}
            </Button>
          </form>
        )}

        {!isDone && (
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline font-medium">
              Volver a iniciar sesión
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
