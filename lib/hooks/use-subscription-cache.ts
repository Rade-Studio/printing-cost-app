"use client"

import { useEffect, useState, useCallback } from "react"
import { Subscription } from "@/lib/types"

// Cache global para el estado de suscripción
class SubscriptionCache {
  private static instance: SubscriptionCache
  private cache: Subscription | null = null
  private lastUpdate: number = 0
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

  static getInstance(): SubscriptionCache {
    if (!SubscriptionCache.instance) {
      SubscriptionCache.instance = new SubscriptionCache()
    }
    return SubscriptionCache.instance
  }

  get(): Subscription | null {
    const now = Date.now()
    if (this.cache && (now - this.lastUpdate) < this.CACHE_DURATION) {
      return this.cache
    }
    return null
  }

  set(subscription: Subscription | null): void {
    this.cache = subscription
    this.lastUpdate = Date.now()
  }

  clear(): void {
    this.cache = null
    this.lastUpdate = 0
  }

  isExpired(): boolean {
    const now = Date.now()
    return !this.cache || (now - this.lastUpdate) >= this.CACHE_DURATION
  }
}

export function useSubscriptionCache() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const cache = SubscriptionCache.getInstance()

  // Cargar desde cache al inicializar
  useEffect(() => {
    const cachedSubscription = cache.get()
    if (cachedSubscription) {
      setSubscription(cachedSubscription)
    }
  }, [])

  const updateSubscription = useCallback((newSubscription: Subscription | null) => {
    cache.set(newSubscription)
    setSubscription(newSubscription)
  }, [cache])

  const clearCache = useCallback(() => {
    cache.clear()
    setSubscription(null)
  }, [cache])

  const isSubscriptionValid = subscription && subscription.isActive && new Date(subscription.endDate) >= new Date()

  return {
    subscription,
    updateSubscription,
    clearCache,
    isSubscriptionValid,
    isExpired: cache.isExpired()
  }
}
