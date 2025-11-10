import { useState, useCallback, useEffect } from 'react';
import { searchApiService } from '../services';
import type {
  CheckAvailabilityParams,
  AvailabilityResponse,
  AvailabilityState,
  ApiError
} from '../types';

// ====================
// HOOK PARA VERIFICACIÓN DE DISPONIBILIDAD
// ====================

export interface UseAvailabilityOptions {
  autoCheck?: boolean; // Verificación automática al cambiar parámetros
  initialParams?: CheckAvailabilityParams;
}

export const useAvailability = (options: UseAvailabilityOptions = {}) => {
  const { autoCheck = false, initialParams } = options;

  const [state, setState] = useState<AvailabilityState>({
    availability: null,
    loading: false,
    error: null
  });

  /**
   * Verificar disponibilidad
   */
  const checkAvailability = useCallback(async (params: CheckAvailabilityParams) => {
    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null 
    }));

    try {
      const response: AvailabilityResponse = await searchApiService.checkAvailability(params);
      
      setState({
        availability: response,
        loading: false,
        error: null
      });

      return response;
    } catch (error) {
      const apiError = error as ApiError;
      setState({
        availability: null,
        loading: false,
        error: apiError.message
      });
      throw error;
    }
  }, []);

  /**
   * Limpiar estado de disponibilidad
   */
  const clearAvailability = useCallback(() => {
    setState({
      availability: null,
      loading: false,
      error: null
    });
  }, []);

  /**
   * Verificación automática
   */
  useEffect(() => {
    if (autoCheck && initialParams) {
      checkAvailability(initialParams);
    }
  }, [autoCheck, initialParams, checkAvailability]);

  return {
    // Estado
    availability: state.availability,
    loading: state.loading,
    error: state.error,

    // Acciones
    checkAvailability,
    clearAvailability,

    // Utilidades de estado
    isAvailable: state.availability?.disponible || false,
    hasConflicts: (state.availability?.conflictos?.length || 0) > 0,
    availableSlots: state.availability?.horariosDisponibles || [],
    conflicts: state.availability?.conflictos || []
  };
};

// ====================
// HOOK PARA VERIFICACIÓN MÚLTIPLE
// ====================

export interface UseMultipleAvailabilityOptions {
  batchSize?: number; // Cuántas verificaciones hacer en paralelo
}

export const useMultipleAvailability = (options: UseMultipleAvailabilityOptions = {}) => {
  const { batchSize = 5 } = options;

  const [state, setState] = useState<{
    results: Record<string, AvailabilityResponse>;
    loading: Record<string, boolean>;
    errors: Record<string, string>;
    isProcessing: boolean;
  }>({
    results: {},
    loading: {},
    errors: {},
    isProcessing: false
  });

  /**
   * Generar clave única para la verificación
   */
  const generateKey = useCallback((params: CheckAvailabilityParams): string => {
    return `${params.idCancha}-${params.fecha}-${params.horaInicio}-${params.horaFin}`;
  }, []);

  /**
   * Verificar disponibilidad de múltiples canchas/horarios
   */
  const checkMultipleAvailability = useCallback(async (paramsList: CheckAvailabilityParams[]) => {
    setState(prev => ({ ...prev, isProcessing: true }));

    // Procesar en lotes
    const batches = [];
    for (let i = 0; i < paramsList.length; i += batchSize) {
      batches.push(paramsList.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const batchPromises = batch.map(async (params) => {
        const key = generateKey(params);
        
        setState(prev => ({
          ...prev,
          loading: { ...prev.loading, [key]: true },
          errors: { ...prev.errors, [key]: '' }
        }));

        try {
          const response = await searchApiService.checkAvailability(params);
          
          setState(prev => ({
            ...prev,
            results: { ...prev.results, [key]: response },
            loading: { ...prev.loading, [key]: false }
          }));

          return { key, response, success: true };
        } catch (error) {
          const apiError = error as ApiError;
          
          setState(prev => ({
            ...prev,
            loading: { ...prev.loading, [key]: false },
            errors: { ...prev.errors, [key]: apiError.message }
          }));

          return { key, error: apiError.message, success: false };
        }
      });

      await Promise.allSettled(batchPromises);
    }

    setState(prev => ({ ...prev, isProcessing: false }));
  }, [batchSize, generateKey]);

  /**
   * Verificar disponibilidad de una cancha específica
   */
  const checkSingleAvailability = useCallback(async (params: CheckAvailabilityParams) => {
    const key = generateKey(params);
    
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, [key]: true },
      errors: { ...prev.errors, [key]: '' }
    }));

    try {
      const response = await searchApiService.checkAvailability(params);
      
      setState(prev => ({
        ...prev,
        results: { ...prev.results, [key]: response },
        loading: { ...prev.loading, [key]: false }
      }));

      return response;
    } catch (error) {
      const apiError = error as ApiError;
      
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, [key]: false },
        errors: { ...prev.errors, [key]: apiError.message }
      }));

      throw error;
    }
  }, [generateKey]);

  /**
   * Obtener resultado de una verificación específica
   */
  const getAvailability = useCallback((params: CheckAvailabilityParams) => {
    const key = generateKey(params);
    return {
      result: state.results[key] || null,
      loading: state.loading[key] || false,
      error: state.errors[key] || null
    };
  }, [state, generateKey]);

  /**
   * Limpiar todos los resultados
   */
  const clearAll = useCallback(() => {
    setState({
      results: {},
      loading: {},
      errors: {},
      isProcessing: false
    });
  }, []);

  /**
   * Limpiar resultado específico
   */
  const clearSingle = useCallback((params: CheckAvailabilityParams) => {
    const key = generateKey(params);
    setState(prev => {
      const newResults = { ...prev.results };
      const newLoading = { ...prev.loading };
      const newErrors = { ...prev.errors };
      
      delete newResults[key];
      delete newLoading[key];
      delete newErrors[key];
      
      return {
        ...prev,
        results: newResults,
        loading: newLoading,
        errors: newErrors
      };
    });
  }, [generateKey]);

  return {
    // Estado
    results: state.results,
    loading: state.loading,
    errors: state.errors,
    isProcessing: state.isProcessing,

    // Acciones
    checkMultipleAvailability,
    checkSingleAvailability,
    clearAll,
    clearSingle,

    // Utilidades
    getAvailability,
    generateKey,
    totalChecked: Object.keys(state.results).length,
    totalLoading: Object.values(state.loading).filter(Boolean).length,
    hasErrors: Object.values(state.errors).some(error => error !== '')
  };
};