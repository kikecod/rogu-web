export interface FavoriteFoto {
  idFoto?: number;
  urlFoto: string; // backend principal field
  descripcion?: string | null;
  creadoEn?: string;
}

export interface FavoriteCancha {
  idCancha: number;
  nombre: string;
  superficie?: string;
  precio?: number;
  cubierta?: boolean;
  iluminacion?: string;
  aforoMax?: number;
  fotos?: FavoriteFoto[]; // backend returns {urlFoto}
  rating?: number;
  numReviews?: number;
  parte?: Array<{
    idParte?: number;
    idDisciplina?: number;
    disciplina?: { idDisciplina: number; nombre: string };
  }>;
}

export interface FavoriteRecord {
  idCancha: number;
  idCliente: number;
  creadoEn: string;
  notificacionesActivas: boolean;
  etiquetas?: string[];
  notas?: string | null;
  cancha?: FavoriteCancha; // cuando el backend la incluya en el find
}

export interface FavoritesResponse {
  success: boolean;
  data: FavoriteRecord[] | { favoritos: FavoriteRecord[] } | any;
}

export interface CheckFavoriteResponse {
  success: boolean;
  data: { esFavorito: boolean };
}

export interface AddFavoriteResult {
  success: boolean;
  data: FavoriteRecord;
}
