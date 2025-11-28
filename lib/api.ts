import { AuthService } from "./auth"
import { CalculatePrintingHistoryResponse, Client, Dashboard, Expense, Filament, Printer, PrintingHistory, Product, Quotation, Sale, SaleDetail, Subscription, SystemConfig, WorkPackage, BoldPaymentData } from "./types";
import { parseErrorResponse, type ErrorResponse } from "./errors/api-error";
import { ApiError } from "./errors/types";
import { getErrorMessage } from "./errors/error-messages";

// Interfaces para paginación
export interface PaginationRequest {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortDescending?: boolean;
}

export interface PaginationMetadata {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMetadata;
}

export interface FilamentFilters extends PaginationRequest {
  type?: string;
  color?: string;
  threshold?: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5081"

// Sistema de debounce para evitar peticiones duplicadas muy rápidas
const pendingRequests = new Map<string, Promise<any>>();

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${API_BASE_URL}${path}`;

    if (AuthService.isTokenExpired()) {
      window.location.href = "/login"
    }

    // Crear clave única para el request (solo para GET requests)
    const method = options.method ?? "GET";
    const requestKey = method === "GET" ? `${method}:${url}` : null;
    
    // Verificar si ya hay una petición pendiente para este endpoint
    if (requestKey && pendingRequests.has(requestKey)) {
      return pendingRequests.get(requestKey) as Promise<T | null>;
    }

    // Crear la promesa de la petición
    const requestPromise = this.executeRequest<T>(url, options);
    
    // Guardar la petición pendiente para GET requests
    if (requestKey) {
      pendingRequests.set(requestKey, requestPromise);
    }
    
    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Limpiar la petición pendiente
      if (requestKey) {
        pendingRequests.delete(requestKey);
      }
    }
  }

  private async executeRequest<T>(url: string, options: RequestInit): Promise<T | null> {
    // Optimizar headers para reducir preflight requests
    const baseHeaders: Record<string, string> = {};
    
    // Solo agregar Authorization si hay token
    const authHeaders = AuthService.getAuthHeaders();
    if (authHeaders.Authorization) {
      baseHeaders.Authorization = authHeaders.Authorization;
    }
    
    // Solo agregar Content-Type si hay body y no está ya definido
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
      // Intentar parsear la respuesta como ErrorResponse
      let errorResponse: ErrorResponse | null = null;
      try {
        const text = await res.text();
        if (text) {
          errorResponse = JSON.parse(text) as ErrorResponse;
        }
      } catch {
        // Si no se puede parsear, continuar con el manejo genérico
      }

      // Si tenemos una ErrorResponse estructurada, usarla
      if (errorResponse && errorResponse.code) {
        // Siempre usar el mensaje del frontend basado en el código
        throw new ApiError(
          getErrorMessage(errorResponse.code),
          errorResponse.code,
          res.status,
          errorResponse.details,
          errorResponse.timestamp
        );
      }

      // Si no, crear un error genérico
      const errText = await res.text().catch(() => "");
      throw parseErrorResponse(
        new Error(`HTTP ${res.status} ${res.statusText} @ ${url}\n${errText}`),
        res.status
      );
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
  async getClients(filters: PaginationRequest = {}): Promise<PaginatedResponse<Client> | null> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortDescending) params.append('sortDescending', 'true');

    const url = `/client/?${params}`;
    return this.request<PaginatedResponse<Client> | null>(url);
  }

  // Método legacy para compatibilidad (sin paginación)
  async getAllClients(): Promise<Client[] | null> {
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
  async getSales(filters: PaginationRequest = {}): Promise<PaginatedResponse<Sale> | null> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortDescending) params.append('sortDescending', 'true');

    const url = `/sale/?${params}`;
    return this.request<PaginatedResponse<Sale> | null>(url);
  }

  // Método legacy para compatibilidad (sin paginación)
  async getAllSales(): Promise<Sale[] | null> {
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

  async getSale(id: string, includeProducts: boolean = true): Promise<Sale | null> {
    const url = `/sale/${id}${includeProducts ? '?includeProducts=true' : ''}`
    return this.request<Sale | null>(url)
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
  async getFilaments(filters: FilamentFilters = {}): Promise<PaginatedResponse<Filament> | null> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortDescending) params.append('sortDescending', 'true');
    if (filters.threshold) params.append('threshold', filters.threshold.toString());

    let url: string;
    if (filters.type) {
      url = `/filament/type/${filters.type}?${params}`;
    } else if (filters.color) {
      // Para colores múltiples, usar el endpoint general con searchTerm
      if (filters.searchTerm) {
        // Si ya hay un searchTerm, combinar con colores
        params.set('searchTerm', `${filters.searchTerm} ${filters.color}`);
      } else {
        // Si no hay searchTerm, usar solo los colores
        params.set('searchTerm', filters.color);
      }
      url = `/filament/?${params}`;
    } else if (filters.threshold !== undefined) {
      url = `/filament/low-stock?${params}`;
    } else {
      url = `/filament/?${params}`;
    }

    return this.request<PaginatedResponse<Filament> | null>(url);
  }

  // Método legacy para compatibilidad (sin paginación)
  async getAllFilaments(): Promise<Filament[] | null> {
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
  async getProducts(filters: PaginationRequest = {}): Promise<PaginatedResponse<Product> | null> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortDescending) params.append('sortDescending', 'true');

    const url = `/product/?${params}`;
    return this.request<PaginatedResponse<Product> | null>(url);
  }

  // Método legacy para compatibilidad (sin paginación)
  async getAllProducts(): Promise<Product[] | null> {
    return this.request("/product/")
  }

  async getProduct(id: string): Promise<Product | null> {
    return this.request<Product | null>(`/product/${id}`)
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
  async getExpenses(filters: PaginationRequest = {}): Promise<PaginatedResponse<Expense> | null> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortDescending) params.append('sortDescending', 'true');

    const url = `/expense/?${params}`;
    return this.request<PaginatedResponse<Expense> | null>(url);
  }

  // Método legacy para compatibilidad (sin paginación)
  async getAllExpenses(): Promise<Expense[] | null> {
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
  async getPrinters(filters: PaginationRequest = {}): Promise<PaginatedResponse<Printer> | null> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortDescending) params.append('sortDescending', 'true');

    const url = `/printer/?${params}`;
    return this.request<PaginatedResponse<Printer> | null>(url);
  }

  // Método legacy para compatibilidad (sin paginación)
  async getAllPrinters(): Promise<Printer[] | null> {
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
  async getPrintingHistory(filters: PaginationRequest = {}): Promise<PaginatedResponse<PrintingHistory> | null> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortDescending) params.append('sortDescending', 'true');

    const url = `/printing-history/?${params}`;
    return this.request<PaginatedResponse<PrintingHistory> | null>(url);
  }

  // Método legacy para compatibilidad (sin paginación)
  async getAllPrintingHistory(): Promise<PrintingHistory[] | null> {
    return this.request<PrintingHistory[] | null>("/printing-history/");
  }

  async createPrintingHistory(printingHistory: any) {
    return this.request("/printing-history/", {
      method: "POST",
      body: JSON.stringify(printingHistory),
    })
  }

  async updatePrintingHistory(id: string, printingHistory: any) {
    return this.request(`/printing-history/${id}`, {
      method: "PUT",
      body: JSON.stringify(printingHistory),
    })
  }

  async deletePrintingHistory(id: string) {
    return this.request(`/printing-history/${id}`, {
      method: "DELETE",
    })
  }

  async calculatePrintingHistory(printingHistory: any): Promise<CalculatePrintingHistoryResponse | null> {
    return this.request<CalculatePrintingHistoryResponse | null>("/printing-history/calculate", {
      method: "POST",
      body: JSON.stringify(printingHistory),
    })
  }

  // Dashboard endpoints
  async getDashboard(): Promise<Dashboard | null> {
    return this.request<Dashboard | null>("/dashboard/")
  }

  // Subscription endpoints
  async getSubscription(): Promise<Subscription | null> {
    return this.request<Subscription | null>("/subscription")
  }

  async updateSubscription(subscription: any): Promise<Subscription | null> {
    return this.request<Subscription | null>("/subscription", {
      method: "PUT",
      body: JSON.stringify(subscription),
    })
  }

  async applyInvitationCode(code: string): Promise<Subscription | null> {
    return this.request<Subscription | null>("/subscription/apply-invitation-code", {
      method: "POST",
      body: JSON.stringify({ invitationCode: code }),
    })
  }

  async renewSubscription(): Promise<Subscription | null> {
    return this.request<Subscription | null>("/subscription/renew", {
      method: "POST",
    })
  }

  // Bold.co payment integration
  async getBoldPaymentData(): Promise<BoldPaymentData | null> {
    return this.request<BoldPaymentData | null>("/bold-payment-data", {
      method: "POST",
    })
  }

  async verifyBoldPayment(orderId: string): Promise<{ success: boolean; message: string } | null> {
    return this.request<{ success: boolean; message: string } | null>("/bold-verify-payment", {
      method: "POST",
      body: JSON.stringify({ orderId }),
    })
  }

  // Quotation endpoints
  async getQuotations(filters: PaginationRequest & { productId?: string; startDate?: string; endDate?: string; clientId?: string } = {}): Promise<PaginatedResponse<Quotation> | null> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortDescending) params.append('sortDescending', 'true');
    if (filters.productId) params.append('productId', filters.productId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.clientId) params.append('clientId', filters.clientId);

    const url = `/quotation/?${params}`;
    return this.request<PaginatedResponse<Quotation> | null>(url);
  }

  async getQuotation(id: string): Promise<Quotation | null> {
    return this.request<Quotation | null>(`/quotation/${id}`)
  }

  async createQuotation(quotation: any): Promise<Quotation | null> {
    return this.request<Quotation | null>("/quotation/", {
      method: "POST",
      body: JSON.stringify(quotation),
    })
  }

  async updateQuotation(id: string, quotation: any): Promise<Quotation | null> {
    return this.request<Quotation | null>(`/quotation/${id}`, {
      method: "PUT",
      body: JSON.stringify(quotation),
    })
  }

  async deleteQuotation(id: string) {
    return this.request(`/quotation/${id}`, {
      method: "DELETE",
    })
  }
}

export const apiClient = new ApiClient()
