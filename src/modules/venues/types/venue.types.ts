// Venue types
export interface ApiSede {
  idSede: number;
  nombre: string;
  descripcion: string;
  country: string;
  countryCode: string;
  stateProvince: string;
  city: string;
  district: string;
  addressLine: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  timezone: string;
  telefono: string;
  email: string;
  politicas: string;
  estado: string;
  NIT: string;
  LicenciaFuncionamiento: string;
  // Campos opcionales para compatibilidad
  direccion?: string; // Deprecado - usar addressLine
  ciudad?: string; // Deprecado - usar city
  horarioApertura?: string;
  horarioCierre?: string;
}

// Nueva interface para el formulario de creación/edición
export interface SedeFormData {
  nombre: string;
  descripcion: string;
  country: string;
  countryCode: string;
  stateProvince: string;
  city: string;
  district: string;
  addressLine: string;
  postalCode: string;
  latitude: number | null;
  longitude: number | null;
  timezone: string;
  telefono: string;
  email: string;
  politicas: string;
  estado: string;
  NIT: string;
  LicenciaFuncionamiento: string;
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
