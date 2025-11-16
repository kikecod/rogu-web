import { adminApiClient } from '../../lib/adminApiClient';
import { apiClient } from '../../lib/apiClient';
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
  CrearUsuarioDto,
  ActualizarUsuarioDto,
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
    const response = await apiClient.get<ListaUsuariosResponse>(`/admin/usuarios${query ? `?${query}` : ''}`);
    return response.data;
  },

  /**
   * Obtiene detalle completo de un usuario
   */
  getById: async (id: number): Promise<UsuarioDetalle> => {
    const response = await apiClient.get<UsuarioDetalle>(`/admin/usuarios/${id}`);
    console.log('📡 RESPUESTA API getById:', response.data);
    return response.data;
  },

  /**
   * Crea un usuario con sus datos de persona y roles
   */
  crear: async (data: CrearUsuarioDto): Promise<UsuarioDetalle> => {
    const response = await apiClient.post<UsuarioDetalle>('/admin/usuarios', data);
    return response.data;
  },

  /**
   * Actualiza datos de usuario/persona y roles
   */
  actualizar: async (id: number, data: ActualizarUsuarioDto): Promise<UsuarioDetalle> => {
    const response = await apiClient.put<UsuarioDetalle>(`/admin/usuarios/${id}`, data);
    return response.data;
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
    const response = await apiClient.put(`/admin/usuarios/${id}/reactivar`, { motivo });
    return response.data;
  },

  /**
   * Elimina un usuario (soft delete)
   */
  eliminar: async (id: number, motivo: string): Promise<{ mensaje: string }> => {
    const response = await apiClient.delete(`/admin/usuarios/${id}`, { data: { motivo, confirmacion: true } });
    return response.data;
  },

  /**
   * Sube o actualiza el avatar de un usuario
   */
  uploadAvatar: async (id: number, file: File): Promise<{ mensaje: string; avatar: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<{ mensaje: string; avatar: string }>(
      `/admin/usuarios/${id}/avatar`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Elimina el avatar de un usuario
   */
  deleteAvatar: async (id: number): Promise<{ mensaje: string }> => {
    const response = await apiClient.delete<{ mensaje: string }>(`/admin/usuarios/${id}/avatar`);
    return response.data;
  },

  /**
   * Cambia la contraseña de un usuario desde el panel admin
   */
  cambiarContrasenaAdmin: async (id: number, nuevaContrasena: string): Promise<{ mensaje: string }> => {
    const response = await apiClient.put<{ mensaje: string }>(`/admin/usuarios/${id}/contrasena`, {
      nuevaContrasena,
    });
    return response.data;
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
