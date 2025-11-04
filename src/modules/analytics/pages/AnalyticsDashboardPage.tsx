// 📊 PÁGINA: Dashboard de Analytics Principal

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
        const response = await fetch(`http://localhost:3000/api/sede/${idSede}`, {
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
        const sedesResponse = await fetch('http://localhost:3000/api/sede', {
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
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800">{error}</p>
        <button
          onClick={loadDashboardData}
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Analytics</h1>
          <p className="text-gray-600 mt-1">
            Período: {dashboardData?.periodo.mesActual || 'Cargando...'}
          </p>
        </div>
        <button
          onClick={handleDescargarReporte}
          disabled={downloading || loading}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="h-4 w-4 mr-2" />
          {downloading ? 'Descargando...' : 'Descargar Reporte'}
        </button>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Gráficos - Fila 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de ingresos */}
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

        {/* Gráfico de reservas por estado */}
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

      {/* Gráficos - Fila 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Horarios populares */}
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

        {/* Reservas por día */}
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

      {/* Tabla de estadísticas rápidas */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen Rápido</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Ingreso Promedio por Reserva</p>
            <p className="text-2xl font-bold text-gray-900">
              Bs {dashboardData?.metricas.ingresosMes.valor && dashboardData?.metricas.totalReservas.valor
                ? (dashboardData.metricas.ingresosMes.valor / dashboardData.metricas.totalReservas.valor).toFixed(2)
                : '0'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Reservas Confirmadas</p>
            <p className="text-2xl font-bold text-green-600">
              {dashboardData?.graficos.reservasPorEstado.find(r => r.estado === 'Confirmada')?.cantidad || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Reservas Canceladas</p>
            <p className="text-2xl font-bold text-red-600">
              {dashboardData?.graficos.reservasPorEstado.find(r => r.estado === 'Cancelada')?.cantidad || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Canchas para Analytics Individual */}
      {canchas.length > 0 && onViewCanchaAnalytics && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Ver Analytics por Cancha Individual
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {canchas.map((cancha) => {
              // Obtener las disciplinas de la cancha desde la relación 'parte'
              const disciplinas = cancha.parte
                ?.map((p: any) => p.disciplina?.nombre)
                .filter(Boolean) || [];
              
              return (
                <button
                  key={cancha.idCancha}
                  onClick={() => onViewCanchaAnalytics(cancha.idCancha)}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{cancha.nombre}</h4>
                    
                    {/* Mostrar disciplinas */}
                    {disciplinas.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1">
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
                    
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-xs text-gray-500">
                        {cancha.estado === 'Disponible' ? '✅ Disponible' : '🔴 No disponible'}
                      </p>
                      <span className="text-xs text-gray-400">•</span>
                      <p className="text-xs text-gray-500">
                        Bs {cancha.precio || '0'}
                      </p>
                    </div>
                  </div>
                  <div className="text-blue-600 ml-2">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboardPage;
