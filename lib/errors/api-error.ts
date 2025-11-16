import { ApiError as ApiErrorClass, type ErrorResponse } from "./types";
import { getErrorMessage } from "./error-messages";

/**
 * Parsea una respuesta de error del servidor
 */
export function parseErrorResponse(error: unknown, statusCode?: number): ApiErrorClass {
  // Si ya es un ApiError, devolverlo tal cual
  if (error instanceof ApiErrorClass) {
    return error;
  }

  // Si es un Error estándar, intentar extraer información
  if (error instanceof Error) {
    // Intentar parsear el mensaje como JSON (puede contener ErrorResponse)
    try {
      const parsed = JSON.parse(error.message);
      if (parsed.code) {
        // Siempre usar el mensaje del frontend basado en el código
        const message = getErrorMessage(parsed.code);
        return new ApiErrorClass(
          message,
          parsed.code,
          statusCode || 500,
          parsed.details,
          parsed.timestamp
        );
      }
    } catch {
      // Si no es JSON, continuar con el manejo normal
    }

    // Si el mensaje contiene información de HTTP, intentar extraerla
    const httpMatch = error.message.match(/HTTP (\d+)/);
    const extractedStatusCode = httpMatch ? parseInt(httpMatch[1], 10) : statusCode || 500;

    return new ApiErrorClass(
      error.message,
      "SYSTEM_INTERNAL_ERROR",
      extractedStatusCode
    );
  }

  // Si es un objeto con estructura de ErrorResponse
  if (typeof error === "object" && error !== null) {
    const errorObj = error as Partial<ErrorResponse>;
    if (errorObj.code) {
      // Siempre usar el mensaje del frontend basado en el código
      const message = getErrorMessage(errorObj.code);
      return new ApiErrorClass(
        message,
        errorObj.code,
        statusCode || 500,
        errorObj.details,
        errorObj.timestamp
      );
    }
  }

  // Error desconocido
  return new ApiErrorClass(
    "Ha ocurrido un error inesperado. Por favor, intenta más tarde.",
    "SYSTEM_INTERNAL_ERROR",
    statusCode || 500
  );
}

/**
 * Extrae el mensaje de error amigable para mostrar al usuario
 */
export function getErrorMessageFromError(error: unknown): string {
  const apiError = parseErrorResponse(error);
  return getErrorMessage(apiError.code);
}

