// Configuracion de la API
// En desarrollo usamos baseURL relativo "/api" para aprovechar el proxy de Vite
// y mantener mismo origen. No dependemos de un puerto específico (5173/5174/...):
// cualquier puerto de Vite en modo DEV funcionará.
const inferDevBaseURL = () => {
  try {
    // Vite expone import.meta.env.DEV en modo desarrollo
    // Esto evita atarnos a un puerto específico (5173) cuando Vite elige otro.
    // Además, si estamos en el navegador, preferimos usar el proxy "/api".
    // En otros entornos (SSR/tests) caemos al backend local por defecto.
    // eslint-disable-next-line no-undef
    if (typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV) {
      return '/api';
    }
    if (typeof window !== 'undefined') {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocalhost) return '/api';
    }
  } catch {
    // ignore
  }
  // Fallback: backend local por defecto
  return 'http://localhost:3000/api';
};

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || inferDevBaseURL(),
  serverURL: import.meta.env.VITE_SERVER_URL || 'http://localhost:3000', // URL del servidor sin /api
  endpoints: {
    // Endpoints principales
    canchas: '/cancha',
    sedes: '/sede',
    reservas: '/reservas',
    bloqueos: '/bloqueos',

    // Endpoints relacionados
    disciplinas: '/disciplina',
    partes: '/parte',
    fotos: '/fotos',
    clientes: '/clientes',
    usuarios: '/usuarios',
    auth: '/auth',

    // Endpoints de gestion
    denuncia: '/denuncia',
    calificacion: '/califica-cancha',
    cancelacion: '/cancelacion',
    pagosRegistrar: '/deudas/registrar',
  },
  timeout: 10000, // 10 segundos
  retryAttempts: 3, // Numero de intentos de reintento
  retryDelay: 1000, // Delay entre intentos (ms)
};

// Helper para construir URLs completas de endpoints API
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.baseURL}${endpoint}`;
};

// Helper para obtener URL de imagen (las imagenes se sirven fuera de /api)
export const getImageUrl = (path: string): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_CONFIG.serverURL}${path}`;
};
