/**
 * Tipos específicos para las entidades de Canchas
 */

export interface Cancha {
  idCancha: number;
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
  idCancha: number;
  urlFoto: string;
}

export interface Parte {
  idCancha: number;
  idDisciplina: number;
  disciplina?: Disciplina;
}

export interface Disciplina {
  idDisciplina: number;
  nombre: string;
  categoria: string;
  descripcion: string;
}

export interface CreateParteRequest {
  idCancha: number;
  idDisciplina: number;
}

export interface DeleteParteRequest {
  idCancha: number;
  idDisciplina: number;
}

// Estados posibles de cancha
export type EstadoCancha = 'Disponible' | 'No disponible' | 'Mantenimiento';

// Tipos de superficie
export type TipoSuperficie = 
  | 'Césped natural' 
  | 'Césped sintético' 
  | 'Cemento' 
  | 'Madera' 
  | 'Parquet' 
  | 'Tierra batida';

// Tipos de iluminación
export type TipoIluminacion = 'Natural' | 'LED' | 'Halógena' | 'Fluorescente';