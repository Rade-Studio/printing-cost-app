
"use client"
import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { apiClient } from "@/lib/api"

export interface SystemConfig {
  id?: string
  key: string
  value: string
}

const defaultValues: Record<string, string> = {
  WorkPackagePerHour: "0",
  MachineRatePerHour: "1",
  ElectricityCostPerKwh: "600",
  DefaultProfitMargin: "20",
  MinimumOrderValue: "5000",
  CompanyName: "Mi Empresa",
  CompanyEmail: "contacto@miempresa.com",
  CompanyPhone: "+57 3000000000",
}

interface SystemConfigContextProps {
  configs: Record<string, string>
  refreshConfigs: () => Promise<void>
  isLoading: boolean
}

const SystemConfigContext = createContext<SystemConfigContextProps | undefined>(undefined)

export function SystemConfigProvider({ children }: { children: ReactNode }) {
  const [configs, setConfigs] = useState<Record<string, string>>(defaultValues)
  const [isLoading, setIsLoading] = useState(true)

  const fetchConfigs = async () => {
    try {
      setIsLoading(true)
      const data: SystemConfig[] | null = await apiClient.getSystemConfig()

      // fusiona configs con valores por defecto
      const merged = { ...defaultValues }
      data?.forEach((c) => {
        merged[c.key] = c.value
      })

      setConfigs(merged)
    } catch (error) {
      console.error("Error cargando configuraciones:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchConfigs()
  }, [])

  return (
    <SystemConfigContext.Provider value={{ configs, refreshConfigs: fetchConfigs, isLoading }}>
      {children}
    </SystemConfigContext.Provider>
  )
}

export function useSystemConfig() {
  const context = useContext(SystemConfigContext)
  if (!context) {
    throw new Error("useSystemConfig debe usarse dentro de un SystemConfigProvider")
  }
  return context
}
