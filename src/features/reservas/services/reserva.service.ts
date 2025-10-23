export interface ReservaRaw {
  id_reserva: number;
  id_cliente: number;
  id_cancha: number;
  inicia_en: string;
  termina_en: string;
  cantidad_personas: number;
  requiere_aprobacion: boolean;
  monto_base: number;
  monto_extra: number;
  monto_total: number;
  creado_en: string;
  actualizado_en: string;
}
import { API_CONFIG } from '../../../lib/config/api';
import { httpClient } from '../../../lib/api/http-client';

const RESERVAS_ENDPOINT = API_CONFIG.endpoints.reservas; // '/reservas'

// Nuevo: obtener reservas por usuario desde el backend (ruta real)
export async function getReservasPorUsuario(id_usuario: number): Promise<ReservaRaw[]> {
  const res = await httpClient.get<ReservaRaw[]>(`${RESERVAS_ENDPOINT}/usuario/${id_usuario}`);
  return res.data;
}

// Obtener reservas por cancha (ruta real)
export async function getReservasPorCancha(canchaId: number): Promise<ReservaRaw[]> {
  const res = await httpClient.get<ReservaRaw[]>(`${RESERVAS_ENDPOINT}/cancha/${canchaId}`);
  return res.data;
}

// Export por defecto para compatibilidad (antes había getReservasPorCliente)
export default {
  getReservasPorUsuario,
  getReservasPorCancha
};
/**
 * Servicio para manejar operaciones CRUD de Reservas
 */

import { httpClient as _httpClient } from '../../../lib/api/http-client';
import type {
  Reserva,
  CreateReservaRequest,
  UpdateReservaRequest
} from '../types/reserva.types';

export class ReservaService {
  private readonly endpoint = API_CONFIG.endpoints.reservas;

  /**
   * Obtiene todas las reservas
   */
  async getAll(): Promise<Reserva[]> {
    const response = await _httpClient.get<Reserva[]>(this.endpoint);
    return response.data;
  }

  /**
   * Obtiene una reserva por ID
   */
  async getById(id: number): Promise<Reserva> {
    const response = await _httpClient.get<Reserva>(`${this.endpoint}/${id}`);
    return response.data;
  }

  /**
   * Obtiene reservas por cancha
   */
  async getByCancha(id_cancha: number): Promise<Reserva[]> {
    const response = await _httpClient.get<Reserva[]>(`${this.endpoint}/cancha/${id_cancha}`);
    return response.data;
  }

  /**
   * Obtiene reservas por cliente
   */
  async getByCliente(id_cliente: number): Promise<Reserva[]> {
    const response = await _httpClient.get<Reserva[]>(`${this.endpoint}/usuario/${id_cliente}`);
    return response.data;
  }

  /**
   * Crea una nueva reserva
   */
  async create(data: CreateReservaRequest): Promise<Reserva> {
    const response = await _httpClient.post<Reserva>(this.endpoint, data);
    return response.data;
  }

  /**
   * Actualiza una reserva existente
   */
  async update(id: number, data: UpdateReservaRequest): Promise<Reserva> {
    const response = await _httpClient.patch<Reserva>(`${this.endpoint}/${id}`, data);
    return response.data;
  }

  /**
   * Elimina una reserva
   */
  async delete(id: number): Promise<void> {
    await _httpClient.delete(`${this.endpoint}/${id}`);
  }

  /**
   * Obtiene horarios disponibles para una cancha en una fecha específica
   */
  async getAvailableSlots(id_cancha: number, fecha: string): Promise<any[]> {
    try {
      const reservas = await this.getByCancha(id_cancha);
      const reservasFecha = reservas.filter(r => 
        r.inicia_en.split('T')[0] === fecha && 
        r.estado !== 'Cancelada'
      );
      
      // Aquí podrías implementar la lógica para calcular slots disponibles
      // basado en las reservas existentes y el horario de la cancha
      return reservasFecha;
    } catch (error) {
      console.error('Error getting available slots:', error);
      return [];
    }
  }
}

// Instancia singleton del servicio
export const reservaService = new ReservaService();
