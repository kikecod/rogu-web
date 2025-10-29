// Booking Repository Port - Interface for booking operations
export interface CreateBookingData {
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

export interface UpdateBookingData {
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

export interface CancelBookingData {
  motivo?: string;
  canal?: string;
}

export interface Booking {
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

export interface BookingRepo {
  findByUserId(userId: number): Promise<Booking[]>;
  create(data: CreateBookingData): Promise<Booking>;
  update(id: number, data: UpdateBookingData): Promise<Booking>;
  cancel(id: number, data: CancelBookingData): Promise<void>;
}
