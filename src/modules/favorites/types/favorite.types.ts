export interface FavoriteFoto {
  idFoto?: number;
  url: string;
  descripcion?: string | null;
  creadoEn?: string;
}

export interface FavoriteCancha {
  idCancha: number;
  nombre: string;
}

export interface FavoriteSede {
  idSede: number;
  nombre: string;
  descripcion?: string;
  ratingFinal?: number;
  fotos?: FavoriteFoto[];
  canchas?: FavoriteCancha[];
}

export interface FavoriteRecord {
  idSede: number;
  idCliente: number;
  creadoEn: string;
  notificacionesActivas: boolean;
  etiquetas?: string[] | null;
  notas?: string | null;
  sede?: FavoriteSede; // cuando el backend la incluya en el find
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
