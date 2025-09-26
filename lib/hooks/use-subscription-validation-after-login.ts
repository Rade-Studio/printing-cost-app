"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api"
import { Subscription } from "@/lib/types"

export function useSubscriptionValidationAfterLogin() {
  const router = useRouter()
  const [isValidating, setIsValidating] = useState(false)
  const [subscription, setSubscription] = useState<Subscription | null>(null)

  const validateSubscriptionAfterLogin = async () => {
    try {
      setIsValidating(true)
      
      // Limpiar cache de suscripción para forzar actualización
      if (typeof window !== 'undefined') {
        localStorage.removeItem('subscriptionData')
        localStorage.removeItem('subscriptionLastCheck')
      }
      
      const subscriptionData = await apiClient.getSubscription()
      setSubscription(subscriptionData)

      if (subscriptionData) {
        const endDate = new Date(subscriptionData.endDate)
        const today = new Date()
        const isExpired = endDate < today || !subscriptionData.isActive

        if (isExpired) {
          // Redirigir a la página de renovación
          router.push('/renovar-suscripcion')
          return false
        } else {
          // Suscripción válida, continuar al dashboard
          return true
        }
      } else {
        // No hay suscripción, redirigir a renovación
        router.push('/renovar-suscripcion')
        return false
      }
    } catch (error) {
      console.error("Error validating subscription after login:", error)
      // En caso de error, también redirigir a renovación por seguridad
      router.push('/renovar-suscripcion')
      return false
    } finally {
      setIsValidating(false)
    }
  }

  return {
    isValidating,
    subscription,
    validateSubscriptionAfterLogin
  }
}
