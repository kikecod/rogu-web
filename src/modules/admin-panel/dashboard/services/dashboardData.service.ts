import { apiClient } from '../../lib/apiClient';
import { ROUTES } from '@/config/routes';
import type { EntityCardData, MetricCardData } from '../../types';

// ==========================================
// DATOS POR DEFECTO (FALLBACK)
// ==========================================

const getDefaultEntityCards = (): EntityCardData[] => {
  return [
    {
      id: 'canchas',
      title: 'Gestión de Canchas',
      description: 'Administrar canchas deportivas',
      badge: { text: 'activas', value: 0 },
      route: ROUTES.admin.canchas,
      icon: '⚽',
      iconColor: 'bg-green-100',
    },
    {
      id: 'espacios',
      title: 'Gestión de Espacios',
      description: 'Administrar espacios deportivos',
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
      icon: '🏅',
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
      icon: '💰',
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

// ==========================================
// SERVICIO DE DATOS DEL DASHBOARD
// ==========================================

/**
 * Servicio para obtener datos dinámicos del dashboard
 * desde el backend usando los endpoints reales
 */
export const dashboardDataService = {
  /**
   * Obtener datos para los cards de gestión de entidades
   */
  async getEntityCardsData(): Promise<EntityCardData[]> {
    try {
      // Llamar a endpoints reales del backend en paralelo
      const [canchasRes, sedesRes, usuariosRes, reservasRes] = await Promise.all([
        apiClient.get<any>('/cancha').catch(() => ({ data: [] })),
        apiClient.get<any>('/sede').catch(() => ({ data: [] })),
        apiClient.get<any>('/usuarios/count').catch(() => ({ data: { total: 0 } })),
        apiClient.get<any>('/reservas').catch(() => ({ data: [] })),
      ]);

      // Contar canchas activas (las que no están eliminadas)
      const canchas = Array.isArray(canchasRes.data) ? canchasRes.data : [];
      const canchasActivas = canchas.filter((c: any) => !c.eliminado).length;

      // Contar sedes disponibles (activas y verificadas)
      const sedes = Array.isArray(sedesRes.data) ? sedesRes.data : [];
      const sedesDisponibles = sedes.filter((s: any) => s.activa && s.verificada).length;

      // Total de usuarios
      const totalUsuarios = usuariosRes.data?.total || 0;

      // Total de reservas
      const reservas = Array.isArray(reservasRes.data) ? reservasRes.data : [];
      const totalReservas = reservas.length;

      return [
        {
          id: 'canchas',
          title: 'Gestión de Canchas',
          description: 'Administrar canchas deportivas',
          badge: {
            text: 'activas',
            value: canchasActivas,
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
            value: sedesDisponibles,
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
            value: totalUsuarios,
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
            value: totalReservas,
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
    } catch (error) {
      console.error('Error al obtener datos de entidades:', error);
      // Retornar datos por defecto en caso de error
      return getDefaultEntityCards();
    }
  },

  /**
   * Obtener datos para los cards de métricas usando endpoints reales
   */
  async getMetricsCardsData(): Promise<MetricCardData[]> {
    try {
      // Obtener datos reales del backend
      const [reservasRes, usuariosRes, canchasRes] = await Promise.all([
        apiClient.get<any>('/reservas').catch(() => ({ data: [] })),
        apiClient.get<any>('/usuarios').catch(() => ({ data: [] })),
        apiClient.get<any>('/cancha').catch(() => ({ data: [] })),
      ]);

      const reservas = Array.isArray(reservasRes.data) ? reservasRes.data : [];
      const usuarios = Array.isArray(usuariosRes.data) ? usuariosRes.data : [];
      const canchas = Array.isArray(canchasRes.data) ? canchasRes.data : [];

      // Calcular reservas de hoy
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const reservasHoy = reservas.filter((r: any) => {
        const fechaReserva = new Date(r.fechaReserva);
        fechaReserva.setHours(0, 0, 0, 0);
        return fechaReserva.getTime() === hoy.getTime();
      }).length;

      // Calcular nuevos usuarios de hoy
      const nuevosUsuariosHoy = usuarios.filter((u: any) => {
        const fechaCreacion = new Date(u.creadoEn);
        fechaCreacion.setHours(0, 0, 0, 0);
        return fechaCreacion.getTime() === hoy.getTime();
      }).length;

      // Calcular reservas pendientes (estado diferente a completada o cancelada)
      const reservasPendientes = reservas.filter((r: any) => 
        r.estado !== 'COMPLETADA' && r.estado !== 'CANCELADA'
      ).length;

      // Calcular ocupación (aproximada)
      const canchasActivas = canchas.filter((c: any) => !c.eliminado).length;
      const ocupacion = canchasActivas > 0 
        ? Math.round((reservasHoy / canchasActivas) * 100) 
        : 0;

      // Calcular ingresos diarios (suma de montos de reservas de hoy)
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
          trend: {
            value: 12,
            direction: 'up',
          },
        },
        {
          id: 'ingresos-diarios',
          label: 'Ingresos Diarios',
          value: ingresosDiarios,
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
          value: Math.min(ocupacion, 100),
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
          value: nuevosUsuariosHoy,
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
      console.error('Error al obtener métricas:', error);
      return getDefaultMetricsCards();
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
