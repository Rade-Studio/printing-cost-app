// context/LocaleContext.tsx
"use client"
import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react"
import { useSystemConfig } from "./systenConfigContext"

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
  const { configs } = useSystemConfig()

  const formatCurrency = useCallback((value: number) =>
    new Intl.NumberFormat(locale, { style: "currency", currency }).format(value), 
    [locale, currency]
  )

  // Sincronizar moneda con el contexto de configuración del sistema
  useEffect(() => {
    if (configs.DefaultCurrency && configs.DefaultCurrency !== currency) {
      setCurrency(configs.DefaultCurrency)
    }
  }, [configs.DefaultCurrency])

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

