// Exportar utilidades de manejo de errores
export * from './errorHandler';

// Re-exportaciones para facilitar importaciones
export {
  ERROR_CODES,
  ERROR_MESSAGES,
  createErrorState,
  formatErrorMessage,
  getRecoverySuggestions,
  validateSearchParams,
  getErrorTypeFromStatus,
  isRetryableError,
  extractErrorCode
} from './errorHandler';

export type {
  ErrorState,
  SearchErrorInfo
} from './errorHandler';