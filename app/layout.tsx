import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { LocaleProvider } from "./localContext"
import { SystemConfigProvider } from "./systenConfigContext"

export const metadata: Metadata = {
  title: "Calculadora 3D - Gestión de Impresión 3D",
  description: "Sistema completo para calcular costos de impresión 3D y gestionar clientes, ventas y materiales",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <LocaleProvider>
          <SystemConfigProvider>
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          </SystemConfigProvider>
        </LocaleProvider>
        <Analytics />
      </body>
    </html>
  )
}
