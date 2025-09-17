export interface Client {
  id?: string
  name: string
  email: string
  phone: string
  address: string
  city: string
}

export interface Sale {
  id?: string
  clientId: string
  status: string
  estimatedTotal?: number | null
  finalTotal?: number | null
}

export interface Filament {
  id: string
  type: string
  color: string
  costPerGram: number
  stockGrams: number
}

export interface WorkPackage {
  id?: string
  name: string
  description: string
  calculationType: string
  value: number
}

export interface Product {
  id?: string
  name: string
  description: string
  imageUrl?: string
  modelUrl?: string
  externalLink?: string
}

export interface SaleDetail {
  id?: string
  saleId: string
  productDescription: string
  filamentId: string
  weightGrams: number
  printTimeHours: number
  quantity: number
  comments: string
  workPackageId: string
  machineRateApplied: number
  workPackagePerHour: number
  laborCost: number
  subTotal: number
  // Propiedades anidadas de la API
  sale?: Sale
  workPackage?: WorkPackage
  filament?: Filament
}

export interface Expense {
  id?: string
  description: string
  amount: number
  category: string
  date: string
}

export interface SystemConfig {
  id?: string
  key: string
  value: string
  description: string
}
