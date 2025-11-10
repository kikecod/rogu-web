// Exportar todos los tipos para facilitar las importaciones
export * from './search.types';

// Re-exportaciones específicas para mayor claridad
export type {
  // Entidades principales
  Cancha,
  Sede,
  Disciplina,
  FotoCancha,
  
  // DTOs y parámetros
  SearchMainParams,
  SearchFiltersParams,
  CheckAvailabilityParams,
  
  // Respuestas de API
  SearchResponse,
  AvailabilityResponse,
  LocationsResponse,
  AutocompleteResponse,
  
  // Estados para hooks
  SearchState,
  LocationState,
  AutocompleteState,
  AvailabilityState,
  
  // Formularios
  SearchFormData,
  
  // Utilidades
  ApiResponse,
  PaginationInfo,
  AutocompleteSuggestion,
  SearchFiltersInfo
} from './search.types';