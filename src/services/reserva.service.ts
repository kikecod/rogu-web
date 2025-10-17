/**
 * Servicio para manejar operaciones CRUD de Reservas
 */

import { httpClient } from './http-client';
import { API_CONFIG } from '../config/api';
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
  async getByCancha(idCancha: number): Promise<Reserva[]> {
    const allReservas = await this.getAll();
    return allReservas.filter(reserva => reserva.idCancha === idCancha);
  }

  /**
   * Obtiene reservas por cliente
   */
  async getByCliente(idCliente: number): Promise<Reserva[]> {
    const allReservas = await this.getAll();
    return allReservas.filter(reserva => reserva.idCliente === idCliente);
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
  async getAvailableSlots(idCancha: number, fecha: string): Promise<any[]> {
    try {
      const reservas = await this.getByCancha(idCancha);
      const reservasFecha = reservas.filter(r => 
        r.iniciaEn.split('T')[0] === fecha && 
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