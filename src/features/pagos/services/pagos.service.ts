import { API_CONFIG } from '../../../lib/config/api';
import { httpClient } from '../../../lib/api/http-client';

export interface RegistrarDeudaRequest {
  reserva_id: number;
  descripcion?: string;
}

export interface RegistrarDeudaResponse {
  message: string;
  transaccion: {
    id_transaccion: number;
    id_transaccion_libelula: string;
    url_pasarela_pagos: string;
    qr_simple_url: string | null;
    estado_pago: string;
    monto_total: number;
  };
  reserva?: {
    id_reserva: number;
    estado: string;
  };
  raw_pasarela?: Record<string, unknown>;
}

export const registrarDeuda = async (
  payload: RegistrarDeudaRequest,
): Promise<RegistrarDeudaResponse> => {
  const response = await httpClient.post<RegistrarDeudaResponse>(
    API_CONFIG.endpoints.pagosRegistrar,
    payload,
  );
  return response.data;
};
