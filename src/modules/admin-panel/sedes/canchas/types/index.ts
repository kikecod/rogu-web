import type { SedeCanchasFilters } from '@/venues/types/venue-search.types';

export interface DisciplinaAdmin {
  idDisciplina: number;
  nombre: string;
  categoria?: string;
  descripcion?: string;
}

export interface FotoCanchaAdmin {
  idFoto: number;
  urlFoto: string;
  esPrincipal?: boolean;
  orden?: number;
  tipo?: string;
}

export interface CanchaAdmin {
  idCancha: number;
  nombre: string;
  descripcion?: string;
  superficie?: string;
  cubierta?: boolean;
  activa?: boolean;
  precio?: number;
  ratingPromedio?: number;
  totalResenas?: number;
  dimensiones?: string;
  aforoMax?: number;
  iluminacion?: string;
  estado?: string;
  horaApertura?: string;
  horaCierre?: string;
  disponible?: boolean;
  disciplinas?: DisciplinaAdmin[];
  fotos?: FotoCanchaAdmin[];
  sede?: {
    idSede: number;
    nombre: string;
    ciudad?: string;
    direccion?: string;
    telefono?: string;
    email?: string;
  };
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface CanchaAdminDetail extends CanchaAdmin {
  reglasUso?: string;
  parte?: Array<{
    idParte?: number;
    disciplina?: DisciplinaAdmin;
  }>;
}

export interface CanchasDeSedeResponse {
  idSede: number;
  nombreSede: string;
  total: number;
  canchas: CanchaAdmin[];
}

export interface CanchasFilters extends SedeCanchasFilters {
  estado?: string;
}

export interface CanchaCreateDto {
  idSede: number;
  nombre: string;
  descripcion?: string;
  superficie?: string;
  precio?: number;
  dimensiones?: string;
  aforoMax?: number;
  iluminacion?: string;
  cubierta?: boolean;
  horaApertura?: string;
  horaCierre?: string;
  estado?: string;
  disciplinas?: number[];
}

export interface CanchaUpdateDto extends Partial<Omit<CanchaCreateDto, 'idSede'>> {}
