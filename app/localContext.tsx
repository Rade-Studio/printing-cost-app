// context/LocaleContext.tsx
"use client"
import { createContext, useContext, useState, ReactNode } from "react"

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

