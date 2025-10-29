// Booking types
export interface ApiReservaUsuario {
  idReserva: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: 'Confirmada' | 'Pendiente' | 'Cancelada';
  cancha: {
    idCancha: number;
    nombre: string;
    sede: {
      idSede: number;
      nombre: string;
    };
  };
  montoTotal: number;
  cantidadPersonas: number;
}

export interface CreateReservaRequest {
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

export interface UpdateReservaRequest {
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

export interface CancelReservaRequest {
  motivo?: string;
  canal?: string;
}

export interface Booking {
  id: string;
  fieldId: string;
  fieldName: string;
  fieldImage: string;
  sedeName: string;
  address: string;
  date: string;
  timeSlot: string;
  participants: number;
  price: number;
  totalPaid: number;
  status: 'active' | 'completed' | 'cancelled';
  bookingCode: string;
  rating?: number;
  reviews?: number;
  paymentMethod: 'card' | 'qr';
}
