// 📊 PÁGINA: Estadísticas Detalladas por Cancha

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
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800">{error}</p>
        <button
          onClick={loadCanchaData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {canchaData?.cancha.nombre || 'Cargando...'}
            </h1>
            <p className="text-gray-600 mt-1">
              {canchaData?.cancha.sede.nombre} • {canchaData?.periodo.inicio} - {canchaData?.periodo.fin}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {/* Selector de mes */}
          <input
            type="month"
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleDescargarReporte}
            disabled={downloading || loading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            {downloading ? 'Descargando...' : 'Descargar Reporte'}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reservas por estado */}
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

        {/* Estadísticas adicionales */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Métricas Clave</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Ingreso Promedio por Reserva</p>
                <p className="text-2xl font-bold text-gray-900">
                  Bs {canchaData?.metricas.totalReservas && canchaData.metricas.totalReservas > 0
                    ? (canchaData.metricas.ingresos / canchaData.metricas.totalReservas).toFixed(2)
                    : '0'}
                </p>
              </div>
              <DollarSign className="h-10 w-10 text-green-600" />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Tasa de Confirmación</p>
                <p className="text-2xl font-bold text-gray-900">
                  {canchaData?.metricas.totalReservas && canchaData.metricas.totalReservas > 0
                    ? ((canchaData.reservasPorEstado.find(r => r.estado === 'Confirmada')?.cantidad || 0) / canchaData.metricas.totalReservas * 100).toFixed(1)
                    : '0'}%
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-blue-600" />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Tasa de Cancelación</p>
                <p className="text-2xl font-bold text-gray-900">
                  {canchaData?.metricas.totalReservas && canchaData.metricas.totalReservas > 0
                    ? ((canchaData.reservasPorEstado.find(r => r.estado === 'Cancelada')?.cantidad || 0) / canchaData.metricas.totalReservas * 100).toFixed(1)
                    : '0'}%
                </p>
              </div>
              <Calendar className="h-10 w-10 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de detalles */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Periodo</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Porcentaje
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {canchaData?.reservasPorEstado.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.estado === 'Confirmada' 
                        ? 'bg-green-100 text-green-800' 
                        : item.estado === 'Pendiente'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.cantidad}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
