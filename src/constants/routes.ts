// routes.ts
const PARAM_TOKEN = /:([A-Za-z0-9_]+)/g;

export const ROUTE_PATHS = {
  // Público / Marketing / Info
  HOME: '/', // página de inicio
  TERMS: '/terminos', // términos y condiciones
  PRIVACY: '/privacidad', // 
  COOKIES: '/cookies',
  ABOUT: '/about',
  ABOUT_VISION: '/about/vision',
  ABOUT_MISSION: '/about/mission',
  POLICIES: '/policies',
  CONTACT: '/contact',
  EXPLORE: '/explore',
  SEARCH: '/search',
  HOW_IT_WORKS: '/como-funciona',
  FAQ: '/faq',
  HELP: '/ayuda',
  TERMS_EN: '/terms',
  PRIVACY_EN: '/privacy',

  // Auth (visitables sin sesión)
  LOGIN: '/auth/login',  // implementado
  REGISTER: '/auth/register',  // implementado
  RESET_PASSWORD: '/auth/reset-password',  // no implementado
  NEW_PASSWORD: '/auth/new-password',  // no implementado

  // Paramétricas públicas (detalle)
  COURT_DETAIL: '/court/:id',  // no implementado
  SPORT_FIELD_DETAIL: '/field/:id', 
  SEDE_DETAIL: '/sede/:id', // DATOS MUERTOS Q NO SON DE LA BASE DE DATOS PERO TIENE UNA IDEA

  // Usuario (CLIENTE)
  USER_HOME: '/user', // no implementado
  CHECKOUT: '/checkout', // q es checkout ? es para pagar ?  no implementado
  CHECKOUT_SUCCESS: '/checkout/success', // no implementado
  BOOKING_CONFIRMATION: '/booking-confirmation', // no implementado
  BOOKINGS: '/bookings',  // listado de reservas implementado
  BOOKING_QR: '/bookings/:id/qr', // no implementado
  PROFILE: '/profile',  // perfil de usuario no implementado IMPORTANTE POR AHORA

  // Dueño (DUENIO)
  OWNER_DASHBOARD: '/owner/dashboard',  // panel de control implementado
  OWNER_VENUES: '/owner/venues',  // listado de sedes implementado
  OWNER_VENUE_CREATE: '/owner/venues/new',  // crear nueva sede implementado
  OWNER_VENUE_DETAIL: '/owner/venues/:id',  // detalle sede de una sede específica implementado
  OWNER_COURTS: '/owner/courts',  // listado canchas no implementado
  OWNER_COURT_CREATE: '/owner/courts/new/:sedeId?',  // crear cancha para una sede
  OWNER_COURT_DETAIL: '/owner/courts/:id',  // detalle cancha implementado
  OWNER_PRICING: '/owner/pricing',  // configuracion de precios no implementado
  OWNER_CALENDAR: '/owner/calendar',  // calendario de reservas no implementado
  OWNER_RESERVATIONS: '/owner/reservations',  // listado de reservas implementado
  OWNER_STAFF: '/owner/staff',  // personal y permisos no implementado
  OWNER_POSTULATIONS: '/owner/postulations',  // postulaciones para dueños no implementado
  HOST: '/host',  // cuando la postulacion es aceptada, devuelve esta pagina por unica vez

  // Controlador (CONTROLADOR)
  CONTROL_SCAN: '/control/scan', // NO IMPLEMENTADO
  CONTROL_HISTORY: '/control/history', // NO IMPLEMENTADO
  CONTROLLER_SCAN: '/controller/scan',  // NO IMPLEMENTADO
  CONTROLLER_HISTORY: '/controller/history',  // NO IMPLEMENTADO

  // Admin (ADMIN)
  ADMIN_HOME: '/admin', // panel de admin no implementado
  ADMIN_APPLICATIONS: '/admin/applications', // postulaciones no implementado
  ADMIN_USERS: '/admin/users',  // gestion de usuarios no implementado
  ADMIN_ROLES: '/admin/roles',  // gestion de roles no implementado
  ADMIN_VENUES: '/admin/venues',  // gestion de sedes no implementado
  ADMIN_COURTS: '/admin/courts',  // gestion de canchas no implementado
  ADMIN_RESERVATIONS: '/admin/reservations',  // gestion de reservas no implementado
  ADMIN_PAYMENTS: '/admin/payments',  // gestion de pagos no implementado 
  ADMIN_CMS: '/admin/cms',  // gestion de contenido no implementado
  ADMIN_SPACES: '/admin-spaces',  // Página de administración de espacios (no implementado)

  // Misceláneo / pruebas
  TEST_ROLES: '/test-roles',  // página de prueba de roles no implementado
} as const;

export type RouteKey = keyof typeof ROUTE_PATHS;

// ---- Paramétricas ----
export type ParametricRouteKey =
  | 'COURT_DETAIL'
  | 'SPORT_FIELD_DETAIL'
  | 'SEDE_DETAIL'
  | 'BOOKING_QR';

type RouteParams = {
  COURT_DETAIL: { id: string | number };
  SPORT_FIELD_DETAIL: { id: string | number };
  SEDE_DETAIL: { id: string | number };
  BOOKING_QR: { id: string | number };
};

