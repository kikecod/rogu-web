// Componentes existentes
export { default as SearchBar } from './SearchBar';
export { default as Filters } from './Filters';

// Componentes integrados con la nueva API
export { default as IntegratedSearchBar } from './IntegratedSearchBar';
export { default as SearchResults } from './SearchResults';
export { default as IntegratedFilters } from './IntegratedFilters';

// Componentes de autocompletado
export { default as CityAutocomplete } from './CityAutocomplete';
export { default as DistrictAutocomplete } from './DistrictAutocomplete';
export { default as LocationAutocomplete } from './LocationAutocomplete';

// Componente de disponibilidad
export { default as AvailabilityChecker } from './AvailabilityChecker';

// Componente de manejo de errores
export { default as ErrorDisplay } from './ErrorDisplay';

// Re-exportaciones para compatibilidad
export type { SearchParams } from './SearchBar';
export type { FilterState } from './Filters';