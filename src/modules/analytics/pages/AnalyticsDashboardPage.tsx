// src/modules/analytics/pages/AnalyticsDashboardPage.tsx

import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, Calendar, Star, DollarSign } from 'lucide-react';
import KPICard from '../components/KPICard';
import SimpleBarChart from '../components/SimpleBarChart';
import SimpleLineChart from '../components/SimpleLineChart';
import DonutChart from '../components/DonutChart';
import {
  getDashboard,
  descargarReporteDashboard
} from '../services/analyticsService';
import type { DashboardData } from '../types/analytics.types';

interface AnalyticsDashboardPageProps {
  idPersonaD?: number;
  idSede?: number;
  onViewCanchaAnalytics?: (idCancha: number) => void;
}

const AnalyticsDashboardPage: React.FC<AnalyticsDashboardPageProps> = ({
  idPersonaD,
  idSede,
  onViewCanchaAnalytics
}) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [canchas, setCanchas] = useState<any[]>([]);

  // Cargar datos del dashboard
  useEffect(() => {
    loadDashboardData();
    loadCanchas();
  }, [idPersonaD, idSede]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboard({ idPersonaD, idSede });
      setDashboardData(data);
    } catch (err) {
      setError('Error al cargar los datos del dashboard');
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCanchas = async () => {
    try {
      const token = localStorage.getItem('token');

      // Si hay sede seleccionada, cargar solo canchas de esa sede
      if (idSede) {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/sede/${idSede}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const sedeData = await response.json();
          setCanchas(sedeData.canchas || []);
        }
      } else if (idPersonaD) {
        // Si no hay sede pero hay dueño, cargar todas las sedes del dueño y sus canchas
        const sedesResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/sede`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (sedesResponse.ok) {
          const allSedes = await sedesResponse.json();
          const mySedes = allSedes.filter((s: any) => s.idPersonaD === idPersonaD);

          // Obtener todas las canchas de mis sedes
          const todasLasCanchas: any[] = [];
          for (const sede of mySedes) {
            if (sede.canchas && sede.canchas.length > 0) {
              todasLasCanchas.push(...sede.canchas);
            }
          }
          setCanchas(todasLasCanchas);
        }
      }
    } catch (err) {
      console.error('Error loading canchas:', err);
    }
  };

  const handleDescargarReporte = async () => {
    try {
      setDownloading(true);
      await descargarReporteDashboard({ idPersonaD, idSede });
    } catch (err) {
      alert('Error al descargar el reporte');
      console.error('Error downloading report:', err);
    } finally {
      setDownloading(false);
    }
  };

  if (error) {
    return (
      <div className="p-6 sm:p-8 lg:p-10">
        <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-2xl p-6 sm:p-8 text-center shadow-sm">
          <p className="text-red-800 text-lg font-semibold">Ups, algo salió mal</p>
          <p className="text-red-700 mt-2">{error}</p>
          <button
            onClick={loadDashboardData}
            className="mt-5 px-5 py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 shadow-sm"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 bg-slate-50 rounded-2xl min-h-full">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-5 py-4 sm:px-7 sm:py-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Dashboard de Analytics
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 border border-blue-100">
              Período
            </span>
            <p className="text-slate-600">
              {dashboardData?.periodo.mesActual || 'Cargando período...'}
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleDescargarReporte}
            disabled={downloading || loading}
            className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm text-sm font-medium"
          >
            <Download className="h-4 w-4 mr-2" />
            {downloading ? 'Descargando...' : 'Descargar Reporte'}
          </button>
        </div>
      </div>

      {/* KPIs Grid */}
      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6 lg:p-7 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Indicadores Clave del Mes
          </h2>
          <span className="text-xs text-slate-500">
            Vista general de tu rendimiento
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          <KPICard
            title="Ingresos del Mes"
            value={`Bs ${dashboardData?.metricas.ingresosMes.valor.toLocaleString() || '0'}`}
            change={dashboardData?.metricas.ingresosMes.variacion}
            trend={dashboardData?.metricas.ingresosMes.tendencia}
            icon={<DollarSign className="h-6 w-6 text-blue-600" />}
            loading={loading}
            valueColor="text-green-600"
          />

          <KPICard
            title="Total Reservas"
            value={dashboardData?.metricas.totalReservas.valor.toLocaleString() || '0'}
            change={dashboardData?.metricas.totalReservas.variacion}
            trend={dashboardData?.metricas.totalReservas.tendencia}
            icon={<Calendar className="h-6 w-6 text-blue-600" />}
            loading={loading}
          />

          <KPICard
            title="Tasa de Ocupación"
            value={`${dashboardData?.metricas.tasaOcupacion.valor.toFixed(1) || '0'}%`}
            icon={<TrendingUp className="h-6 w-6 text-blue-600" />}
            loading={loading}
            valueColor="text-orange-600"
            subtitle="Promedio del mes"
          />

          <KPICard
            title="Rating Promedio"
            value={`${dashboardData?.metricas.ratingPromedio.valor.toFixed(1) || '0'}/5`}
            icon={<Star className="h-6 w-6 text-blue-600" />}
            loading={loading}
            valueColor="text-yellow-600"
            subtitle="Calificación de clientes"
          />
        </div>
      </section>

      {/* Gráficos - Fila 1 */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Gráfico de ingresos */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-5 lg:p-6">
          <SimpleLineChart
            data={dashboardData?.graficos.ingresosUltimos12Meses.map(item => ({
              label: item.nombreMes,
              value: item.ingresos
            })) || []}
            title="Ingresos Últimos 12 Meses"
            loading={loading}
            color="#10B981"
            height={300}
          />
        </div>

        {/* Gráfico de reservas por estado */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-5 lg:p-6 flex flex-col items-center justify-center">
          <DonutChart
            data={dashboardData?.graficos.reservasPorEstado.map((item, index) => ({
              label: item.estado,
              value: item.cantidad,
              color: index === 0 ? '#10B981' : index === 1 ? '#F59E0B' : '#EF4444'
            })) || []}
            title="Reservas por Estado"
            loading={loading}
            centerText={dashboardData?.metricas.totalReservas.valor.toString()}
            size={250}
          />
        </div>
      </section>

      {/* Gráficos - Fila 2 */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Horarios populares */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-5 lg:p-6">
          <SimpleBarChart
            data={dashboardData?.graficos.horariosPopulares.map(item => ({
              label: item.hora,
              value: item.cantidad,
              color: '#3B82F6'
            })) || []}
            title="Horarios Más Populares"
            loading={loading}
            height={300}
          />
        </div>

        {/* Reservas por día */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-5 lg:p-6">
          <SimpleLineChart
            data={dashboardData?.graficos.reservasPorDia.slice(-14).map(item => ({
              label: new Date(item.fecha).getDate().toString(),
              value: item.cantidad
            })) || []}
            title="Reservas por Día (Últimos 14 días)"
            loading={loading}
            color="#3B82F6"
            height={300}
          />
        </div>
      </section>

      {/* Tabla de estadísticas rápidas */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-7 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Resumen Rápido
          </h3>
          <span className="text-xs text-slate-500">
            Datos calculados a partir del período actual
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Ingreso Promedio por Reserva</p>
            <p className="text-2xl font-bold text-gray-900">
              Bs {dashboardData?.metricas.ingresosMes.valor && dashboardData?.metricas.totalReservas.valor
                ? (dashboardData.metricas.ingresosMes.valor / dashboardData.metricas.totalReservas.valor).toFixed(2)
                : '0'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Reservas Confirmadas</p>
            <p className="text-2xl font-bold text-green-600">
              {dashboardData?.graficos.reservasPorEstado.find(r => r.estado === 'Confirmada')?.cantidad || 0}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Reservas Canceladas</p>
            <p className="text-2xl font-bold text-red-600">
              {dashboardData?.graficos.reservasPorEstado.find(r => r.estado === 'Cancelada')?.cantidad || 0}
            </p>
          </div>
        </div>
      </section>

      {/* Lista de Canchas para Analytics Individual */}
      {canchas.length > 0 && onViewCanchaAnalytics && (
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-7 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Ver Analytics por Cancha Individual
            </h3>
            <span className="text-xs text-slate-500">
              Selecciona una cancha para ver el detalle
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {canchas.map((cancha) => {
              // Obtener las disciplinas de la cancha desde la relación 'parte'
              const disciplinas = cancha.parte
                ?.map((p: any) => p.disciplina?.nombre)
                .filter(Boolean) || [];

              return (
                <button
                  key={cancha.idCancha}
                  onClick={() => onViewCanchaAnalytics(cancha.idCancha)}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors text-left bg-slate-50/60"
                >
                  <div className="flex-1 space-y-2">
                    <h4 className="font-semibold text-gray-900 line-clamp-1">
                      {cancha.nombre}
                    </h4>

                    {/* Mostrar disciplinas */}
                    {disciplinas.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {disciplinas.map((disc: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full"
                          >
                            {disc}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mt-1">Sin disciplinas</p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-500">
                      <p>
                        {cancha.estado === 'Disponible' ? '✅ Disponible' : '🔴 No disponible'}
                      </p>
                      <span className="text-gray-400">•</span>
                      <p>
                        Bs {cancha.precio || '0'}
                      </p>
                    </div>
                  </div>
                  <div className="text-blue-600 ml-3 shrink-0">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default AnalyticsDashboardPage;
