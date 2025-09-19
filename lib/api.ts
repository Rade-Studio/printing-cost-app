import { AuthService } from "./auth"
import { Client, Expense, Filament, Printer, PrintingHistory, Product, Sale, SaleDetail, SystemConfig, WorkPackage } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5081"

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${API_BASE_URL}${path}`;

    // Solo agrega Content-Type si hay body; evita preflights innecesarios en GET/DELETE.
    const baseHeaders: Record<string, string> = {
      ...AuthService.getAuthHeaders(), // ej: { Authorization: `Bearer ...` }
    };
    if (options.body && !("Content-Type" in (options.headers ?? {}))) {
      baseHeaders["Content-Type"] = "application/json";
    }

    const res = await fetch(url, {
      method: options.method ?? "GET",
      mode: "cors",
      // credentials: "include", // <-- solo si usas cookies/sesiones
      ...options,
      headers: {
        ...baseHeaders,
        ...(options.headers as Record<string, string>),
      },
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${res.statusText} @ ${url}\n${errText}`);
    }

    // 204 No Content
    if (res.status === 204) return null;

    // Manejo de cuerpo vacío con 200/201
    const text = await res.text();
    if (!text) return null;

    try {
      return JSON.parse(text) as T;
    } catch {
      // Si no es JSON, devuelve texto (ajusta si tu API siempre es JSON)
      return text as unknown as T;
    }
  }

  // Client endpoints
  async getClients(): Promise<Client[] | null> {
    return this.request("/client/")
  }

  async createClient(client: any): Promise<Client | null> {
    return this.request("/client/", {
      method: "POST",
      body: JSON.stringify(client),
    })
  }

  async updateClient(id: string, client: any) {
    return this.request(`/client/${id}`, {
      method: "PUT",
      body: JSON.stringify(client),
    })
  }

  async deleteClient(id: string) {
    return this.request(`/client/${id}`, {
      method: "DELETE",
    })
  }

  // Sale endpoints
  async getSales(): Promise<Sale[] | null> {
    return this.request("/sale/")
  }

  async createSale(sale: any): Promise<Sale | null> {
    return this.request("/sale/", {
      method: "POST",
      body: JSON.stringify(sale),
    })
  }

  async updateSale(id: string, sale: any) {
    return this.request(`/sale/${id}`, {
      method: "PUT",
      body: JSON.stringify(sale),
    })
  }

  async deleteSale(id: string) {
    return this.request(`/sale/${id}`, {
      method: "DELETE",
    })
  }

  // Sale details endpoints
  async getSaleDetails(saleId: string): Promise<SaleDetail[] | null> {
    return this.request(`/sale/${saleId}/details`)
  }

  async createSaleDetail(saleId: string, detail: any): Promise<SaleDetail | null> {
    return this.request(`/sale/${saleId}/details`, {
      method: "POST",
      body: JSON.stringify(detail),
    })
  }

  async updateSaleDetail(saleId: string, detailId: string, detail: any) {
    return this.request(`/sale/${saleId}/details/${detailId}`, {
      method: "PUT",
      body: JSON.stringify(detail),
    })
  }

  async deleteSaleDetail(saleId: string, detailId: string) {
    return this.request(`/sale/${saleId}/details/${detailId}`, {
      method: "DELETE",
    })
  }

  // Filament endpoints
  async getFilaments(): Promise<Filament[] | null> {
    return this.request("/filament/")
  }

  async createFilament(filament: any): Promise<Filament | null> {
    return this.request("/filament/", {
      method: "POST",
      body: JSON.stringify(filament),
    })
  }

  async updateFilament(id: string, filament: any) {
    return this.request(`/filament/${id}`, {
      method: "PUT",
      body: JSON.stringify(filament),
    })
  }

  async deleteFilament(id: string) {
    return this.request(`/filament/${id}`, {
      method: "DELETE",
    })
  }

  // WorkPackage endpoints
  async getWorkPackages(): Promise<WorkPackage[] | null> {
    return this.request("/workpackage/")
  }

  async createWorkPackage(workPackage: any): Promise<WorkPackage | null> {
    return this.request("/workpackage/", {
      method: "POST",
      body: JSON.stringify(workPackage),
    })
  }

  async updateWorkPackage(id: string, workPackage: any) {
    return this.request(`/workpackage/${id}`, {
      method: "PUT",
      body: JSON.stringify(workPackage),
    })
  }

  async deleteWorkPackage(id: string) {
    return this.request(`/workpackage/${id}`, {
      method: "DELETE",
    })
  }

  // Products endpoints
  async getProducts(): Promise<Product[] | null> {
    return this.request("/product/")
  }

  async createProduct(product: any): Promise<Product | null> {
    return this.request("/product/", {
      method: "POST",
      body: JSON.stringify(product),
    })
  }

  async updateProduct(id: string, product: any) {
    return this.request(`/product/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    })
  }

  async deleteProduct(id: string) {
    return this.request(`/product/${id}`, {
      method: "DELETE",
    })
  }

  // Expense endpoints
  async getExpenses(): Promise<Expense[] | null> {
    return this.request("/expense/")
  }

  async createExpense(expense: any): Promise<Expense | null> {
    return this.request("/expense/", {
      method: "POST",
      body: JSON.stringify(expense),
    })
  }

  async updateExpense(id: string, expense: any) {
    return this.request(`/expense/${id}`, {
      method: "PUT",
      body: JSON.stringify(expense),
    })
  }

  async deleteExpense(id: string) {
    return this.request(`/expense/${id}`, {
      method: "DELETE",
    })
  }

  // SystemConfig endpoints
  async getSystemConfig(): Promise<SystemConfig[] | null> {
    return this.request("/systemconfig")
  }

  async createSystemConfig(config: any): Promise<SystemConfig | null> {
    return this.request("/systemconfig", {
      method: "POST",
      body: JSON.stringify(config),
    })
  }

  async updateSystemConfig(id: string, config: any) {
    return this.request(`/systemconfig/${id}`, {
      method: "PUT",
      body: JSON.stringify(config),
    })
  }

  async deleteSystemConfig(id: string) {
    return this.request(`/systemconfig/${id}`, {
      method: "DELETE",
    })
  }

  // Printer endpoints
  async getPrinters(): Promise<Printer[] | null> {
    return this.request<Printer[] | null>("/printer/")
  }

  async createPrinter(printer: Printer) {
    return this.request("/printer/", {
      method: "POST",
      body: JSON.stringify(printer),
    })
  }

  async updatePrinter(id: string, printer: Printer) {
    return this.request(`/printer/${id}`, {
      method: "PUT",
      body: JSON.stringify(printer),
    })
  }

  async deletePrinter(id: string) {
    return this.request(`/printer/${id}`, {
      method: "DELETE",
    })
  }

  // PrintingHistory endpoints
  async getPrintingHistory() : Promise<PrintingHistory[] | null> {
    return this.request<PrintingHistory[] | null>("/printinghistory/")
  }

  async createPrintingHistory(printingHistory: any) {
    return this.request("/printinghistory/", {
      method: "POST",
      body: JSON.stringify(printingHistory),
    })
  }

  async updatePrintingHistory(id: string, printingHistory: any) {
    return this.request(`/printinghistory/${id}`, {
      method: "PUT",
      body: JSON.stringify(printingHistory),
    })
  }

  async deletePrintingHistory(id: string) {
    return this.request(`/printinghistory/${id}`, {
      method: "DELETE",
    })
  }
}

export const apiClient = new ApiClient()
