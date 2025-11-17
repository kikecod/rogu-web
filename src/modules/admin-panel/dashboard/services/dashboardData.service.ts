import { apiClient } from '../../lib/apiClient';
import { adminApiClient } from '../../lib/adminApiClient';
import { ROUTES } from '@/config/routes';
import type { EntityCardData, MetricCardData } from '../../types';

const DASHBOARD_METRICS_ENDPOINT = '/dashboard/metricas';

// ==========================================
// DATOS POR DEFECTO (FALLBACK)
// ==========================================

const getDefaultEntityCards = (): EntityCardData[] => {
  return [
    {
      id: 'sedes',
      title: 'Gestión de Sedes',
      description: 'Administrar sedes deportivas',
      badge: { text: 'disponibles', value: 0 },
      route: ROUTES.admin.sedes,
      icon: '🏟️',
      iconColor: 'bg-blue-100',
    },
    {
      id: 'disciplinas',
      title: 'Gestión de Disciplinas',
      description: 'Administrar disciplinas deportivas',
      badge: { text: 'deportes', value: 0 },
      route: '/admin/disciplinas',
      icon: '🎯',
      iconColor: 'bg-purple-100',
    },
    {
      id: 'personas',
      title: 'Gestión de Personas',
      description: 'Administrar clientes y usuarios',
      badge: { text: 'registrados', value: 0 },
      route: ROUTES.admin.usuarios,
      icon: '👥',
      iconColor: 'bg-yellow-100',
    },
    {
      id: 'reservas',
      title: 'Gestión de Reservas',
      description: 'Administrar reservas del sistema',
      badge: { text: 'reservas', value: 0 },
      route: '/admin/reservas',
      icon: '📅',
      iconColor: 'bg-pink-100',
    },
    {
      id: 'pagos',
      title: 'Gestión de Pagos',
      description: 'Administrar pagos y transacciones',
      badge: { text: 'ingresos' },
      route: '/admin/pagos',
      icon: '💳',
      iconColor: 'bg-emerald-100',
    },
    {
      id: 'acceso',
      title: 'Control de Acceso',
      description: 'Gestionar acceso QR y asistencias',
      badge: { text: 'QRs', value: 0 },
      route: ROUTES.admin.verificaciones,
      icon: '🔐',
      iconColor: 'bg-indigo-100',
    },
  ];
};

const getDefaultMetricsCards = (): MetricCardData[] => {
  return [
    {
      id: 'reservas-hoy',
      label: 'Reservas Hoy',
      value: 0,
      period: 'hoy',
      format: 'number',
    },
    {
      id: 'ingresos-diarios',
      label: 'Ingresos Diarios',
      value: 0,
      period: 'hoy',
      format: 'currency',
    },
    {
      id: 'ocupacion',
      label: 'Ocupación',
      value: 0,
      format: 'percentage',
      helperText: 'Canchas ocupadas',
    },
    {
      id: 'nuevos-usuarios',
      label: 'Nuevos Usuarios',
      value: 0,
      period: 'hoy',
      format: 'number',
      helperText: 'Registros completados',
    },
    {
      id: 'reservas-pendientes',
      label: 'Reservas Pendientes',
      value: 0,
      format: 'number',
      helperText: 'Por confirmar',
    },
    {
      id: 'total-usuarios',
      label: 'Total Usuarios',
      value: 0,
      format: 'number',
      helperText: 'En el sistema',
    },
    {
      id: 'total-canchas',
      label: 'Total Canchas',
      value: 0,
      format: 'number',
      helperText: 'Activas',
    },
    {
      id: 'total-reservas',
      label: 'Total Reservas',
      value: 0,
      format: 'number',
      helperText: 'En el sistema',
    },
  ];
};

const buildEntityCardsFromStats = (stats: any): EntityCardData[] => {
  const cards = getDefaultEntityCards();
  const sedesStats = stats?.sedes ?? {};
  const usuariosStats = stats?.usuarios ?? {};
  const reservasStats = stats?.reservas ?? {};

  const sedesCard = cards.find((card) => card.id === 'sedes');
  if (sedesCard) {
    sedesCard.badge = {
      text: 'activas',
      value: Number(sedesStats.activas ?? sedesStats.verificadas ?? sedesStats.total ?? 0),
    };
  }

  const personasCard = cards.find((card) => card.id === 'personas');
  if (personasCard) {
    personasCard.badge = {
      text: 'registrados',
      value: Number(usuariosStats.total ?? 0),
    };
  }

  const reservasCard = cards.find((card) => card.id === 'reservas');
  if (reservasCard) {
    reservasCard.badge = {
      text: 'reservas',
      value: Number(reservasStats.totalMes ?? reservasStats.total ?? 0),
    };
  }

  return cards;
};

