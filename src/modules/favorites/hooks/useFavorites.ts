import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FavoriteRecord } from '../types/favorite.types';
import { favoritesService } from '../services/favoritesService';
import { getLocalFavorites } from '../lib/localFavorites';


export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'reciente' | 'rating'>('reciente');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const data = await favoritesService.list({ orden: sortBy });
      setFavorites(data);
      setError(null);
    } catch (e: any) {
      if (e?.message === 'UNAUTHORIZED' || !token) {
        // Fallback listado local sin autenticar
        const ids = getLocalFavorites();
        const now = new Date().toISOString();
        const localFavs: FavoriteRecord[] = ids.map(id => ({
          idSede: id,
          idCliente: 0,
          creadoEn: now,
          notificacionesActivas: false,
        }));
        setFavorites(localFavs);
        setError(null);
      } else {
        setError(e?.message || 'Error cargando favoritos');
      }
    } finally {
      setLoading(false);
    }
  }, [sortBy, token]);

  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  const removeFavorite = useCallback(async (idSede: number) => {
    try {
      await favoritesService.remove(idSede);
      setFavorites(prev => prev.filter(f => f.idSede !== idSede));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const sorted = useMemo(() => {
    const arr = [...favorites];
    switch (sortBy) {
      case 'rating':
        return arr.sort((a, b) => (b.sede?.ratingFinal ?? 0) - (a.sede?.ratingFinal ?? 0));
      default:
        return arr.sort((a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime());
    }
  }, [favorites, sortBy]);

  return { favorites: sorted, loading, error, fetchFavorites, removeFavorite, sortBy, setSortBy };
}

