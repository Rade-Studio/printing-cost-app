/**
 * Estructura de respuesta de error sincronizada con el backend
 * El backend solo envía el código, el frontend traduce a mensaje
 */
export interface ErrorResponse {
  code: string;
  message?: string; // Opcional - el frontend siempre usa su propio diccionario
  details?: Record<string, unknown>;
  timestamp?: string;
}

/**
 * Extensión de Error para incluir información de la respuesta del servidor
 */
export class ApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;
  public readonly timestamp?: string;

  constructor(
    message: string,
    code: string,
    statusCode: number,
    details?: Record<string, unknown>,
    timestamp?: string
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = timestamp;
  }
}

