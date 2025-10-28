import { API_CONFIG } from '../../../lib/config/api';
import { httpClient } from '../../../lib/api/http-client';
import type {
  Reserva as ReservaTipo,
  CreateReservaRequest,
  UpdateReservaRequest,
} from '../types/reserva.types';

const RESERVAS_ENDPOINT = API_CONFIG.endpoints.reservas;

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
  estado?: string;
  estado_pago?: string | null;
  metodo_pago?: string | null;
  codigo_qr?: string | null;
  // Compatibilidad legacy
  estadoPago?: string | null;
  metodoPago?: string | null;
  codigoQR?: string | null;
  hora_inicio?: string;
  hora_fin?: string;
  horaInicio?: string;
  horaFin?: string;
}

export interface GetReservasUsuarioResponse {
  reservas: (ReservaTipo & {
    cancha?: any;
    metodo_pago?: string | null;
    estado_pago?: string | null;
    codigo_qr?: string | null;
    metodoPago?: string | null;
    estadoPago?: string | null;
    codigoQR?: string | null;
    pases_acceso?: Array<{
      id_pase_acceso: number;
      qr: string | null;
      cantidad_personas: number;
    }>;
  })[];
  total: number;
  activas: number;
  completadas: number;
  canceladas: number;
}

export interface GetReservasDuenioResponse {
  reservas: (ReservaTipo & {
    cancha?: any;
    metodo_pago?: string | null;
    estado_pago?: string | null;
    codigo_qr?: string | null;
    metodoPago?: string | null;
    estadoPago?: string | null;
    codigoQR?: string | null;
    pases_acceso?: Array<{
      id_pase_acceso: number;
      qr: string | null;
      cantidad_personas: number;
    }>;
    cliente?:
      | {
          id_cliente: number;
          persona?:
            | {
                nombres?: string;
                paterno?: string;
                materno?: string;
                telefono?: string;
              }
            | null;
        }
      | null;
    participantes?: Array<{
      id_cliente: number;
      confirmado?: boolean;
      persona?:
        | {
            nombres?: string;
            paterno?: string;
            materno?: string;
            telefono?: string;
          }
        | null;
    }>;
  })[];
  total: number;
  activas: number;
  completadas: number;
  canceladas: number;
}

// Nota: el backend espera id_cliente (id_persona), no id_usuario
export async function getReservasPorUsuario(
  id_cliente: number,
): Promise<GetReservasUsuarioResponse> {
  const res = await httpClient.get<GetReservasUsuarioResponse>(
    `${RESERVAS_ENDPOINT}/usuario/${id_cliente}`,
  );
  return res.data;
}

export async function getReservasPorDuenio(
  duenioId: number,
): Promise<GetReservasDuenioResponse> {
  const res = await httpClient.get<GetReservasDuenioResponse>(
    `${RESERVAS_ENDPOINT}/duenio/${duenioId}`,
  );
  return res.data;
}

export async function getReservasPorCancha(
  canchaId: number,
): Promise<ReservaRaw[]> {
  const res = await httpClient.get<ReservaRaw[]>(
    `${RESERVAS_ENDPOINT}/cancha/${canchaId}`,
  );
  return res.data;
}

const legacyDefault = {
  getReservasPorUsuario,
  getReservasPorDuenio,
  getReservasPorCancha,
};

export default legacyDefault;

/**
 * Servicio para manejar operaciones CRUD de Reservas
 */
export class ReservaService {
  private readonly endpoint = RESERVAS_ENDPOINT;

  async getAll(): Promise<ReservaTipo[]> {
    const response = await httpClient.get<ReservaTipo[]>(this.endpoint);
    return response.data;
  }

  async getById(id: number): Promise<ReservaTipo> {
    const response = await httpClient.get<ReservaTipo>(
      `${this.endpoint}/${id}`,
    );
    return response.data;
  }

  async getByCancha(id_cancha: number): Promise<ReservaTipo[]> {
    const response = await httpClient.get<ReservaTipo[]>(
      `${this.endpoint}/cancha/${id_cancha}`,
    );
    return response.data;
  }

  async getByCliente(id_cliente: number): Promise<ReservaTipo[]> {
    const response = await httpClient.get<ReservaTipo[]>(
      `${this.endpoint}/usuario/${id_cliente}`,
    );
    return response.data;
  }

  async create(data: CreateReservaRequest): Promise<ReservaTipo> {
    const response = await httpClient.post<ReservaTipo>(this.endpoint, data);
    return response.data;
  }

  async update(id: number, data: UpdateReservaRequest): Promise<ReservaTipo> {
    const response = await httpClient.patch<ReservaTipo>(
      `${this.endpoint}/${id}`,
      data,
    );
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await httpClient.delete(`${this.endpoint}/${id}`);
  }

  async getAvailableSlots(
    id_cancha: number,
    fecha: string,
  ): Promise<any[]> {
    try {
      const reservas = await this.getByCancha(id_cancha);
      const reservasFecha = reservas.filter(
        (r) =>
          r.inicia_en.split('T')[0] === fecha && r.estado !== 'Cancelada',
      );
      return reservasFecha;
    } catch (error) {
      console.error('Error getting available slots:', error);
      return [];
    }
  }
}

export const reservaService = new ReservaService();

export async function cancelReserva(id: number, motivo?: string): Promise<void> {
  await httpClient.patch(
    `${RESERVAS_ENDPOINT}/${id}/cancelar`,
    motivo ? { motivo } : {},
  );
}

export const legacyReservasApi = {
  ...legacyDefault,
  cancelReserva,
};
