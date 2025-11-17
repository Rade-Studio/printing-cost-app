"use client"

import type React from "react"

import { useEffect, useState, useMemo } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AuthService } from "@/lib/auth"
import { Sidebar } from "@/components/shared/sidebar"
import { SubscriptionStatus } from "@/components/subscription/subscription-status"
import { NavbarSubscriptionAlert } from "@/components/subscription/navbar-subscription-alert"
import { SubscriptionNotificationProvider } from "@/lib/contexts/subscription-notification-context"
import { SidebarProvider, useSidebar } from "@/lib/contexts/sidebar-context"
import { useSubscriptionValidation } from "@/lib/hooks/use-subscription-validation"
import { cn } from "@/lib/utils"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const { isValidating, isSubscriptionValid } = useSubscriptionValidation()

  // Memoizar el estado de autenticación para evitar re-renders
  const isAuthenticated = useMemo(() => AuthService.isAuthenticated(), [])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated, router])

  // Memoizar el estado de loading para evitar re-renders innecesarios
  const shouldShowLoading = useMemo(() => {
    return isLoading || isValidating
  }, [isLoading, isValidating])

  return (
    <SidebarProvider>
      <DashboardContent children={children} shouldShowLoading={shouldShowLoading} isLoading={isLoading} isValidating={isValidating} isSubscriptionValid={isSubscriptionValid} />
    </SidebarProvider>
  )
}

function DashboardContent({ 
  children, 
  shouldShowLoading, 
  isLoading, 
  isValidating, 
  isSubscriptionValid 
}: { 
  children: React.ReactNode
  shouldShowLoading: boolean
  isLoading: boolean
  isValidating: boolean
  isSubscriptionValid: boolean
}) {
  const { isCollapsed } = useSidebar()

  // Memoizar el contenido del layout para evitar re-renders
  const layoutContent = useMemo(() => (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className={cn("transition-all duration-300", isCollapsed ? "lg:pl-16" : "lg:pl-64")}>
        {/* Navbar Alert (cuando la notificación principal está cerrada) */}
        <NavbarSubscriptionAlert />
        
        {/* Subscription Status Header */}
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border/50">
          <div className="flex justify-center p-4">
            <SubscriptionStatus />
          </div>
        </div>
        <main className="p-6 bg-background">{children}</main>
      </div>
    </div>
  ), [children, isCollapsed])

  // Mostrar loading mientras se valida la autenticación o la suscripción
  if (shouldShowLoading) {
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
      {layoutContent}
    </SubscriptionNotificationProvider>
  )
}
