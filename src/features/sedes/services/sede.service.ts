/**
 * Servicio para manejar operaciones CRUD de Sedes
 */

import { httpClient } from '../../../lib/api/http-client';
import { API_CONFIG } from '../../../lib/config/api';
import type {
  Sede,
  CreateSedeRequest,
  UpdateSedeRequest
} from '../types/sede.types';

export class SedeService {
  private readonly endpoint = API_CONFIG.endpoints.sedes;

  /**
   * Obtiene todas las sedes
   */
  async getAll(): Promise<Sede[]> {
    const response = await httpClient.get<Sede[]>(this.endpoint);
    return response.data;
  }

  /**
   * Obtiene una sede por ID
   */
  async getById(id: number): Promise<Sede> {
    const response = await httpClient.get<Sede>(`${this.endpoint}/${id}`);
    return response.data;
  }

  /**
   * Crea una nueva sede
   */
  async create(data: CreateSedeRequest): Promise<Sede> {
    const response = await httpClient.post<Sede>(this.endpoint, data);
    return response.data;
  }

  /**
   * Actualiza una sede existente
   */
  async update(id: number, data: UpdateSedeRequest): Promise<Sede> {
    const response = await httpClient.patch<Sede>(`${this.endpoint}/${id}`, data);
    return response.data;
  }

  /**
   * Elimina una sede
   */
  async delete(id: number): Promise<void> {
    await httpClient.delete(`${this.endpoint}/${id}`);
  }
}

// Instancia singleton del servicio
export const sedeService = new SedeService();
