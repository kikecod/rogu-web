import { useState, useCallback, useEffect } from 'react';
import { searchApiService } from '../services';
import type {
  LocationsResponse,
  LocationState,
  ApiError
} from '../types';

// ====================
// HOOK PARA UBICACIONES
// ====================

export interface UseLocationsOptions {
  autoLoad?: boolean; // Cargar automáticamente al montar
}

export const useLocations = (options: UseLocationsOptions = {}) => {
  const { autoLoad = true } = options;

  const [state, setState] = useState<LocationState>({
    locations: null,
    loading: false,
    error: null
  });

  /**
   * Cargar ubicaciones disponibles
   */
  const loadLocations = useCallback(async () => {
    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null 
    }));

    try {
      const response: LocationsResponse = await searchApiService.getLocations();
      
      setState({
        locations: response,
        loading: false,
        error: null
      });

      return response;
    } catch (error) {
      const apiError = error as ApiError;
      setState({
        locations: null,
        loading: false,
        error: apiError.message
      });
      throw error;
    }
  }, []);

  /**
   * Obtener estados de un país
   */
  const getStatesForCountry = useCallback((country: string): string[] => {
    if (!state.locations) return [];
    return state.locations.states[country] || [];
  }, [state.locations]);

  /**
   * Obtener ciudades de un estado
   */
  const getCitiesForState = useCallback((stateName: string): string[] => {
    if (!state.locations) return [];
    return state.locations.cities[stateName] || [];
  }, [state.locations]);

  /**
   * Obtener distritos de una ciudad
   */
  const getDistrictsForCity = useCallback((city: string): string[] => {
    if (!state.locations) return [];
    return state.locations.districts[city] || [];
  }, [state.locations]);

  /**
   * Buscar ubicaciones por texto
   */
  const searchLocations = useCallback((query: string) => {
    if (!state.locations || !query.trim()) return {
      countries: [],
      states: [],
      cities: [],
      districts: []
    };

    const searchTerm = query.toLowerCase().trim();

    return {
      countries: state.locations.countries.filter(country => 
        country.toLowerCase().includes(searchTerm)
      ),
      states: Object.values(state.locations.states).flat().filter(state => 
        state.toLowerCase().includes(searchTerm)
      ),
      cities: Object.values(state.locations.cities).flat().filter(city => 
        city.toLowerCase().includes(searchTerm)
      ),
      districts: Object.values(state.locations.districts).flat().filter(district => 
        district.toLowerCase().includes(searchTerm)
      )
    };
  }, [state.locations]);

  /**
   * Validar jerarquía de ubicación
   */
  const validateLocationHierarchy = useCallback((location: {
    country?: string;
    stateProvince?: string;
    city?: string;
    district?: string;
  }) => {
    if (!state.locations) return { valid: false, errors: ['Ubicaciones no cargadas'] };

    const errors: string[] = [];

    // Validar país
    if (location.country && !state.locations.countries.includes(location.country)) {
      errors.push(`País "${location.country}" no disponible`);
    }

    // Validar estado
    if (location.country && location.stateProvince) {
      const availableStates = state.locations.states[location.country] || [];
      if (!availableStates.includes(location.stateProvince)) {
        errors.push(`Estado "${location.stateProvince}" no disponible en ${location.country}`);
      }
    }

    // Validar ciudad
    if (location.stateProvince && location.city) {
      const availableCities = state.locations.cities[location.stateProvince] || [];
      if (!availableCities.includes(location.city)) {
        errors.push(`Ciudad "${location.city}" no disponible en ${location.stateProvince}`);
      }
    }

    // Validar distrito
    if (location.city && location.district) {
      const availableDistricts = state.locations.districts[location.city] || [];
      if (!availableDistricts.includes(location.district)) {
        errors.push(`Distrito "${location.district}" no disponible en ${location.city}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }, [state.locations]);

  /**
   * Cargar automáticamente al montar
   */
  useEffect(() => {
    if (autoLoad) {
      loadLocations();
    }
  }, [autoLoad, loadLocations]);

  return {
    // Estado
    locations: state.locations,
    loading: state.loading,
    error: state.error,

    // Acciones
    loadLocations,

    // Utilidades de consulta
    getStatesForCountry,
    getCitiesForState,
    getDistrictsForCity,
    searchLocations,
    validateLocationHierarchy,

    // Estado de datos
    hasLocations: state.locations !== null,
    countries: state.locations?.countries || [],
    allStates: state.locations ? Object.values(state.locations.states).flat() : [],
    allCities: state.locations ? Object.values(state.locations.cities).flat() : [],
    allDistricts: state.locations ? Object.values(state.locations.districts).flat() : []
  };
};