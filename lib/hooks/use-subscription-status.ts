"use client"

import { useState, useEffect, useMemo } from "react"
import { apiClient } from "@/lib/api"
import { Subscription } from "@/lib/types"

export function useSubscriptionStatus() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [hasCheckedToday, setHasCheckedToday] = useState(false)

  const checkIfCheckedToday = () => {
    const today = new Date().toDateString()
    const lastCheck = localStorage.getItem('subscriptionLastCheck')
    return lastCheck === today
  }

  const markAsCheckedToday = () => {
    const today = new Date().toDateString()
    localStorage.setItem('subscriptionLastCheck', today)
  }

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        setIsLoading(true)
        
        // Verificar si ya se revisó hoy
        const checkedToday = checkIfCheckedToday()
        setHasCheckedToday(checkedToday)
        
        // Solo cargar si no se ha revisado hoy o si es la primera vez
        if (!checkedToday) {
          const subscriptionData = await apiClient.getSubscription()
          setSubscription(subscriptionData)
          markAsCheckedToday()
        } else {
          // Cargar datos del localStorage si ya se revisó hoy
          const cachedSubscription = localStorage.getItem('subscriptionData')
          if (cachedSubscription) {
            setSubscription(JSON.parse(cachedSubscription))
          }
        }
      } catch (err) {
        setError("Error al cargar información de suscripción")
        console.error("Error loading subscription:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadSubscription()
  }, [])

  // Función para forzar actualización del cache
  const forceRefreshSubscription = async () => {
    try {
      setIsLoading(true)
      // Limpiar cache
      localStorage.removeItem('subscriptionData')
      localStorage.removeItem('subscriptionLastCheck')
      
      // Cargar datos frescos
      const subscriptionData = await apiClient.getSubscription()
      setSubscription(subscriptionData)
      markAsCheckedToday()
    } catch (err) {
      setError("Error al actualizar información de suscripción")
      console.error("Error refreshing subscription:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Calcular días restantes basándose en las fechas
  const calculateDaysRemaining = (subscription: Subscription | null): number => {
    if (!subscription) return 0
    
    const endDate = new Date(subscription.endDate)
    const today = new Date()
    const diffTime = endDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return Math.max(0, diffDays)
  }

  // Guardar en localStorage cuando se actualiza la suscripción
  useEffect(() => {
    if (subscription) {
      localStorage.setItem('subscriptionData', JSON.stringify(subscription))
    }
  }, [subscription])

  const refreshSubscription = async () => {
    try {
      setIsLoading(true)
      const subscriptionData = await apiClient.getSubscription()
      setSubscription(subscriptionData)
      markAsCheckedToday()
    } catch (err) {
      setError("Error al actualizar información de suscripción")
      console.error("Error refreshing subscription:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    subscription,
    isLoading,
    error,
    hasCheckedToday,
    refreshSubscription,
    forceRefreshSubscription,
    daysRemaining: useMemo(() => calculateDaysRemaining(subscription), [subscription])
  }
}
