// ====================
// TIPOS DE ERROR
// ====================

export interface SearchErrorInfo {
  code: string;
  message: string;
  field?: string;
  context?: Record<string, any>;
}

export interface ErrorState {
  hasError: boolean;
  type: 'network' | 'validation' | 'server' | 'timeout' | 'unknown';
  message: string;
  details?: SearchErrorInfo[];
  retryable: boolean;
  retryCount: number;
}

// ====================
// CÓDIGOS DE ERROR
// ====================

export const ERROR_CODES = {
  // Errores de red
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  CONNECTION_ERROR: 'CONNECTION_ERROR',
  
  // Errores de validación
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_DATE_FORMAT: 'INVALID_DATE_FORMAT',
  INVALID_TIME_FORMAT: 'INVALID_TIME_FORMAT',
  INVALID_LOCATION: 'INVALID_LOCATION',
  
  // Errores del servidor
  SERVER_ERROR: 'SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  RATE_LIMIT: 'RATE_LIMIT',
  
  // Errores de búsqueda específicos
  NO_RESULTS: 'NO_RESULTS',
  SEARCH_FAILED: 'SEARCH_FAILED',
  LOCATION_NOT_FOUND: 'LOCATION_NOT_FOUND',
  INVALID_FILTERS: 'INVALID_FILTERS',
  
  // Errores de disponibilidad
  AVAILABILITY_CHECK_FAILED: 'AVAILABILITY_CHECK_FAILED',
  INVALID_TIME_RANGE: 'INVALID_TIME_RANGE',
  CANCHA_NOT_FOUND: 'CANCHA_NOT_FOUND'
} as const;

// ====================
// MENSAJES DE ERROR AMIGABLES
// ====================

export const ERROR_MESSAGES: Record<string, string> = {
  [ERROR_CODES.NETWORK_ERROR]: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
  [ERROR_CODES.TIMEOUT_ERROR]: 'La búsqueda está tomando más tiempo del esperado. Intenta nuevamente.',
  [ERROR_CODES.CONNECTION_ERROR]: 'Error de conexión. Por favor, intenta más tarde.',
  
  [ERROR_CODES.VALIDATION_ERROR]: 'Los datos ingresados no son válidos.',
  [ERROR_CODES.MISSING_REQUIRED_FIELD]: 'Faltan campos obligatorios.',
  [ERROR_CODES.INVALID_DATE_FORMAT]: 'Formato de fecha inválido.',
  [ERROR_CODES.INVALID_TIME_FORMAT]: 'Formato de hora inválido.',
  [ERROR_CODES.INVALID_LOCATION]: 'Ubicación no válida.',
  
  [ERROR_CODES.SERVER_ERROR]: 'Error interno del servidor. Intenta más tarde.',
  [ERROR_CODES.NOT_FOUND]: 'No se encontró el recurso solicitado.',
  [ERROR_CODES.UNAUTHORIZED]: 'No tienes permisos para realizar esta acción.',
  [ERROR_CODES.FORBIDDEN]: 'Acceso denegado.',
  [ERROR_CODES.RATE_LIMIT]: 'Has excedido el límite de peticiones. Espera un momento.',
  
  [ERROR_CODES.NO_RESULTS]: 'No se encontraron canchas con los criterios especificados.',
  [ERROR_CODES.SEARCH_FAILED]: 'Error al realizar la búsqueda. Intenta con otros criterios.',
  [ERROR_CODES.LOCATION_NOT_FOUND]: 'No se encontraron ubicaciones que coincidan.',
  [ERROR_CODES.INVALID_FILTERS]: 'Los filtros aplicados no son válidos.',
  
  [ERROR_CODES.AVAILABILITY_CHECK_FAILED]: 'No se pudo verificar la disponibilidad.',
  [ERROR_CODES.INVALID_TIME_RANGE]: 'El rango de horarios no es válido.',
  [ERROR_CODES.CANCHA_NOT_FOUND]: 'La cancha solicitada no existe.'
};

