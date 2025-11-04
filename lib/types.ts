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
  createdAt: string
  client?: Client
}

export interface Filament {
  id?: string
  type: string
  color: string[] | string
  costPerGram: number
  stockGrams: number
  density: number
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
  externalLink?: string,
  printingHistory?: PrintingHistory
}

export interface SaleDetail {
  id?: string
  saleId: string
  productId?: string
  quantity: number
  comments: string
  workPackageId: string
  workPackagePerHour: number
  laborCost: number
  subTotal: number
  // Propiedades anidadas de la API
  sale?: Sale
  workPackage?: WorkPackage
  product?: Product,
}

export interface Expense {
  id?: string
  description: string
  amount: number
  category: string
  expenseDate: string
}

export interface SystemConfig {
  id?: string
  key: string
  value: string
  description: string
}

export interface Printer {
  id?: string
  name: string
  description: string
  model: string
  status: string
  kwhPerHour: number
}

export interface FilamentConsumption {
  id?: string
  printingHistoryId?: string
  filamentId: string
  gramsUsed?: number
  filamentCost?: number
  filament?: Filament
}

export interface PrintingHistory {
  id?: string
  printerId: string
  productId?: string
  printTimeHours: number
  printTimeMinutes?: number
  totalGramsUsed?: number
  totalCost?: number
  totalEnergyCost?: number
  totalFilamentCost?: number
  type: string
  filamentConsumptions?: FilamentConsumption[]
  printer?: Printer
}

export interface PrintingHistoryCalculation {
  totalGramsUsed: number
  totalEnergyCost: number
  totalFilamentCost: number
  totalCost: number
}

export interface Dashboard {
  totalClients: number
  totalSales: number
  totalFilaments: number
  totalPrinters: number
  totalPrintingHistories: number
  totalProducts: number
  totalSalesAmount: number
  totalExpensesAmount: number
  profit: number
  lowStockFilamentsCount: number
  activePrintersCount: number
  totalPrintTimeHours: number
  totalFilamentConsumptionGrams: number
  recentSales: Sale[],
  printers: Printer[],
  filaments: Filament[],
}

export interface CalculatePrintingHistoryResponse {
  totalGramsUsed: number
  totalEnergyCost: number
  totalFilamentCost: number
  totalCost: number
}

export interface Subscription {
  startDate: string
  endDate: string
  isActive: boolean
  isTrial: boolean
}

export interface BoldPaymentData {
  apiKey: string
  orderId: string
  hash: string
  amount: number
  description: string
  currency: string
  email: string
  phone: string
  name: string
  dialCode?: string
  documentNumber?: string
  documentType?: string
}