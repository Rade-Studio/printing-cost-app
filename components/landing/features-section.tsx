"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users,
  ShoppingCart,
  History,
  Package,
  CatIcon as Catalog,
  Printer,
  Settings,
  DollarSign,
  BarChart3,
} from "lucide-react"
import { useEffect, useRef } from "react"

const features = [
  {
    icon: Users,
    title: "Gestión de Clientes",
    description: "Administra datos de contacto, ubicación y historial completo de cada cliente.",
  },
  {
    icon: ShoppingCart,
    title: "Control de Ventas",
    description: "Cotizaciones automáticas con cálculos precisos de costos y márgenes de ganancia.",
  },
  {
    icon: History,
    title: "Historial de Impresiones",
    description: "Registro detallado con filamentos utilizados, tiempos y volúmenes de cada trabajo.",
  },
  {
    icon: Package,
    title: "Inventario de Filamentos",
    description: "Control en tiempo real con alertas automáticas de stock bajo y reposición.",
  },
  {
    icon: Catalog,
    title: "Catálogo de Productos",
    description: "Organiza tu portafolio con imágenes, modelos 3D y especificaciones técnicas.",
  },
  {
    icon: Printer,
    title: "Administración de Impresoras",
    description: "Monitorea consumo energético, estado activo y mantenimiento de equipos.",
  },
  {
    icon: Settings,
    title: "Paquetes de Trabajo",
    description: "Configura servicios adicionales y paquetes personalizados para optimizar precios.",
  },
  {
    icon: DollarSign,
    title: "Control de Gastos",
    description: "Registro completo de gastos operativos para mantener finanzas claras y organizadas.",
  },
  {
    icon: BarChart3,
    title: "Panel de Control",
    description: "Estadísticas avanzadas, métricas clave y reportes detallados para tomar decisiones.",
  },
]

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  return (
    <section id="features" ref={sectionRef} className="py-16 sm:py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="mx-auto max-w-3xl text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-balance">
            Todo lo que necesitas para hacer crecer tu negocio
          </h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground text-pretty">
            Una plataforma completa diseñada específicamente para negocios de impresión 3D
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              ref={(el) => (cardsRef.current[index] = el)}
              className={`smooth-border hover-lift p-4 sm:p-6 h-full`}
            >
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors duration-300 group-hover:bg-primary/20">
                  <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl leading-tight">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm sm:text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