// ====================
// UTILIDADES DE ERROR
// ====================

/**
 * Determina el tipo de error basado en el código de estado HTTP
 */
export const getErrorTypeFromStatus = (status: number): ErrorState['type'] => {
  if (status >= 500) return 'server';
  if (status === 404) return 'server';
  if (status === 401 || status === 403) return 'server';
  if (status === 429) return 'server';
  if (status >= 400) return 'validation';
  if (status === 0) return 'network';
  return 'unknown';
};

/**
 * Determina si un error es reintenteble
 */
export const isRetryableError = (type: ErrorState['type'], status?: number): boolean => {
  switch (type) {
    case 'network':
    case 'timeout':
      return true;
    case 'server':
      return status ? status >= 500 : true;
    case 'validation':
    case 'unknown':
    default:
      return false;
  }
};

/**
 * Extrae el código de error de una respuesta de API
 */
export const extractErrorCode = (error: any): string => {
  // Intenta extraer el código de diferentes lugares posibles
  if (error?.code) return error.code;
  if (error?.response?.data?.code) return error.response.data.code;
  if (error?.response?.data?.error?.code) return error.response.data.error.code;
  
  // Mapea códigos de estado HTTP a códigos de error
  const status = error?.status || error?.response?.status;
  if (status) {
    switch (status) {
      case 404: return ERROR_CODES.NOT_FOUND;
      case 401: return ERROR_CODES.UNAUTHORIZED;
      case 403: return ERROR_CODES.FORBIDDEN;
      case 429: return ERROR_CODES.RATE_LIMIT;
      case 422: return ERROR_CODES.VALIDATION_ERROR;
      case 500:
      case 502:
      case 503:
      case 504: return ERROR_CODES.SERVER_ERROR;
      default: break;
    }
  }
  
  // Detecta errores de red
  if (error?.message?.includes('Network Error') || error?.code === 'NETWORK_ERROR') {
    return ERROR_CODES.NETWORK_ERROR;
  }
  
  if (error?.message?.includes('timeout') || error?.code === 'ECONNABORTED') {
    return ERROR_CODES.TIMEOUT_ERROR;
  }
  
  return ERROR_CODES.SERVER_ERROR;
};

/**
 * Crea un estado de error normalizado
 */
export const createErrorState = (error: any, retryCount: number = 0): ErrorState => {
  const errorCode = extractErrorCode(error);
  const status = error?.status || error?.response?.status;
  const type = getErrorTypeFromStatus(status || 500);
  
  // Mensaje personalizado o por defecto
  let message = error?.message || ERROR_MESSAGES[errorCode] || 'Ha ocurrido un error inesperado';
  
  // Si el mensaje del servidor es más descriptivo, úsalo
  const serverMessage = error?.response?.data?.message;
  if (serverMessage && serverMessage !== message) {
    message = serverMessage;
  }
  
  // Extraer detalles de error si existen
  const details: SearchErrorInfo[] = [];
  const serverErrors = error?.response?.data?.errors;
  if (Array.isArray(serverErrors)) {
    details.push(...serverErrors.map((err: any) => ({
      code: err.code || errorCode,
      message: err.message || err.msg || '',
      field: err.field || err.param,
      context: err.context
    })));
  }
  
  return {
    hasError: true,
    type,
    message,
    details: details.length > 0 ? details : undefined,
    retryable: isRetryableError(type, status),
    retryCount
  };
};

/**
 * Formatea un mensaje de error para mostrar al usuario
 */
export const formatErrorMessage = (errorState: ErrorState): string => {
  let message = errorState.message;
  
  // Agregar contexto adicional si es útil
  if (errorState.type === 'network') {
    message += ' Verifica tu conexión a internet e intenta nuevamente.';
  } else if (errorState.type === 'server' && errorState.retryable) {
    message += ' Este error suele ser temporal, intenta nuevamente en unos minutos.';
  } else if (errorState.type === 'validation' && errorState.details) {
    const fieldErrors = errorState.details
      .filter(detail => detail.field)
      .map(detail => `${detail.field}: ${detail.message}`)
      .join(', ');
    
    if (fieldErrors) {
      message += ` Revisa: ${fieldErrors}`;
    }
  }
  
  return message;
};

