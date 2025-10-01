"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Crown, 
  Check, 
  X, 
  Clock, 
  Users, 
  Package, 
  BarChart3, 
  Settings,
  Zap,
  Shield,
  Star,
  AlertTriangle,
  LogOut,
  MessageCircle
} from "lucide-react"
import { apiClient } from "@/lib/api"
import { AuthService } from "@/lib/auth"
import { BoldPaymentButton } from "@/components/subscription/bold-payment-button"

const subscriptionFeatures = [
  {
    name: "Gestión de Clientes",
    description: "Registra y administra tu base de clientes",
    icon: Users,
    included: true
  },
  {
    name: "Control de Ventas",
    description: "Gestiona todas tus ventas y transacciones",
    icon: BarChart3,
    included: true
  },
  {
    name: "Inventario de Filamentos",
    description: "Controla stock y costos de filamentos",
    icon: Package,
    included: true
  },
  {
    name: "Historial de Impresión",
    description: "Registra y calcula costos de impresión",
    icon: Clock,
    included: true
  },
  {
    name: "Configuración Avanzada",
    description: "Personaliza configuraciones del sistema",
    icon: Settings,
    included: true
  },
  {
    name: "Soporte Prioritario",
    description: "Atención al cliente 24/7",
    icon: Shield,
    included: true
  },
  {
    name: "Reportes Avanzados",
    description: "Análisis detallados de tu negocio",
    icon: Star,
    included: true
  },
  {
    name: "Integración API",
    description: "Conecta con otros sistemas",
    icon: Zap,
    included: true
  }
]

export default function RenovarSuscripcionPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")

  // Limpiar cache de suscripción al cargar la página
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('subscriptionData')
      localStorage.removeItem('subscriptionLastCheck')
    }
  }, [])

  const handleLogout = () => {
    AuthService.logout()
    window.location.href = "/"
  }

  const handleWhatsAppContact = () => {
    // Número de WhatsApp (reemplaza con tu número real)
    const phoneNumber = "1234567890" // Cambia por tu número de WhatsApp
    const message = "Hola, necesito ayuda con mi suscripción de 3D Print Cost"
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const handlePaymentSuccess = async (orderId?: string) => {
    try {
      setIsProcessing(true)
      setError("")
      
      // Verificar el pago con Bold.co si tenemos el orderId
      if (orderId) {
        const verification = await apiClient.verifyBoldPayment(orderId)
        if (!verification?.success) {
          setError(verification?.message || "Error al verificar el pago")
          return
        }
        
        // Si la verificación es exitosa, redirigir al dashboard
        window.location.href = "/dashboard"
      }
    } catch (err) {
      setError("Error al procesar la renovación. Por favor, intenta nuevamente.")
      console.error("Error renewing subscription:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaymentError = (error: string) => {
    setError(error)
  }


  return (
    <div 
      className="min-h-screen bg-background flex flex-col" 
      style={{ 
        backgroundColor: 'hsl(var(--background))'
      }}
    >
      {/* Header compacto */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-foreground">Suscribirse a <span className="text-primary font-extrabold">3D</span> Print Cost</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Tu suscripción ha expirado</p>
              </div>
            </div>
            
            {/* Botón de cerrar sesión */}
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center gap-2 w-full sm:w-auto"
              size="sm"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex items-center justify-center py-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Panel izquierdo - Información */}
            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground">Suscripción Mensual</h2>
                    <p className="text-sm text-muted-foreground">Acceso completo a todas las funciones</p>
                  </div>
                </div>
                
                <div className="text-center lg:text-left mb-6">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-2">$9.99 USD</div>
                  <p className="text-sm text-muted-foreground">por mes</p>
                </div>
              </div>

              {/* Características en grid compacto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {subscriptionFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="p-1 bg-emerald-100 rounded-full flex-shrink-0">
                      <Check className="h-3 w-3 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">{feature.name}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Beneficios compactos */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h3 className="font-semibold text-emerald-800 mb-2 text-sm">¿Por qué suscribirse?</h3>
                <ul className="text-emerald-700 text-xs space-y-1">
                  <li>• Acceso inmediato a todas las funciones</li>
                  <li>• Soporte técnico prioritario</li>
                  <li>• Actualizaciones automáticas</li>
                  <li>• Respaldo de datos seguro</li>
                </ul>
              </div>
            </div>

            {/* Panel derecho - Acción */}
            <div className="flex flex-col justify-center">
              <Card className="border-2 border-primary/20 shadow-lg">
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <div className="text-center space-y-6">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <h3 className="text-lg font-semibold text-foreground">Acceso Restringido</h3>
                    </div>
                    
                    <p className="text-muted-foreground text-sm">
                      Tu suscripción ha expirado. Suscríbete ahora para recuperar el acceso completo a todas las funciones de <span className="text-primary font-extrabold">3D</span> Print Cost.
                    </p>

                    {/* Información del precio */}
                    <div className="text-center pt-4">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        <span className="font-semibold text-sm sm:text-base">Suscripción Mensual</span>
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-primary">$9.99 USD</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">por mes</div>
                    </div>

                    {/* Botón principal */}
                    <div className="pt-4">
                      <BoldPaymentButton 
                        onPaymentSuccess={handlePaymentSuccess}
                        onPaymentError={handlePaymentError}
                        className="w-full"
                      />
                      
                      {error && (
                        <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-lg">
                          <p className="text-red-800 text-sm">{error}</p>
                        </div>
                      )}
                    </div>

                    {/* Información adicional */}
                    <div className="pt-4 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-3">
                        ¿Necesitas ayuda? Contáctanos directamente por WhatsApp.
                      </p>
                      <div className="flex justify-center">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleWhatsAppContact}
                          className="flex items-center gap-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100 w-full sm:w-auto"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span className="text-xs sm:text-sm">Contáctanos por WhatsApp</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
