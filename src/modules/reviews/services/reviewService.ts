// Review Service - API calls para sistema de reseñas
import { getApiUrl, getAuthToken } from '@/core/config/api';
import type {
  Review,
  ReviewsResponse,
  CreateReviewData,
  UpdateReviewData,
  ValidateReviewResponse,
  PendingReview,
  ReviewFilters,
} from '../types/review.types';

class ReviewService {
  /**
   * Crear una nueva reseña
   * POST /api/califica-cancha
   */
  async createReview(data: CreateReviewData): Promise<Review> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Debes iniciar sesión para dejar una reseña');
    }

    console.log('📤 Enviando reseña:', data);

    const response = await fetch(getApiUrl('/califica-cancha'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = 'Error al crear la reseña';
      try {
        const errorData = await response.json();
        console.error('❌ Error del servidor:', errorData);
        errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
      } catch {
        const errorText = await response.text();
        console.error('❌ Error (texto):', errorText);
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('✅ Reseña creada:', result);
    return result;
  }

  /**
   * Validar si el usuario puede dejar una reseña para una reserva
   * GET /api/califica-cancha/validar/:idReserva
   */
  async validateCanReview(idReserva: number): Promise<ValidateReviewResponse> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Debes iniciar sesión');
    }

    const response = await fetch(getApiUrl(`/califica-cancha/validar/${idReserva}`), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error al validar permiso de reseña');
    }

    return await response.json();
  }

  /**
   * Obtener reseñas de una cancha
   * GET /api/califica-cancha/cancha/:idCancha
   */
  async getFieldReviews(
    idCancha: number,
    filters: ReviewFilters = {}
  ): Promise<ReviewsResponse> {
    const { page = 1, limit = 10, ordenar = 'recientes' } = filters;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ordenar,
    });

    const response = await fetch(
      getApiUrl(`/califica-cancha/cancha/${idCancha}?${queryParams}`),
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error al cargar las reseñas');
    }

    const result = await response.json();
    console.log('📊 Reseñas recibidas del servidor:', result);

    // Asegurarnos de que ratingPromedio sea un número
    if (result.ratingPromedio !== undefined && result.ratingPromedio !== null) {
      result.ratingPromedio = Number(result.ratingPromedio) || 0;
    } else {
      result.ratingPromedio = 0;
    }

    return result;
  }

  /**
   * Obtener mis reseñas
   * GET /api/califica-cancha/mis-resenas
   */
  async getMyReviews(): Promise<Review[]> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Debes iniciar sesión');
    }

    const response = await fetch(getApiUrl('/califica-cancha/mis-resenas'), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error al cargar tus reseñas');
    }

    return await response.json();
  }

  /**
   * Obtener reservas pendientes de reseñar
   * GET /api/califica-cancha/pendientes
   */
  async getPendingBookingsToReview(): Promise<PendingReview[]> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Debes iniciar sesión');
    }

    const response = await fetch(getApiUrl('/califica-cancha/pendientes'), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error al cargar reservas pendientes');
    }

    return await response.json();
  }

  /**
   * Editar mi reseña
   * PATCH /api/califica-cancha/:idCancha
   */
  async updateReview(idCancha: number, data: UpdateReviewData): Promise<Review> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Debes iniciar sesión');
    }

    const response = await fetch(getApiUrl(`/califica-cancha/${idCancha}`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error al editar la reseña');
    }

    return await response.json();
  }

  /**
   * Eliminar mi reseña
   * DELETE /api/califica-cancha/:idCancha
   */
  async deleteReview(idCancha: number): Promise<void> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Debes iniciar sesión');
    }

    const response = await fetch(getApiUrl(`/califica-cancha/${idCancha}`), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error al eliminar la reseña');
    }

    // 204 No Content - no hay respuesta
    return;
  }

  /**
   * Obtener una reseña específica
   * GET /api/califica-cancha/:idCliente/:idCancha
   */
  async getReview(idCliente: number, idCancha: number): Promise<Review> {
    const response = await fetch(
      getApiUrl(`/califica-cancha/${idCliente}/${idCancha}`),
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error al cargar la reseña');
    }

    return await response.json();
  }
}

// Singleton instance
export const reviewService = new ReviewService();
