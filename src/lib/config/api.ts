// Configuración de la API
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  serverURL: import.meta.env.VITE_SERVER_URL || 'http://localhost:3000', // URL del servidor sin /api
  endpoints: {
    // Endpoints principales
    canchas: '/cancha',
    sedes: '/sede',
    reservas: '/reserva',
    
    // Endpoints relacionados
    disciplinas: '/disciplina',
    partes: '/parte',
    fotos: '/fotos',
    clientes: '/clientes',
    usuarios: '/usuarios',
    auth: '/auth',
    
    // Endpoints de gestión
    denuncia: '/denuncia',
    calificacion: '/califica_cancha',
    cancelacion: '/cancelacion',
  },
  timeout: 10000, // 10 segundos
  retryAttempts: 3, // Número de intentos de reintento
  retryDelay: 1000, // Delay entre intentos (ms)
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