// ---- Roles ----
export type AppRole = 'CLIENTE' | 'DUENIO' | 'CONTROLADOR' | 'ADMIN';

// Claves por “grupo” base
export const PUBLIC_ROUTE_KEYS: Readonly<RouteKey[]> = [
  'HOME','TERMS','PRIVACY','COOKIES','ABOUT','ABOUT_VISION','ABOUT_MISSION',
  'POLICIES','CONTACT','EXPLORE','SEARCH','HOW_IT_WORKS','FAQ','HELP',
  'TERMS_EN','PRIVACY_EN',
  // detalles visibles para cualquiera
  'COURT_DETAIL','SPORT_FIELD_DETAIL','SEDE_DETAIL',
];

export const AUTH_ROUTE_KEYS: Readonly<RouteKey[]> = [
  'LOGIN','REGISTER','RESET_PASSWORD','NEW_PASSWORD',
];

export const CLIENTE_ROUTE_KEYS: Readonly<RouteKey[]> = [
  'USER_HOME','CHECKOUT','CHECKOUT_SUCCESS','BOOKING_CONFIRMATION','BOOKINGS','BOOKING_QR','PROFILE',
];

export const DUENIO_ROUTE_KEYS: Readonly<RouteKey[]> = [
  'OWNER_DASHBOARD','OWNER_VENUES','OWNER_VENUE_CREATE','OWNER_COURTS','OWNER_COURT_CREATE','OWNER_PRICING',
  'OWNER_CALENDAR','OWNER_RESERVATIONS','OWNER_STAFF','OWNER_POSTULATIONS','HOST',
];

export const CONTROLADOR_ROUTE_KEYS: Readonly<RouteKey[]> = [
  'CONTROL_SCAN','CONTROL_HISTORY','CONTROLLER_SCAN','CONTROLLER_HISTORY',
];

export const ADMIN_ROUTE_KEYS: Readonly<RouteKey[]> = [
  'ADMIN_HOME','PROFILE','ADMIN_APPLICATIONS','ADMIN_USERS','ADMIN_ROLES',
  'ADMIN_VENUES','ADMIN_COURTS','ADMIN_RESERVATIONS','ADMIN_PAYMENTS',
  'ADMIN_CMS','ADMIN_SPACES',
];

// Mapa role -> keys
export const ROUTE_KEYS_BY_ROLE: Readonly<Record<AppRole, Readonly<RouteKey[]>>> = {
  CLIENTE: CLIENTE_ROUTE_KEYS,
  DUENIO: DUENIO_ROUTE_KEYS,
  CONTROLADOR: CONTROLADOR_ROUTE_KEYS,
  ADMIN: ADMIN_ROUTE_KEYS,
} as const;

// ---- Helpers de paths (compatibles con tu código actual) ----
export const getRoutePath = <K extends RouteKey>(key: K): (typeof ROUTE_PATHS)[K] =>
  ROUTE_PATHS[key];

export const buildRoutePath = (path: string, params: Record<string, string | number> = {}) => {
  return path.replace(PARAM_TOKEN, (_, rawKey: string) => {
    if (!(rawKey in params)) {
      throw new Error(`Missing parameter "${rawKey}" for path "${path}"`);
    }
    return encodeURIComponent(String(params[rawKey]));
  });
};

export const buildRoute = <K extends ParametricRouteKey>(key: K, params: RouteParams[K]): string => {
  return buildRoutePath(ROUTE_PATHS[key], params);
};

// ---- Helpers de acceso por rol ----
export const getRouteKeysForRoles = (
  roles: AppRole[],
  opts?: { includePublic?: boolean; includeAuth?: boolean }
): RouteKey[] => {
  const includePublic = opts?.includePublic ?? true;
  const includeAuth = opts?.includeAuth ?? false;

  const set = new Set<RouteKey>();
  if (includePublic) PUBLIC_ROUTE_KEYS.forEach(k => set.add(k));
  if (includeAuth) AUTH_ROUTE_KEYS.forEach(k => set.add(k));
  roles.forEach(r => ROUTE_KEYS_BY_ROLE[r].forEach(k => set.add(k)));
  return Array.from(set);
};

export const getPathsForRoles = (
  roles: AppRole[],
  opts?: { includePublic?: boolean; includeAuth?: boolean }
) => {
  // If user is ADMIN, give access to all routes (shortcut)
  if (roles.includes('ADMIN')) {
    // Return a shallow copy of ROUTE_PATHS typed as Partial<Record<RouteKey,string>>
    return { ...(ROUTE_PATHS as unknown as Record<string, string>) } as Partial<Record<RouteKey, string>>;
  }

  const keys = getRouteKeysForRoles(roles, opts);
  return keys.reduce((acc, k) => {
    acc[k] = ROUTE_PATHS[k];
    return acc;
  }, {} as Partial<Record<RouteKey, string>>);
};

export const canAccessRoute = (key: RouteKey, roles: AppRole[]): boolean => {
  if (PUBLIC_ROUTE_KEYS.includes(key)) return true;
  // auth solo para invitados; si ya estás logueado normal, probablemente no quieras entrar
  if (AUTH_ROUTE_KEYS.includes(key)) return true;
  return roles.some(role => ROUTE_KEYS_BY_ROLE[role].includes(key));
};
