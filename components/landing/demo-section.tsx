"use client"

import { useEffect, useRef } from "react"

export function DemoSection() {
  const demoRef = useRef<HTMLElement>(null)

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

    if (demoRef.current) {
      observer.observe(demoRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="demo"
      ref={demoRef}
      className="py-16 sm:py-20 lg:py-24 bg-secondary/30 fade-in-up"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-balance mb-4">Ve <span className="text-primary font-extrabold">3D</span> Print Cost en acción</h2>
          <p className="text-base sm:text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            Descubre cómo <span className="text-primary font-extrabold">3D</span> Print Cost puede transformar la gestión de tu negocio de impresión 3D
          </p>
        </div>

        <div className="relative mx-auto max-w-4xl">
          <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl bg-black/5">
            <iframe
              src="https://www.youtube.com/embed/CVlVHS1Ou4E?si=stj-ZALzita6GiQ_"
              title="3D Print Cost Demo"
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary/20 rounded-full blur-sm"></div>
          <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-primary/10 rounded-full blur-sm"></div>
        </div>

        <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-primary font-bold">1</span>
            </div>
            <h3 className="font-semibold mb-2">Configuración rápida</h3>
            <p className="text-sm text-muted-foreground">Configura tu negocio en minutos</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-primary font-bold">2</span>
            </div>
            <h3 className="font-semibold mb-2">Gestión completa</h3>
            <p className="text-sm text-muted-foreground">Controla todos los aspectos</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-primary font-bold">3</span>
            </div>
            <h3 className="font-semibold mb-2">Más rentabilidad</h3>
            <p className="text-sm text-muted-foreground">Optimiza tus ganancias</p>
          </div>
        </div>
      </div>
    </section>
  )
}
