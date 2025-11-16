import { useState, useCallback } from "react";
import { getUserFriendlyMessage } from "../utils/error-utils";
import type { ErrorCode } from "../errors/error-codes";

/**
 * Hook para manejar errores de forma elegante en componentes
 */
export function useErrorHandler() {
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<ErrorCode | null>(null);

  const handleError = useCallback((err: unknown) => {
    const message = getUserFriendlyMessage(err);
    setError(message);
    
    // Intentar extraer el código de error
    if (err && typeof err === "object" && "code" in err) {
      setErrorCode(err.code as ErrorCode);
    } else {
      setErrorCode(null);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setErrorCode(null);
  }, []);

  return {
    error,
    errorCode,
    handleError,
    clearError,
    hasError: error !== null,
  };
}

