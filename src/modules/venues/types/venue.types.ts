// Venue types
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

export interface Venue {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  policies: string[];
  images: string[];
  rating: number;
  reviews: number;
  amenities: string[];
  owner: {
    id: string;
    name: string;
    avatar: string;
  };
}
