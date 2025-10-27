import { httpClient } from '../../../lib/api/http-client';
import { API_CONFIG } from '../../../lib/config/api';

export interface BloqueoCancha {
  id_bloqueo: number;
  id_cancha: number;
  inicia_en: string; // ISO
  termina_en: string; // ISO
  motivo?: string | null;
  creado_en?: string;
}

export interface CreateBloqueoRequest {
  id_cancha: number;
  inicia_en: string; // ISO string
  termina_en: string; // ISO string
  motivo?: string;
}

class BloqueosService {
  private readonly endpoint = API_CONFIG.endpoints.bloqueos; // '/bloqueos'

  async getByCancha(id_cancha: number): Promise<BloqueoCancha[]> {
    const res = await httpClient.get<BloqueoCancha[]>(`${this.endpoint}/cancha/${id_cancha}`);
    return res.data ?? [];
  }

  async create(payload: CreateBloqueoRequest): Promise<BloqueoCancha> {
    const res = await httpClient.post<BloqueoCancha>(this.endpoint, payload);
    return res.data;
  }

  async remove(id_bloqueo: number): Promise<void> {
    await httpClient.delete(`${this.endpoint}/${id_bloqueo}`);
  }
}

export const bloqueosService = new BloqueosService();
