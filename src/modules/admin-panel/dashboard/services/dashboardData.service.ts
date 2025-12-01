import { ROUTES } from '@/config/routes';
import { apiClient } from '../../lib/apiClient';
import { adminApiClient } from '../../lib/adminApiClient';
import { Building2, Users, CalendarClock, CreditCard, ShieldCheck, Sparkles } from 'lucide-react';
import type { EntityCardData, MetricCardData } from '../../types';

const DASHBOARD_METRICS_ENDPOINT = '/dashboard/metricas';

const ENTITY_BASE: EntityCardData[] = [
  {
    id: 'sedes',
    title: 'Gestion de Sedes',
    description: 'Administrar sedes deportivas',
    badge: { text: 'disponibles' },
    route: ROUTES.admin.sedes,
    icon: Building2,
  },
  {
    id: 'disciplinas',
    title: 'Gestion de Disciplinas',
    description: 'Administrar disciplinas deportivas',
    badge: { text: 'deportes' },
    route: ROUTES.admin.disciplinas,
    icon: Sparkles,
  },
  {
    id: 'personas',
    title: 'Gestion de Personas',
    description: 'Administrar clientes y usuarios',
    badge: { text: 'registrados' },
    route: ROUTES.admin.usuarios,
    icon: Users,
  },
  {
    id: 'reservas',
    title: 'Gestion de Reservas',
    description: 'Administrar reservas del sistema',
    badge: { text: 'reservas' },
    route: ROUTES.admin.reservas,
    icon: CalendarClock,
  },
  {
    id: 'pagos',
    title: 'Gestion de Pagos',
    description: 'Transacciones y conciliacion',
    badge: { text: 'ingresos' },
    route: ROUTES.admin.pagos,
    icon: CreditCard,
  },
  {
    id: 'seguridad',
    title: 'Control de Accesos',
    description: 'Verificacion y control QR',
    badge: { text: 'eventos' },
    route: ROUTES.admin.verificaciones,
    icon: ShieldCheck,
  },
];

const getDefaultEntityCards = (): EntityCardData[] => [];

const getDefaultMetricsCards = (): MetricCardData[] => [];

const buildEntityCardsFromStats = (stats: any): EntityCardData[] => {
  const sedesStats = stats?.sedes ?? {};
  const usuariosStats = stats?.usuarios ?? {};
  const reservasStats = stats?.reservas ?? {};

  return ENTITY_BASE.reduce<EntityCardData[]>((acc, card) => {
    let value: number | undefined;
    switch (card.id) {
      case 'sedes':
        value = sedesStats.activas ?? sedesStats.verificadas ?? sedesStats.total;
        break;
      case 'personas':
        value = usuariosStats.total;
        break;
      case 'reservas':
        value = reservasStats.totalMes ?? reservasStats.total ?? reservasStats.totalHoy;
        break;
      case 'pagos':
        value = stats?.pagos?.total;
        break;
      case 'seguridad':
        value = stats?.verificaciones?.total;
        break;
      default:
        break;
    }

    if (value !== undefined && !Number.isNaN(Number(value))) {
      acc.push({
        ...card,
        badge: {
          ...card.badge,
          value: Number(value),
        },
      });
    }

    return acc;
  }, []);
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
      accent: 'primary',
      sparkline: [reservasHoy / 2, reservasHoy / 3 + 3, reservasHoy / 2 + 4, reservasHoy],
    },
    {
      id: 'ingresos-diarios',
      label: 'Ingresos Diarios',
      value: ingresosDiarios,
      period: 'hoy',
      format: 'currency',
      accent: 'secondary',
      sparkline: [ingresosDiarios / 2, ingresosDiarios / 3, ingresosDiarios / 1.5, ingresosDiarios],
    },
    {
      id: 'ocupacion',
      label: 'Ocupacion',
      value: Math.min(Math.max(ocupacionValue, 0), 100),
      format: 'percentage',
      helperText: 'Canchas ocupadas',
      accent: 'accent-1',
    },
    {
      id: 'nuevos-usuarios',
      label: 'Nuevos Usuarios',
      value: Number(usuariosStats.nuevosHoy ?? 0),
      period: 'hoy',
      format: 'number',
      helperText: 'Registros completados',
      accent: 'accent-2',
    },
    {
      id: 'reservas-pendientes',
      label: 'Reservas Pendientes',
      value: Number(reservasStats.pendientes ?? 0),
      format: 'number',
      helperText: 'Por confirmar',
      accent: 'primary',
    },
    {
      id: 'total-usuarios',
      label: 'Total Usuarios',
      value: Number(usuariosStats.total ?? 0),
      format: 'number',
      helperText: 'En el sistema',
      accent: 'secondary',
    },
    {
      id: 'total-canchas',
      label: 'Total Canchas',
      value: Number(canchasStats.activas ?? canchasStats.total ?? 0),
      format: 'number',
      helperText: 'Activas',
      accent: 'accent-2',
    },
    {
      id: 'total-reservas',
      label: 'Total Reservas',
      value: Number(reservasStats.totalMes ?? reservasStats.total ?? 0),
      format: 'number',
      helperText: 'En el sistema',
      accent: 'accent-1',
    },
  ];
};

