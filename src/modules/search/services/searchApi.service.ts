import axios from 'axios';
import type { AxiosResponse } from 'axios';
import { createErrorState } from '../lib/errorHandler';
import type {
  ApiResponse,
  SearchMainParams,
  SearchFiltersParams,
  CheckAvailabilityParams,
  SearchResponse,
  AvailabilityResponse,
  LocationsResponse,
  AutocompleteResponse,
  ApiError
} from '../types';

// ====================
// CONFIGURACIÓN BASE
// ====================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejo de errores
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: any) => {
    // Crear estado de error normalizado
    const errorState = createErrorState(error);

    // Convertir a formato API Error para compatibilidad
    const apiError: ApiError = {
      status: error.response?.status || 500,
      message: errorState.message,
      errors: errorState.details?.map(detail => ({
        code: detail.code,
        message: detail.message,
        field: detail.field
      })) || []
    };

    return Promise.reject(apiError);
  }
);

// ====================
// UTILIDADES
// ====================

/**
 * Convierte parámetros a query string
 */
const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
};

/**
 * Maneja la respuesta de la API
 */
const handleApiResponse = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
  if (!response.data.success) {
    throw new Error(response.data.message || 'Error en la respuesta de la API');
  }
  return response.data.data;
};

// ====================
// SERVICIO PRINCIPAL
// ====================

class SearchApiService {

