export interface Sede {
  id: string;
  ownerId: string; // ID del dueño/propietario
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  policies: string[]; // Políticas de la sede (ej: "No fumar", "Cancelación 24h antes", etc.)
  images: string[];
  rating: number;
  reviews: number;
  amenities: string[]; // Amenidades generales de la sede
  owner: {
    id: string;
    name: string;
    avatar: string;
  };
}

// Interfaces para los datos de la API
export interface ApiFoto {
  idFoto: number;
  idCancha: number;
  urlFoto: string;
}

export interface ApiSede {
  idSede: number;
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  email: string;
  horarioApertura: string;
  horarioCierre: string;
  descripcion?: string;
}

export interface ApiReserva {
  idReserva: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: string; // "Confirmada" | "Pendiente" | "Cancelada"
}

export interface ApiUsuario {
  nombre: string;
  avatar?: string;
}

export interface ApiResena {
  idResena: string;
  idUsuario: number;
  calificacion: number;
  comentario: string;
  fecha: string;
  usuario?: ApiUsuario;
  editadoEn?: string;
  estado?: 'ACTIVA' | 'OCULTA' | 'ELIMINADA';
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
  creadoEn: string;
  actualizadoEn: string;
  eliminadoEn: string | null;
  parte: any[];
  fotos: ApiFoto[];
  reservas?: any[];
  sede?: ApiSede;
}

export interface ApiCanchaDetalle extends ApiCancha {
  sede: ApiSede;
}

export interface SportField {
  id: string;
  sedeId: string; // ID de la sede a la que pertenece
  name: string;
  description: string;
  images: string[];
  price: number;
  sport: SportType;
  amenities: string[]; // Amenidades específicas de la cancha
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
  // Campos adicionales para detalle
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

export type SportType = 'football' | 'basketball' | 'tennis' | 'volleyball' | 'paddle' | 'hockey';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
}

export interface Booking {
  id: string;
  fieldId: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
}

// Interfaces para crear reservas
export interface CreateReservaRequest {
  idCliente: number;
  idCancha: number;
  iniciaEn: string;           // "YYYY-MM-DDTHH:mm:ss"
  terminaEn: string;          // "YYYY-MM-DDTHH:mm:ss"
  cantidadPersonas: number;
  requiereAprobacion: boolean;
  montoBase: number;
  montoExtra: number;
  montoTotal: number;
}

export interface CreateReservaResponse {
  message: string;
  reserva: {
    idReserva: number;
    idCliente: number;
    idCancha: number;
    iniciaEn: string;
    terminaEn: string;
    cantidadPersonas: number;
    requiereAprobacion: boolean;
    montoBase: string;
    montoExtra: string;
    montoTotal: string;
    creadoEn: string;
    actualizadoEn: string;
  };
}