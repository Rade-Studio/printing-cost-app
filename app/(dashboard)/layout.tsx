"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthService } from "@/lib/auth"
import { Sidebar } from "@/components/shared/sidebar"
import { SubscriptionStatus } from "@/components/subscription/subscription-status"
import { NavbarSubscriptionAlert } from "@/components/subscription/navbar-subscription-alert"
import { SubscriptionNotificationProvider } from "@/lib/contexts/subscription-notification-context"
import { useSubscriptionValidation } from "@/lib/hooks/use-subscription-validation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const { isValidating, isSubscriptionValid } = useSubscriptionValidation()

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push("/login")
    } else {
      setIsLoading(false)
    }
  }, [router])

  // Mostrar loading mientras se valida la autenticación o la suscripción
  if (isLoading || isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {isLoading ? "Verificando autenticación..." : "Validando suscripción..."}
          </p>
        </div>
      </div>
    )
  }

  // Si la suscripción no es válida, el hook ya redirigió a /renovar-suscripcion
  if (!isSubscriptionValid) {
    return null
  }

  return (
    <SubscriptionNotificationProvider>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="lg:pl-64">
          {/* Navbar Alert (cuando la notificación principal está cerrada) */}
          <NavbarSubscriptionAlert />
          
          {/* Subscription Status Header */}
          <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border/50">
            <div className="flex justify-center p-4">
              <SubscriptionStatus />
            </div>
          </div>
          <main className="p-6">{children}</main>
        </div>
      </div>
    </SubscriptionNotificationProvider>
  )
}
