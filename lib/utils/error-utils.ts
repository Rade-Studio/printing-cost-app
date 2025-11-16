import { parseErrorResponse, getErrorMessageFromError } from "../errors/api-error";
import { getErrorMessage } from "../errors/error-messages";
import type { ErrorCode } from "../errors/error-codes";

/**
 * Obtiene el mensaje de error para mostrar al usuario
 */
export function getUserFriendlyMessage(error: unknown): string {
  return getErrorMessageFromError(error);
}

/**
 * Obtiene el mensaje de error por código
 */
export function getMessageByCode(code: ErrorCode | string): string {
  return getErrorMessage(code);
}

/**
 * Verifica si un error es de un tipo específico
 */
export function isErrorCode(error: unknown, code: ErrorCode): boolean {
  try {
    const apiError = parseErrorResponse(error);
    return apiError.code === code;
  } catch {
    return false;
  }
}

/**
 * Obtiene detalles adicionales del error
 */
export function getErrorDetails(error: unknown): Record<string, unknown> | undefined {
  try {
    const apiError = parseErrorResponse(error);
    return apiError.details;
  } catch {
    return undefined;
  }
}

