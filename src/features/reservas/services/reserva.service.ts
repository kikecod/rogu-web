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

const API_BASE = 'http://localhost:3000/api';

export async function getReservasPorCliente(token?: string): Promise<ReservaRaw[]> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/reservas/cliente`, { headers });
  if (!res.ok) {
    throw new Error(`Error fetching reservas por cliente: ${res.status}`);
  }
  return res.json();
}

export async function getReservasPorCancha(canchaId: number, token?: string): Promise<ReservaRaw[]> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/reservas/cancha/${canchaId}`, { headers });
  if (!res.ok) {
    throw new Error(`Error fetching reservas por cancha: ${res.status}`);
  }
  return res.json();
}

export default {
  getReservasPorCliente,
  getReservasPorCancha
};
/**
 * Servicio para manejar operaciones CRUD de Reservas
 */

import { httpClient } from '../../../lib/api/http-client';
import { API_CONFIG } from '../../../lib/config/api';
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
    const response = await httpClient.get<Reserva[]>(this.endpoint);
    return response.data;
  }

  /**
   * Obtiene una reserva por ID
   */
  async getById(id: number): Promise<Reserva> {
    const response = await httpClient.get<Reserva>(`${this.endpoint}/${id}`);
    return response.data;
  }

  /**
   * Obtiene reservas por cancha
   */
  async getByCancha(id_cancha: number): Promise<Reserva[]> {
    const allReservas = await this.getAll();
    return allReservas.filter(reserva => reserva.id_cancha === id_cancha);
  }

  /**
   * Obtiene reservas por cliente
   */
  async getByCliente(id_cliente: number): Promise<Reserva[]> {
    const allReservas = await this.getAll();
    return allReservas.filter(reserva => reserva.id_cliente === id_cliente);
  }

  /**
   * Crea una nueva reserva
   */
  async create(data: CreateReservaRequest): Promise<Reserva> {
    const response = await httpClient.post<Reserva>(this.endpoint, data);
    return response.data;
  }

  /**
   * Actualiza una reserva existente
   */
  async update(id: number, data: UpdateReservaRequest): Promise<Reserva> {
    const response = await httpClient.patch<Reserva>(`${this.endpoint}/${id}`, data);
    return response.data;
  }

  /**
   * Elimina una reserva
   */
  async delete(id: number): Promise<void> {
    await httpClient.delete(`${this.endpoint}/${id}`);
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
