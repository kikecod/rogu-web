// Hook para validar si el usuario puede dejar una reseña
import { useState, useEffect } from 'react';
import { reviewService } from '../services/reviewService';
import type { ValidateReviewResponse } from '../types/review.types';

export const useCanReview = (idReserva: number | null) => {
  const [validation, setValidation] = useState<ValidateReviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateReview = async () => {
      if (!idReserva) {
        setValidation(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await reviewService.validateCanReview(idReserva);
        setValidation(response);
      } catch (err) {
        console.error('Error validating review permission:', err);
        setError(err instanceof Error ? err.message : 'Error al validar permiso');
        setValidation(null);
      } finally {
        setLoading(false);
      }
    };

    validateReview();
  }, [idReserva]);

  const revalidate = async () => {
    if (!idReserva) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await reviewService.validateCanReview(idReserva);
      setValidation(response);
    } catch (err) {
      console.error('Error revalidating review permission:', err);
      setError(err instanceof Error ? err.message : 'Error al validar permiso');
      setValidation(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    canReview: validation?.puedeResenar ?? false,
    diasRestantes: validation?.diasRestantes,
    fechaLimite: validation?.fechaLimite,
    razon: validation?.razon,
    loading,
    error,
    revalidate,
  };
};

export default useCanReview;
