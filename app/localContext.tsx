// context/LocaleContext.tsx
"use client"
import { createContext, useContext, useState } from "react"

const LocaleContext = createContext(null)

export function LocaleProvider({ children }) {
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

export const useLocale = () => useContext(LocaleContext)
