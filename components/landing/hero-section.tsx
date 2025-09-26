"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Play } from "lucide-react"
import { useEffect, useRef } from "react"

export function HeroSection() {
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in")
          }
        })
      },
      { threshold: 0.1 },
    )

    if (heroRef.current) {
      observer.observe(heroRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const scrollToDemo = () => {
    const demoSection = document.getElementById("demo")
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section
      ref={heroRef}
      className="relative py-16 sm:py-20 lg:py-32 opacity-0 translate-y-8 transition-all duration-1000 ease-out"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-4 sm:mb-6 text-xs sm:text-sm">
            🚀 La solución completa para tu negocio de impresión 3D
          </Badge>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-balance leading-tight">
            Gestiona tu negocio de <span className="text-primary">impresión 3D</span> como un profesional
          </h1>

          <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-muted-foreground text-pretty max-w-2xl mx-auto">
            PrintCost Pro te permite controlar cada aspecto de tu negocio: desde la gestión de clientes y cotizaciones
            hasta el inventario de filamentos y análisis de rentabilidad.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button size="lg" className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base">
              Comenzar Ahora
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={scrollToDemo}
              className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 bg-transparent text-sm sm:text-base"
            >
              <Play className="mr-2 h-4 w-4" />
              Ver Demo
            </Button>
          </div>

          <div className="mt-12 sm:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center p-4 rounded-lg bg-secondary/20 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-bold text-primary">100%</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Control total</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/20 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-bold text-primary">Fácil</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Configuración</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/20 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-bold text-primary">Tiempo</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Ahorrado</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/20 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-bold text-primary">Más</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Rentabilidad</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
