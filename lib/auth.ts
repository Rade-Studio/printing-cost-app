export interface User {
  id: string
  email: string
  name?: string
}

export interface LoginResponse {
  token: {
    result: string
    id: number
    exception: null | string
    status: string
    isCanceled: boolean
    isCompleted: boolean
    isCompletedSuccessfully: boolean
    creationOptions: string
    asyncState: null | any
    isFaulted: boolean
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5081"

export class AuthService {
  private static TOKEN_KEY = "3d_calculator_token"

  static async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      throw new Error("Error de autenticación")
    }

    const data = await response.json()

    if (!data.token?.isCompletedSuccessfully || data.token?.isFaulted) {
      throw new Error("Error en la autenticación del servidor")
    }

    this.setToken(data.token.result)
    return data
  }

  static setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.TOKEN_KEY, token)
    }
  }

  static getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.TOKEN_KEY)
    }
    return null
  }

  static removeToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.TOKEN_KEY)
    }
  }

  static isAuthenticated(): boolean {
    return this.getToken() !== null
  }

  static logout(): void {
    this.removeToken()
  }

  static getAuthHeaders(): Record<string, string> {
    const token = this.getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }
}
