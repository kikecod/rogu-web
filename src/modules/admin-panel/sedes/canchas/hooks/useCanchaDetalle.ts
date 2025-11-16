import { useCallback, useEffect, useState } from 'react';
import { canchasService } from '../services/canchas.service';
import type { CanchaAdminDetail } from '../types';

interface UseCanchaDetalleResult {
  cancha: CanchaAdminDetail | null;
  loading: boolean;
  error: string | null;
  recargar: () => void;
}

export const useCanchaDetalle = (idCancha?: number): UseCanchaDetalleResult => {
  const [cancha, setCancha] = useState<CanchaAdminDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!idCancha) {
      setCancha(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await canchasService.getDetail(idCancha);
      setCancha(data);
    } catch (err: any) {
      console.error('Error al cargar detalle de cancha:', err);
      setError(err?.message || 'No se pudo cargar la cancha');
      setCancha(null);
    } finally {
      setLoading(false);
    }
  }, [idCancha]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const recargar = useCallback(() => {
    cargar();
  }, [cargar]);

  return {
    cancha,
    loading,
    error,
    recargar,
  };
};
