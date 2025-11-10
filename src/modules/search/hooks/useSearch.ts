import { useState, useCallback, useEffect } from 'react';
import { searchApiService } from '../services';
import type {
  SearchMainParams,
  SearchResponse,
  SearchState,
  ApiError
} from '../types';

// ====================
// HOOK PARA BÚSQUEDA PRINCIPAL
// ====================

export interface UseSearchMainOptions {
  autoSearch?: boolean; // Búsqueda automática al cambiar parámetros
  initialParams?: SearchMainParams;
}

export const useSearchMain = (options: UseSearchMainOptions = {}) => {
  const { autoSearch = false, initialParams } = options;

  const [state, setState] = useState<SearchState>({
    results: [],
    loading: false,
    error: null,
    pagination: null,
    filters: null,
    lastSearchParams: initialParams || null
  });

  /**
   * Ejecutar búsqueda principal
   */
  const searchMain = useCallback(async (params: SearchMainParams) => {
    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null,
      lastSearchParams: params
    }));

    try {
      const response: SearchResponse = await searchApiService.searchMain(params);
      
      setState(prev => ({
        ...prev,
        results: response.results,
        pagination: response.pagination,
        filters: response.filters,
        loading: false
      }));

      return response;
    } catch (error) {
      const apiError = error as ApiError;
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError.message
      }));
      throw error;
    }
  }, []);

  /**
   * Cambiar página
   */
  const changePage = useCallback(async (page: number) => {
    if (!state.lastSearchParams) return;

    const newParams = {
      ...state.lastSearchParams,
      page
    };

    return searchMain(newParams);
  }, [state.lastSearchParams, searchMain]);

  /**
   * Cambiar ordenamiento
   */
  const changeSort = useCallback(async (
    sortBy: 'precio' | 'rating' | 'nombre',
    sortOrder: 'asc' | 'desc' = 'desc'
  ) => {
    if (!state.lastSearchParams) return;

    const newParams = {
      ...state.lastSearchParams,
      sortBy,
      sortOrder,
      page: 1 // Reset a la primera página
    };

    return searchMain(newParams);
  }, [state.lastSearchParams, searchMain]);

  /**
   * Limpiar resultados
   */
  const clearResults = useCallback(() => {
    setState({
      results: [],
      loading: false,
      error: null,
      pagination: null,
      filters: null,
      lastSearchParams: null
    });
  }, []);

  /**
   * Búsqueda automática cuando cambian los parámetros
   */
  useEffect(() => {
    if (autoSearch && initialParams) {
      searchMain(initialParams);
    }
  }, [autoSearch, initialParams, searchMain]);

  return {
    // Estado
    results: state.results,
    loading: state.loading,
    error: state.error,
    pagination: state.pagination,
    filters: state.filters,
    lastSearchParams: state.lastSearchParams,

    // Acciones
    searchMain,
    changePage,
    changeSort,
    clearResults,

    // Utilidades
    hasResults: state.results.length > 0,
    hasNextPage: state.pagination?.hasNext || false,
    hasPrevPage: state.pagination?.hasPrev || false,
    totalResults: state.pagination?.total || 0
  };
};

// ====================
// HOOK PARA BÚSQUEDA CON FILTROS
// ====================

import type { SearchFiltersParams } from '../types';

export interface UseSearchFiltersOptions {
  autoSearch?: boolean;
  initialParams?: SearchFiltersParams;
}

export const useSearchFilters = (options: UseSearchFiltersOptions = {}) => {
  const { autoSearch = false, initialParams } = options;

  const [state, setState] = useState<SearchState>({
    results: [],
    loading: false,
    error: null,
    pagination: null,
    filters: null,
    lastSearchParams: initialParams || null
  });

  /**
   * Ejecutar búsqueda con filtros
   */
  const searchWithFilters = useCallback(async (params: SearchFiltersParams) => {
    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null,
      lastSearchParams: params
    }));

    try {
      const response: SearchResponse = await searchApiService.searchWithFilters(params);
      
      setState(prev => ({
        ...prev,
        results: response.results,
        pagination: response.pagination,
        filters: response.filters,
        loading: false
      }));

      return response;
    } catch (error) {
      const apiError = error as ApiError;
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError.message
      }));
      throw error;
    }
  }, []);

  /**
   * Búsqueda inteligente (decide automáticamente el tipo)
   */
  const smartSearch = useCallback(async (params: SearchMainParams | SearchFiltersParams) => {
    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null,
      lastSearchParams: params
    }));

    try {
      const response: SearchResponse = await searchApiService.smartSearch(params);
      
      setState(prev => ({
        ...prev,
        results: response.results,
        pagination: response.pagination,
        filters: response.filters,
        loading: false
      }));

      return response;
    } catch (error) {
      const apiError = error as ApiError;
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError.message
      }));
      throw error;
    }
  }, []);

  /**
   * Aplicar filtros manteniendo otros parámetros
   */
  const applyFilters = useCallback(async (filters: Partial<SearchFiltersParams>) => {
    if (!state.lastSearchParams) return;

    const newParams = {
      ...state.lastSearchParams,
      ...filters,
      page: 1 // Reset a la primera página
    };

    return searchWithFilters(newParams);
  }, [state.lastSearchParams, searchWithFilters]);

  /**
   * Limpiar filtros
   */
  const clearFilters = useCallback(async () => {
    if (!state.lastSearchParams) return;

    const baseParams: SearchMainParams = {
      country: state.lastSearchParams.country,
      stateProvince: state.lastSearchParams.stateProvince,
      city: state.lastSearchParams.city,
      district: state.lastSearchParams.district,
      fecha: state.lastSearchParams.fecha,
      horaInicio: state.lastSearchParams.horaInicio,
      horaFin: state.lastSearchParams.horaFin,
      disciplina: state.lastSearchParams.disciplina,
      page: 1,
      limit: state.lastSearchParams.limit,
      sortBy: state.lastSearchParams.sortBy,
      sortOrder: state.lastSearchParams.sortOrder
    };

    return smartSearch(baseParams);
  }, [state.lastSearchParams, smartSearch]);

  /**
   * Cambiar página
   */
  const changePage = useCallback(async (page: number) => {
    if (!state.lastSearchParams) return;

    const newParams = {
      ...state.lastSearchParams,
      page
    };

    return smartSearch(newParams);
  }, [state.lastSearchParams, smartSearch]);

  /**
   * Búsqueda automática
   */
  useEffect(() => {
    if (autoSearch && initialParams) {
      searchWithFilters(initialParams);
    }
  }, [autoSearch, initialParams, searchWithFilters]);

  return {
    // Estado
    results: state.results,
    loading: state.loading,
    error: state.error,
    pagination: state.pagination,
    filters: state.filters,
    lastSearchParams: state.lastSearchParams,

    // Acciones
    searchWithFilters,
    smartSearch,
    applyFilters,
    clearFilters,
    changePage,

    // Utilidades
    hasResults: state.results.length > 0,
    hasFilters: state.lastSearchParams ? Object.keys(state.lastSearchParams).some(key => 
      ['precioMin', 'precioMax', 'ratingMin', 'cubierta', 'superficie', 'iluminacion', 'aforoMin', 'aforoMax'].includes(key)
    ) : false,
    hasNextPage: state.pagination?.hasNext || false,
    hasPrevPage: state.pagination?.hasPrev || false,
    totalResults: state.pagination?.total || 0
  };
};