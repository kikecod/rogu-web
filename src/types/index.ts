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
}

export interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
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