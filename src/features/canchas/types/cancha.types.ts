/**
 * Feature-level helper types for cancha management flows.
 * These models adapt backend payloads to UI form needs (camelCase fields, etc.).
 */

export interface Cancha {
  id_cancha: number;
  nombre: string;
  superficie: string;
  cubierta: boolean;
  aforoMax: number;
  dimensiones: string;
  reglasUso: string;
  iluminacion: string;
  estado: string;
  precio: number;
  idSede?: number;
  fotos?: Foto[];
  parte?: Parte[];
  reservas?: any[];
}

export interface CanchaFormData {
  nombre: string;
  superficie: string;
  cubierta: boolean;
  aforoMax: number;
  dimensiones: string;
  reglasUso: string;
  iluminacion: string;
  estado: string;
  precio: number;
  idSede?: number;
}

export interface CreateCanchaRequest extends CanchaFormData {
  idSede: number;
}

export interface UpdateCanchaRequest extends Partial<CanchaFormData> {}

export interface Foto {
  idFoto: number;
  id_cancha: number;
  urlFoto: string;
}

export interface Parte {
  id_cancha: number;
  id_disciplina: number;
  disciplina?: Disciplina;
}

export interface Disciplina {
  id_disciplina: number;
  nombre: string;
  categoria: string;
  descripcion: string;
}

export interface CreateParteRequest {
  id_cancha: number;
  id_disciplina: number;
}

export interface DeleteParteRequest {
  id_cancha: number;
  id_disciplina: number;
}

export type EstadoCancha = 'Disponible' | 'No disponible' | 'Mantenimiento';

export type TipoSuperficie =
  | 'Cesped natural'
  | 'Cesped sintetico'
  | 'Cemento'
  | 'Madera'
  | 'Parquet'
  | 'Tierra batida';

export type TipoIluminacion = 'Natural' | 'LED' | 'Halogena' | 'Fluorescente';
