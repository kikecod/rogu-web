import { useCallback, useEffect, useState } from 'react';
import { canchasService } from '../services/canchas.service';
import type { CanchaAdmin, CanchasFilters } from '../types';

const filtrosIniciales: CanchasFilters = {};

interface UseCanchasResultado {
  canchas: CanchaAdmin[];
  loading: boolean;
  error: string | null;
  total: number;
  sedeNombre: string;
  filtros: CanchasFilters;
  actualizarFiltros: (nuevosFiltros: Partial<CanchasFilters>) => void;
  limpiarFiltros: () => void;
  recargar: () => void;
}

export const useCanchasDeSede = (
  idSede?: number,
  filtrosCustom?: Partial<CanchasFilters>
): UseCanchasResultado => {
  const [canchas, setCanchas] = useState<CanchaAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [sedeNombre, setSedeNombre] = useState('');
  const [filtros, setFiltros] = useState<CanchasFilters>({
    ...filtrosIniciales,
    ...filtrosCustom,
  });

  const cargar = useCallback(async () => {
    if (!idSede) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const datos = await canchasService.getBySede(idSede, filtros);
      setCanchas(datos.canchas);
      setTotal(datos.total);
      setSedeNombre(datos.nombreSede);
    } catch (err: any) {
      console.error('Error cargando canchas de sede:', err);
      setError(err?.message || 'No se pudieron cargar las canchas');
      setCanchas([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [idSede, filtros]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const actualizarFiltros = useCallback((nuevosFiltros: Partial<CanchasFilters>) => {
    setFiltros((prev) => ({ ...prev, ...nuevosFiltros }));
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltros({ ...filtrosIniciales });
  }, []);

  const recargar = useCallback(() => {
    cargar();
  }, [cargar]);

  return {
    canchas,
    loading,
    error,
    total,
    sedeNombre,
    filtros,
    actualizarFiltros,
    limpiarFiltros,
    recargar,
  };
};