const fetchDashboardStats = async (): Promise<any | null> => {
  try {
    return await adminApiClient.get<any>(DASHBOARD_METRICS_ENDPOINT);
  } catch (error: any) {
    console.error('Error al obtener metricas del dashboard:', error);
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

    const stats = {
      sedes: { activas: sedesDisponibles, total: sedes.length },
      usuarios: { total: totalUsuarios },
      reservas: { total: totalReservas },
    };
    return buildEntityCardsFromStats(stats);
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

    const reservasPendientes = reservas.filter(
      (r: any) => r.estado !== 'COMPLETADA' && r.estado !== 'CANCELADA'
    ).length;

    const canchasActivas = canchas.filter((c: any) => !c.eliminado).length;
    const ocupacion = canchasActivas > 0 ? Math.round((reservasHoy / canchasActivas) * 100) : 0;

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
        accent: 'primary',
        sparkline: [reservasHoy / 3, reservasHoy / 2, reservasHoy / 1.5, reservasHoy],
      },
      {
        id: 'ingresos-diarios',
        label: 'Ingresos Diarios',
        value: ingresosDiarios,
        period: 'hoy',
        format: 'currency',
        trend: { value: 8, direction: 'up' },
        accent: 'secondary',
        sparkline: [ingresosDiarios / 4, ingresosDiarios / 2, ingresosDiarios],
      },
      {
        id: 'ocupacion',
        label: 'Ocupacion',
        value: Math.min(ocupacion, 100),
        format: 'percentage',
        helperText: 'Canchas ocupadas',
        trend: { value: 5, direction: 'up' },
        accent: 'accent-1',
      },
      {
        id: 'nuevos-usuarios',
        label: 'Nuevos Usuarios',
        value: nuevosUsuariosHoy,
        period: 'hoy',
        format: 'number',
        helperText: 'Registros completados',
        accent: 'accent-2',
      },
      {
        id: 'reservas-pendientes',
        label: 'Reservas Pendientes',
        value: reservasPendientes,
        format: 'number',
        helperText: 'Por confirmar',
        accent: 'primary',
      },
      {
        id: 'total-usuarios',
        label: 'Total Usuarios',
        value: usuarios.length,
        format: 'number',
        helperText: 'En el sistema',
        accent: 'secondary',
      },
      {
        id: 'total-canchas',
        label: 'Total Canchas',
        value: canchasActivas,
        format: 'number',
        helperText: 'Activas',
        accent: 'accent-2',
      },
      {
        id: 'total-reservas',
        label: 'Total Reservas',
        value: reservas.length,
        format: 'number',
        helperText: 'En el sistema',
        accent: 'accent-1',
      },
    ];
  } catch (error) {
    console.error('Error al obtener metricas legacy:', error);
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

  async getMetricsCardsData(): Promise<MetricCardData[]> {
    try {
      const stats = await fetchDashboardStats();
      if (stats) return buildMetricsFromStats(stats);
      return getLegacyMetricsCardsData();
    } catch (error) {
      console.error('Error al obtener metricas:', error);
      return getLegacyMetricsCardsData();
    }
  },

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
