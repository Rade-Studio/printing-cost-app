"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthService } from "@/lib/auth"
import { Loader2, Layers3 } from "lucide-react"
import { useSubscriptionValidationAfterLogin } from "@/lib/hooks/use-subscription-validation-after-login"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { validateSubscriptionAfterLogin, isValidating } = useSubscriptionValidationAfterLogin()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Primero hacer login
      await AuthService.login(email, password)
      
      // Luego validar suscripción
      const isSubscriptionValid = await validateSubscriptionAfterLogin()
      
      if (isSubscriptionValid) {
        // Solo redirigir al dashboard si la suscripción es válida
        router.push("/dashboard")
      }
      // Si no es válida, el hook ya redirigió a renovar-suscripcion
      
    } catch (err) {
      setError("Credenciales incorrectas. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-card">
        <CardHeader className="text-center pb-8 pt-8">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <img src="/favicon.ico" alt="Logo" className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-card-foreground mb-2">PrintCost Pro</CardTitle>
          <CardDescription className="text-muted-foreground text-base">Bienvenido de vuelta</CardDescription>
          <p className="text-sm text-muted-foreground mt-1">Ingresa tus credenciales para acceder a tu cuenta</p>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-card-foreground">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-input border-border rounded-lg text-base text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-card-foreground">
                  Contraseña
                </Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-input border-border rounded-lg text-base text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full h-12 text-base font-medium rounded-lg shadow-sm"
              disabled={isLoading || isValidating}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : isValidating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validando suscripción...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full h-12 text-sm font-medium rounded-lg shadow-sm"
              onClick={() => router.push("/landing")}
            >
              <Layers3 className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
