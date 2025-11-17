// ==========================================
// TIPOS Y ENUMS PARA SEDES
// ==========================================

export const EstadoSede = {
  ACTIVA: 'ACTIVA',
  INACTIVA: 'INACTIVA',
  SUSPENDIDA: 'SUSPENDIDA',
  ELIMINADA: 'ELIMINADA',
} as const;

export type EstadoSede = typeof EstadoSede[keyof typeof EstadoSede];

export const EstadoVerificacionSede = {
  PENDIENTE: 'PENDIENTE',
  VERIFICADA: 'VERIFICADA',
  RECHAZADA: 'RECHAZADA',
  EN_REVISION: 'EN_REVISION',
} as const;

export type EstadoVerificacionSede = typeof EstadoVerificacionSede[keyof typeof EstadoVerificacionSede];

// ==========================================
// INTERFACES PRINCIPALES
// ==========================================

export interface Sede {
  idSede: number;
  nombre: string;
  descripcion?: string;
  direccion?: string;
  ciudad?: string;
  city?: string;
  distrito?: string;
  district?: string;
  estado?: string;
  latitud?: number;
  longitud?: number;
  telefono?: string;
  email?: string;
  NIT?: string;
  LicenciaFuncionamiento?: string;
  politicas?: string;
  verificada: boolean;
  activa: boolean;
  idDuenio: number;
  duenio?: {
    idUsuario: number;
    usuario: string;
    correo: string;
    persona: {
      nombre: string;
      apellidoPaterno: string;
      apellidoMaterno?: string;
    };
  };
  totalCanchas?: number;
  promedioCalificacion?: number;
  totalResenas?: number;
  totalReservas?: number;
  creadoEn: string | Date;
  actualizadoEn?: string | Date;
}

export interface SedeDetalle extends Sede {
  canchas?: Cancha[];
  horarios?: HorarioSede[];
  fotos?: FotoSede[];
  estadisticas?: EstadisticasSede;
  historial?: HistorialSede[];
}

export interface Cancha {
  idCancha: number;
  nombre: string;
  descripcion?: string;
  tipo?: string;
  activa: boolean;
  eliminado: boolean;
  idSede: number;
  creadoEn: string | Date;
}

export interface HorarioSede {
  idHorario: number;
  diaSemana: number;
  horaApertura: string;
  horaCierre: string;
  activo: boolean;
}

export interface FotoSede {
  idFoto: number;
  urlFoto: string;
  esPrincipal: boolean;
  orden: number;
}

export interface EstadisticasSede {
  reservasTotales: number;
  reservasCompletadas: number;
  reservasCanceladas: number;
  ingresosTotales: number;
  ocupacionPromedio: number;
  calificacionPromedio: number;
  totalResenas: number;
}

export interface HistorialSede {
  id: number;
  accion: string;
  descripcion: string;
  realizadoPor: string;
  fecha: string | Date;
}

// ==========================================
// DTOs PARA OPERACIONES CRUD
// ==========================================

export interface CrearSedeDto {
  nombre: string;
  descripcion?: string;
  direccion: string;
  ciudad: string;
  distrito?: string;
  estado?: string;
  latitud?: number;
  longitud?: number;
  telefono?: string;
  email?: string;
  idDuenio: number;
  horarios?: Omit<HorarioSede, 'idHorario'>[];
}

export interface EditarSedeDto {
  nombre?: string;
  descripcion?: string;
  direccion?: string;
  ciudad?: string;
  distrito?: string;
  estado?: string;
  latitud?: number;
  longitud?: number;
  telefono?: string;
  email?: string;
  activa?: boolean;
  verificada?: boolean;
}

export interface DesactivarSedeDto {
  motivo: string;
  temporal: boolean;
}

export interface EliminarSedeDto {
  motivo: string;
  confirmacion: boolean;
}

// ==========================================
// FILTROS Y PAGINACIÓN
// ==========================================

export interface FiltrosSedes {
  buscar?: string;
  ciudad?: string;
  estado?: string;
  verificada?: boolean;
  activa?: boolean;
  idDuenio?: number;
  page?: number;
  limit?: number;
  ordenarPor?: 'nombre' | 'fecha' | 'calificacion' | 'reservas';
  ordenDireccion?: 'asc' | 'desc';
}

export interface RespuestaListaSedes {
  sedes: Sede[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

// ==========================================
// RESPUESTAS DE API
// ==========================================

export interface RespuestaCrearSede {
  mensaje: string;
  sede: Sede;
}

export interface RespuestaEditarSede {
  mensaje: string;
  sedeActualizada: Sede;
}

export interface RespuestaEliminarSede {
  mensaje: string;
  idSedeEliminada: number;
}
