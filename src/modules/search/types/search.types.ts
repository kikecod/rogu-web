// ====================
// TIPOS BASE
// ====================

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ====================
// ENTIDADES PRINCIPALES
// ====================

export interface Sede {
  idSede: number;
  nombre: string;
  country: string;
  stateProvince: string;
  city: string;
  district: string;
  addressLine: string;
  latitude: number;
  longitude: number;
  telefono: string;
}

export interface Disciplina {
  idDisciplina: number;
  nombre: string;
  categoria: string;
}

export interface FotoCancha {
  idFoto: number;
  urlFoto: string;
}

export interface Cancha {
  idCancha: number;
  nombre: string;
  precio: number;
  ratingPromedio: number;
  totalResenas: number;
  superficie: string;
  cubierta: boolean;
  dimensiones: string;
  aforoMax: number;
  horaApertura: string;
  horaCierre: string;
  fotos: FotoCancha[];
  disciplinas: Disciplina[];
  sede: Sede;
  disponible?: boolean;
}

// ====================
// DTOs DE BÚSQUEDA
// ====================

export interface SearchMainParams {
  country?: string;
  stateProvince?: string;
  city?: string;
  district?: string;
  fecha?: string; // YYYY-MM-DD
  horaInicio?: string; // HH:mm
  horaFin?: string; // HH:mm
  disciplina?: string;
  page?: number;
  limit?: number;
  sortBy?: 'precio' | 'rating' | 'nombre';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchFiltersParams extends SearchMainParams {
  precioMin?: number;
  precioMax?: number;
  ratingMin?: number;
  cubierta?: boolean;
  superficie?: string;
  iluminacion?: boolean;
  aforoMin?: number;
  aforoMax?: number;
}

export interface CheckAvailabilityParams {
  idCancha: number;
  fecha: string; // YYYY-MM-DD
  horaInicio: string; // HH:mm
  horaFin: string; // HH:mm
}

// ====================
// RESPUESTAS DE API
// ====================

export interface SearchFiltersInfo {
  availableCities: string[];
  availableDistricts: string[];
  availableDisciplines: Array<{
    id: number;
    nombre: string;
  }>;
  priceRange: {
    min: number;
    max: number;
  };
}

export interface SearchResponse {
  results: Cancha[];
  pagination: PaginationInfo;
  filters: SearchFiltersInfo;
}

export interface AvailabilityResponse {
  disponible: boolean;
  conflictos?: Array<{
    horaInicio: string;
    horaFin: string;
    motivo: string;
  }>;
  horariosDisponibles?: Array<{
    horaInicio: string;
    horaFin: string;
  }>;
}

export interface LocationsResponse {
  countries: string[];
  states: Record<string, string[]>;
  cities: Record<string, string[]>;
  districts: Record<string, string[]>;
}

export interface AutocompleteSuggestion {
  value: string;
  count: number;
}

export interface AutocompleteResponse {
  suggestions: AutocompleteSuggestion[];
}

// ====================
// TIPOS PARA EL ESTADO
// ====================

export interface SearchState {
  results: Cancha[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  filters: SearchFiltersInfo | null;
  lastSearchParams: SearchMainParams | SearchFiltersParams | null;
}

export interface LocationState {
  locations: LocationsResponse | null;
  loading: boolean;
  error: string | null;
}

export interface AutocompleteState {
  suggestions: AutocompleteSuggestion[];
  loading: boolean;
  error: string | null;
}

export interface AvailabilityState {
  availability: AvailabilityResponse | null;
  loading: boolean;
  error: string | null;
}

// ====================
// TIPOS PARA FORMULARIOS
// ====================

export interface SearchFormData {
  location: {
    country?: string;
    stateProvince?: string;
    city?: string;
    district?: string;
  };
  dateTime: {
    fecha?: string;
    horaInicio?: string;
    horaFin?: string;
  };
  disciplina?: string;
  filters?: {
    precioMin?: number;
    precioMax?: number;
    ratingMin?: number;
    cubierta?: boolean;
    superficie?: string;
    iluminacion?: boolean;
    aforoMin?: number;
    aforoMax?: number;
  };
  sorting: {
    sortBy: 'precio' | 'rating' | 'nombre';
    sortOrder: 'asc' | 'desc';
  };
  pagination: {
    page: number;
    limit: number;
  };
}

// ====================
// TIPOS PARA ERRORES
// ====================

export interface SearchError {
  code: string;
  message: string;
  field?: string;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: SearchError[];
}