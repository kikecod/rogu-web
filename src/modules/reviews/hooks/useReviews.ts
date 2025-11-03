// Hook para gestionar reseñas
import { useState, useEffect, useCallback } from 'react';
import { reviewService } from '../services/reviewService';
import type { Review, ReviewsResponse, ReviewFilters, CreateReviewData, UpdateReviewData } from '../types/review.types';

export const useReviews = (idCancha: number, initialFilters: ReviewFilters = {}) => {
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReviewFilters>(initialFilters);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await reviewService.getFieldReviews(idCancha, filters);
      setData(response);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar las reseñas');
    } finally {
      setLoading(false);
    }
  }, [idCancha, filters]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const createReview = async (reviewData: CreateReviewData): Promise<Review> => {
    try {
      setError(null);
      const newReview = await reviewService.createReview(reviewData);
      
      // Refrescar lista de reseñas
      await fetchReviews();
      
      return newReview;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la reseña';
      setError(errorMessage);
      throw err;
    }
  };

  const updateReview = async (reviewIdCancha: number, updateData: UpdateReviewData): Promise<Review> => {
    try {
      setError(null);
      const updatedReview = await reviewService.updateReview(reviewIdCancha, updateData);
      
      // Refrescar lista de reseñas
      await fetchReviews();
      
      return updatedReview;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar la reseña';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteReview = async (reviewIdCancha: number): Promise<void> => {
    try {
      setError(null);
      await reviewService.deleteReview(reviewIdCancha);
      
      // Refrescar lista de reseñas
      await fetchReviews();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar la reseña';
      setError(errorMessage);
      throw err;
    }
  };

  const updateFilters = (newFilters: Partial<ReviewFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const refresh = () => {
    fetchReviews();
  };

  return {
    data,
    loading,
    error,
    filters,
    createReview,
    updateReview,
    deleteReview,
    updateFilters,
    refresh,
  };
};

export default useReviews;
