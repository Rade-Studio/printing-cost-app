"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthService, type AuthError } from "@/lib/auth"
import { getErrorMessage } from "@/lib/errors/error-messages"
import { Loader2, MailCheck } from "lucide-react"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await AuthService.forgotPassword(email.trim())
      setIsSent(true)
    } catch (err) {
      const code = (err as AuthError).code
      setError(code ? getErrorMessage(code) : "No pudimos procesar la solicitud. Intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Recuperar contraseña</h1>
          <p className="text-sm text-muted-foreground">
            Escribe el correo de tu cuenta y te enviaremos un enlace para crear una contraseña nueva.
          </p>
        </div>

        {isSent ? (
          <div className="space-y-4 text-center">
            <MailCheck className="mx-auto h-10 w-10 text-primary" />
            <p className="text-sm">
              Si <strong>{email.trim()}</strong> está registrado, en unos minutos recibirás un correo con el enlace.
              El enlace es válido por 1 hora.
            </p>
            <p className="text-sm text-muted-foreground">Revisa también la carpeta de spam.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
                autoComplete="email"
                required
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11 font-medium" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar enlace"
              )}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline font-medium">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
