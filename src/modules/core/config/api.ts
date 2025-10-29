// API Configuration
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  serverURL: import.meta.env.VITE_SERVER_URL || 'http://localhost:3000', // URL del servidor sin /api
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
  return `${API_CONFIG.baseURL}${endpoint}`;
};

// Helper para obtener URL de imagen (las imágenes están en el servidor, no en /api)
export const getImageUrl = (path: string): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  // Las imágenes están directamente en el servidor, no bajo /api
  return `${API_CONFIG.serverURL}${path}`;
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
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};
