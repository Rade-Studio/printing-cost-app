import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { useRouter } from "next/navigation"

const features = [
  "Gestión ilimitada de clientes",
  "Control total de ventas y cotizaciones",
  "Historial completo de impresiones",
  "Inventario de filamentos en tiempo real",
  "Catálogo de productos personalizado",
  "Administración de impresoras",
  "Configuración de paquetes de trabajo",
  "Registro de gastos operativos",
  "Panel de control con estadísticas",
  "Reportes detallados y métricas",
  "Soporte técnico 24/7",
  "Actualizaciones automáticas",
]

export function PricingSection() {
  const router = useRouter()

  const handleStartTrial = () => {
    router.push("/signup")
  }

  return (
    <section id="pricing" className="py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-balance">
            Comienza tu prueba gratuita hoy
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Obtén 30% de descuento en tu primer mes. Sin costos ocultos, cancela cuando quieras.
          </p>
        </div>

        <div className="flex justify-center max-w-6xl mx-auto">
          {/* Plan Mensual - Diseño Horizontal */}
          <Card className="border-2 border-primary/20 relative overflow-hidden hover:border-primary/40 transition-all duration-300 shadow-xl bg-gradient-to-r from-white to-primary/5 w-full">
            <Badge className="absolute top-6 right-6 bg-gradient-to-r from-primary to-primary/80 text-white font-semibold px-4 py-2 text-sm">
              30% OFF Primer Mes
            </Badge>
            
            <div className="flex flex-col lg:flex-row">
              {/* Sección Izquierda - Precio y Info */}
              <div className="lg:w-1/3 p-8 lg:p-12 bg-gradient-to-br from-primary/5 to-primary/10">
                <div className="text-center lg:text-left">
                  <CardTitle className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Plan Mensual</CardTitle>
                  <CardDescription className="text-lg text-gray-600 mb-6">
                    Acceso completo a todas las funcionalidades
                  </CardDescription>
                  
                  {/* Precio con descuento */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-center lg:justify-start gap-2">
                      <span className="text-lg text-gray-500 line-through">$9.99</span>
                      <span className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded-full font-medium">
                        -30%
                      </span>
                    </div>
                    <div className="flex items-baseline justify-center lg:justify-start gap-1">
                      <span className="text-6xl font-bold text-primary">$6.99</span>
                      <span className="text-2xl text-gray-600">/mes</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Primer mes con descuento, luego $9.99/mes
                    </p>
                  </div>
                  
                  {/* Botón */}
                  <div className="mt-8">
                    <Button 
                      className="w-full lg:w-auto px-8 h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300" 
                      size="lg" 
                      onClick={handleStartTrial}
                    >
                      Comenzar Prueba Gratis
                    </Button>
                    <div className="mt-4 space-y-1">
                      <p className="text-sm text-gray-600 font-medium">
                        14 días gratis • Sin compromiso
                      </p>
                      <p className="text-xs text-gray-500">
                        Cancela cuando quieras
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sección Derecha - Features */}
              <div className="lg:w-2/3 p-8 lg:p-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center lg:text-left">
                  Todo lo que incluye tu plan:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">¿Tienes preguntas sobre nuestros planes?</p>
          <Button variant="outline" onClick={() => window.open("https://wa.me/+573006717164", "_blank")}>
            Contactar por WhatsApp
          </Button>
        </div>
      </div>
    </section>
  )
}
