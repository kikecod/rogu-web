import { useState, useEffect, useCallback } from 'react';
import { sedesService } from '../services/sedes.service';
import type { Sede, FiltrosSedes, RespuestaListaSedes } from '../types';

interface UseSedesResult {
  sedes: Sede[];
  loading: boolean;
  error: string | null;
  total: number;
  pagina: number;
  totalPaginas: number;
  filtros: FiltrosSedes;
  actualizarFiltros: (nuevosFiltros: Partial<FiltrosSedes>) => void;
  limpiarFiltros: () => void;
  cambiarPagina: (nuevaPagina: number) => void;
  recargar: () => void;
}

const filtrosIniciales: FiltrosSedes = {
  page: 1,
  limit: 12,
  ordenarPor: 'fecha',
  ordenDireccion: 'desc',
};

export const useSedes = (filtrosCustom?: Partial<FiltrosSedes>): UseSedesResult => {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [filtros, setFiltros] = useState<FiltrosSedes>({
    ...filtrosIniciales,
    ...filtrosCustom,
  });

  const cargarSedes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const respuesta: RespuestaListaSedes = await sedesService.getAll(filtros);

      setSedes(respuesta.sedes || []);
      setTotal(respuesta.total || 0);
      setPagina(respuesta.pagina || 1);
      setTotalPaginas(respuesta.totalPaginas || 1);
    } catch (err: any) {
      console.error('Error al cargar sedes:', err);
      setError(err.message || 'Error al cargar las sedes');
      setSedes([]);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    cargarSedes();
  }, [cargarSedes]);

  const actualizarFiltros = useCallback((nuevosFiltros: Partial<FiltrosSedes>) => {
    setFiltros((prev) => {
      // Si cambia cualquier filtro que NO sea 'page', resetear a página 1
      const debeResetearPagina = Object.keys(nuevosFiltros).some(key => key !== 'page');
      
      return {
        ...prev,
        ...nuevosFiltros,
        page: debeResetearPagina && nuevosFiltros.page === undefined ? 1 : (nuevosFiltros.page || prev.page),
      };
    });
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltros(filtrosIniciales);
  }, []);

  const cambiarPagina = useCallback((nuevaPagina: number) => {
    setFiltros((prev) => ({ ...prev, page: nuevaPagina }));
  }, []);

  const recargar = useCallback(() => {
    cargarSedes();
  }, [cargarSedes]);

  return {
    sedes,
    loading,
    error,
    total,
    pagina,
    totalPaginas,
    filtros,
    actualizarFiltros,
    limpiarFiltros,
    cambiarPagina,
    recargar,
  };
};
