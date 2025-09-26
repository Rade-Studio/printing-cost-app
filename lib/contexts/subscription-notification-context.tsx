"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface SubscriptionNotificationContextType {
  isNotificationClosed: boolean
  closeNotification: () => void
  showNotification: () => void
}

const SubscriptionNotificationContext = createContext<SubscriptionNotificationContextType | undefined>(undefined)

export function SubscriptionNotificationProvider({ children }: { children: ReactNode }) {
  const [isNotificationClosed, setIsNotificationClosed] = useState(false)

  // Verificar estado inicial del localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const closedUntil = localStorage.getItem('subscriptionNotificationClosed')
      if (closedUntil) {
        const closedDate = new Date(closedUntil)
        const now = new Date()
        // Si han pasado más de 24 horas, mostrar la notificación nuevamente
        if (now.getTime() - closedDate.getTime() < 24 * 60 * 60 * 1000) {
          setIsNotificationClosed(true)
        } else {
          localStorage.removeItem('subscriptionNotificationClosed')
          setIsNotificationClosed(false)
        }
      }
    }
  }, [])

  const closeNotification = () => {
    setIsNotificationClosed(true)
    if (typeof window !== 'undefined') {
      localStorage.setItem('subscriptionNotificationClosed', new Date().toISOString())
    }
  }

  const showNotification = () => {
    setIsNotificationClosed(false)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('subscriptionNotificationClosed')
    }
  }

  return (
    <SubscriptionNotificationContext.Provider 
      value={{ 
        isNotificationClosed, 
        closeNotification, 
        showNotification 
      }}
    >
      {children}
    </SubscriptionNotificationContext.Provider>
  )
}

export function useSubscriptionNotification() {
  const context = useContext(SubscriptionNotificationContext)
  if (context === undefined) {
    throw new Error('useSubscriptionNotification must be used within a SubscriptionNotificationProvider')
  }
  return context
}
