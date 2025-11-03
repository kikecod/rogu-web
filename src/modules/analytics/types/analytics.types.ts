// 📊 TIPOS PARA EL MÓDULO DE ANALYTICS

export interface DashboardKPIs {
  ingresosMes: {
    valor: number;
    variacion: number;
    tendencia: 'up' | 'down';
    mesAnterior: number;
  };
  totalReservas: {
    valor: number;
    variacion: number;
    tendencia: 'up' | 'down';
    mesAnterior: number;
  };
  tasaOcupacion: {
    valor: number;
    unidad: '%';
  };
  ratingPromedio: {
    valor: number;
    max: 5;
  };
}

export interface IngresosMensuales {
  mes: string;
  nombreMes: string;
  ingresos: number;
}

export interface ReservasPorEstado {
  estado: string;
  cantidad: number;
}

export interface ReservasPorDia {
  fecha: string;
  cantidad: number;
}

export interface HorarioPopular {
  hora: string;
  cantidad: number;
}

export interface DashboardGraficos {
  ingresosUltimos12Meses: IngresosMensuales[];
  reservasPorEstado: ReservasPorEstado[];
  reservasPorDia: ReservasPorDia[];
  horariosPopulares: HorarioPopular[];
}

export interface DashboardData {
  periodo: {
    mesActual: string;
    fechaConsulta: string;
  };
  metricas: DashboardKPIs;
  graficos: DashboardGraficos;
}

export interface CanchaEstadistica {
  idCancha: number;
  nombre: string;
  sede: {
    idSede: number;
    nombre: string;
  };
}

export interface EstadisticasCanchaMetricas {
  totalReservas: number;
  ingresos: number;
  tasaOcupacion: number;
  rating: number;
  totalCalificaciones: number;
}

export interface EstadisticasCanchaData {
  cancha: CanchaEstadistica;
  periodo: {
    inicio: string;
    fin: string;
  };
  metricas: EstadisticasCanchaMetricas;
  reservasPorEstado: ReservasPorEstado[];
}

export interface IngresosMensualesData {
  mes: string;
  ingresos: number;
  transacciones: number;
}

export interface IngresosMensualesResponse {
  periodo: string;
  limite: number;
  datos: IngresosMensualesData[];
}



export interface ResenaCliente {
  idCliente: number;
  nombre: string;
  apellido: string;
  apodo: string | null;
}

export interface Resena {
  puntaje: number;
  comentario: string;
  fecha: string;
  cancha: {
    idCancha: number;
    nombre: string;
  };
  sede: {
    idSede: number;
    nombre: string;
  };
  cliente: ResenaCliente;
}

export interface DistribucionEstrellas {
  estrellas: number;
  cantidad: number;
  porcentaje: number;
}

export interface ResumenResenasData {
  resumen: {
    ratingPromedio: number;
    totalResenas: number;
    maxRating: number;
  };
  distribucion: DistribucionEstrellas[];
  ultimasResenas: Resena[];
}

export interface AnalyticsFiltros {
  fechaInicio?: string;
  fechaFin?: string;
  idCancha?: number;
  idSede?: number;
  idPersonaD?: number;
}

// 📅 Tipos para el Calendario de Reservas
export interface CalendarioData {
  mes: string;
  year: number;
  month: number;
  diasEnMes: number;
  canchas: CanchaCalendario[];
  reservas: ReservaCalendario[];
}

export interface CanchaCalendario {
  idCancha: number;
  nombre: string;
  sede: {
    idSede: number;
    nombre: string;
  };
}

export interface ReservaCalendario {
  idReserva: number;
  idCancha: number;
  estado: string;
  iniciaEn: string;
  terminaEn: string;
  cantidadPersonas?: number;
  montoBase?: number;
  montoExtra?: number;
  montoTotal?: number;
  requiereAprobacion?: boolean;
  creadoEn?: string;
  actualizadoEn?: string;
  cliente: {
    idCliente: number;
    nombre: string;
    apellido: string;
    apodo: string | null;
    telefono?: string;
    correo?: string;
    usuario?: string;
  };
}
