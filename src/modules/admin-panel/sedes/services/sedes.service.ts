import { adminApiClient } from '../../lib/adminApiClient';
import type { Sede, SedeDetalle } from '../../types';

// ==========================================
// SERVICIO DE GESTIÓN DE SEDES
// ==========================================

export const sedesService = {
  /**
   * Obtiene lista de sedes con filtros
   */
  getAll: async (params?: {
    estado?: string;
    ciudad?: string;
    verificada?: boolean;
    buscar?: string;
    page?: number;
    limit?: number;
  }): Promise<{ sedes: Sede[]; total: number }> => {
    const queryParams = new URLSearchParams();
    if (params?.estado) queryParams.append('estado', params.estado);
    if (params?.ciudad) queryParams.append('ciudad', params.ciudad);
    if (params?.verificada !== undefined) queryParams.append('verificada', params.verificada.toString());
    if (params?.buscar) queryParams.append('buscar', params.buscar);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return adminApiClient.get(`/sedes${query ? `?${query}` : ''}`);
  },

  /**
   * Obtiene detalle completo de una sede
   */
  getById: async (id: number): Promise<SedeDetalle> => {
    return adminApiClient.get<SedeDetalle>(`/sedes/${id}`);
  },

  /**
   * Edita una sede
   */
  editar: async (id: number, data: Partial<Sede>): Promise<{ mensaje: string; sedeActualizada: Sede }> => {
    return adminApiClient.put(`/sedes/${id}/editar`, data);
  },

  /**
   * Desactiva una sede
   */
  desactivar: async (id: number, motivo: string, temporal: boolean = false): Promise<{ mensaje: string }> => {
    return adminApiClient.put(`/sedes/${id}/desactivar`, { motivo, temporal });
  },

  /**
   * Reactiva una sede
   */
  reactivar: async (id: number): Promise<{ mensaje: string }> => {
    return adminApiClient.put(`/sedes/${id}/reactivar`);
  },

  /**
   * Elimina una sede
   */
  eliminar: async (id: number, motivo: string): Promise<{ mensaje: string }> => {
    return adminApiClient.delete(`/sedes/${id}`, { data: { motivo, confirmacion: true } });
  },

  /**
   * Obtiene estadísticas de sedes
   */
  getEstadisticas: async (): Promise<any> => {
    return adminApiClient.get('/sedes/estadisticas');
  },
};

export default sedesService;
