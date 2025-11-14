import { useEffect, useState } from 'react';
import AdminLayout from '../../layout/AdminLayout';
import { dashboardService } from '../hooks/useDashboard';
import type { DashboardMetricas, DashboardAlertas, ActividadReciente } from '../../types';
import { Users, Building2, Calendar, Flag, TrendingUp, AlertCircle } from 'lucide-react';
import { ROUTES } from '@/config/routes';

const DashboardPage = () => {
  const [metricas, setMetricas] = useState<DashboardMetricas | null>(null);
  const [alertas, setAlertas] = useState<DashboardAlertas | null>(null);
  const [actividades, setActividades] = useState<ActividadReciente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [metricasData, alertasData, actividadesData] = await Promise.all([
        dashboardService.getMetricas(),
        dashboardService.getAlertas(),
        dashboardService.getActividadReciente(10),
      ]);

      setMetricas(metricasData);
      setAlertas(alertasData);
      setActividades(actividadesData);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Vista general del sistema</p>
        </div>

        {/* Métricas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Usuarios */}
          <MetricCard
            title="Usuarios"
            value={metricas?.usuarios.total || 0}
            change={metricas?.usuarios.crecimiento || 0}
            icon={Users}
            color="blue"
          />

          {/* Sedes */}
          <MetricCard
            title="Sedes"
            value={metricas?.sedes.total || 0}
            subtitle={`${metricas?.sedes.verificadas || 0} verificadas`}
            icon={Building2}
            color="green"
          />

          {/* Canchas */}
          <MetricCard
            title="Canchas"
            value={metricas?.canchas.total || 0}
            subtitle={`${metricas?.canchas.activas || 0} activas`}
            icon={Calendar}
            color="purple"
          />

          {/* Reportes */}
          <MetricCard
            title="Reportes"
            value={metricas?.reportes.pendientes || 0}
            subtitle="Pendientes"
            icon={Flag}
            color="red"
            alert
          />
        </div>

        {/* Alertas Importantes */}
        {alertas && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="text-orange-500" size={24} />
              Alertas Importantes
            </h2>
            <div className="space-y-3">
              {alertas.verificacionesPendientes > 0 && (
                <AlertItem
                  text={`${alertas.verificacionesPendientes} Verificaciones de dueños pendientes`}
                  severity="high"
                />
              )}
              {alertas.reportesSinAsignar > 0 && (
                <AlertItem
                  text={`${alertas.reportesSinAsignar} Reportes sin asignar`}
                  severity="medium"
                />
              )}
              {alertas.sedesAntiguas > 0 && (
                <AlertItem
                  text={`${alertas.sedesAntiguas} Sedes esperando más de 5 días`}
                  severity="medium"
                />
              )}
              {alertas.resenasReportadas > 0 && (
                <AlertItem
                  text={`${alertas.resenasReportadas} Reseñas reportadas por revisar`}
                  severity="low"
                />
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Actividad Reciente */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Actividad Reciente
            </h2>
            <div className="space-y-3">
              {actividades.map((actividad) => (
                <div key={actividad.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{actividad.descripcion}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(actividad.fecha).toLocaleString('es-MX')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Acciones Rápidas
            </h2>
            <div className="grid grid-cols-1 gap-3">
              <ActionButton
                text="Ver Verificaciones"
                href={ROUTES.admin.verificaciones}
                icon="✅"
              />
              <ActionButton
                text="Revisar Reportes"
                href={ROUTES.admin.reportes}
                icon="🚩"
              />
              <ActionButton
                text="Gestionar Usuarios"
                href={ROUTES.admin.usuarios}
                icon="👥"
              />
              <ActionButton
                text="Ver Analytics"
                href={ROUTES.admin.analytics}
                icon="📊"
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

// Componente de Métrica
interface MetricCardProps {
  title: string;
  value: number;
  subtitle?: string;
  change?: number;
  icon: any;
  color: 'blue' | 'green' | 'purple' | 'red';
  alert?: boolean;
}

const MetricCard = ({ title, value, subtitle, change, icon: Icon, color, alert }: MetricCardProps) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${alert ? 'ring-2 ring-red-500' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp size={16} />
            <span className="text-sm font-medium">{change > 0 ? '+' : ''}{change}%</span>
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value.toLocaleString()}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
};

// Componente de Alerta
interface AlertItemProps {
  text: string;
  severity: 'high' | 'medium' | 'low';
}

const AlertItem = ({ text, severity }: AlertItemProps) => {
  const colors = {
    high: 'bg-red-50 border-red-200 text-red-800',
    medium: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    low: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const icons = {
    high: '🔴',
    medium: '🟡',
    low: '⚪',
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${colors[severity]}`}>
      <span>{icons[severity]}</span>
      <span className="text-sm">{text}</span>
    </div>
  );
};

// Componente de Botón de Acción
interface ActionButtonProps {
  text: string;
  href: string;
  icon: string;
}

const ActionButton = ({ text, href, icon }: ActionButtonProps) => {
  return (
    <a
      href={href}
      className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-medium text-gray-900">{text}</span>
    </a>
  );
};

export default DashboardPage;
