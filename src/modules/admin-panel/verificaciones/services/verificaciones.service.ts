import { apiClient } from '../../lib/apiClient';
import { API_CONFIG } from '@/core/config/api';

export interface SedeVerificacion {
  idSede: number;
  nombre: string;
  direccion?: string;
  ciudad?: string;
  licenciaFuncionamiento?: string | null;
  nombreDuenio: string;
  emailDuenio: string;
  telefonoDuenio?: string;
  fechaCreacion: string;
  verificada: boolean;
}

export interface RespuestaVerificaciones {
  sedes: SedeVerificacion[];
  total: number;
}

export const verificacionesService = {
  /**
   * Obtiene todas las sedes pendientes de verificación
   */
  getPendientes: async (): Promise<RespuestaVerificaciones> => {
    const response = await apiClient.get<any>('/sede?verificada=false');
    const data = response.data;

    console.log('Datos recibidos de /sede?verificada=false:', data);

    let sedesRaw = Array.isArray(data) ? data : (data.sedes || []);

    // Filtrar solo las que realmente tienen verificada=false
    sedesRaw = sedesRaw.filter((sede: any) => sede.verificada === false);

    console.log('Sedes después de filtrar verificada=false:', sedesRaw);

    // Mapear datos de la API al formato esperado
    const sedesMapeadas: SedeVerificacion[] = sedesRaw.map((sede: any) => {
      console.log('Sede individual completa:', sede);
      console.log('Objeto duenio:', sede.duenio);

      return {
        idSede: sede.idSede,
        nombre: sede.nombre,
        direccion: sede.direccion || sede.Direccion || 'Sin dirección',
        ciudad: sede.ciudad || sede.city || sede.Ciudad || 'Sin ciudad',
        licenciaFuncionamiento: sede.LicenciaFuncionamiento || sede.licenciaFuncionamiento || null,
        nombreDuenio: sede.duenio
          ? `${sede.duenio.persona?.nombre || ''} ${sede.duenio.persona?.apellidoPaterno || ''}`.trim() || sede.duenio.usuario
          : 'Sin dueño',
        emailDuenio: sede.duenio?.correo || sede.email || 'Sin email',
        telefonoDuenio: sede.telefono || sede.Telefono || 'Sin teléfono',
        fechaCreacion: sede.creadoEn || sede.createdAt || new Date().toISOString(),
        verificada: sede.verificada || false,
      };
    });

    console.log('Sedes mapeadas:', sedesMapeadas);

    return {
      sedes: sedesMapeadas,
      total: sedesMapeadas.length,
    };
  },

  /**
   * Verifica una sede
   */
  verificarSede: async (id: number): Promise<{ mensaje: string }> => {
    const response = await fetch(`${API_CONFIG.baseURL}/sede/${id}/verificar`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        verificada: true
      })
    });

    if (!response.ok) {
      throw new Error('Error al verificar la sede');
    }

    return response.json();
  },

  /**
   * Obtiene la URL de la licencia de funcionamiento
   */
  getLicenciaUrl: (idSede: number): string => {
    return `${API_CONFIG.baseURL}/sede/${idSede}/licencia`;
  },

  /**
   * Obtiene el blob de la licencia de funcionamiento
   */
  getLicenciaBlob: async (idSede: number): Promise<Blob> => {
    const response = await apiClient.get(`/sede/${idSede}/licencia`, {
      responseType: 'blob'
    });
    return response.data;
  },
};

export default verificacionesService;
