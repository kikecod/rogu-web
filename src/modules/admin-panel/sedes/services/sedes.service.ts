import { apiClient } from '../../lib/apiClient';
import type { 
  SedeDetalle, 
  FiltrosSedes, 
  RespuestaListaSedes,
  CrearSedeDto,
  EditarSedeDto,
  DesactivarSedeDto,
  RespuestaCrearSede,
  RespuestaEditarSede,
  RespuestaEliminarSede,
  EstadisticasSede
} from '../types';

// ==========================================
// SERVICIO DE GESTIÓN DE SEDES
// ==========================================

export const sedesService = {
  /**
   * Obtiene lista de sedes con filtros y paginación
   */
  getAll: async (filtros?: FiltrosSedes): Promise<RespuestaListaSedes> => {
    const queryParams = new URLSearchParams();
    
    if (filtros?.buscar) queryParams.append('buscar', filtros.buscar);
    if (filtros?.ciudad) queryParams.append('ciudad', filtros.ciudad);
    if (filtros?.estado) queryParams.append('estado', filtros.estado);
    if (filtros?.verificada !== undefined) queryParams.append('verificada', filtros.verificada.toString());
    if (filtros?.activa !== undefined) queryParams.append('activa', filtros.activa.toString());
    if (filtros?.idDuenio) queryParams.append('idDuenio', filtros.idDuenio.toString());
    if (filtros?.calificacionMin !== undefined) queryParams.append('calificacionMin', filtros.calificacionMin.toString());
    if (filtros?.page) queryParams.append('page', filtros.page.toString());
    if (filtros?.limit) queryParams.append('limit', filtros.limit.toString());
    if (filtros?.ordenarPor) queryParams.append('ordenarPor', filtros.ordenarPor);
    if (filtros?.ordenDireccion) queryParams.append('ordenDireccion', filtros.ordenDireccion);

    const query = queryParams.toString();
    const response = await apiClient.get<any>(`/sede${query ? `?${query}` : ''}`);
    
    // Normalizar respuesta - acceder a response.data
    const data = response.data;
    
    if (Array.isArray(data)) {
      return {
        sedes: data,
        total: data.length,
        pagina: filtros?.page || 1,
        limite: filtros?.limit || 20,
        totalPaginas: Math.ceil(data.length / (filtros?.limit || 20)),
      };
    }
    
    return {
      sedes: data.sedes || [],
      total: data.total || 0,
      pagina: data.pagina || filtros?.page || 1,
      limite: data.limite || filtros?.limit || 20,
      totalPaginas: data.totalPaginas || 1,
    };
  },

  /**
   * Obtiene detalle completo de una sede por ID
   */
  getById: async (id: number): Promise<SedeDetalle> => {
    const response = await apiClient.get<SedeDetalle>(`/sede/admin/${id}`);
    return response.data;
  },

  /**
   * Crea una nueva sede
   */
  crear: async (data: CrearSedeDto): Promise<RespuestaCrearSede> => {
    const response = await apiClient.post<RespuestaCrearSede>('/sede', data);
    return response.data;
  },

  /**
   * Edita una sede existente
   */
  editar: async (id: number, data: EditarSedeDto): Promise<RespuestaEditarSede> => {
    const response = await apiClient.patch<RespuestaEditarSede>(`/sede/${id}`, data);
    return response.data;
  },

  /**
   * Verifica una sede (admin)
   */
  verificar: async (id: number): Promise<{ mensaje: string }> => {
    const response = await apiClient.patch(`/sede/${id}/verificar`);
    return response.data;
  },

  /**
   * Rechaza verificación de una sede (admin)
   */
  rechazarVerificacion: async (id: number, motivo: string): Promise<{ mensaje: string }> => {
    const response = await apiClient.patch(`/sede/${id}/rechazar`, { motivo });
    return response.data;
  },

  /**
   * Activa una sede
   */
  activar: async (id: number): Promise<{ mensaje: string }> => {
    const response = await apiClient.patch(`/sede/${id}/activar`);
    return response.data;
  },

  /**
   * Desactiva una sede
   */
  desactivar: async (id: number, data: DesactivarSedeDto): Promise<{ mensaje: string }> => {
    const response = await apiClient.patch(`/sede/${id}/desactivar`, data);
    return response.data;
  },

  /**
   * Reactiva una sede desactivada
   */
  reactivar: async (id: number): Promise<{ mensaje: string }> => {
    const response = await apiClient.patch(`/sede/${id}/reactivar`);
    return response.data;
  },

  /**
   * Elimina una sede (soft delete)
   */
  eliminar: async (id: number, motivo: string): Promise<RespuestaEliminarSede> => {
    const response = await apiClient.delete<RespuestaEliminarSede>(`/sede/${id}`, { 
      data: { motivo, confirmacion: true } 
    });
    return response.data;
  },

  /**
   * Obtiene estadísticas de una sede específica
   */
  getEstadisticas: async (id: number): Promise<EstadisticasSede> => {
    const response = await apiClient.get<EstadisticasSede>(`/sede/${id}/estadisticas`);
    return response.data;
  },

  /**
   * Obtiene estadísticas generales de todas las sedes
   */
  getEstadisticasGenerales: async (): Promise<any> => {
    const response = await apiClient.get('/sede/estadisticas/generales');
    return response.data;
  },

  /**
   * Obtiene las canchas de una sede
   */
  getCanchas: async (idSede: number): Promise<any[]> => {
    const response = await apiClient.get(`/sede/${idSede}/canchas`);
    return response.data;
  },

  /**
   * Obtiene el historial de cambios de una sede
   */
  getHistorial: async (idSede: number): Promise<any[]> => {
    const response = await apiClient.get(`/sede/${idSede}/historial`);
    return response.data;
  },
};

export default sedesService;
