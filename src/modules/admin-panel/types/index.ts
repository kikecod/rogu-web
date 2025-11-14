// ==========================================
// TIPOS GLOBALES DEL PANEL ADMINISTRATIVO
// ==========================================

export const TipoRol = {
  ADMIN: 'ADMIN',
  CLIENTE: 'CLIENTE',
  DUENIO: 'DUENIO',
  CONTROLADOR: 'CONTROLADOR'
} as const;

export type TipoRol = typeof TipoRol[keyof typeof TipoRol];

export const EstadoUsuario = {
  ACTIVO: 'ACTIVO',
  INACTIVO: 'INACTIVO',
  BLOQUEADO: 'BLOQUEADO',
  PENDIENTE: 'PENDIENTE',
  DESACTIVADO: 'DESACTIVADO',
  ELIMINADO: 'ELIMINADO'
} as const;

export type EstadoUsuario = typeof EstadoUsuario[keyof typeof EstadoUsuario];

export const EstadoVerificacion = {
  PENDIENTE: 'PENDIENTE',
  APROBADO: 'APROBADO',
  RECHAZADO: 'RECHAZADO',
  EN_REVISION: 'EN_REVISION'
} as const;

export type EstadoVerificacion = typeof EstadoVerificacion[keyof typeof EstadoVerificacion];

// ==========================================
// INTERFACES DE DASHBOARD
// ==========================================

export interface DashboardMetricas {
  usuarios: {
    total: number;
    nuevosHoy: number;
    nuevosEsteMes: number;
    crecimiento: number;
  };
  sedes: {
    total: number;
    verificadas: number;
    pendientes: number;
    rechazadas: number;
  };
  canchas: {
    total: number;
    activas: number;
    inactivas: number;
  };
  reservas: {
    totalHoy: number;
    totalMes: number;
    ingresoTotal: number;
  };
  reportes: {
    pendientes: number;
    enRevision: number;
    resueltos: number;
  };
}

export interface DashboardAlertas {
  verificacionesPendientes: number;
  reportesSinAsignar: number;
  sedesAntiguas: number;
  resenasReportadas: number;
}

export interface ActividadReciente {
  id: number;
  tipo: 'SEDE_VERIFICADA' | 'REPORTE_CERRADO' | 'DUENIO_VERIFICADO' | 'NUEVAS_RESERVAS';
  descripcion: string;
  fecha: Date;
  icono?: string;
}

export interface GraficoData {
  fechas: string[];
  valores: number[];
}

// ==========================================
// INTERFACES DE USUARIOS
// ==========================================

export interface Persona {
  idPersona: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  fechaNacimiento?: Date;
  telefono?: string;
  ci?: string;
  direccion?: string;
}

export interface UsuarioRol {
  idUsuarioRol: number;
  idUsuario: number;
  idRol: number;
  rol: {
    idRol: number;
    rol: TipoRol;
  };
  activo: boolean;
  creadoEn: Date;
}

export interface Usuario {
  idUsuario: number;
  idPersona: number;
  usuario: string;
  correo: string;
  correoVerificado: boolean;
  avatarPath?: string;
  estado: EstadoUsuario;
  creadoEn: Date;
  actualizadoEn: Date;
  ultimoAccesoEn?: Date;
  persona: Persona;
  roles: UsuarioRol[];
}

export interface UsuarioDetalle extends Usuario {
  estadisticas: {
    totalReservas: number;
    reservasCanceladas: number;
    sedesCreadas: number;
    canchasActivas: number;
    resenasRecibidas: number;
    promedioCalificacion: number;
    reportesRecibidos: number;
  };
  sedesAdministradas?: Array<{
    idSede: number;
    nombre: string;
    totalCanchas: number;
  }>;
}

export interface ListaUsuariosParams {
  rol?: TipoRol;
  estado?: EstadoUsuario;
  buscar?: string;
  page?: number;
  limit?: number;
}

export interface ListaUsuariosResponse {
  usuarios: Usuario[];
  total: number;
  paginas: number;
}

// ==========================================
// INTERFACES DE VERIFICACIONES
// ==========================================

export interface VerificacionDuenio {
  idVerificacion: number;
  idUsuario: number;
  usuario: Usuario;
  estado: EstadoVerificacion;
  documentos: {
    ineFrontal?: string;
    ineReverso?: string;
    selfieConIne?: string;
    comprobanteDomicilio?: string;
    nit?: string;
  };
  notas?: string;
  fechaSolicitud: Date;
  fechaRevision?: Date;
  revisadoPor?: number;
}

export interface VerificacionSede {
  idVerificacion: number;
  idSede: number;
  sede: any; // Definir tipo Sede
  estado: EstadoVerificacion;
  documentos: string[];
  notas?: string;
  fechaSolicitud: Date;
  fechaRevision?: Date;
  revisadoPor?: number;
}

// ==========================================
// INTERFACES DE SEDES Y CANCHAS
// ==========================================

export interface Sede {
  idSede: number;
  nombre: string;
  descripcion?: string;
  direccion?: string;
  ciudad?: string;
  city?: string;
  district?: string;
  estado?: string;
  verificada: boolean;
  activa: boolean;
  idDuenio: number;
  duenio?: Usuario;
  totalCanchas?: number;
  promedioCalificacion?: number;
  totalResenas?: number;
  totalReservas?: number;
  creadoEn: Date;
}

export interface SedeDetalle extends Sede {
  canchas: any[]; // Definir tipo Cancha
  estadisticas: {
    reservasTotales: number;
    ingresosTotales: number;
    ocupacionPromedio: number;
  };
  historial: any[];
}

// ==========================================
// INTERFACES DE API
// ==========================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: Array<{
    code: string;
    message: string;
    field?: string;
  }>;
}

// ==========================================
// ACCIONES ADMINISTRATIVAS
// ==========================================

export interface CambiarRolDto {
  nuevoRol: TipoRol;
  motivo: string;
}

export interface SuspenderUsuarioDto {
  diasSuspension: number;
  motivo: string;
}

export interface BanearUsuarioDto {
  motivo: string;
  permanente: boolean;
}

export interface EnviarEmailDto {
  asunto: string;
  mensaje: string;
  tipo: 'NOTIFICACION' | 'ADVERTENCIA' | 'SUSPENSION';
}

export interface NotaAdminDto {
  contenido: string;
  tipo: 'INFORMATIVA' | 'ADVERTENCIA' | 'IMPORTANTE';
}

// ==========================================
// INTERFACES DE DASHBOARD - CARDS DE GESTIÓN
// ==========================================

export interface EntityCardData {
  id: string;
  title: string;
  description: string;
  badge: {
    text: string;
    value?: number;
  };
  route: string;
  icon: string;
  iconColor: string;
}

export interface MetricCardData {
  id: string;
  label: string;
  value: number | string;
  helperText?: string;
  period?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  format?: 'number' | 'currency' | 'percentage';
}

export interface DashboardData {
  entityCards: EntityCardData[];
  metricsCards: MetricCardData[];
}
