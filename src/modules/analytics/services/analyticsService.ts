// 📊 SERVICIO DE ANALYTICS
// Comunicación con el backend de analytics

import type {
  DashboardData,
  EstadisticasCanchaData,
  IngresosMensualesResponse,
  CalendarioData,
  ResumenResenasData,
  AnalyticsFiltros
} from '../types/analytics.types';

import { API_URL } from '@/core/config/api';

/**
 * Obtener el token de autorización
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Construir query params desde filtros
 */
const buildQueryParams = (filtros: AnalyticsFiltros): string => {
  const params = new URLSearchParams();
  
  if (filtros.idPersonaD) params.append('idPersonaD', filtros.idPersonaD.toString());
  if (filtros.idCancha) params.append('idCancha', filtros.idCancha.toString());
  if (filtros.idSede) params.append('idSede', filtros.idSede.toString());
  if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
  if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
  
  return params.toString();
};

/**
 * 📊 Obtener datos del dashboard principal
 */
export const getDashboard = async (filtros: AnalyticsFiltros = {}): Promise<DashboardData> => {
  const queryParams = buildQueryParams(filtros);
  const url = `${API_URL}/analytics/dashboard${queryParams ? '?' + queryParams : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error('Error al obtener datos del dashboard');
  }

  return await response.json();
};

/**
 * 📊 Obtener estadísticas detalladas de una cancha
 */
export const getEstadisticasCancha = async (
  idCancha: number,
  mes?: string
): Promise<EstadisticasCanchaData> => {
  const queryParams = mes ? `?mes=${mes}` : '';
  const url = `${API_URL}/analytics/cancha/${idCancha}${queryParams}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error('Error al obtener estadísticas de la cancha');
  }

  return await response.json();
};

/**
 * � Obtener calendario de disponibilidad de canchas con reservas
 */
export const getCalendario = async (
  mes: string, // formato YYYY-MM
  filtros: AnalyticsFiltros = {}
): Promise<any> => {
  const queryParams = buildQueryParams(filtros);
  const url = `${API_URL}/analytics/calendario?mes=${mes}${queryParams ? '&' + queryParams : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error('Error al obtener el calendario');
  }

  return await response.json();
};

/**
 * �💰 Obtener ingresos mensuales agrupados
 */
export const getIngresosMensuales = async (
  filtros: AnalyticsFiltros & { limite?: number } = {}
): Promise<IngresosMensualesResponse> => {
  const queryParams = buildQueryParams(filtros);
  const limite = filtros.limite || 12;
  const url = `${API_URL}/analytics/ingresos?periodo=mes&limite=${limite}${queryParams ? '&' + queryParams : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error('Error al obtener ingresos mensuales');
  }

  return await response.json();
};

/**
 * 📅 Obtener calendario de disponibilidad
 */
export const getCalendarioDisponibilidad = async (
  mes: string,
  filtros: AnalyticsFiltros = {}
): Promise<CalendarioData> => {
  const queryParams = buildQueryParams(filtros);
  const url = `${API_URL}/analytics/calendario?mes=${mes}${queryParams ? '&' + queryParams : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error('Error al obtener calendario de disponibilidad');
  }

  return await response.json();
};

/**
 * ⭐ Obtener resumen de reseñas y calificaciones
 */
export const getResumenResenas = async (
  filtros: AnalyticsFiltros = {}
): Promise<ResumenResenasData> => {
  const queryParams = buildQueryParams(filtros);
  const url = `${API_URL}/analytics/resenas${queryParams ? '?' + queryParams : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error('Error al obtener resumen de reseñas');
  }

  return await response.json();
};

/**
 * 📄 Descargar reporte PDF del dashboard
 */
export const descargarReporteDashboard = async (filtros: AnalyticsFiltros = {}): Promise<void> => {
  const queryParams = buildQueryParams(filtros);
  const url = `${API_URL}/reportes/dashboard/csv${queryParams ? '?' + queryParams : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error('Error al descargar reporte');
  }

  // Descargar archivo
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `dashboard_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};

/**
 * 📄 Descargar reporte de ingresos CSV
 */
export const descargarReporteIngresos = async (
  filtros: AnalyticsFiltros & { limite?: number } = {}
): Promise<void> => {
  const queryParams = buildQueryParams(filtros);
  const limite = filtros.limite || 12;
  const url = `${API_URL}/reportes/ingresos/csv?limite=${limite}${queryParams ? '&' + queryParams : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error('Error al descargar reporte de ingresos');
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `ingresos_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};

/**
 * 📄 Descargar reporte de cancha CSV
 */
export const descargarReporteCancha = async (
  idCancha: number,
  mes?: string
): Promise<void> => {
  const queryParams = mes ? `?mes=${mes}` : '';
  const url = `${API_URL}/reportes/cancha/${idCancha}/csv${queryParams}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error('Error al descargar reporte de cancha');
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `cancha_${idCancha}_${mes || 'actual'}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};

/**
 * 📄 Descargar reporte consolidado CSV
 */
export const descargarReporteConsolidado = async (
  filtros: AnalyticsFiltros = {}
): Promise<void> => {
  const queryParams = buildQueryParams(filtros);
  const url = `${API_URL}/reportes/consolidado/csv${queryParams ? '?' + queryParams : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error('Error al descargar reporte consolidado');
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `consolidado_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};
