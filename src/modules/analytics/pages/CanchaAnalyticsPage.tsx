// src/modules/analytics/pages/CanchaAnalyticsPage.tsx

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, TrendingUp, DollarSign, Calendar, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import KPICard from '../components/KPICard';
import DonutChart from '../components/DonutChart';
import { 
  getEstadisticasCancha, 
  descargarReporteCancha 
} from '../services/analyticsService';
import type { EstadisticasCanchaData } from '../types/analytics.types';

interface CanchaAnalyticsPageProps {
  idCancha: number;
  onBack?: () => void;
}

const CanchaAnalyticsPage: React.FC<CanchaAnalyticsPageProps> = ({ 
  idCancha,
  onBack 
}) => {
  const navigate = useNavigate();
  const [canchaData, setCanchaData] = useState<EstadisticasCanchaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [mes, setMes] = useState<string>('');

  useEffect(() => {
    // Establecer mes actual por defecto
    const now = new Date();
    const mesActual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setMes(mesActual);
  }, []);

  useEffect(() => {
    if (mes) {
      loadCanchaData();
    }
  }, [idCancha, mes]);

  const loadCanchaData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEstadisticasCancha(idCancha, mes);
      setCanchaData(data);
    } catch (err) {
      setError('Error al cargar las estadísticas de la cancha');
      console.error('Error loading cancha stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarReporte = async () => {
    try {
      setDownloading(true);
      await descargarReporteCancha(idCancha, mes);
    } catch (err) {
      alert('Error al descargar el reporte');
      console.error('Error downloading report:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  if (error) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 via-white to-rose-100 p-8 text-center shadow-xl">
        <div className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full bg-red-200/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-rose-200/60 blur-3xl" />
        <p className="relative text-lg font-semibold text-red-800">{error}</p>
        <p className="relative mt-2 text-sm text-red-600">
          Revisa tu conexión o intenta nuevamente en unos instantes.
        </p>
        <button
          onClick={loadCanchaData}
          className="relative mt-5 inline-flex items-center rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-orange-400 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-400/40 transition-transform hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-sky-50 p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-gradient-to-r from-sky-50 via-white to-emerald-50 px-4 py-3 shadow-lg">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="group rounded-xl border border-slate-200 bg-white/80 p-2 shadow-md transition-all hover:-translate-y-0.5 hover:border-sky-400 hover:bg-sky-50"
          >
            <ArrowLeft className="h-6 w-6 text-slate-600 transition-colors group-hover:text-sky-600" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {canchaData?.cancha.nombre || 'Cargando...'}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {canchaData?.cancha.sede.nombre} • {canchaData?.periodo.inicio} - {canchaData?.periodo.fin}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {/* Selector de mes */}
          <div className="flex items-center space-x-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-inner">
            <Calendar className="h-4 w-4 text-sky-500" />
            <input
              type="month"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="border-none bg-transparent text-sm text-slate-800 outline-none focus:ring-0"
            />
          </div>
          <button
            onClick={handleDescargarReporte}
            disabled={downloading || loading}
            className="inline-flex items-center rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-400/40 transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="mr-2 h-4 w-4" />
            {downloading ? 'Descargando...' : 'Descargar Reporte'}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              Indicadores generales
            </h2>
            <p className="text-xs text-slate-500">
              Resumen del rendimiento de la cancha en el periodo seleccionado.
            </p>
          </div>
          {canchaData?.metricas && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
              {canchaData.metricas.totalReservas.toLocaleString()} reservas totales
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
          <KPICard
            title="Total Reservas"
            value={canchaData?.metricas.totalReservas.toLocaleString() || '0'}
            icon={<Calendar className="h-6 w-6 text-blue-600" />}
            loading={loading}
          />

          <KPICard
            title="Ingresos"
            value={`Bs ${canchaData?.metricas.ingresos.toLocaleString() || '0'}`}
            icon={<DollarSign className="h-6 w-6 text-blue-600" />}
            loading={loading}
            valueColor="text-green-600"
          />

          <KPICard
            title="Ocupación"
            value={`${canchaData?.metricas.tasaOcupacion.toFixed(1) || '0'}%`}
            icon={<TrendingUp className="h-6 w-6 text-blue-600" />}
            loading={loading}
            valueColor="text-orange-600"
          />

          <KPICard
            title="Rating"
            value={`${canchaData?.metricas.rating.toFixed(1) || '0'}/5`}
            icon={<Star className="h-6 w-6 text-blue-600" />}
            loading={loading}
            valueColor="text-yellow-600"
          />

          <KPICard
            title="Calificaciones"
            value={canchaData?.metricas.totalCalificaciones.toLocaleString() || '0'}
            icon={<Star className="h-6 w-6 text-blue-600" />}
            loading={loading}
            subtitle="Total de reseñas"
          />
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Reservas por estado */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md">
          <DonutChart
            data={canchaData?.reservasPorEstado.map((item, index) => ({
              label: item.estado,
              value: item.cantidad,
              color: index === 0 ? '#10B981' : index === 1 ? '#F59E0B' : '#EF4444'
            })) || []}
            title="Distribución de Reservas"
            loading={loading}
            centerText={canchaData?.metricas.totalReservas.toString()}
            size={250}
          />
        </div>

        {/* Estadísticas adicionales */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
          <h3 className="mb-6 text-lg font-semibold text-slate-900 flex items-center gap-2">
            <span className="inline-flex h-8 w-1 rounded-full bg-gradient-to-b from-sky-500 to-emerald-500" />
            Métricas Clave
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-100">
              <div>
                <p className="text-sm text-slate-600">Ingreso Promedio por Reserva</p>
                <p className="text-2xl font-bold text-slate-900">
                  Bs {canchaData?.metricas.totalReservas && canchaData.metricas.totalReservas > 0
                    ? (canchaData.metricas.ingresos / canchaData.metricas.totalReservas).toFixed(2)
                    : '0'}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-sky-50 p-4 border border-sky-100">
              <div>
                <p className="text-sm text-slate-600">Tasa de Confirmación</p>
                <p className="text-2xl font-bold text-slate-900">
                  {canchaData?.metricas.totalReservas && canchaData.metricas.totalReservas > 0
                    ? ((canchaData.reservasPorEstado.find(r => r.estado === 'Confirmada')?.cantidad || 0) / canchaData.metricas.totalReservas * 100).toFixed(1)
                    : '0'}%
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-rose-50 p-4 border border-rose-100">
              <div>
                <p className="text-sm text-slate-600">Tasa de Cancelación</p>
                <p className="text-2xl font-bold text-slate-900">
                  {canchaData?.metricas.totalReservas && canchaData.metricas.totalReservas > 0
                    ? ((canchaData.reservasPorEstado.find(r => r.estado === 'Cancelada')?.cantidad || 0) / canchaData.metricas.totalReservas * 100).toFixed(1)
                    : '0'}%
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100">
                <Calendar className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de detalles */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <span className="inline-flex h-6 w-1 rounded-full bg-gradient-to-b from-slate-900 to-sky-500" />
            Resumen del Periodo
          </h3>
          {canchaData?.metricas && (
            <div className="flex flex-wrap gap-2 text-xs text-slate-600">
              <span className="rounded-full bg-slate-50 px-3 py-1 border border-slate-200">
                Total reservas:{' '}
                <span className="font-semibold text-slate-900">
                  {canchaData.metricas.totalReservas.toLocaleString()}
                </span>
              </span>
              <span className="rounded-full bg-slate-50 px-3 py-1 border border-slate-200">
                Rating promedio:{' '}
                <span className="font-semibold text-yellow-600">
                  {canchaData.metricas.rating.toFixed(1)}/5
                </span>
              </span>
            </div>
          )}
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Porcentaje
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {canchaData?.reservasPorEstado.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50/80">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.estado === 'Confirmada' 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : item.estado === 'Pendiente'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      <span className="mr-1 h-1.5 w-1.5 rounded-full bg-current" />
                      {item.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                    {item.cantidad}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {canchaData?.metricas.totalReservas 
                      ? ((item.cantidad / canchaData.metricas.totalReservas) * 100).toFixed(1) 
                      : '0'}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CanchaAnalyticsPage;
