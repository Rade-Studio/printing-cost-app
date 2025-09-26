"use client"

import { AlertTriangle, Clock, Crown } from "lucide-react"
import { useSubscriptionStatus } from "@/lib/hooks/use-subscription-status"
import { useSubscriptionNotification } from "@/lib/contexts/subscription-notification-context"

export function NavbarSubscriptionAlert() {
  const { subscription, isLoading, error, daysRemaining } = useSubscriptionStatus()
  const { isNotificationClosed, showNotification } = useSubscriptionNotification()

  // Solo mostrar si:
  // 1. Es una suscripción de prueba activa
  // 2. No ha expirado
  // 3. La notificación principal fue cerrada
  if (isLoading || error || !subscription || 
      !subscription.isTrial || !subscription.isActive || 
      !isNotificationClosed) {
    return null
  }

  const endDate = new Date(subscription.endDate)
  const today = new Date()
  if (endDate < today) {
    return null
  }

  const isExpiringSoon = daysRemaining <= 3
  const getAlertColor = () => {
    if (isExpiringSoon) return 'bg-amber-50 border-amber-200 text-amber-800'
    return 'bg-blue-50 border-blue-200 text-blue-800'
  }

  const getAlertIcon = () => {
    if (isExpiringSoon) return <AlertTriangle className="h-4 w-4" />
    return <Clock className="h-4 w-4" />
  }

  return (
    <div 
      className={`w-full border-b ${getAlertColor()} cursor-pointer hover:opacity-80 transition-opacity`}
      onClick={showNotification}
      title="Haz clic para ver la notificación completa"
    >
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-center gap-2 text-sm">
          {getAlertIcon()}
          <span className="font-medium">
            {isExpiringSoon 
              ? `⚠️ Tu prueba expira en ${daysRemaining} ${daysRemaining === 1 ? 'día' : 'días'}`
              : `👑 Prueba activa: ${daysRemaining} ${daysRemaining === 1 ? 'día' : 'días'} restantes`
            }
          </span>
          <Crown className="h-3 w-3" />
        </div>
      </div>
    </div>
  )
}
