"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api"
import { Subscription } from "@/lib/types"

export function useSubscriptionValidation() {
  const router = useRouter()
  const [isValidating, setIsValidating] = useState(true)
  const [subscription, setSubscription] = useState<Subscription | null>(null)

  useEffect(() => {
    const validateSubscription = async () => {
      try {
        setIsValidating(true)
        const subscriptionData = await apiClient.getSubscription()
        setSubscription(subscriptionData)

        if (subscriptionData) {
          const endDate = new Date(subscriptionData.endDate)
          const today = new Date()
          const isExpired = endDate < today || !subscriptionData.isActive

          if (isExpired) {
            // Redirigir a la página de renovación
            router.push('/renovar-suscripcion')
            return
          }
        }
      } catch (error) {
        console.error("Error validating subscription:", error)
        // En caso de error, también redirigir a renovación por seguridad
        router.push('/renovar-suscripcion')
      } finally {
        setIsValidating(false)
      }
    }

    // Solo validar si no estamos en la página de login o renovación
    const currentPath = window.location.pathname
    if (currentPath !== '/login' && currentPath !== '/renovar-suscripcion') {
      validateSubscription()
    } else {
      setIsValidating(false)
    }
  }, [router])

  return {
    isValidating,
    subscription,
    isSubscriptionValid: subscription && subscription.isActive && new Date(subscription.endDate) >= new Date()
  }
}
