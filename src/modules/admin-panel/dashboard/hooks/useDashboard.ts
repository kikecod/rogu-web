import { adminApiClient } from '../../lib/adminApiClient';
import type {
  DashboardMetricas,
  DashboardAlertas,
  ActividadReciente,
  GraficoData,
} from '../../types';

// ==========================================
// SERVICIO DE DASHBOARD
// ==========================================

export const dashboardService = {
  /**
   * Obtiene las métricas principales del dashboard
   */
  getMetricas: async (): Promise<DashboardMetricas> => {
    return adminApiClient.get<DashboardMetricas>('/dashboard/metricas');
  },

  /**
   * Obtiene las alertas importantes
   */
  getAlertas: async (): Promise<DashboardAlertas> => {
    return adminApiClient.get<DashboardAlertas>('/dashboard/alertas');
  },

  /**
   * Obtiene datos para gráfico de usuarios
   */
  getGraficoUsuarios: async (periodo: string = '30d'): Promise<GraficoData> => {
    return adminApiClient.get<GraficoData>(`/dashboard/graficos/usuarios?periodo=${periodo}`);
  },

  /**
   * Obtiene datos para gráfico de reservas
   */
  getGraficoReservas: async (periodo: string = '7d'): Promise<GraficoData> => {
    return adminApiClient.get<GraficoData>(`/dashboard/graficos/reservas?periodo=${periodo}`);
  },

  /**
   * Obtiene la actividad reciente del sistema
   */
  getActividadReciente: async (limit: number = 10): Promise<ActividadReciente[]> => {
    return adminApiClient.get<ActividadReciente[]>(`/dashboard/actividad-reciente?limit=${limit}`);
  },
};

export default dashboardService;