  /**
   * 🔍 BÚSQUEDA PRINCIPAL
   * GET /api/search/main
   * Nota: Este endpoint devuelve directamente un array de sedes, lo convertimos a SearchResponse
   */
  async searchMain(params: SearchMainParams): Promise<SearchResponse> {
    try {
      const queryString = buildQueryString(params);
      const url = `/search/main${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get(url);
      // El endpoint devuelve directamente un array, lo convertimos a SearchResponse
      const results = Array.isArray(response.data) ? response.data : [];
      const page = params.page || 1;
      const limit = params.limit || 10;
      const totalPages = Math.ceil(results.length / limit);

      return {
        results,
        pagination: {
          total: results.length,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        filters: {
          availableCities: [],
          availableDistricts: [],
          availableDisciplines: [],
          priceRange: { min: 0, max: 0 }
        }
      };
    } catch (error) {
      console.error('Error en búsqueda principal:', error);
      throw error;
    }
  }

  /**
   * 🎨 BÚSQUEDA CON FILTROS AVANZADOS
   * GET /api/search/filters
   */
  async searchWithFilters(params: SearchFiltersParams): Promise<SearchResponse> {
    try {
      const queryString = buildQueryString(params);
      const url = `/search/filters${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get<ApiResponse<SearchResponse>>(url);
      return handleApiResponse(response);
    } catch (error) {
      console.error('Error en búsqueda con filtros:', error);
      throw error;
    }
  }

  /**
   * ✔️ VERIFICAR DISPONIBILIDAD
   * POST /api/search/availability
   */
  async checkAvailability(params: CheckAvailabilityParams): Promise<AvailabilityResponse> {
    try {
      const response = await apiClient.post<ApiResponse<AvailabilityResponse>>(
        '/search/availability',
        params
      );
      return handleApiResponse(response);
    } catch (error) {
      console.error('Error verificando disponibilidad:', error);
      throw error;
    }
  }

  /**
   * 📍 OBTENER UBICACIONES DISPONIBLES
   * GET /api/search/locations
   */
  async getLocations(): Promise<LocationsResponse> {
    try {
      const response = await apiClient.get<ApiResponse<LocationsResponse>>('/search/locations');
      return handleApiResponse(response);
    } catch (error) {
      console.error('Error obteniendo ubicaciones:', error);
      throw error;
    }
  }

  /**
   * 🏙️ AUTOCOMPLETADO DE CIUDADES
   * GET /api/search/cities?q={texto}
   */
  async getCitySuggestions(query: string): Promise<AutocompleteResponse> {
    try {
      if (!query.trim()) {
        return { suggestions: [] };
      }

      const queryString = buildQueryString({ q: query.trim() });
      const url = `/search/cities?${queryString}`;

      const response = await apiClient.get<ApiResponse<AutocompleteResponse>>(url);
      return handleApiResponse(response);
    } catch (error) {
      console.error('Error en autocompletado de ciudades:', error);
      throw error;
    }
  }

  /**
   * 🗺️ AUTOCOMPLETADO DE DISTRITOS
   * GET /api/search/districts?city={ciudad}&q={texto}
   */
  async getDistrictSuggestions(city: string, query: string): Promise<AutocompleteResponse> {
    try {
      if (!city || !query.trim()) {
        return { suggestions: [] };
      }

      const queryString = buildQueryString({
        city: city.trim(),
        q: query.trim()
      });
      const url = `/search/districts?${queryString}`;

      const response = await apiClient.get<ApiResponse<AutocompleteResponse>>(url);
      return handleApiResponse(response);
    } catch (error) {
      console.error('Error en autocompletado de distritos:', error);
      throw error;
    }
  }

  /**
   * 🔄 BÚSQUEDA INTELIGENTE
   * Decide automáticamente si usar búsqueda simple o con filtros
   */
  async smartSearch(params: SearchMainParams | SearchFiltersParams): Promise<SearchResponse> {
    const hasAdvancedFilters = 'precioMin' in params || 'precioMax' in params ||
      'ratingMin' in params || 'cubierta' in params ||
      'superficie' in params || 'iluminacion' in params ||
      'aforoMin' in params || 'aforoMax' in params;

    if (hasAdvancedFilters) {
      return this.searchWithFilters(params as SearchFiltersParams);
    } else {
      return this.searchMain(params as SearchMainParams);
    }
  }

  /**
   * 🔎 AUTOCOMPLETADO DE DISCIPLINAS
   * GET /api/disciplina/search?q=term
   */
  async searchDisciplines(query: string): Promise<Array<{ idDisciplina: number; nombre: string }>> {
    try {
      if (!query || query.length < 1) {
        return [];
      }

      console.log('Buscando disciplinas con query:', query);
      const response = await apiClient.get(`/disciplina/search?q=${encodeURIComponent(query)}`);
      console.log('Respuesta del servidor:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error buscando disciplinas:', error);
      return [];
    }
  }

  /**
   * 🏢 AUTOCOMPLETADO DE SEDES
   * GET /api/search/sedes?q=term
   */
  async searchVenues(query: string): Promise<Array<{ idSede: number; nombre: string }>> {
    try {
      if (!query || query.length < 1) {
        return [];
      }

      const response = await apiClient.get(`/search/sedes?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error buscando sedes:', error);
      return [];
    }
  }

  /**
   * 📊 OBTENER ESTADÍSTICAS DE BÚSQUEDA
   * Método auxiliar para obtener información general
   */
  async getSearchStats(): Promise<{
    totalCanchas: number;
    totalSedes: number;
    totalCiudades: number;
    disciplinasPopulares: string[];
  }> {
    try {
      // Realizamos una búsqueda vacía para obtener totales
      const response = await this.searchMain({ page: 1, limit: 1 });
      const locations = await this.getLocations();

      return {
        totalCanchas: response.pagination.total,
        totalSedes: 0, // Se podría agregar este dato al backend
        totalCiudades: Object.values(locations.cities).flat().length,
        disciplinasPopulares: response.filters.availableDisciplines
          .slice(0, 5)
          .map((d: { nombre: string }) => d.nombre)
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return {
        totalCanchas: 0,
        totalSedes: 0,
        totalCiudades: 0,
        disciplinasPopulares: []
      };
    }
  }
}

// ====================
// INSTANCIA SINGLETON
// ====================

export const searchApiService = new SearchApiService();

// ====================
// EXPORTACIONES
// ====================

export default searchApiService;
export type { SearchApiService };