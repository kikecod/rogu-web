import { useState, useCallback, useEffect } from 'react';
import { searchApiService } from '../services';
import type {
  AutocompleteResponse,
  AutocompleteState,
  ApiError
} from '../types';

// ====================
// HOOK PARA AUTOCOMPLETADO DE CIUDADES
// ====================

export interface UseCityAutocompleteOptions {
  minChars?: number; // Mínimo de caracteres para buscar
  debounceMs?: number; // Tiempo de espera para debounce
  maxSuggestions?: number; // Máximo de sugerencias
}

export const useCityAutocomplete = (options: UseCityAutocompleteOptions = {}) => {
  const { minChars = 2, debounceMs = 300, maxSuggestions = 10 } = options;

  const [state, setState] = useState<AutocompleteState>({
    suggestions: [],
    loading: false,
    error: null
  });

  const [query, setQuery] = useState('');
  const [debounceTimeout, setDebounceTimeout] = useState<number | null>(null);

  /**
   * Buscar sugerencias de ciudades
   */
  const searchCities = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < minChars) {
      setState({
        suggestions: [],
        loading: false,
        error: null
      });
      return;
    }

    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null 
    }));

    try {
      const response: AutocompleteResponse = await searchApiService.getCitySuggestions(searchQuery);
      
      setState({
        suggestions: response.suggestions.slice(0, maxSuggestions),
        loading: false,
        error: null
      });

      return response.suggestions;
    } catch (error) {
      const apiError = error as ApiError;
      setState({
        suggestions: [],
        loading: false,
        error: apiError.message
      });
      throw error;
    }
  }, [minChars, maxSuggestions]);

  /**
   * Actualizar query con debounce
   */
  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);

    // Limpiar timeout anterior
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // Configurar nuevo timeout
    const timeout = window.setTimeout(() => {
      searchCities(newQuery);
    }, debounceMs);

    setDebounceTimeout(timeout);
  }, [searchCities, debounceMs, debounceTimeout]);

  /**
   * Buscar inmediatamente
   */
  const searchImmediate = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
      setDebounceTimeout(null);
    }
    return searchCities(searchQuery);
  }, [searchCities, debounceTimeout]);

  /**
   * Limpiar sugerencias
   */
  const clearSuggestions = useCallback(() => {
    setState({
      suggestions: [],
      loading: false,
      error: null
    });
    setQuery('');
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
      setDebounceTimeout(null);
    }
  }, [debounceTimeout]);

  /**
   * Limpiar timeout al desmontar
   */
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);

  return {
    // Estado
    suggestions: state.suggestions,
    loading: state.loading,
    error: state.error,
    query,

    // Acciones
    updateQuery,
    searchImmediate,
    clearSuggestions,

    // Utilidades
    hasSuggestions: state.suggestions.length > 0,
    isSearching: state.loading && query.length >= minChars
  };
};

// ====================
// HOOK PARA AUTOCOMPLETADO DE DISTRITOS
// ====================

export interface UseDistrictAutocompleteOptions {
  city: string; // Ciudad requerida para buscar distritos
  minChars?: number;
  debounceMs?: number;
  maxSuggestions?: number;
}

export const useDistrictAutocomplete = (options: UseDistrictAutocompleteOptions) => {
  const { city, minChars = 2, debounceMs = 300, maxSuggestions = 10 } = options;

  const [state, setState] = useState<AutocompleteState>({
    suggestions: [],
    loading: false,
    error: null
  });

  const [query, setQuery] = useState('');
  const [debounceTimeout, setDebounceTimeout] = useState<number | null>(null);

  /**
   * Buscar sugerencias de distritos
   */
  const searchDistricts = useCallback(async (searchQuery: string) => {
    if (!city || searchQuery.length < minChars) {
      setState({
        suggestions: [],
        loading: false,
        error: null
      });
      return;
    }

    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null 
    }));

    try {
      const response: AutocompleteResponse = await searchApiService.getDistrictSuggestions(city, searchQuery);
      
      setState({
        suggestions: response.suggestions.slice(0, maxSuggestions),
        loading: false,
        error: null
      });

      return response.suggestions;
    } catch (error) {
      const apiError = error as ApiError;
      setState({
        suggestions: [],
        loading: false,
        error: apiError.message
      });
      throw error;
    }
  }, [city, minChars, maxSuggestions]);

  /**
   * Actualizar query con debounce
   */
  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);

    // Limpiar timeout anterior
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // Configurar nuevo timeout
    const timeout = window.setTimeout(() => {
      searchDistricts(newQuery);
    }, debounceMs);

    setDebounceTimeout(timeout);
  }, [searchDistricts, debounceMs, debounceTimeout]);

  /**
   * Buscar inmediatamente
   */
  const searchImmediate = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
      setDebounceTimeout(null);
    }
    return searchDistricts(searchQuery);
  }, [searchDistricts, debounceTimeout]);

  /**
   * Limpiar sugerencias
   */
  const clearSuggestions = useCallback(() => {
    setState({
      suggestions: [],
      loading: false,
      error: null
    });
    setQuery('');
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
      setDebounceTimeout(null);
    }
  }, [debounceTimeout]);

  /**
   * Efecto para limpiar cuando cambia la ciudad
   */
  useEffect(() => {
    clearSuggestions();
  }, [city, clearSuggestions]);

  /**
   * Limpiar timeout al desmontar
   */
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);

  return {
    // Estado
    suggestions: state.suggestions,
    loading: state.loading,
    error: state.error,
    query,
    city,

    // Acciones
    updateQuery,
    searchImmediate,
    clearSuggestions,

    // Utilidades
    hasSuggestions: state.suggestions.length > 0,
    isSearching: state.loading && query.length >= minChars && !!city,
    canSearch: !!city
  };
};

// ====================
// HOOK COMBINADO PARA AUTOCOMPLETADO DE UBICACIONES
// ====================

export interface UseLocationAutocompleteOptions {
  minChars?: number;
  debounceMs?: number;
  maxSuggestions?: number;
}

export const useLocationAutocomplete = (options: UseLocationAutocompleteOptions = {}) => {
  const cityAutocomplete = useCityAutocomplete(options);
  
  const [selectedCity, setSelectedCity] = useState<string>('');
  
  const districtAutocomplete = useDistrictAutocomplete({
    city: selectedCity,
    ...options
  });

  /**
   * Seleccionar ciudad y preparar búsqueda de distritos
   */
  const selectCity = useCallback((city: string) => {
    setSelectedCity(city);
    cityAutocomplete.clearSuggestions();
    districtAutocomplete.clearSuggestions();
  }, [cityAutocomplete, districtAutocomplete]);

  /**
   * Limpiar toda la selección
   */
  const clearAll = useCallback(() => {
    setSelectedCity('');
    cityAutocomplete.clearSuggestions();
    districtAutocomplete.clearSuggestions();
  }, [cityAutocomplete, districtAutocomplete]);

  return {
    // Autocompletado de ciudades
    city: {
      ...cityAutocomplete,
      selectCity
    },

    // Autocompletado de distritos
    district: districtAutocomplete,

    // Estado combinado
    selectedCity,
    isLoadingAny: cityAutocomplete.loading || districtAutocomplete.loading,
    hasAnyError: !!cityAutocomplete.error || !!districtAutocomplete.error,

    // Acciones generales
    clearAll
  };
};