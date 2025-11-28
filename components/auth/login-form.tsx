"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthService } from "@/lib/auth"
import { Loader2, Eye, EyeOff, Calculator, BarChart3, Users, Shield, Layers3 } from "lucide-react"
import { useSubscriptionValidationAfterLogin } from "@/lib/hooks/use-subscription-validation-after-login"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const router = useRouter()
  const { validateSubscriptionAfterLogin, isValidating } = useSubscriptionValidationAfterLogin()

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await AuthService.login(email, password)
      
      const isSubscriptionValid = await validateSubscriptionAfterLogin()
      
      if (isSubscriptionValid) {
        router.push("/dashboard")
      }
      
    } catch (err) {
      setError("Credenciales incorrectas. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
      {/* Patrones decorativos de fondo - detrás de los paneles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Patrón de puntos en el lado izquierdo */}
        <div 
          className="absolute left-0 top-0 w-1/2 h-full opacity-[0.12]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary)) 2px, transparent 0)`,
            backgroundSize: '48px 48px'
          }}
        />
        
        {/* Patrón de cuadrícula en el lado derecho */}
        <div 
          className="absolute right-0 top-0 w-1/2 h-full opacity-[0.1]"
          style={{
            backgroundImage: `linear-gradient(90deg, transparent 0%, hsl(var(--primary)) 1px, transparent 1px), linear-gradient(180deg, transparent 0%, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />
        
        {/* Formas geométricas decorativas grandes */}
        <div className="absolute top-20 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-56 h-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-primary/8 blur-2xl" />
        <div className="absolute top-1/4 right-1/3 w-40 h-40 rounded-full bg-primary/8 blur-2xl" />
        <div className="absolute bottom-1/3 left-1/3 w-36 h-36 rounded-full bg-primary/8 blur-xl" />
      </div>

      {/* Animación de fondo que sigue el cursor */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 z-[1]"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(var(--primary) / 0.2), transparent 40%)`,
          transition: 'background 0.15s ease-out'
        }}
      />

      {/* Cuadro flotante contenedor */}
      <div className="w-full max-w-7xl bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden relative z-10">
        <div className="flex min-h-[600px]">
          {/* Panel izquierdo - Información de bienvenida */}
          <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-background flex-col justify-center px-12 py-16 border-r border-border/50 relative">
            <div className="max-w-md relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="flex h-12 w-12 items-center justify-center bg-primary/10 rounded-lg">
                  <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                  <span className="text-primary">3D</span> Print Cost
                </h1>
              </div>
              
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Bienvenido de vuelta
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Accede a tu panel de control y gestiona tu negocio de impresión 3D de manera eficiente.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calculator className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Calculadora de Costos</h3>
                    <p className="text-sm text-muted-foreground">
                      Calcula el costo real de tus impresiones 3D con precisión.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Análisis y Reportes</h3>
                    <p className="text-sm text-muted-foreground">
                      Visualiza el rendimiento de tu negocio con reportes detallados.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Gestión de Clientes</h3>
                    <p className="text-sm text-muted-foreground">
                      Administra tus clientes y cotizaciones desde un solo lugar.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Seguridad y Confiabilidad</h3>
                    <p className="text-sm text-muted-foreground">
                      Tus datos están protegidos con los más altos estándares de seguridad.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel derecho - Formulario */}
          <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12 bg-card/50 relative">
            <div className="w-full max-w-md relative z-10">
          <div className="lg:hidden mb-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center bg-primary/10 rounded-lg">
                <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              <span className="text-primary">3D</span> Print Cost
            </h1>
            <p className="text-muted-foreground">Bienvenido de vuelta</p>
          </div>

              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  Iniciar sesión
                </h2>
                <p className="text-sm text-muted-foreground">
                  Ingresa tus credenciales para acceder a tu cuenta
                </p>
              </div>

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
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 pr-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 font-medium"
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

                <div className="text-center pt-4">
                  <p className="text-sm text-muted-foreground">
                    ¿No tienes una cuenta?{" "}
                    <button
                      type="button"
                      onClick={() => router.push("/signup")}
                      className="text-primary hover:underline font-medium"
                    >
                      Regístrate aquí
                    </button>
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-10"
                  onClick={() => router.push("/")}
                >
                  <Layers3 className="mr-2 h-4 w-4" />
                  Volver al inicio
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
