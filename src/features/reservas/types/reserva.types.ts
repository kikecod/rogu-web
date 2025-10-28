/**
 * Feature-level helper types for reserva flows.
 */

export interface Reserva {
  id_reserva: number;
  id_cliente: number;
  id_cancha: number;
  inicia_en: string;
  termina_en: string;
  cantidad_personas: number;
  requiere_aprobacion: boolean;
  monto_base: number;
  monto_extra: number;
  monto_total: number;
  estado: EstadoReserva;
  estado_pago?: string;
  metodo_pago?: string | null;
  codigo_qr?: string | null;
  // Compatibilidad legacy (pendiente de depurar en FE)
  estadoPago?: string;
  metodoPago?: string | null;
  codigoQR?: string | null;
  creado_en: string;
  actualizado_en: string;
  cliente?: any;
  cancha?: any;
  transacciones?: any[];
  pases_acceso?: any[];
  pasesAcceso?: any[];
  pago?: any;
}

export interface ReservaFormData {
  id_cliente: number;
  id_cancha: number;
  inicia_en: string;
  termina_en: string;
  cantidad_personas: number;
  requiere_aprobacion: boolean;
  monto_base: number;
  monto_extra: number;
  monto_total: number;
}

export interface CreateReservaRequest extends ReservaFormData {}

export interface UpdateReservaRequest extends Partial<ReservaFormData> {
  estado?: EstadoReserva;
}

export type EstadoReserva = 'Confirmada' | 'Pendiente' | 'Cancelada';

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  price?: number;
}
