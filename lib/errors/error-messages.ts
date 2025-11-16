import { ErrorCodes, type ErrorCode } from "./error-codes";

/**
 * Mensajes de error en español - sincronizados con el backend
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // Errores de Cliente
  [ErrorCodes.CLIENT_NOT_FOUND]: "El cliente especificado no existe.",
  [ErrorCodes.CLIENT_ID_MISMATCH]: "El ID del cliente no coincide con el ID de la solicitud.",

  // Errores de Producto
  [ErrorCodes.PRODUCT_NOT_FOUND]: "El producto especificado no existe.",
  [ErrorCodes.PRODUCT_ID_MISMATCH]: "El ID del producto no coincide con el ID de la solicitud.",
  [ErrorCodes.PRODUCT_INVALID_QUANTITY]: "La cantidad del producto debe ser mayor a 0.",
  [ErrorCodes.PRODUCT_MISSING_WORKPACKAGE]: "Uno de los productos no tiene paquete de trabajo configurado.",
  [ErrorCodes.PRODUCT_DUPLICATE]: "No se pueden incluir productos duplicados.",

  // Errores de Venta
  [ErrorCodes.SALE_NOT_FOUND]: "La venta especificada no existe.",
  [ErrorCodes.SALE_DETAIL_NOT_FOUND]: "El detalle de venta especificado no existe.",
  [ErrorCodes.SALE_CLIENT_NOT_FOUND]: "El cliente especificado no existe.",
  [ErrorCodes.SALE_OBSERVATIONS_TOO_LONG]: "Las observaciones no pueden exceder 5000 caracteres.",
  [ErrorCodes.SALE_DUPLICATE_PRODUCTS]: "No se pueden incluir productos duplicados en la venta.",
  [ErrorCodes.SALE_PRODUCT_INVALID_QUANTITY]: "La cantidad del producto debe ser mayor a 0.",
  [ErrorCodes.SALE_PRODUCT_NOT_FOUND]: "El producto especificado no existe.",
  [ErrorCodes.SALE_PRODUCT_MISSING_WORKPACKAGE]: "Uno de los productos no tiene paquete de trabajo configurado.",

  // Errores de Filamento
  [ErrorCodes.FILAMENT_NOT_FOUND]: "El filamento especificado no existe.",
  [ErrorCodes.FILAMENT_ID_MISMATCH]: "El ID del filamento no coincide con el ID de la solicitud.",

  // Errores de Impresora
  [ErrorCodes.PRINTER_NOT_FOUND]: "La impresora especificada no existe.",
  [ErrorCodes.PRINTER_NOT_SELECTED]: "Debe seleccionar una impresora.",

  // Errores de WorkPackage
  [ErrorCodes.WORKPACKAGE_NOT_FOUND]: "El paquete de trabajo especificado no existe.",
  [ErrorCodes.WORKPACKAGE_ID_MISMATCH]: "El ID del paquete de trabajo no coincide con el ID de la solicitud.",

  // Errores de Gasto
  [ErrorCodes.EXPENSE_NOT_FOUND]: "El gasto especificado no existe.",

  // Errores de Configuración del Sistema
  [ErrorCodes.SYSTEM_CONFIG_NOT_FOUND]: "La configuración del sistema especificada no existe.",
  [ErrorCodes.SYSTEM_CONFIG_ID_MISMATCH]: "El ID de la configuración no coincide con el ID de la solicitud.",

  // Errores de Historial de Impresión
  [ErrorCodes.PRINTING_HISTORY_NOT_FOUND]: "El historial de impresión especificado no existe.",
  [ErrorCodes.PRINTING_HISTORY_FILAMENT_NOT_FOUND]: "El filamento especificado no existe.",

  // Errores de Suscripción
  [ErrorCodes.SUBSCRIPTION_NOT_FOUND]: "No se encontró una suscripción activa.",
  [ErrorCodes.SUBSCRIPTION_ALREADY_EXISTS]: "Ya tienes una suscripción activa.",

  // Errores de Autenticación
  [ErrorCodes.AUTH_INVALID_CREDENTIALS]: "Las credenciales proporcionadas son incorrectas.",
  [ErrorCodes.AUTH_USER_NOT_FOUND]: "El usuario especificado no existe.",
  [ErrorCodes.AUTH_USER_LOCKED_OUT]: "El usuario está bloqueado. Intenta más tarde.",
  [ErrorCodes.AUTH_USER_NOT_ALLOWED]: "El usuario no tiene permiso para realizar esta acción.",
  [ErrorCodes.AUTH_REQUIRES_TWO_FACTOR]: "Se requiere autenticación de dos factores.",
  [ErrorCodes.AUTH_REGISTRATION_FAILED]: "Error al registrar el usuario. Por favor, verifica los datos proporcionados.",
  [ErrorCodes.AUTH_ROLE_ASSIGNMENT_FAILED]: "Error al asignar el rol al usuario.",
  [ErrorCodes.AUTH_PASSWORD_CHANGE_FAILED]: "Error al cambiar la contraseña. Por favor, verifica los datos proporcionados.",
  [ErrorCodes.AUTH_USER_ALREADY_EXISTS]: "El usuario ya existe.",
  [ErrorCodes.AUTH_USER_WITHOUT_TENANT]: "El usuario no tiene un identificador de organización asignado.",

  // Errores de Validación General
  [ErrorCodes.VALIDATION_ID_MISMATCH]: "El ID proporcionado no coincide con el ID de la solicitud.",
  [ErrorCodes.VALIDATION_REQUIRED_FIELD]: "El campo es requerido.",
  [ErrorCodes.VALIDATION_INVALID_FORMAT]: "El formato del campo es inválido.",

  // Errores del Sistema
  [ErrorCodes.SYSTEM_INTERNAL_ERROR]: "Ha ocurrido un error interno del servidor. Por favor, intenta más tarde.",
  [ErrorCodes.SYSTEM_BAD_REQUEST]: "La solicitud es inválida. Por favor, verifica los datos proporcionados.",
};

/**
 * Obtiene el mensaje de error en español para un código dado
 */
export function getErrorMessage(code: string): string {
  return ERROR_MESSAGES[code as ErrorCode] || "Ha ocurrido un error inesperado. Por favor, intenta más tarde.";
}

