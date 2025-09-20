// context/LocaleContext.tsx
"use client"
import { createContext, useContext, useState, ReactNode, useEffect } from "react"
import { apiClient } from "@/lib/api"

type LocaleContextType = {
  locale: string
  setLocale: (value: string) => void
  currency: string
  setCurrency: (value: string) => void
  formatCurrency: (value: number) => string
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState("es-CO")
  const [currency, setCurrency] = useState("COP")

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(locale, { style: "currency", currency }).format(value)

  // Cargar configuración de moneda desde la base de datos
  useEffect(() => {
    const loadCurrencyConfig = async () => {
      try {
        const configs = await apiClient.getSystemConfig()
        const currencyConfig = configs?.find(config => config.key === "DefaultCurrency")

        if (currencyConfig) {
          setCurrency(currencyConfig.value)
        }
      } catch (error) {
        console.error("Error loading currency config:", error)
      }
    }

    loadCurrencyConfig()
  }, [])

  return (
    <LocaleContext.Provider value={{ locale, setLocale, currency, setCurrency, formatCurrency }}>
      {children}
    </LocaleContext.Provider>
  )
}

export const useLocale = () => {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider")
  }
  return context
}

