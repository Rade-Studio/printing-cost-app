"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Crown, AlertTriangle, CheckCircle, X, Gift } from "lucide-react"
import { useSubscriptionStatus } from "@/lib/hooks/use-subscription-status"
import { useSubscriptionNotification } from "@/lib/contexts/subscription-notification-context"
import { InvitationCodeModal } from "./invitation-code-modal"

export function SubscriptionStatus() {
  const { subscription, isLoading, error, daysRemaining, refreshSubscription } = useSubscriptionStatus()
  const { isNotificationClosed, closeNotification } = useSubscriptionNotification()
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl border-0 shadow-sm bg-gradient-to-br from-card to-card/50">
        <CardContent className="py-3 px-6">
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm text-muted-foreground">Cargando información de suscripción...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !subscription) {
    return null // No mostrar nada si hay error o no hay suscripción
  }

  // Solo mostrar si es una suscripción de prueba, está activa y no ha expirado
  if (!subscription.isTrial || !subscription.isActive) {
    return null
  }

  // No mostrar si la suscripción ha expirado
  const endDate = new Date(subscription.endDate)
  const today = new Date()
  if (endDate < today) {
    return null
  }

  // No mostrar si la notificación fue cerrada temporalmente
  if (isNotificationClosed) {
    return null
  }

  const isExpiringSoon = daysRemaining <= 3
  const isExpired = daysRemaining <= 0

  const getStatusIcon = () => {
    if (isExpired) return <AlertTriangle className="h-4 w-4 text-red-500" />
    if (isExpiringSoon) return <Clock className="h-4 w-4 text-amber-500" />
    return <CheckCircle className="h-4 w-4 text-emerald-500" />
  }

  const getStatusColor = () => {
    if (isExpired) return "bg-red-50 border-red-200"
    if (isExpiringSoon) return "bg-amber-50 border-amber-200"
    return "bg-emerald-50 border-emerald-200"
  }

  const getStatusText = () => {
    if (isExpired) return "Prueba Expirada"
    if (isExpiringSoon) return "Prueba por Expirar"
    return "Prueba Activa"
  }

  const getDaysText = () => {
    if (isExpired) return "La prueba ha expirado"
    if (daysRemaining === 1) return "1 día restante"
    return `${daysRemaining} días restantes`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <Card className={`w-full max-w-5xl border-0 shadow-sm bg-gradient-to-br from-card to-card/50 ${getStatusColor()} relative`}>
      <CardContent className="py-3 px-6">
        {/* Botón de cerrar */}
        <Button
          variant="ghost"
          size="sm"
          onClick={closeNotification}
          className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-background/20"
        >
          <X className="h-3 w-3" />
        </Button>
        
        <div className="flex items-center justify-between">
          {/* Información principal */}
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Crown className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm text-foreground">Suscripción de Prueba</h3>
                  <Badge variant={isExpired ? "destructive" : isExpiringSoon ? "secondary" : "default"} className="text-xs">
                    {getStatusText()}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Información de fechas */}
          <div className="flex items-center gap-6 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Fecha exacta</p>
              <p className="text-sm font-medium text-foreground">{formatDate(subscription.endDate)}</p>
            </div>
          </div>

          {/* Contador de días */}
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div className="text-center">
              <div className="text-xl font-bold text-foreground">
                {isExpired ? "0" : daysRemaining}
              </div>
              <div className="text-xs text-muted-foreground">días</div>
            </div>
          </div>

          {/* Botón para aplicar código de invitación - solo para usuarios trial */}
          {subscription.isTrial && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Gift className="h-4 w-4" />
              Aplicar código
            </Button>
          )}
        </div>
        
        {isExpiringSoon && !isExpired && (
          <div className="mt-2 p-2 bg-amber-100 rounded-lg">
            <p className="text-xs text-amber-800 text-center">
              ⚠️ Tu prueba expira pronto. Considera actualizar tu suscripción para continuar disfrutando de todas las funciones.
            </p>
          </div>
        )}

        {isExpired && (
          <div className="mt-2 p-2 bg-red-100 rounded-lg">
            <p className="text-xs text-red-800 text-center">
              🚫 Tu prueba ha expirado. Actualiza tu suscripción para continuar usando la aplicación.
            </p>
          </div>
        )}
      </CardContent>

      <InvitationCodeModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={() => {
          refreshSubscription()
        }}
      />
    </Card>
  )
}
