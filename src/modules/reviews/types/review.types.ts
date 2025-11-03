// Review Types - Sistema de Reseñas y Calificaciones

export interface Review {
  idCliente: number;
  idCancha: number;
  idReserva: number;
  cliente: {
    nombre: string;
    avatar: string;
  };
  puntaje: number;
  comentario: string | null;
  creadaEn: string;
  editadaEn: string | null;
  estado: 'ACTIVA' | 'ELIMINADA';
}

export interface ReviewsResponse {
  ratingPromedio: number;
  totalResenas: number;
  distribucion: {
    [key: string]: number; // "5": 18, "4": 4, etc.
  };
  resenas: Review[];
  paginacion: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}

export interface CreateReviewData {
  idReserva: number;
  puntaje: number;
  comentario?: string;
}

export interface UpdateReviewData {
  puntaje?: number;
  comentario?: string;
}

export interface ValidateReviewResponse {
  puedeResenar: boolean;
  diasRestantes?: number;
  fechaLimite?: string;
  razon?: string;
}

export interface PendingReview {
  idReserva: number;
  idCliente: number;
  idCancha: number;
  iniciaEn: string;
  terminaEn: string;
  completadaEn: string; // ⭐ CAMBIADO: Ahora usa completadaEn para calcular días restantes
  estado: string;
  cancha: {
    idCancha: number;
    nombre: string;
    sede: {
      nombre: string;
    };
  };
  diasRestantes: number;
  fechaLimite: string;
}

export type ReviewSortOrder = 'recientes' | 'mejores' | 'peores';

export interface ReviewFilters {
  page?: number;
  limit?: number;
  ordenar?: ReviewSortOrder;
}
