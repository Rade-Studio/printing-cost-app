import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

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
  return (
    <section id="pricing" className="py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-balance">
            Precios simples y transparentes
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Sin costos ocultos. Cancela cuando quieras. Comienza con 14 días gratis.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 max-w-4xl mx-auto">
          {/* Plan Mensual */}
          <Card className="border-border/50 hover:border-primary/20 transition-colors">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl">Plan Mensual</CardTitle>
              <CardDescription className="text-base">
                Perfecto para comenzar y probar todas las funcionalidades
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$9.99</span>
                <span className="text-muted-foreground">/mes</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              <Button className="w-full" size="lg">
                Comenzar Prueba Gratis
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                14 días gratis, luego $9.99/mes. Cancela cuando quieras.
              </p>
            </CardContent>
          </Card>

          {/* Plan Anual */}
          <Card className="border-primary/50 relative overflow-hidden">
            <Badge className="absolute top-4 right-4 bg-primary">Ahorra 30%</Badge>
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl">Plan Anual</CardTitle>
              <CardDescription className="text-base">La mejor opción para negocios establecidos</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$84.99</span>
                <span className="text-muted-foreground">/año</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Equivale a <span className="font-semibold text-primary">$7.08/mes</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              <Button className="w-full" size="lg">
                Comenzar Prueba Gratis
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                14 días gratis, luego $84.99/año. Cancela cuando quieras.
              </p>
            </CardContent>
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