const buildMetricsFromStats = (stats: any): MetricCardData[] => {
  const reservasStats = stats?.reservas ?? {};
  const usuariosStats = stats?.usuarios ?? {};
  const canchasStats = stats?.canchas ?? {};

  const reservasHoy = Number(reservasStats.hoy ?? reservasStats.totalHoy ?? 0);
  const ingresosDiarios = Number(reservasStats.ingresosHoy ?? reservasStats.ingresoTotal ?? 0);
  const ocupacionValue = Number(
    reservasStats.ocupacion ??
      stats?.ocupacion ??
      (canchasStats.activas ? (reservasStats.totalHoy ?? 0) / canchasStats.activas : 0)
  );

  return [
    {
      id: 'reservas-hoy',
      label: 'Reservas Hoy',
      value: reservasHoy,
      period: 'hoy',
      format: 'number',
    },
    {
      id: 'ingresos-diarios',
      label: 'Ingresos Diarios',
      value: ingresosDiarios,
      period: 'hoy',
      format: 'currency',
    },
    {
      id: 'ocupacion',
      label: 'Ocupación',
      value: Math.min(Math.max(ocupacionValue, 0), 100),
      format: 'percentage',
      helperText: 'Canchas ocupadas',
    },
    {
      id: 'nuevos-usuarios',
      label: 'Nuevos Usuarios',
      value: Number(usuariosStats.nuevosHoy ?? 0),
      period: 'hoy',
      format: 'number',
      helperText: 'Registros completados',
    },
    {
      id: 'reservas-pendientes',
      label: 'Reservas Pendientes',
      value: Number(reservasStats.pendientes ?? 0),
      format: 'number',
      helperText: 'Por confirmar',
    },
    {
      id: 'total-usuarios',
      label: 'Total Usuarios',
      value: Number(usuariosStats.total ?? 0),
      format: 'number',
      helperText: 'En el sistema',
    },
    {
      id: 'total-canchas',
      label: 'Total Canchas',
      value: Number(canchasStats.activas ?? canchasStats.total ?? 0),
      format: 'number',
      helperText: 'Activas',
    },
    {
      id: 'total-reservas',
      label: 'Total Reservas',
      value: Number(reservasStats.totalMes ?? reservasStats.total ?? 0),
      format: 'number',
      helperText: 'En el sistema',
    },
  ];
};

const fetchDashboardStats = async (): Promise<any | null> => {
  try {
    return await adminApiClient.get<any>(DASHBOARD_METRICS_ENDPOINT);
  } catch (error: any) {
    console.error('Error al obtener métricas del dashboard:', error);
    return null;
  }
};

const getLegacyEntityCardsData = async (): Promise<EntityCardData[]> => {
  try {
    const [sedesRes, usuariosRes, reservasRes] = await Promise.all([
      apiClient.get<any>('/sede').catch(() => ({ data: [] })),
      apiClient.get<any>('/usuarios/count').catch(() => ({ data: { total: 0 } })),
      apiClient.get<any>('/reservas').catch(() => ({ data: [] })),
    ]);

    const sedes = Array.isArray(sedesRes.data) ? sedesRes.data : [];
    const sedesDisponibles = sedes.filter((s: any) => !s.inactivo && s.verificada).length;
    const totalUsuarios = usuariosRes.data?.total || 0;
    const reservas = Array.isArray(reservasRes.data) ? reservasRes.data : [];
    const totalReservas = reservas.length;

    const cards = getDefaultEntityCards();
    const sedesCard = cards.find((card) => card.id === 'sedes');
    if (sedesCard) {
      sedesCard.badge = { text: 'activas', value: sedesDisponibles };
    }
    const personasCard = cards.find((card) => card.id === 'personas');
    if (personasCard) {
      personasCard.badge = { text: 'registrados', value: totalUsuarios };
    }
    const reservasCard = cards.find((card) => card.id === 'reservas');
    if (reservasCard) {
      reservasCard.badge = { text: 'reservas', value: totalReservas };
    }
    return cards;
  } catch (error) {
    console.error('Error al obtener tarjetas legacy:', error);
    return getDefaultEntityCards();
  }
};

