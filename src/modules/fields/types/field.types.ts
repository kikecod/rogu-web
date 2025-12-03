// Field types
export type SportType = 'football' | 'basketball' | 'tennis' | 'volleyball' | 'paddle' | 'hockey';

export interface ApiFoto {
  idFoto: number;
  idCancha: number;
  urlFoto: string;
}

export interface ApiReserva {
  idReserva: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: string;
}

export interface ApiReservaUsuario {
  idReserva: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: 'Confirmada' | 'Pendiente' | 'Cancelada' | 'Completada'; // ⭐ Agregado 'Completada'
  completadaEn: string | null; // Fecha en que se completó la reserva
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

export interface ApiResena {
  idResena: string;
  idUsuario: number;
  calificacion: number;
  comentario: string;
  fecha: string;
  usuario?: {
    nombre: string;
    avatar?: string;
  };
}

export interface ApiCancha {
  idCancha: number;
  id_Sede: number;
  nombre: string;
  superficie: string;
  cubierta: boolean;
  aforoMax: number;
  dimensiones: string;
  reglasUso: string;
  iluminacion: string;
  estado: string;
  precio: string;
  horaApertura: string; // Formato: "HH:mm:ss" o "HH:mm"
  horaCierre: string;   // Formato: "HH:mm:ss" o "HH:mm"
  creadoEn: string;
  actualizadoEn: string;
  eliminadoEn: string | null;
  parte: any[];
  fotos: ApiFoto[];
  reservas?: any[];
  sede?: any;
}

export interface ApiCanchaDetalle extends ApiCancha {
  sede: any;
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

export interface CreateReservaResponse {
  message: string;
  reserva: any;
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

export interface UpdateReservaResponse {
  message: string;
  reserva: any;
}

export interface CancelReservaRequest {
  motivo?: string;
  canal?: string;
}

export interface CancelReservaResponse {
  message: string;
  cancelacion: any;
}

export interface SportField {
  id: string;
  sedeId: string;
  name: string;
  description: string;
  images: string[];
  price: number;
  sport: SportType;
  amenities: string[];
  availability: TimeSlot[];
  rating: number;
  reviews: number;
  location?: {
    address?: string;
    city?: string;
    coordinates?: { lat: number; lng: number };
  };
  owner?: {
    id: string;
    name: string;
    avatar: string;
  };
  surface?: string;
  size?: string;
  indoor?: boolean;
  lighting?: string;
  rules?: string[];
  capacity?: number;
  openingHours?: {
    open: string;
    close: string;
  };
  reviewsList?: Review[];
  // Lista normalizada de nombres de disciplinas asociadas (derivada de partes)
  disciplinas?: string[];
}

export interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
  price?: number;
}

export interface Review {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  rating: number;
  date: string;
  comment: string;
}

export interface CrearCanchaDto {
  idSede: number;
  nombre: string;
  superficie: string;
  cubierta: boolean;
  aforoMax: number;
  dimensiones: string;
  reglasUso: string;
  iluminacion: string;
  estado: string;
  precio: number;
  horaApertura: string;
  horaCierre: string;
}

export interface EditarCanchaDto extends Partial<CrearCanchaDto> { }
