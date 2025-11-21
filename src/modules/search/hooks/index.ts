// Exportar todos los hooks de búsqueda
export * from './useSearch';
export * from './useAvailability';
export * from './useLocations';
export * from './useAutocomplete';

// Re-exportaciones específicas para mayor claridad
export {
  useSearchMain,
  useSearchFilters
} from './useSearch';

export {
  useAvailability,
  useMultipleAvailability
} from './useAvailability';

export {
  useLocations
} from './useLocations';

export {
  useCityAutocomplete,
  useDistrictAutocomplete,
  useLocationAutocomplete
} from './useAutocomplete';