/**
 * Obtiene sugerencias de recuperación basadas en el tipo de error
 */
export const getRecoverySuggestions = (errorState: ErrorState): string[] => {
  const suggestions: string[] = [];
  
  switch (errorState.type) {
    case 'network':
      suggestions.push('Verifica tu conexión a internet');
      suggestions.push('Intenta recargar la página');
      suggestions.push('Desactiva temporalmente tu VPN si usas una');
      break;
      
    case 'timeout':
      suggestions.push('La búsqueda está tomando mucho tiempo');
      suggestions.push('Intenta con criterios más específicos');
      suggestions.push('Verifica tu conexión a internet');
      break;
      
    case 'validation':
      suggestions.push('Revisa que todos los datos estén correctos');
      suggestions.push('Verifica el formato de fechas y horas');
      suggestions.push('Asegúrate de seleccionar una ubicación válida');
      break;
      
    case 'server':
      if (errorState.retryable) {
        suggestions.push('Este error suele ser temporal');
        suggestions.push('Intenta nuevamente en unos minutos');
        suggestions.push('Si persiste, contacta al soporte técnico');
      } else {
        suggestions.push('Contacta al soporte técnico');
        suggestions.push('Incluye los detalles del error en tu reporte');
      }
      break;
      
    default:
      suggestions.push('Intenta recargar la página');
      suggestions.push('Si el problema persiste, contacta al soporte');
      break;
  }
  
  return suggestions;
};

/**
 * Valida parámetros de búsqueda básicos
 */
export const validateSearchParams = (params: any): SearchErrorInfo[] => {
  const errors: SearchErrorInfo[] = [];
  
  // Validar fecha
  if (params.fecha) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(params.fecha)) {
      errors.push({
        code: ERROR_CODES.INVALID_DATE_FORMAT,
        message: 'El formato de fecha debe ser YYYY-MM-DD',
        field: 'fecha'
      });
    } else {
      const date = new Date(params.fecha);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (date < today) {
        errors.push({
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'No puedes buscar canchas en fechas pasadas',
          field: 'fecha'
        });
      }
    }
  }
  
  // Validar horarios
  if (params.horaInicio || params.horaFin) {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    if (params.horaInicio && !timeRegex.test(params.horaInicio)) {
      errors.push({
        code: ERROR_CODES.INVALID_TIME_FORMAT,
        message: 'El formato de hora de inicio debe ser HH:MM',
        field: 'horaInicio'
      });
    }
    
    if (params.horaFin && !timeRegex.test(params.horaFin)) {
      errors.push({
        code: ERROR_CODES.INVALID_TIME_FORMAT,
        message: 'El formato de hora de fin debe ser HH:MM',
        field: 'horaFin'
      });
    }
    
    if (params.horaInicio && params.horaFin && timeRegex.test(params.horaInicio) && timeRegex.test(params.horaFin)) {
      const start = new Date(`2000-01-01T${params.horaInicio}`);
      const end = new Date(`2000-01-01T${params.horaFin}`);
      
      if (end <= start) {
        errors.push({
          code: ERROR_CODES.INVALID_TIME_RANGE,
          message: 'La hora de fin debe ser posterior a la hora de inicio',
          field: 'horaFin'
        });
      }
    }
  }
  
  // Validar rangos de precio
  if (params.precioMin !== undefined && params.precioMax !== undefined) {
    if (params.precioMin < 0) {
      errors.push({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'El precio mínimo no puede ser negativo',
        field: 'precioMin'
      });
    }
    
    if (params.precioMax < params.precioMin) {
      errors.push({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'El precio máximo debe ser mayor al mínimo',
        field: 'precioMax'
      });
    }
  }
  
  return errors;
};