import axios from 'axios';
import type { CrearDeudaRequest, CrearDeudaResponse } from '../types/libelula.types';

// ==========================================
// CONFIGURACIÓN BASE
// ==========================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación si existe
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==========================================
// SERVICIO DE LIBÉLULA
// ==========================================

/**
 * Crea una deuda en Libélula para procesar el pago de una reserva
 */
export const crearDeudaLibelula = async (
  request: CrearDeudaRequest
): Promise<CrearDeudaResponse> => {
  try {
    console.log('📤 [LibelulaService] Enviando solicitud de creación de deuda:', request);

    const response = await apiClient.post<CrearDeudaResponse>(
      '/libelula/crear-deuda',
      request
    );

    console.log('✅ [LibelulaService] Deuda creada exitosamente:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ [LibelulaService] Error al crear deuda:', error);

    // Manejo de errores
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        'Error al procesar el pago. Por favor intenta de nuevo.'
      );
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor de pagos. Verifica tu conexión.');
    } else {
      throw new Error('Error inesperado al iniciar el pago.');
    }
  }
};

/**
 * Genera un identificador único para la deuda
 * Formato: ROGU-XXXXXXXX-YYYYYYYY
 */
export const generarIdentificadorDeuda = (_idReserva: number): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `ROGU-${timestamp}-${random}`;
};
