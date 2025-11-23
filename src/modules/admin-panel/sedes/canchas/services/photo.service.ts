import { getApiUrl, getAuthToken } from '@/core/config/api';

export interface PhotoItem {
  idFoto: number;
  urlFoto: string;
  esPrincipal?: boolean;
  orden?: number;
}

const authHeaders = (contentType: string | null = 'application/json') => {
  const token = getAuthToken();
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(contentType && { 'Content-Type': contentType }),
  };
};

// S3 URLs are already complete public URLs, no need for getImageUrl normalization
const sanitize = (foto: any): PhotoItem => ({
  idFoto: foto.idFoto || foto.id || 0,
  esPrincipal: foto.esPrincipal ?? foto.principal ?? false,
  orden: typeof foto.orden === 'number' ? foto.orden : undefined,
  urlFoto: foto.urlFoto || foto.url || foto.imageUrl || '',
});

export const photoService = {
  async listByCancha(idCancha: number): Promise<PhotoItem[]> {
    const response = await fetch(getApiUrl(`/fotos/cancha/${idCancha}`), {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('No se pudieron cargar las fotos');
    const data = await response.json();
    if (!Array.isArray(data)) return [];
    return data.map(sanitize);
  },

  async listBySede(idSede: number): Promise<PhotoItem[]> {
    const response = await fetch(getApiUrl(`/fotos/sede/${idSede}`), {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('No se pudieron cargar las fotos');
    const data = await response.json();
    if (!Array.isArray(data)) return [];
    return data.map(sanitize);
  },

  async uploadCanchaPhoto(idCancha: number, file: File) {
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch(getApiUrl(`/fotos/upload/cancha/${idCancha}`), {
      method: 'POST',
      headers: {
        ...(getAuthToken() && { Authorization: `Bearer ${getAuthToken()}` }),
      },
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message || 'No se pudo subir la foto');
    }
  },

  async uploadSedePhoto(idSede: number, file: File) {
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch(getApiUrl(`/fotos/upload/sede/${idSede}`), {
      method: 'POST',
      headers: {
        ...(getAuthToken() && { Authorization: `Bearer ${getAuthToken()}` }),
      },
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message || 'No se pudo subir la foto');
    }
  },

  async delete(photoId: number) {
    const response = await fetch(getApiUrl(`/fotos/${photoId}`), {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('No se pudo eliminar la foto');
  },

  async setPrincipal(photoId: number, esPrincipal = true) {
    const response = await fetch(getApiUrl(`/fotos/${photoId}`), {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ esPrincipal }),
    });
    if (!response.ok) throw new Error('No se pudo actualizar la foto');
  },
};
