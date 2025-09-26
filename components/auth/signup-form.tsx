
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthService, SignupCreate } from "@/lib/auth"
import { Loader2, Layers3 } from "lucide-react"

export function SignupForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [data, setData] = useState<SignupCreate>({
    email: "",
    password: "",
    companyName: "",
    fullName: "",
    phoneNumber: "",
    country: "",
  })
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [terms, setTerms] = useState(false)

  const validateForm = () => {
    if (!terms) {
      setError("Debes aceptar los términos y condiciones.")
      return false;
    }
    if (data.password !== passwordConfirmation) {
      setError("Las contraseñas no coinciden.")
      return false;
    }
    setError("");
    return true;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return;
    setIsLoading(true)
    setError("")

    try {
      await AuthService.signup(data)
      router.push("/dashboard")
    } catch (err) {
      setError("Error al registrar. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-2xl shadow-xl border-0 bg-white">
        <CardHeader className="text-center pb-8 pt-8">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <img src="/favicon.ico" alt="Logo" className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground mb-2">PrintCost Pro</CardTitle>
          <CardDescription className="text-muted-foreground text-base">Bienvenido</CardDescription>
          <p className="text-sm text-muted-foreground mt-1">Crea una cuenta para acceder a la herramienta completa</p>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  className="h-12 bg-muted/30 border-border rounded-lg text-base"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm font-medium text-foreground">
                  Nombre de la empresa
                </Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Nombre de la empresa"
                  value={data.companyName}
                  onChange={(e) => setData({ ...data, companyName: e.target.value })}
                  className="h-12 bg-muted/30 border-border rounded-lg text-base"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
                  Nombre completo
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Nombre completo"
                  value={data.fullName}
                  onChange={(e) => setData({ ...data, fullName: e.target.value })}
                  className="h-12 bg-muted/30 border-border rounded-lg text-base"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-sm font-medium text-foreground">
                  Número de teléfono
                </Label>
                <Input
                  id="phoneNumber"
                  type="text"
                  placeholder="Número de teléfono"
                  value={data.phoneNumber}
                  onChange={(e) => setData({ ...data, phoneNumber: e.target.value })}
                  className="h-12 bg-muted/30 border-border rounded-lg text-base"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm font-medium text-foreground">
                  País
                </Label>
                <Input
                  id="country"
                  type="text"
                  placeholder="País"
                  value={data.country}
                  onChange={(e) => setData({ ...data, country: e.target.value })}
                  className="h-12 bg-muted/30 border-border rounded-lg text-base"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={data.password}
                  onChange={(e) => setData({ ...data, password: e.target.value })}
                  className="h-12 bg-muted/30 border-border rounded-lg text-base"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="passwordConfirmation" className="text-sm font-medium text-foreground">
                  Confirmar Contraseña
                </Label>
                <Input
                  id="passwordConfirmation"
                  type="password"
                  placeholder="••••••••"
                  value={passwordConfirmation}
                  onChange={(e) => {setPasswordConfirmation(e.target.value)}}
                  className="h-12 bg-muted/30 border-border rounded-lg text-base"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="terms" className="text-sm font-medium text-foreground">
                  Acepto los términos y condiciones
                </Label>
                <div className="flex items-center">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={terms}
                    onChange={(e) => setTerms(e.target.checked)}
                    className="h-4 w-4 text-primary border-border rounded-lg"
                  />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Acepto los términos y condiciones
                  </span>
                </div>
              </div>
            </div>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full h-12 text-base font-medium rounded-lg shadow-sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                "Crear cuenta"
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