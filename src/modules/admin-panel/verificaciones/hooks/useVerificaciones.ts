import { useState, useEffect } from 'react';
import { verificacionesService } from '../services/verificaciones.service';
import type { SedeVerificacion } from '../services/verificaciones.service';

export const useVerificaciones = () => {
  const [sedes, setSedes] = useState<SedeVerificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verificando, setVerificando] = useState<number | null>(null);

  const cargarSedes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await verificacionesService.getPendientes();
      setSedes(data.sedes);
    } catch (err: any) {
      setError(err.message || 'Error al cargar sedes pendientes');
      console.error('Error al cargar verificaciones:', err);
    } finally {
      setLoading(false);
    }
  };

  const verificarSede = async (id: number) => {
    try {
      setVerificando(id);
      await verificacionesService.verificarSede(id);
      // Recargar lista después de verificar
      await cargarSedes();
    } catch (err: any) {
      setError(err.message || 'Error al verificar sede');
      console.error('Error al verificar sede:', err);
      throw err;
    } finally {
      setVerificando(null);
    }
  };

  useEffect(() => {
    cargarSedes();
  }, []);

  return {
    sedes,
    loading,
    error,
    verificando,
    verificarSede,
    recargar: cargarSedes,
  };
};
