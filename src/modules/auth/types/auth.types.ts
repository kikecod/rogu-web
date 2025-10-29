// Auth module types
import type { AppRole } from '@/core/contracts/types/common';

export interface User {
  correo: string;
  usuario: string;
  idPersona: number;
  idUsuario: number;
  roles: string[]; // Array de roles como 'CLIENTE', 'DUENIO', 'ADMIN', etc.
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  // Persona data
  nombres: string;
  paterno: string;
  materno: string;
  telefono: string;
  fechaNacimiento: string;
  genero: string;
  // Usuario data
  usuario: string;
  correo: string;
  contrasena: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  usuario: {
    correo: string;
    usuario: string;
    idPersona: number;
    idUsuario: number;
    roles: AppRole[];
  };
}

export interface RegisterResponse {
  message: string;
  token: string;
  usuario: {
    correo: string;
    usuario: string;
    idPersona: number;
    idUsuario: number;
    roles: AppRole[];
  };
}
