"use client"

import { useEffect, useState, useCallback, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api"
import { Subscription } from "@/lib/types"

// Cache global para evitar validaciones repetidas
let subscriptionCache: Subscription | null = null
let lastValidationTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export function useSubscriptionValidation() {
  const router = useRouter()
  const [isValidating, setIsValidating] = useState(false) // Cambiar a false por defecto
  const [subscription, setSubscription] = useState<Subscription | null>(subscriptionCache)
  const hasValidatedRef = useRef(false)

  const validateSubscription = useCallback(async (forceRefresh = false) => {
    const now = Date.now()
    const isCacheValid = subscriptionCache && (now - lastValidationTime) < CACHE_DURATION

    // Si tenemos cache válido y no es refresh forzado, usar cache
    if (isCacheValid && !forceRefresh) {
      setSubscription(subscriptionCache)
      setIsValidating(false)
      return subscriptionCache
    }

    try {
      setIsValidating(true)
      const subscriptionData = await apiClient.getSubscription()
      
      // Actualizar cache
      subscriptionCache = subscriptionData
      lastValidationTime = now
      setSubscription(subscriptionData)

      if (subscriptionData) {
        const endDate = new Date(subscriptionData.endDate)
        const today = new Date()
        const isExpired = endDate < today || !subscriptionData.isActive

        if (isExpired) {
          // Redirigir a la página de renovación
          router.push('/renovar-suscripcion')
          return subscriptionData
        }
      }
      
      return subscriptionData
    } catch (error) {
      console.error("Error validating subscription:", error)
      // En caso de error, también redirigir a renovación por seguridad
      router.push('/renovar-suscripcion')
      return null
    } finally {
      setIsValidating(false)
    }
  }, [router])

  useEffect(() => {
    const currentPath = window.location.pathname
    
    // Solo validar si no estamos en la página de login o renovación
    if (currentPath !== '/login' && currentPath !== '/renovar-suscripcion') {
      // Solo validar una vez por sesión, a menos que sea necesario
      if (!hasValidatedRef.current) {
        hasValidatedRef.current = true
        validateSubscription()
      }
    } else {
      setIsValidating(false)
    }
  }, [validateSubscription])

  // Función para forzar refresh cuando sea necesario
  const refreshSubscription = useCallback(() => {
    hasValidatedRef.current = false
    return validateSubscription(true)
  }, [validateSubscription])

  return {
    isValidating,
    subscription,
    refreshSubscription,
    isSubscriptionValid: useMemo(() => 
      subscription && subscription.isActive && new Date(subscription.endDate) >= new Date(),
      [subscription]
    )
  }
}
