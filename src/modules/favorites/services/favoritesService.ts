// Frontend service for /favoritos API (Sedes)
import type { AddFavoriteResult, CheckFavoriteResponse, FavoriteRecord } from '../types/favorite.types';
import { getApiUrl, getAuthHeaders } from '@/core/config/api';

export interface FavoritesQueryOptions {
  orden?: 'rating' | 'reciente';
}

class FavoritesService {
  async add(idSede: number): Promise<AddFavoriteResult> {
    const res = await fetch(getApiUrl('/favoritos'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ idSede })
    });
    if (res.status === 401) {
      throw new Error('UNAUTHORIZED');
    }
    if (!res.ok) throw new Error(await res.text() || 'Error agregando favorito');
    return res.json();
  }

  async remove(idSede: number): Promise<void> {
    const res = await fetch(getApiUrl(`/favoritos/${idSede}`), {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (res.status === 401) {
      throw new Error('UNAUTHORIZED');
    }
    if (!res.ok) throw new Error('Error removiendo favorito');
  }

  async list(opts?: FavoritesQueryOptions): Promise<FavoriteRecord[]> {
    const params = new URLSearchParams();
    if (opts?.orden) params.append('orden', opts.orden);

    const res = await fetch(getApiUrl(`/favoritos?${params.toString()}`), {
      headers: getAuthHeaders()
    });

    if (res.status === 401) throw new Error('UNAUTHORIZED');
    if (!res.ok) throw new Error('Error obteniendo favoritos');

    const data = await res.json();
    // backend returns array directly or wrapped; normalize
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.favoritos)) return data.data.favoritos;
    return [];
  }

  async check(idSede: number): Promise<boolean> {
    const res = await fetch(getApiUrl(`/favoritos/verificar/${idSede}`), {
      headers: getAuthHeaders()
    });
    if (!res.ok) return false;
    const json: CheckFavoriteResponse = await res.json();
    return json.data.esFavorito;
  }

  async updateMeta(idSede: number, payload: Partial<Pick<FavoriteRecord, 'etiquetas' | 'notas' | 'notificacionesActivas'>>): Promise<FavoriteRecord> {
    const res = await fetch(getApiUrl(`/favoritos/${idSede}`), {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (res.status === 401) {
      throw new Error('UNAUTHORIZED');
    }
    if (!res.ok) throw new Error('Error actualizando favorito');
    const json = await res.json();
    return json.data;
  }
}

export const favoritesService = new FavoritesService();
