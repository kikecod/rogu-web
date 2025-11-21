import { useState, useEffect } from 'react';
import { sedesService } from '../services/sedes.service';
import type { SedeDetalle } from '../types';

interface UseSedeDetalleResult {
  sede: SedeDetalle | null;
  loading: boolean;
  error: string | null;
  recargar: () => void;
}

export const useSedeDetalle = (idSede: number): UseSedeDetalleResult => {
  const [sede, setSede] = useState<SedeDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarSede = async () => {
    if (!idSede) return;

    try {
      setLoading(true);
      setError(null);

      const respuesta = await sedesService.getById(idSede);
      setSede(respuesta);
    } catch (err: any) {
      console.error('Error al cargar sede:', err);
      setError(err.message || 'Error al cargar la sede');
      setSede(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSede();
  }, [idSede]);

  return {
    sede,
    loading,
    error,
    recargar: cargarSede,
  };
};
