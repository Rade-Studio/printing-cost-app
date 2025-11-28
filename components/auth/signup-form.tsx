"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthService, SignupCreate } from "@/lib/auth"
import { Loader2, Eye, EyeOff, CheckCircle, XCircle, ArrowLeft, Gift, Calculator, BarChart3, Users, Shield, Zap, TrendingUp } from "lucide-react"
import { getErrorMessage } from "@/lib/errors/error-messages"

interface PasswordStrength {
  score: number
  feedback: string[]
  strength: 'weak' | 'medium' | 'strong' | 'very-strong'
}

export function SignupForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [data, setData] = useState<SignupCreate>({
    email: "",
    password: "",
    companyName: "",
    fullName: "",
    phoneNumber: "",
    country: "",
    invitationCode: "",
  })
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [terms, setTerms] = useState(false)
  const [hasInvitationCode, setHasInvitationCode] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0
    const feedback: string[] = []

    if (password.length >= 8) score += 1
    else feedback.push("Mínimo 8 caracteres")

    if (/[a-z]/.test(password)) score += 1
    else feedback.push("Incluye letras minúsculas")

    if (/[A-Z]/.test(password)) score += 1
    else feedback.push("Incluye letras mayúsculas")

    if (/[0-9]/.test(password)) score += 1
    else feedback.push("Incluye números")

    if (/[^A-Za-z0-9]/.test(password)) score += 1
    else feedback.push("Incluye caracteres especiales")

    let strength: 'weak' | 'medium' | 'strong' | 'very-strong'
    if (score <= 2) strength = 'weak'
    else if (score === 3) strength = 'medium'
    else if (score === 4) strength = 'strong'
    else strength = 'very-strong'

    return { score, feedback, strength }
  }

  const passwordStrength = calculatePasswordStrength(data.password)

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'weak': return 'text-red-500'
      case 'medium': return 'text-yellow-500'
      case 'strong': return 'text-blue-500'
      case 'very-strong': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  const getStrengthText = (strength: string) => {
    switch (strength) {
      case 'weak': return 'Débil'
      case 'medium': return 'Media'
      case 'strong': return 'Fuerte'
      case 'very-strong': return 'Muy Fuerte'
      default: return ''
    }
  }

  const validateForm = () => {
    if (!terms) {
      setError("Debes aceptar los términos y condiciones.")
      return false
    }
    if (data.password !== passwordConfirmation) {
      setError("Las contraseñas no coinciden.")
      return false
    }
    if (passwordStrength.score < 3) {
      setError("La contraseña debe ser más segura.")
      return false
    }
    setError("")
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)
    setError("")

    try {
      const signupData = {
        ...data,
        invitationCode: data.invitationCode?.trim() || undefined
      }
      await AuthService.signup(signupData)
      router.push("/dashboard")
    } catch (err) {
      console.error("Signup error:", err)
      if (err instanceof Error) {
        const errorCode = (err as any).code
        if (errorCode) {
          setError(getErrorMessage(errorCode))
        } else {
          setError(err.message || "Error al registrar. Por favor, intenta de nuevo.")
        }
      } else {
        setError("Error al registrar. Por favor, intenta de nuevo.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const formatInvitationCode = (value: string): string => {
    const cleaned = value.replace(/[-\s]/g, '').toUpperCase()
    if (cleaned.length <= 5) return cleaned
    if (cleaned.length <= 10) return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`
    if (cleaned.length <= 15) return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 10)}-${cleaned.slice(10)}`
    if (cleaned.length <= 20) return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 10)}-${cleaned.slice(10, 15)}-${cleaned.slice(15)}`
    if (cleaned.length <= 25) return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 10)}-${cleaned.slice(10, 15)}-${cleaned.slice(15, 20)}-${cleaned.slice(20)}`
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 10)}-${cleaned.slice(10, 15)}-${cleaned.slice(15, 20)}-${cleaned.slice(20, 25)}`
  }

  const handleInvitationCodeChange = (value: string) => {
    const formatted = formatInvitationCode(value)
    setData({ ...data, invitationCode: formatted })
    setHasInvitationCode(formatted.trim().length > 0)
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
        <div className="absolute top-3/4 right-1/4 w-32 h-32 rounded-full bg-primary/8 blur-xl" />
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
          {/* Panel izquierdo - Beneficios y características */}
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
            Comienza tu prueba gratuita
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Únete a cientos de empresas que ya están optimizando sus costos de impresión 3D.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calculator className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Calculadora Precisa</h3>
                <p className="text-sm text-muted-foreground">
                  Calcula el costo real de cada impresión considerando materiales, tiempo y gastos operativos.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Reportes Detallados</h3>
                <p className="text-sm text-muted-foreground">
                  Analiza el rendimiento de tu negocio con reportes y gráficos en tiempo real.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Gestión Completa</h3>
                <p className="text-sm text-muted-foreground">
                  Administra clientes, productos, cotizaciones y ventas desde un solo lugar.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Ahorro de Tiempo</h3>
                <p className="text-sm text-muted-foreground">
                  Automatiza tus procesos y reduce el tiempo en tareas administrativas.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Maximiza Rentabilidad</h3>
                <p className="text-sm text-muted-foreground">
                  Optimiza tus precios y aumenta la rentabilidad de tu negocio.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Seguridad Garantizada</h3>
                <p className="text-sm text-muted-foreground">
                  Tus datos están protegidos con encriptación de nivel empresarial.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

          {/* Panel derecho - Formulario */}
          <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12 overflow-y-auto bg-card/50 relative">
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
                <p className="text-muted-foreground">Crea tu cuenta</p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  Crear cuenta
                </h2>
                <p className="text-sm text-muted-foreground">
                  Completa el formulario para comenzar
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium">
                      Nombre completo
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Tu nombre completo"
                      value={data.fullName}
                      onChange={(e) => setData({ ...data, fullName: e.target.value })}
                      className="h-11"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Correo electrónico
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={data.email}
                      onChange={(e) => setData({ ...data, email: e.target.value })}
                      className="h-11"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-sm font-medium">
                      Teléfono
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={data.phoneNumber}
                      onChange={(e) => setData({ ...data, phoneNumber: e.target.value })}
                      className="h-11"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-sm font-medium">
                      Nombre de la empresa
                    </Label>
                    <Input
                      id="companyName"
                      type="text"
                      placeholder="Nombre de tu empresa"
                      value={data.companyName}
                      onChange={(e) => setData({ ...data, companyName: e.target.value })}
                      className="h-11"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="invitationCode" className="text-sm font-medium flex items-center gap-2">
                      <Gift className="h-4 w-4" />
                      Código de invitación <span className="text-muted-foreground font-normal">(opcional)</span>
                    </Label>
                    <Input
                      id="invitationCode"
                      type="text"
                      placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
                      value={data.invitationCode}
                      onChange={(e) => handleInvitationCodeChange(e.target.value)}
                      className="h-11 font-mono text-sm"
                      maxLength={29}
                      style={{
                        letterSpacing: data.invitationCode ? '0.05em' : 'normal'
                      }}
                    />
                    {hasInvitationCode && (
                      <div className="mt-2 p-2.5 bg-primary/5 border border-primary/20 rounded-md">
                        <p className="text-xs text-primary font-medium flex items-center gap-1.5">
                          <Gift className="h-3 w-3" />
                          Usuario partner: recibirás 1 año de suscripción completa
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Crea una contraseña segura"
                      value={data.password}
                      onChange={(e) => setData({ ...data, password: e.target.value })}
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
                
                <div className="space-y-2">
                  <Label htmlFor="passwordConfirmation" className="text-sm font-medium">
                    Confirmar contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="passwordConfirmation"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirma tu contraseña"
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      className="h-11 pr-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

                  {data.password && (
                    <div className="bg-muted/30 p-3 rounded-md">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-foreground">Fortaleza:</span>
                        <span className={`text-xs font-semibold ${getStrengthColor(passwordStrength.strength)}`}>
                          {getStrengthText(passwordStrength.strength)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {passwordStrength.feedback.map((item, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs">
                            {data.password.length >= 8 && item.includes("8 caracteres") ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : /[a-z]/.test(data.password) && item.includes("minúsculas") ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : /[A-Z]/.test(data.password) && item.includes("mayúsculas") ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : /[0-9]/.test(data.password) && item.includes("números") ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : /[^A-Za-z0-9]/.test(data.password) && item.includes("especiales") ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-500" />
                            )}
                            <span className={
                              item.includes("8 caracteres") && data.password.length >= 8 ? "text-green-600" : 
                              item.includes("minúsculas") && /[a-z]/.test(data.password) ? "text-green-600" :
                              item.includes("mayúsculas") && /[A-Z]/.test(data.password) ? "text-green-600" :
                              item.includes("números") && /[0-9]/.test(data.password) ? "text-green-600" :
                              item.includes("especiales") && /[^A-Za-z0-9]/.test(data.password) ? "text-green-600" : "text-muted-foreground"
                            }>
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {passwordConfirmation && (
                    <div className="text-sm">
                      {data.password !== passwordConfirmation ? (
                        <p className="text-red-600">Las contraseñas no coinciden</p>
                      ) : (
                        <p className="text-green-600">Las contraseñas coinciden</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-2">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={terms}
                    onChange={(e) => setTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 text-primary border-border rounded focus:ring-primary"
                  />
                  <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed">
                    Acepto los{" "}
                    <a href="#" className="text-primary hover:underline">términos y condiciones</a>
                    {" "}y la{" "}
                    <a href="#" className="text-primary hover:underline">política de privacidad</a>
                  </label>
                </div>

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                    {error}
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  <Button
                    type="submit"
                    className="w-full h-11 font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creando cuenta...
                      </>
                    ) : (
                      hasInvitationCode ? "Crear cuenta como partner" : "Crear cuenta"
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10"
                    onClick={() => router.push("/")}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al inicio
                  </Button>
                </div>

                <div className="text-center pt-2">
                  <p className="text-xs text-muted-foreground">
                    ¿Ya tienes una cuenta?{" "}
                    <button
                      type="button"
                      onClick={() => router.push("/login")}
                      className="text-primary hover:underline font-medium"
                    >
                      Inicia sesión
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
