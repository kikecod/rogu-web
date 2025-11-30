/**
 * Servicio para gestionar las Sedes (Espacios Deportivos)
 */

import { getApiUrl, getImageUrl } from '@/core/config/api';
import type {
  SedeDetalleResponse,
  SedeCanchasResponse,
  SedeCanchasFilters,
  SedeResenasResponse,
  CrearCalificacionSedeDTO,
  PuedeCalificarResponse,
  VenueSearchResponse,
  VenueSearchFilters,
  SedeCard,
} from '../types/venue-search.types';

class VenueService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }


  /**
   * Obtener todas las sedes para la página de inicio
   * GET /api/sede/inicio - Devuelve un array de sedes con datos procesados
   */
  async findVenues(): Promise<SedeCard[]> {
    try {
      const url = getApiUrl(`/sede/inicio`);
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error al buscar sedes: ${response.statusText}`);
      }

      const sedes = await response.json();

      if (!Array.isArray(sedes)) {
        return [];
      }

      // Transformar solo lo necesario (URLs y conversión de tipos)
      return sedes.map(sede => ({
        ...sede,
        latitude: typeof sede.latitude === 'string' ? parseFloat(sede.latitude) : sede.latitude,
        longitude: typeof sede.longitude === 'string' ? parseFloat(sede.longitude) : sede.longitude,
        fotoPrincipal: sede.fotoPrincipal ? getImageUrl(sede.fotoPrincipal) : undefined,
        fotos: sede.fotos?.map((foto: any) => ({
          ...foto,
          urlFoto: getImageUrl(foto.urlFoto),
        })) || [],
      }));

    } catch (error) {
      console.error('Error en findVenues:', error);
      throw error;
    }
  }

  async searchVenues(filters: VenueSearchFilters = {}): Promise<VenueSearchResponse> {
    try {
      const params = new URLSearchParams();

      if (filters.city) params.append('city', filters.city);
      if (filters.stateProvince) params.append('stateProvince', filters.stateProvince);
      if (filters.district) params.append('district', filters.district);
      if (filters.deporte) params.append('deporte', filters.deporte);
      if (filters.precioMin) params.append('precioMin', filters.precioMin.toString());
      if (filters.precioMax) params.append('precioMax', filters.precioMax.toString());
      if (filters.ratingMin) params.append('ratingMin', filters.ratingMin.toString());
      if (filters.verificada !== undefined) params.append('verificada', filters.verificada.toString());
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const queryString = params.toString();
      const url = getApiUrl(`/sedes/buscar${queryString ? `?${queryString}` : ''}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error al buscar sedes: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en searchVenues:', error);
      throw error;
    }
  }

  /**
   * Obtener detalle completo de una sede
   * GET /api/sede/:id
   */
  async getVenueById(idSede: number): Promise<SedeDetalleResponse> {
    try {
      const response = await fetch(getApiUrl(`/sede/${idSede}`), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Sede no encontrada');
        }
        throw new Error(`Error al obtener sede: ${response.statusText}`);
      }

      const data = await response.json();

      // Transformar coordenadas de string a number si es necesario
      if (data.sede) {
        data.sede.latitude = typeof data.sede.latitude === 'string'
          ? parseFloat(data.sede.latitude)
          : data.sede.latitude;
        data.sede.longitude = typeof data.sede.longitude === 'string'
          ? parseFloat(data.sede.longitude)
          : data.sede.longitude;

        // Transformar fotos con URLs completas
        if (data.sede.fotos && Array.isArray(data.sede.fotos)) {
          data.sede.fotos = data.sede.fotos.map((foto: any) => ({
            ...foto,
            urlFoto: getImageUrl(foto.url || foto.urlFoto),
          }));
        }
      }

      return data;
    } catch (error) {
      console.error('Error en getVenueById:', error);
      throw error;
    }
  }

  /**
   * Transforma los datos de cancha de la API al formato esperado
   */
  private transformCanchaApi(cancha: any): any {
    return {
      ...cancha,
      precio: parseFloat(cancha.precio) || 0,
      ratingPromedio: parseFloat(cancha.ratingPromedio) || 0,
      aforoMax: cancha.aforoMax || 0,
      iluminacion: cancha.iluminacion || 'Natural',
      fotos: cancha.fotos?.map((foto: any) => ({
        idFoto: foto.idFoto,
        urlFoto: getImageUrl(foto.url || foto.urlFoto),
      })) || [],
    };
  }

  /**
   * Obtener canchas de una sede con filtros opcionales
   * GET /api/sede/:id/canchas
   */
  async getVenueFields(
    idSede: number,
    filters: SedeCanchasFilters = {}
  ): Promise<SedeCanchasResponse> {
    try {
      const params = new URLSearchParams();

      if (filters.deporte) params.append('deporte', filters.deporte);
      if (filters.precioMin) params.append('precioMin', filters.precioMin.toString());
      if (filters.precioMax) params.append('precioMax', filters.precioMax.toString());
      if (filters.cubierta !== undefined) params.append('cubierta', filters.cubierta.toString());
      if (filters.iluminacion !== undefined) params.append('iluminacion', filters.iluminacion.toString());
      if (filters.disponible !== undefined) params.append('disponible', filters.disponible.toString());

      const queryString = params.toString();
      const url = getApiUrl(`/sede/${idSede}/canchas${queryString ? `?${queryString}` : ''}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error al obtener canchas: ${response.statusText}`);
      }

      const data = await response.json();

      // Transformar las canchas para convertir strings a números
      return {
        ...data,
        canchas: data.canchas?.map((cancha: any) => this.transformCanchaApi(cancha)) || [],
      };
    } catch (error) {
      console.error('Error en getVenueFields:', error);
      throw error;
    }
  }

  /**
   * Obtener reseñas de una sede
   * GET /api/califica-sede/sede/:idSede
   */
  async getVenueReviews(idSede: number): Promise<SedeResenasResponse> {
    try {
      const response = await fetch(getApiUrl(`/califica-sede/sede/${idSede}`), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error al obtener reseñas: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getVenueReviews:', error);
      throw error;
    }
  }

  /**
   * Verificar si el usuario puede calificar una sede
   * GET /api/califica-sede/puede-calificar/:idSede
   */
  async canReviewVenue(idSede: number): Promise<PuedeCalificarResponse> {
    try {
      const response = await fetch(getApiUrl(`/califica-sede/puede-calificar/${idSede}`), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error al verificar permisos: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en canReviewVenue:', error);
      throw error;
    }
  }

  /**
   * Crear una calificación para una sede
   * POST /api/califica-sede
   */
  async createVenueReview(data: CrearCalificacionSedeDTO): Promise<any> {
    try {
      const response = await fetch(getApiUrl('/califica-sede'), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || `Error al crear reseña: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en createVenueReview:', error);
      throw error;
    }
  }

  /**
   * Crear foto de sede
   * POST /api/fotos
   */
  async createVenuePhoto(idSede: number, urlFoto: string): Promise<any> {
    try {
      const response = await fetch(getApiUrl('/fotos'), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          tipo: 'sede',
          idSede,
          urlFoto,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error al crear foto: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en createVenuePhoto:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las sedes (sin filtros) - Para migración gradual
   * GET /api/sedes
   */
  async getAllVenues(): Promise<SedeDetalleResponse[]> {
    try {
      const response = await fetch(getApiUrl('/sedes'), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error al obtener sedes: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en getAllVenues:', error);
      throw error;
    }
  }
}

export const venueService = new VenueService();
export default venueService;
