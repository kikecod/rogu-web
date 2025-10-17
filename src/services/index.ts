/**
 * Punto de entrada para todos los servicios
 * Permite importar servicios de manera centralizada
 */

// Servicios
export { httpClient, HttpClient } from './http-client';
export { canchaService, CanchaService } from './cancha.service';
export { sedeService, SedeService } from './sede.service';
export { reservaService, ReservaService } from './reserva.service';

// Utilidades
export { ErrorHandler, useErrorHandler } from './error-handler';

// Re-exportar tipos comunes
export type { ApiResponse, ApiError } from './http-client';