import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FavoriteRecord } from '../types/favorite.types';
import { favoritesService, type FavoritesQueryOptions } from '../services/favoritesService';
import { getLocalFavorites } from '../lib/localFavorites';

export function useFavorites(filters?: Pick<FavoritesQueryOptions, 'precioMin' | 'precioMax' | 'superficie' | 'disciplinas' | 'match'>) {
  const [favorites, setFavorites] = useState<FavoriteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'reciente' | 'rating' | 'precio-asc' | 'precio-desc'>('reciente');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const data = await favoritesService.list({ orden: sortBy, ...filters });
      setFavorites(data);
      setError(null);
    } catch (e: any) {
      if (e?.message === 'UNAUTHORIZED' || !token) {
        // Fallback listado local sin autenticar
        const ids = getLocalFavorites();
        const now = new Date().toISOString();
        const localFavs: FavoriteRecord[] = ids.map(id => ({
          idCancha: id,
          idCliente: 0,
          creadoEn: now,
          notificacionesActivas: false,
        }));
        // Aplicar filtros simples en cliente
        // No tenemos datos de cancha en modo offline aún, dejamos la lista tal cual
        setFavorites(localFavs);
        setError(null);
      } else {
        setError(e?.message || 'Error cargando favoritos');
      }
    } finally {
      setLoading(false);
    }
  }, [sortBy, JSON.stringify(filters), token]);

  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  const removeFavorite = useCallback(async (idCancha: number) => {
    try {
      await favoritesService.remove(idCancha);
      setFavorites(prev => prev.filter(f => f.idCancha !== idCancha));
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Filtro adicional en cliente como refuerzo (por si backend no aplica)
  const filtered = useMemo(() => {
    let arr = [...favorites];
    if (filters?.disciplinas && filters.disciplinas.length) {
      arr = arr.filter(f => {
        const parte = (f.cancha as any)?.parte as Array<{ idDisciplina: number }> | undefined;
        if (!parte?.length) return false;
        const ids = parte.map(p => p.idDisciplina);
        if (filters.match === 'all') {
          return filters.disciplinas!.every(d => ids.includes(d));
        }
        return ids.some(id => filters.disciplinas!.includes(id));
      });
    }
    if (filters?.precioMin !== undefined) {
      arr = arr.filter(f => (f.cancha?.precio ?? Number.MAX_SAFE_INTEGER) >= (filters.precioMin as number));
    }
    if (filters?.precioMax !== undefined) {
      arr = arr.filter(f => (f.cancha?.precio ?? 0) <= (filters.precioMax as number));
    }
    return arr;
  }, [favorites, filters]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sortBy) {
      case 'precio-asc': return arr.sort((a,b) => (a.cancha?.precio ?? 0) - (b.cancha?.precio ?? 0));
      case 'precio-desc': return arr.sort((a,b) => (b.cancha?.precio ?? 0) - (a.cancha?.precio ?? 0));
      case 'rating': return arr.sort((a,b) => (b.cancha?.rating ?? 0) - (a.cancha?.rating ?? 0));
      default: return arr.sort((a,b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime());
    }
  }, [filtered, sortBy]);

  return { favorites: sorted, loading, error, fetchFavorites, removeFavorite, sortBy, setSortBy };
}
