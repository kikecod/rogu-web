/**
 * Feature-level helper types for sedes management.
 */

export interface Sede {
  id_sede: number;
  nombre: string;
  direccion?: string;
  ciudad?: string;
  telefono?: string;
  email?: string;
  horarioApertura?: string;
  horarioCierre?: string;
  descripcion?: string;
}

export interface SedeFormData {
  nombre: string;
  direccion?: string;
  ciudad?: string;
  telefono?: string;
  email?: string;
  horarioApertura?: string;
  horarioCierre?: string;
  descripcion?: string;
}

export interface CreateSedeRequest extends SedeFormData {}

export interface UpdateSedeRequest extends Partial<SedeFormData> {}
