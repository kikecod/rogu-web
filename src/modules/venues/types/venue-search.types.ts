/**
 * Tipos para la búsqueda y visualización de Sedes (Espacios Deportivos)
 */

// ============================================
// RESPUESTA CRUDA DE LA API
// ============================================

// Respuesta directa del GET /api/sede
export interface SedeApiResponse {
  idSede: number;
  idPersonaD: number;
  nombre: string;
  descripcion: string;
  country: string;
  countryCode: string;
  stateProvince: string;
  city: string;
  district: string;
  addressLine: string;
  postalCode: string;
  latitude: string;
  longitude: string;
  timezone: string;
  direccion: string | null;
  latitud: string | null;
  longitud: string | null;
  telefono: string;
  email: string;
  politicas: string;
  estado: string;
  NIT: string;
  LicenciaFuncionamiento: string;
  ratingPromedioSede: string;
  totalResenasSede: number;
  ratingFinal: string;
  creadoEn: string;
  actualizadoEn: string;
  eliminadoEn: string | null;
  canchas: any[];
}

// ============================================
// ENTIDADES PRINCIPALES
// ============================================

export interface SedeEstadisticas {
  totalCanchas: number;
  deportesDisponibles: string[];
  precioDesde: number;
  precioHasta: number;
  ratingGeneral: number; // Rating de reseñas de la sede
  ratingCanchas: number; // Promedio de ratings de canchas
  ratingFinal: number; // Promedio ponderado
  totalResenasSede: number;
  totalResenasCanchas: number;
}

export interface SedeDuenio {
  idUsuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string;
  avatar?: string;
}

export interface FotoSede {
  idFoto: number;
  urlFoto: string;
  tipo: 'sede' | 'cancha';
  orden?: number;
}

// Card para mostrar en búsqueda/listado
export interface SedeCard {
  idSede: number;
  nombre: string;
  descripcion: string;
  country: string;
  stateProvince: string;
  city: string;
  district: string;
  addressLine: string;
  latitude: number;
  longitude: number;
  telefono: string;
  email: string;
  fotoPrincipal?: string;
  fotos: FotoSede[];
  estadisticas: SedeEstadisticas;
  duenio: SedeDuenio;
  verificada?: boolean;
}

// Detalle completo de sede
export interface SedeDetalle extends SedeCard {
  postalCode: string;
  timezone: string;
  politicas: string;
  estado: string;
  NIT: string;
  LicenciaFuncionamiento: string;
  horarioApertura?: string;
  horarioCierre?: string;
  amenities?: string[];
}

// ============================================
// CANCHAS DE UNA SEDE
// ============================================

export interface DisciplinaCancha {
  idDisciplina: number;
  nombre: string;
  categoria: string;
}

export interface FotoCancha {
  idFoto: number;
  urlFoto: string;
}

export interface CanchaResumen {
  idCancha: number;
  nombre: string;
  superficie: string;
  cubierta: boolean;
  precio: number;
  ratingPromedio: number;
  totalResenas: number;
  dimensiones: string;
  aforoMax: number;
  iluminacion: string;
  estado: string;
  horaApertura: string;
  horaCierre: string;
  disciplinas: DisciplinaCancha[];
  fotos: FotoCancha[];
  disponible?: boolean;
}

// ============================================
// RESEÑAS DE SEDE
// ============================================

export interface CalificacionSede {
  idCalificacionSede: number;
  idSede: number;
  idCliente: number;
  idReserva: number;
  puntajeGeneral: number;
  atencion: number;
  instalaciones: number;
  ubicacion: number;
  estacionamiento: number;
  vestuarios: number;
  limpieza: number;
  seguridad: number;
  comentario: string;
  fechaCreacion: string;
  cliente?: {
    nombre: string;
    apellido: string;
    avatar?: string;
  };
}

export interface CrearCalificacionSedeDTO {
  idSede: number;
  idReserva: number;
  puntajeGeneral: number;
  atencion: number;
  instalaciones: number;
  ubicacion: number;
  estacionamiento: number;
  vestuarios: number;
  limpieza: number;
  seguridad: number;
  comentario: string;
}

// ============================================
// RESPUESTAS DE API
// ============================================

export interface SedeDetalleResponse {
  sede: SedeDetalle;
}

export interface SedeCanchasResponse {
  idSede: number;
  nombreSede: string;
  canchas: CanchaResumen[];
  total: number;
}

export interface SedeResenasResponse {
  resenas: CalificacionSede[];
  total: number;
  promedios: {
    general: number;
    atencion: number;
    instalaciones: number;
    ubicacion: number;
    estacionamiento: number;
    vestuarios: number;
    limpieza: number;
    seguridad: number;
  };
}

export interface PuedeCalificarResponse {
  puedeCalificar: boolean;
  motivo?: string;
  reservasCompletadas?: number;
}

// ============================================
// FILTROS DE BÚSQUEDA
// ============================================

export interface VenueSearchFilters {
  city?: string;
  stateProvince?: string;
  district?: string;
  deporte?: string;
  precioMin?: number;
  precioMax?: number;
  ratingMin?: number;
  verificada?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'nombre' | 'rating' | 'precio' | 'canchas';
  sortOrder?: 'asc' | 'desc';
}

export interface VenueSearchResponse {
  sedes: SedeCard[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================
// FILTROS PARA CANCHAS DE UNA SEDE
// ============================================

export interface SedeCanchasFilters {
  deporte?: string;
  precioMin?: number;
  precioMax?: number;
  cubierta?: boolean;
  iluminacion?: boolean;
  disponible?: boolean;
}
