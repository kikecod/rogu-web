import { useEffect, useState } from 'react';
import EntityCard from '../components/EntityCard';
import MetricCard from '../components/MetricCard';
import { dashboardDataService } from '../services/dashboardData.service';
import type { EntityCardData, MetricCardData } from '../../types';

const NewDashboardPage = () => {
  const [entityCards, setEntityCards] = useState<EntityCardData[]>([]);
  const [metricsCards, setMetricsCards] = useState<MetricCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardDataService.getAllDashboardData();
      setEntityCards(data.entityCards);
      setMetricsCards(data.metricsCards);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
        <p className="text-gray-600 mt-2">
          Gestiona todas las entidades del sistema deportivo
        </p>
      </div>

        {/* Entity Management Cards */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Gestión de Entidades
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {entityCards.map((card) => (
              <EntityCard key={card.id} data={card} />
            ))}
          </div>
        </section>

        {/* Metrics Cards */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Métricas del Sistema
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metricsCards.map((card) => (
              <MetricCard key={card.id} data={card} />
            ))}
          </div>
        </section>
    </div>
  );
};

export default NewDashboardPage;