const getLegacyMetricsCardsData = async (): Promise<MetricCardData[]> => {
  try {
    const [canchasRes, reservasRes, usuariosRes] = await Promise.all([
      apiClient.get<any>('/cancha').catch(() => ({ data: [] })),
      apiClient.get<any>('/reservas').catch(() => ({ data: [] })),
      apiClient.get<any>('/usuarios').catch(() => ({ data: [] })),
    ]);

    const canchas = Array.isArray(canchasRes.data) ? canchasRes.data : [];
    const reservas = Array.isArray(reservasRes.data) ? reservasRes.data : [];
    const usuarios = Array.isArray(usuariosRes.data) ? usuariosRes.data : [];

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const reservasHoy = reservas.filter((r: any) => {
      const fechaReserva = new Date(r.fechaReserva);
      fechaReserva.setHours(0, 0, 0, 0);
      return fechaReserva.getTime() === hoy.getTime();
    }).length;

    const nuevosUsuariosHoy = usuarios.filter((u: any) => {
      const fechaCreacion = new Date(u.creadoEn);
      fechaCreacion.setHours(0, 0, 0, 0);
      return fechaCreacion.getTime() === hoy.getTime();
    }).length;

    const reservasPendientes = reservas.filter((r: any) => 
      r.estado !== 'COMPLETADA' && r.estado !== 'CANCELADA'
    ).length;

    const canchasActivas = canchas.filter((c: any) => !c.eliminado).length;
    const ocupacion = canchasActivas > 0 
      ? Math.round((reservasHoy / canchasActivas) * 100) 
      : 0;

    const ingresosDiarios = reservas
      .filter((r: any) => {
        const fechaReserva = new Date(r.fechaReserva);
        fechaReserva.setHours(0, 0, 0, 0);
        return fechaReserva.getTime() === hoy.getTime();
      })
      .reduce((sum: number, r: any) => sum + (r.monto || 0), 0);

    return [
      {
        id: 'reservas-hoy',
        label: 'Reservas Hoy',
        value: reservasHoy,
        period: 'hoy',
        format: 'number',
        trend: { value: 12, direction: 'up' },
      },
      {
        id: 'ingresos-diarios',
        label: 'Ingresos Diarios',
        value: ingresosDiarios,
        period: 'hoy',
        format: 'currency',
        trend: { value: 8, direction: 'up' },
      },
      {
        id: 'ocupacion',
        label: 'Ocupación',
        value: Math.min(ocupacion, 100),
        format: 'percentage',
        helperText: 'Canchas ocupadas',
        trend: { value: 5, direction: 'up' },
      },
      {
        id: 'nuevos-usuarios',
        label: 'Nuevos Usuarios',
        value: nuevosUsuariosHoy,
        period: 'hoy',
        format: 'number',
        helperText: 'Registros completados',
      },
      {
        id: 'reservas-pendientes',
        label: 'Reservas Pendientes',
        value: reservasPendientes,
        format: 'number',
        helperText: 'Por confirmar',
      },
      {
        id: 'total-usuarios',
        label: 'Total Usuarios',
        value: usuarios.length,
        format: 'number',
        helperText: 'En el sistema',
      },
      {
        id: 'total-canchas',
        label: 'Total Canchas',
        value: canchasActivas,
        format: 'number',
        helperText: 'Activas',
      },
      {
        id: 'total-reservas',
        label: 'Total Reservas',
        value: reservas.length,
        format: 'number',
        helperText: 'En el sistema',
      },
    ];
  } catch (error) {
    console.error('Error al obtener métricas legacy:', error);
    return getDefaultMetricsCards();
  }
};

export const dashboardDataService = {
  async getEntityCardsData(): Promise<EntityCardData[]> {
    try {
      const stats = await fetchDashboardStats();
      if (stats) return buildEntityCardsFromStats(stats);
      return getLegacyEntityCardsData();
    } catch (error) {
      console.error('Error al obtener tarjetas:', error);
      return getLegacyEntityCardsData();
    }
  },

  /**
   * Obtener métricas del dashboard
   */
  async getMetricsCardsData(): Promise<MetricCardData[]> {
    try {
      const stats = await fetchDashboardStats();
      if (stats) return buildMetricsFromStats(stats);
      return getLegacyMetricsCardsData();
    } catch (error) {
      console.error('Error al obtener métricas:', error);
      return getLegacyMetricsCardsData();
    }
  },

  /**
   * Obtener todos los datos del dashboard
   */
  async getAllDashboardData() {
    const [entityCards, metricsCards] = await Promise.all([
      this.getEntityCardsData(),
      this.getMetricsCardsData(),
    ]);

    return {
      entityCards,
      metricsCards,
    };
  },
};
