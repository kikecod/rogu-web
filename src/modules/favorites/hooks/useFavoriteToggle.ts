import { useCallback, useEffect, useState } from 'react';
import { favoritesService } from '../services/favoritesService';
import { toggleLocalFavorite, getLocalFavorites } from '../lib/localFavorites';

interface UseFavoriteToggleResult {
  isFavorite: boolean;
  loading: boolean;
  toggle: () => Promise<void>;
}

export function useFavoriteToggle(idSede: number): UseFavoriteToggleResult {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      if (!token) {
        const localFavs = getLocalFavorites();
        if (mounted) setIsFavorite(localFavs.includes(idSede));
        return;
      }
      try {
        const fav = await favoritesService.check(idSede);
        if (mounted) setIsFavorite(fav);
      } catch {
        if (mounted) setIsFavorite(false);
      }
    };
    init();
    return () => { mounted = false; };
  }, [idSede, token]);

  const toggle = useCallback(async () => {
    if (!token) {
      const nowFav = toggleLocalFavorite(idSede);
      setIsFavorite(nowFav);
      return;
    }
    setLoading(true);
    try {
      if (isFavorite) {
        await favoritesService.remove(idSede);
        setIsFavorite(false);
      } else {
        await favoritesService.add(idSede);
        setIsFavorite(true);
      }
    } catch (e: any) {
      // Si está sin autenticar, usar fallback local
      if (e?.message === 'UNAUTHORIZED') {
        const nowFav = toggleLocalFavorite(idSede);
        setIsFavorite(nowFav);
      } else {
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  }, [idSede, token, isFavorite]);

  return { isFavorite, loading, toggle };
}

