// API Configuration
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL,
  serverURL: import.meta.env.VITE_SERVER_URL, // URL del servidor sin /api
  endpoints: {
    canchas: '/cancha',
    sedes: '/sede',
    reservas: '/reserva',
    auth: '/auth',
    perfil: '/perfil',
    personas: '/personas',
  },
  timeout: 10000, // 10 segundos
};

// Helper para construir URLs completas de endpoints API
export const getApiUrl = (endpoint: string): string => {
  const base = API_CONFIG.baseURL.replace(/\/$/, ''); // sin barra al final
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`; // con barra al inicio
  return `${base}${path}`;
};

// Helper para obtener URL de imagen (las imágenes están en el servidor, no en /api)
export const getImageUrl = (path: string): string => {
  if (!path) return '';

  // Si es URL absoluta, normalizar solo si apunta a este servidor
  // y corregir /avatars -> /uploads/avatars cuando sea necesario.
  if (path.startsWith('http')) {
    try {
      const url = new URL(path);
      const server = new URL(API_CONFIG.serverURL);

      // Solo normalizar si el host coincide con el backend
      if (url.host === server.host) {
        const originalPath = url.pathname;
        const normalizedPath = originalPath.startsWith('/uploads/')
          ? originalPath
          : originalPath.startsWith('/avatars/')
            ? `/uploads${originalPath}`
            : originalPath;

        return `${server.origin}${normalizedPath}${url.search || ''}${url.hash || ''}`;
      }

      // Para hosts externos (CDN, etc.) devolver la URL tal cual
      return path;
    } catch {
      return path;
    }
  }

  // Normalización de rutas servidas por Nest estático:
  // El backend sirve el directorio 'uploads' en '/uploads',
  // pero algunos endpoints devuelven paths como '/avatars/...'
  // En ese caso, debemos anteponer '/uploads' para evitar 404.
  const base = API_CONFIG.serverURL.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  const normalized = p.startsWith('/uploads/')
    ? p
    : p.startsWith('/avatars/')
      ? `/uploads${p}`
      : p;
  return `${base}${normalized}`;
};

// Helper para obtener el token de autenticación
export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper para crear headers con autenticación
export const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};
