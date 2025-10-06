import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { LocaleProvider } from "./localContext"
import { SystemConfigProvider } from "./systenConfigContext"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "3D Print Cost - Calculadora de Impresión 3D | Gestión de Costos y Clientes",
  description: "Calculadora profesional de costos de impresión 3D. Gestiona precios, clientes, materiales y ventas. Software completo para negocios de impresión 3D. Calcula costos de filamento, tiempo y gastos operativos.",
  keywords: [
    "calculadora impresion 3d",
    "calcular costos impresion 3d", 
    "precios impresion 3d",
    "gestion impresion 3d",
    "software impresion 3d",
    "costos filamento 3d",
    "negocio impresion 3d",
    "calculadora 3d",
    "impresion 3d precios",
    "gestion clientes 3d",
    "ventas impresion 3d",
    "materiales 3d",
    "filamento calculadora",
    "tiempo impresion 3d",
    "costos operativos 3d"
  ],
  authors: [{ name: "RADE Studio S.A.S" }],
  creator: "RADE Studio S.A.S",
  publisher: "3D Print Cost",
  robots: "index, follow",
  openGraph: {
    title: "3D Print Cost - Calculadora de Impresión 3D",
    description: "Calculadora profesional de costos de impresión 3D. Gestiona precios, clientes y materiales para tu negocio de impresión 3D.",
    type: "website",
    locale: "es_ES",
    siteName: "3D Print Cost",
  },
  twitter: {
    card: "summary_large_image",
    title: "3D Print Cost - Calculadora de Impresión 3D",
    description: "Calculadora profesional de costos de impresión 3D. Gestiona precios, clientes y materiales.",
  },
  icons: {
    icon: [
      { url: "/favicon16x16.ico", sizes: "16x16", type: "image/x-icon" },
      { url: "/favicon32x32.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/favicon128x128.ico", sizes: "128x128", type: "image/x-icon" },
      { url: "/favicon.ico", sizes: "any", type: "image/x-icon" }
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon128x128.ico",
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "3D Print Cost",
    "description": "Calculadora profesional de costos de impresión 3D. Gestiona precios, clientes, materiales y ventas para negocios de impresión 3D.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Prueba gratuita de 14 días"
    },
    "creator": {
      "@type": "Organization",
      "name": "RADE Studio S.A.S",
      "url": "https://github.com/Rade-Studio"
    },
    "keywords": "calculadora impresion 3d, calcular costos impresion 3d, precios impresion 3d, gestion impresion 3d, software impresion 3d",
    "inLanguage": "es",
    "url": "https://3dprintcost.com"
  }

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SystemConfigProvider>
            <LocaleProvider>
              <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
            </LocaleProvider>
          </SystemConfigProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
