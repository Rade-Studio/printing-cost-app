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

export interface SignupResponse {
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

export interface SignupCreate {
  email: string
  password: string
  companyName: string
  fullName: string
  phoneNumber: string
  country: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5081"

export class AuthService {
  private static TOKEN_KEY = "3d_calculator_token"
  private static TOKEN_EXPIRY_KEY = "3d_calculator_token_expiry"

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

  static async signup(data: SignupCreate): Promise<SignupResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Error de registro")
    }

    const result = await response.json()
    this.setToken(result.token.result)
    return result
  }

  static setToken(token: string): void {
    if (typeof window !== "undefined") {
      // expira en 24 horas
      const expiryTime = Date.now() + (24 * 60 * 60 * 1000)
      localStorage.setItem(this.TOKEN_KEY, token)
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString())
    }
  }

  static getToken(): string | null {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(this.TOKEN_KEY)
      const expiryTime = localStorage.getItem(this.TOKEN_EXPIRY_KEY)
      
      if (!token || !expiryTime) {
        return null
      }
      
      // Verificar si el token ha expirado
      if (Date.now() > parseInt(expiryTime)) {
        // Token expirado, limpiar localStorage
        this.removeToken()
        return null
      }
      
      return token
    }
    return null
  }

  static removeToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.TOKEN_KEY)
      localStorage.removeItem(this.TOKEN_EXPIRY_KEY)
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

  static getTokenTimeRemaining(): number | null {
    if (typeof window !== "undefined") {
      const expiryTime = localStorage.getItem(this.TOKEN_EXPIRY_KEY)
      if (!expiryTime) return null
      
      const remaining = parseInt(expiryTime) - Date.now()
      return remaining > 0 ? remaining : 0
    }
    return null
  }

  static isTokenExpired(): boolean {
    const timeRemaining = this.getTokenTimeRemaining()
    return timeRemaining === null || timeRemaining <= 0
  }
}
