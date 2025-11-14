import { adminApiClient } from '../../lib/adminApiClient';
import type {
  Usuario,
  UsuarioDetalle,
  ListaUsuariosParams,
  ListaUsuariosResponse,
  CambiarRolDto,
  SuspenderUsuarioDto,
  BanearUsuarioDto,
  EnviarEmailDto,
  NotaAdminDto,
} from '../../types';

// ==========================================
// SERVICIO DE GESTIÓN DE USUARIOS
// ==========================================

export const usuariosService = {
  /**
   * Obtiene lista de usuarios con filtros
   */
  getAll: async (params?: ListaUsuariosParams): Promise<ListaUsuariosResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.rol) queryParams.append('rol', params.rol);
    if (params?.estado) queryParams.append('estado', params.estado);
    if (params?.buscar) queryParams.append('buscar', params.buscar);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return adminApiClient.get<ListaUsuariosResponse>(`/usuarios${query ? `?${query}` : ''}`);
  },

  /**
   * Obtiene detalle completo de un usuario
   */
  getById: async (id: number): Promise<UsuarioDetalle> => {
    return adminApiClient.get<UsuarioDetalle>(`/usuarios/${id}`);
  },

  /**
   * Cambia el rol de un usuario
   */
  cambiarRol: async (id: number, data: CambiarRolDto): Promise<Usuario> => {
    return adminApiClient.put<Usuario>(`/usuarios/${id}/cambiar-rol`, data);
  },

  /**
   * Suspende temporalmente a un usuario
   */
  suspender: async (id: number, data: SuspenderUsuarioDto): Promise<{ mensaje: string; fechaReactivacion: Date }> => {
    return adminApiClient.put(`/usuarios/${id}/suspender`, data);
  },

  /**
   * Banea a un usuario (permanente o temporal)
   */
  banear: async (id: number, data: BanearUsuarioDto): Promise<{ mensaje: string }> => {
    return adminApiClient.put(`/usuarios/${id}/banear`, data);
  },

  /**
   * Reactiva un usuario suspendido o baneado
   */
  reactivar: async (id: number, motivo: string): Promise<{ mensaje: string }> => {
    return adminApiClient.put(`/usuarios/${id}/reactivar`, { motivo });
  },

  /**
   * Elimina un usuario (soft delete)
   */
  eliminar: async (id: number, motivo: string): Promise<{ mensaje: string }> => {
    return adminApiClient.delete(`/usuarios/${id}`, { data: { motivo, confirmacion: true } });
  },

  /**
   * Envía un email a un usuario
   */
  enviarEmail: async (id: number, data: EnviarEmailDto): Promise<{ mensaje: string }> => {
    return adminApiClient.post(`/usuarios/${id}/enviar-email`, data);
  },

  /**
   * Obtiene el historial de acciones de un usuario
   */
  getHistorial: async (id: number, page: number = 1, limit: number = 50): Promise<any[]> => {
    return adminApiClient.get(`/usuarios/${id}/historial?page=${page}&limit=${limit}`);
  },

  /**
   * Agrega una nota interna sobre un usuario
   */
  agregarNota: async (id: number, data: NotaAdminDto): Promise<any> => {
    return adminApiClient.post(`/usuarios/${id}/nota`, data);
  },

  /**
   * Obtiene estadísticas generales de usuarios
   */
  getEstadisticas: async (): Promise<any> => {
    return adminApiClient.get('/usuarios/estadisticas');
  },
};

export default usuariosService;
