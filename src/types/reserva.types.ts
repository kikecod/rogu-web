/**
 * Tipos específicos para las entidades de Reservas
 */

export interface Reserva {
  idReserva: number;
  idCliente: number;
  idCancha: number;
  iniciaEn: string;
  terminaEn: string;
  cantidadPersonas: number;
  requiereAprobacion: boolean;
  montoBase: number;
  montoExtra: number;
  montoTotal: number;
  estado: EstadoReserva;
  creadoEn: string;
  actualizadoEn: string;
  cliente?: any;
  cancha?: any;
}

export interface ReservaFormData {
  idCliente: number;
  idCancha: number;
  iniciaEn: string;
  terminaEn: string;
  cantidadPersonas: number;
  requiereAprobacion: boolean;
  montoBase: number;
  montoExtra: number;
  montoTotal: number;
}

export interface CreateReservaRequest extends ReservaFormData {}

export interface UpdateReservaRequest extends Partial<ReservaFormData> {}

// Estados posibles de reserva
export type EstadoReserva = 'Confirmada' | 'Pendiente' | 'Cancelada';

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  price?: number;
}