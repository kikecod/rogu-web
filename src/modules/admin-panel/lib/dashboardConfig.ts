import { ROUTES } from '@/config/routes';
import type { EntityCardData, MetricCardData } from '../types';

// ==========================================
// CONFIGURACIÓN DE CARDS DE GESTIÓN
// ==========================================

export const entityCardsConfig: EntityCardData[] = [
  {
    id: 'canchas',
    title: 'Gestión de Canchas',
    description: 'Administrar canchas deportivas',
    badge: {
      text: 'activas',
      value: 53,
    },
    route: ROUTES.admin.canchas,
    icon: '⚽',
    iconColor: 'bg-green-100',
  },
  {
    id: 'espacios',
    title: 'Gestión de Espacios',
    description: 'Administrar espacios deportivos',
    badge: {
      text: 'disponibles',
      value: 10,
    },
    route: ROUTES.admin.sedes,
    icon: '🏟️',
    iconColor: 'bg-blue-100',
  },
  {
    id: 'disciplinas',
    title: 'Gestión de Disciplinas',
    description: 'Administrar disciplinas deportivas',
    badge: {
      text: 'deportes',
      value: 8,
    },
    route: '/admin/disciplinas',
    icon: '🏅',
    iconColor: 'bg-purple-100',
  },
  {
    id: 'personas',
    title: 'Gestión de Personas',
    description: 'Administrar clientes y usuarios',
    badge: {
      text: 'registrados',
      value: 82,
    },
    route: ROUTES.admin.usuarios,
    icon: '👥',
    iconColor: 'bg-yellow-100',
  },
  {
    id: 'reservas',
    title: 'Gestión de Reservas',
    description: 'Administrar reservas del sistema',
    badge: {
      text: 'reservas',
      value: 20,
    },
    route: '/admin/reservas',
    icon: '📅',
    iconColor: 'bg-pink-100',
  },
  {
    id: 'pagos',
    title: 'Gestión de Pagos',
    description: 'Administrar pagos y transacciones',
    badge: {
      text: 'ingresos',
    },
    route: '/admin/pagos',
    icon: '💰',
    iconColor: 'bg-emerald-100',
  },
  {
    id: 'acceso',
    title: 'Control de Acceso',
    description: 'Gestionar acceso QR y asistencias',
    badge: {
      text: 'QRs',
      value: 10,
    },
    route: ROUTES.admin.verificaciones,
    icon: '🔐',
    iconColor: 'bg-indigo-100',
  },
];

// ==========================================
// CONFIGURACIÓN DE CARDS DE MÉTRICAS
// ==========================================

export const metricsCardsConfig: MetricCardData[] = [
  {
    id: 'reservas-hoy',
    label: 'Reservas Hoy',
    value: 156,
    period: 'hoy',
    format: 'number',
    trend: {
      value: 12,
      direction: 'up',
    },
  },
  {
    id: 'ingresos-diarios',
    label: 'Ingresos Diarios',
    value: 3200,
    period: 'hoy',
    format: 'currency',
    trend: {
      value: 8,
      direction: 'up',
    },
  },
  {
    id: 'ocupacion',
    label: 'Ocupación',
    value: 92,
    format: 'percentage',
    helperText: 'Canchas ocupadas',
    trend: {
      value: 5,
      direction: 'up',
    },
  },
  {
    id: 'nuevos-usuarios',
    label: 'Nuevos Usuarios',
    value: 45,
    period: 'hoy',
    format: 'number',
    helperText: 'Registros completados',
    trend: {
      value: 15,
      direction: 'up',
    },
  },
  {
    id: 'reservas-pendientes',
    label: 'Reservas Pendientes',
    value: 23,
    format: 'number',
    helperText: 'Por confirmar',
  },
  {
    id: 'pagos-fallidos',
    label: 'Pagos Fallidos',
    value: 7,
    format: 'number',
    helperText: 'Últimas 24h',
    trend: {
      value: 3,
      direction: 'down',
    },
  },
  {
    id: 'canchas-ocupadas',
    label: 'Canchas Ocupadas',
    value: 48,
    format: 'number',
    helperText: 'En este momento',
  },
  {
    id: 'proximas-reservas',
    label: 'Próximas Reservas',
    value: 12,
    format: 'number',
    helperText: 'Siguiente hora',
  },
];

// ==========================================
// FUNCIÓN PARA OBTENER DATOS DEL DASHBOARD
// ==========================================

/**
 * Esta función debe reemplazarse por una llamada real al backend
 * Por ahora retorna datos estáticos de configuración
 */
export const getDashboardData = async () => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    entityCards: entityCardsConfig,
    metricsCards: metricsCardsConfig,
  };
};

/**
 * Actualizar un card de entidad con datos del backend
 */
export const updateEntityCardData = (
  cardId: string,
  updates: Partial<EntityCardData>
): EntityCardData | undefined => {
  const card = entityCardsConfig.find(c => c.id === cardId);
  if (!card) return undefined;

  return { ...card, ...updates };
};

/**
 * Actualizar un card de métrica con datos del backend
 */
export const updateMetricCardData = (
  cardId: string,
  updates: Partial<MetricCardData>
): MetricCardData | undefined => {
  const card = metricsCardsConfig.find(c => c.id === cardId);
  if (!card) return undefined;

  return { ...card, ...updates };
};
