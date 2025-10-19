/**
 * Utilidades para el manejo de errores en el frontend
 */

import type { ApiError } from './http-client';

export class ErrorHandler {
  /**
   * Extrae un mensaje legible del error
   */
  static getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    
    if (typeof error === 'object' && error !== null) {
      const apiError = error as ApiError;
      if (apiError.message) {
        return apiError.message;
      }
      
      if (apiError.data?.message) {
        return apiError.data.message;
      }
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    return 'Ha ocurrido un error inesperado';
  }

  /**
   * Maneja errores de forma consistente mostrando notificaciones
   */
  static handleError(error: unknown, context?: string): void {
    const message = this.getErrorMessage(error);
    const fullMessage = context ? `${context}: ${message}` : message;
    
    console.error('Error:', error);
    alert(fullMessage); // En una aplicación real, aquí usarías un sistema de notificaciones más sofisticado
  }

  /**
   * Maneja errores de autenticación
   */
  static handleAuthError(): void {
    localStorage.removeItem('token');
    alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
    // Aquí podrías redirigir al login
    window.location.href = '/login';
  }

  /**
   * Verifica si un error es de autenticación
   */
  static isAuthError(error: unknown): boolean {
    if (typeof error === 'object' && error !== null) {
      const apiError = error as ApiError;
      return apiError.status === 401;
    }
    return false;
  }
}

// Hook personalizado para manejo de errores en componentes React
export const useErrorHandler = () => {
  const handleError = (error: unknown, context?: string) => {
    if (ErrorHandler.isAuthError(error)) {
      ErrorHandler.handleAuthError();
    } else {
      ErrorHandler.handleError(error, context);
    }
  };

  return { handleError };
};