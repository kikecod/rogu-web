// Frontend service for /favoritos API
import type { AddFavoriteResult, CheckFavoriteResponse, FavoriteRecord } from '../types/favorite.types';
import { getApiUrl, getAuthHeaders } from '@/core/config/api';

export interface FavoritesQueryOptions {
  orden?: string;
  precioMin?: number;
  precioMax?: number;
  superficie?: string;
  disciplinas?: number[];
  match?: 'any' | 'all';
}

class FavoritesService {
  async add(idCancha: number): Promise<AddFavoriteResult> {
    const res = await fetch(getApiUrl('/favoritos'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ idCancha })
    });
    if (res.status === 401) {
      throw new Error('UNAUTHORIZED');
    }
    if (!res.ok) throw new Error(await res.text() || 'Error agregando favorito');
    return res.json();
  }

  async remove(idCancha: number): Promise<void> {
    const res = await fetch(getApiUrl(`/favoritos/${idCancha}`), {
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
    if (opts?.precioMin !== undefined) params.append('precioMin', String(opts.precioMin));
    if (opts?.precioMax !== undefined) params.append('precioMax', String(opts.precioMax));
    if (opts?.superficie) params.append('superficie', opts.superficie);
    if (opts?.disciplinas?.length) {
      // enviar múltiples params disciplinas=1&disciplinas=4
      opts.disciplinas.forEach(id => params.append('disciplinas', String(id)));
    }
    if (opts?.match) params.append('match', opts.match);
    const res = await fetch(getApiUrl(`/favoritos?${params.toString()}`), { headers: getAuthHeaders() });
    if (res.status === 401) throw new Error('UNAUTHORIZED');
    if (!res.ok) throw new Error('Error obteniendo favoritos');
    const data = await res.json();
    // backend returns array directly or wrapped; normalize
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.favoritos)) return data.data.favoritos;
    return [];
  }

  async check(idCancha: number): Promise<boolean> {
    const res = await fetch(getApiUrl(`/favoritos/verificar/${idCancha}`), { headers: getAuthHeaders() });
    if (!res.ok) return false;
    const json: CheckFavoriteResponse = await res.json();
    return json.data.esFavorito;
  }

  async updateMeta(idCancha: number, payload: Partial<Pick<FavoriteRecord, 'etiquetas' | 'notas' | 'notificacionesActivas'>>): Promise<FavoriteRecord> {
    const res = await fetch(getApiUrl(`/favoritos/${idCancha}`), {
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
