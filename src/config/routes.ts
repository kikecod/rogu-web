// ==========================================
// SISTEMA DE RUTAS CENTRALIZADO
// ==========================================

/**
 * Objeto centralizado con todas las rutas de la aplicación
 * Usar esto en lugar de hardcodear rutas en componentes
 * 
 * Uso:
 * import { ROUTES } from '@/config/routes';
 * <Link to={ROUTES.home}>Inicio</Link>
 * navigate(ROUTES.profile);
 */

export const ROUTES = {
  // ==========================================
  // RUTAS PÚBLICAS
  // ==========================================
  home: '/',
  about: '/about',
  howItWorks: '/how-it-works',
  faq: '/faq',
  terms: '/terms-and-conditions',
  // testRoles: '/test-roles', // Página de desarrollo - comentada

  // ==========================================
  // AUTENTICACIÓN
  // ==========================================
  login: '/login',
  signup: '/signup',

  // ==========================================
  // SEDES Y CANCHAS
  // ==========================================
  // Funciones para generar rutas dinámicas
  venue: (idSede: number | string) => `/venues/${idSede}`,
  venueField: (idSede: number | string, idCancha: number | string) => 
    `/venues/${idSede}/fields/${idCancha}`,
  
  // Patrones para Route definitions (con parámetros)
  venuePattern: '/venues/:idSede',
  venueFieldPattern: '/venues/:idSede/fields/:idCancha',
  
  // Legacy routes (mantener compatibilidad)
  field: (id: number | string) => `/field/${id}`,
  sede: (id: number | string) => `/sede/${id}`,
  fieldPattern: '/field/:id',
  sedePattern: '/sede/:id',

  // ==========================================
  // RESERVAS / BOOKINGS
  // ==========================================
  checkout: '/checkout',
  bookings: '/bookings',
  bookingConfirmation: (id?: number | string) => 
    id ? `/booking-confirmation/${id}` : '/booking-confirmation',
  bookingConfirmationPattern: '/booking-confirmation/:id',
  bookingConfirmationBase: '/booking-confirmation',

  // ==========================================
  // USUARIO
  // ==========================================
  profile: '/profile',
  favoritos: '/favoritos',

  // ==========================================
  // ADMIN - Panel de Administración
  // ==========================================
  admin: {
    dashboard: '/admin/dashboard',
    usuarios: '/admin/usuarios',
    usuarioDetalle: (id: number | string) => `/admin/usuarios/${id}`,
    verificaciones: '/admin/verificaciones',
    verificacionDuenio: (id: number | string) => `/admin/verificaciones/duenios/${id}`,
    verificacionSede: (id: number | string) => `/admin/verificaciones/sedes/${id}`,
    sedes: '/admin/sedes',
    sedesNueva: '/admin/sedes/nueva',
    sedeDetalle: (id: number | string) => `/admin/sedes/${id}`,
    sedeEditar: (id: number | string) => `/admin/sedes/${id}/editar`,
    canchas: '/admin/canchas',
    reportes: '/admin/reportes',
    reporteDetalle: (id: number | string) => `/admin/reportes/${id}`,
    analytics: '/admin/analytics',
    moderacion: '/admin/moderacion',
    configuracion: '/admin/configuracion',
    logs: '/admin/logs',
  },

  // ==========================================
  // DUEÑO - Gestión de Espacios
  // ==========================================
  owner: {
    mode: '/owner-mode', // Nueva ruta principal para Modo Dueño
    dashboard: '/owner/dashboard',
    spaces: '/owner/spaces',
    adminSpaces: '/admin-spaces', // Deprecado - usar mode
    hostSpace: '/host-space',
    resenas: '/owner/resenas',
    spaceDetail: (id: number | string) => `/owner/spaces/${id}`,
    analytics: (idSede: number | string) => `/owner/spaces/${idSede}/analytics`,
    reservations: (idSede: number | string) => `/owner/spaces/${idSede}/reservations`,
  },

  // ==========================================
  // CONTROLADOR - Escaneo QR
  // ==========================================
  controller: {
    scan: '/controller/scan',
    verify: (qrCode: string) => `/controller/verify/${qrCode}`,
  },
} as const;

/**
 * Rutas que requieren autenticación
 */
export const PROTECTED_ROUTES = [
  ROUTES.profile,
  ROUTES.favoritos,
  ROUTES.bookings,
  ROUTES.checkout,
  ...Object.values(ROUTES.admin),
  ...Object.values(ROUTES.owner),
  ...Object.values(ROUTES.controller),
];

/**
 * Rutas exclusivas para administradores
 */
export const ADMIN_ROUTES = Object.values(ROUTES.admin);

/**
 * Rutas exclusivas para dueños
 */
export const OWNER_ROUTES = Object.values(ROUTES.owner);

/**
 * Rutas exclusivas para controladores
 */
export const CONTROLLER_ROUTES = Object.values(ROUTES.controller);

/**
 * Helper para verificar si una ruta requiere autenticación
 */
export const isProtectedRoute = (path: string): boolean => {
  return PROTECTED_ROUTES.some(route => {
    if (typeof route === 'string') {
      return path.startsWith(route);
    }
    return false;
  });
};

/**
 * Helper para verificar si una ruta es de admin
 */
export const isAdminRoute = (path: string): boolean => {
  return path.startsWith('/admin');
};

/**
 * Helper para verificar si una ruta es de dueño
 */
export const isOwnerRoute = (path: string): boolean => {
  return path.startsWith('/owner');
};

/**
 * Helper para verificar si una ruta es de controlador
 */
export const isControllerRoute = (path: string): boolean => {
  return path.startsWith('/controller');
};

export default ROUTES;
