// Legacy front-end models kept for compatibility with existing UI flows.
// These types represent client-side view models and mock data structures
// that do not mirror the backend schema one-to-one.

import type { Disciplina } from './backend';

export interface LegacySede {
  id: string;
  ownerId: string; // ID del dueno/propietario
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  policies: string[]; // Politicas de la sede (ej: "No fumar", "Cancelacion 24h antes")
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

export interface ApiFoto {
  idFoto: number;
  id_cancha: number;
  urlFoto: string;
}

export interface ApiParte {
  id_cancha: number;
  id_disciplina: number;
  disciplina?: Disciplina | null;
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
  id_reserva: number;
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
  id_usuario: number;
  calificacion: number;
  comentario: string;
  fecha: string;
  usuario?: ApiUsuario;
}

export interface ApiCancha {
  id_cancha: number;
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
  creado_en: string;
  actualizado_en: string;
  eliminadoEn: string | null;
  parte?: ApiParte[];
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
  amenities: string[]; // Amenidades especificas de la cancha
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
  disciplines?: string[];
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

export type SportType =
  | 'football'
  | 'basketball'
  | 'tennis'
  | 'volleyball'
  | 'paddle'
  | 'hockey';

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

export interface CreateReservaRequest {
  id_cliente: number;
  id_cancha: number;
  inicia_en: string; // "YYYY-MM-DDTHH:mm:ss"
  termina_en: string; // "YYYY-MM-DDTHH:mm:ss"
  cantidad_personas: number;
  requiere_aprobacion: boolean;
  monto_base: number;
  monto_extra: number;
  monto_total: number;
}

export interface CreateReservaResponse {
  message: string;
  reserva: {
    id_reserva: number;
    id_cliente: number;
    id_cancha: number;
    inicia_en: string;
    termina_en: string;
    cantidad_personas: number;
    requiere_aprobacion: boolean;
    monto_base: string;
    monto_extra: string;
    monto_total: string;
    creado_en: string;
    actualizado_en: string;
  };
}
