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
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <header className="bg-surface backdrop-blur-xl border border-border rounded-card shadow-soft p-5 flex flex-col gap-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Panel administrativo</p>
            <h1 className="text-2xl md:text-3xl font-semibold text-text-main">Resumen operativo</h1>
            <p className="text-sm text-muted">Metrica instantanea · reservas · usuarios · sedes</p>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, idx) => (
            <div
              key={idx}
              className="h-32 rounded-card border border-border bg-surface shadow-soft animate-pulse"
            />
          ))}
        </div>
      ) : entityCards.length === 0 && metricsCards.length === 0 ? (
        <div className="rounded-card border border-border bg-surface shadow-soft p-6 text-center text-muted">
          Conecta el dashboard al backend para visualizar datos reales.
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {metricsCards.map((card) => (
              <MetricCard key={card.id} data={card} />
            ))}
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {entityCards.map((card) => (
              <EntityCard key={card.id} data={card} />
            ))}
          </section>
        </>
      )}
    </div>
  );
};

export default NewDashboardPage;
