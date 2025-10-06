"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthService, SignupCreate } from "@/lib/auth"
import { Loader2, Eye, EyeOff, CheckCircle, XCircle, ArrowLeft, Shield, User, Building, Phone } from "lucide-react"

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
    country: "", // Mantenemos el campo pero no lo mostramos
  })
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [terms, setTerms] = useState(false)

  // Función para calcular la fortaleza de la contraseña
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
      await AuthService.signup(data)
      router.push("/dashboard")
    } catch (err) {
      console.error("Signup error:", err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Error al registrar. Por favor, intenta de nuevo.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center">
              <img src="/logo.svg" alt="Logo" className="h-14 w-14" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Únete a <span className="text-primary font-extrabold">3D</span> Print Cost
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comienza tu prueba gratuita de 14 días y transforma tu negocio de impresión 3D
          </p>
        </div>

        {/* Formulario principal - Layout horizontal */}
        <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-6 pt-8">
              <CardTitle className="text-2xl font-bold text-card-foreground">Crear Cuenta</CardTitle>
              <CardDescription className="text-muted-foreground">
                Completa la información para comenzar tu prueba gratuita
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Primera fila - Información básica */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
                      Nombre completo *
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Tu nombre completo"
                      value={data.fullName}
                      onChange={(e) => setData({ ...data, fullName: e.target.value })}
                      className="h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-foreground">
                      Correo electrónico *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={data.email}
                      onChange={(e) => setData({ ...data, email: e.target.value })}
                      className="h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-sm font-medium text-foreground">
                      Número de teléfono *
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={data.phoneNumber}
                      onChange={(e) => setData({ ...data, phoneNumber: e.target.value })}
                      className="h-12"
                      required
                    />
                  </div>
                </div>

                {/* Segunda fila - Empresa */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-sm font-medium text-foreground">
                      Nombre de la empresa *
                    </Label>
                    <Input
                      id="companyName"
                      type="text"
                      placeholder="Nombre de tu empresa"
                      value={data.companyName}
                      onChange={(e) => setData({ ...data, companyName: e.target.value })}
                      className="h-12"
                      required
                    />
                  </div>
                  <div className="md:col-span-2 lg:col-span-2">
                    {/* Espacio para futuras expansiones o información adicional */}
                  </div>
                </div>

                {/* Tercera fila - Contraseñas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-foreground">
                      Contraseña *
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Crea una contraseña segura"
                        value={data.password}
                        onChange={(e) => setData({ ...data, password: e.target.value })}
                        className="h-12 pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="passwordConfirmation" className="text-sm font-medium text-foreground">
                      Confirmar contraseña *
                    </Label>
                    <div className="relative">
                      <Input
                        id="passwordConfirmation"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirma tu contraseña"
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        className="h-12 pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Indicador de fortaleza de contraseña - Solo cuando hay contraseña */}
                {data.password && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-medium text-foreground">Fortaleza de la contraseña:</span>
                      <span className={`text-sm font-semibold ${getStrengthColor(passwordStrength.strength)}`}>
                        {getStrengthText(passwordStrength.strength)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                          <span className={item.includes("8 caracteres") && data.password.length >= 8 ? "text-green-600" : 
                                item.includes("minúsculas") && /[a-z]/.test(data.password) ? "text-green-600" :
                                item.includes("mayúsculas") && /[A-Z]/.test(data.password) ? "text-green-600" :
                                item.includes("números") && /[0-9]/.test(data.password) ? "text-green-600" :
                                item.includes("especiales") && /[^A-Za-z0-9]/.test(data.password) ? "text-green-600" : "text-red-600"}>
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Validación de coincidencia de contraseñas */}
                {passwordConfirmation && (
                  <div className="text-center">
                    {data.password !== passwordConfirmation ? (
                      <p className="text-sm text-red-600">❌ Las contraseñas no coinciden</p>
                    ) : (
                      <p className="text-sm text-green-600">✅ Las contraseñas coinciden</p>
                    )}
                  </div>
                )}

                {/* Términos y condiciones */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={terms}
                      onChange={(e) => setTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 text-primary border-border rounded focus:ring-primary"
                    />
                    <label htmlFor="terms" className="text-sm text-muted-foreground">
                      Acepto los{" "}
                      <a href="#" className="text-primary hover:underline">términos y condiciones</a>{" "}
                      y la{" "}
                      <a href="#" className="text-primary hover:underline">política de privacidad</a>
                    </label>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                    {error}
                  </div>
                )}

                {/* Botones */}
                <div className="space-y-4">
                  <Button
                    type="submit"
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creando cuenta...
                      </>
                    ) : (
                      "Comenzar Prueba Gratis"
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12"
                    onClick={() => router.push("/")}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al inicio
                  </Button>
                </div>

                {/* Información adicional */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    ¿Ya tienes una cuenta?{" "}
                    <button
                      type="button"
                      onClick={() => router.push("/login")}
                      className="text-primary hover:underline font-medium"
                    >
                      Inicia sesión aquí
                    </button>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
      </div>
    </div>
  )
}