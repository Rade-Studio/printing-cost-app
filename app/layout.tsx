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
  title: "Calculadora 3D - Gestión de Impresión 3D",
  description: "Sistema completo para calcular costos de impresión 3D y gestionar clientes, ventas y materiales",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
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
