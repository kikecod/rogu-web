import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PublicFilters from '../components/PublicFilters';
import PublicVenueGrid from '../components/PublicVenueGrid';
import { usePublicVenues, type PublicVenueFilters } from '../hooks/usePublicVenues';

const PublicVenuesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stateFilters = (location.state as { filters?: PublicVenueFilters } | null)?.filters;

  const {
    filters,
    setFilters,
    venues,
    loading,
    error,
    total,
    totalPages,
    loadMore,
    page,
  } = usePublicVenues(stateFilters || {}, 12);

  useEffect(() => {
    if (stateFilters) {
      setFilters(stateFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const canLoadMore = page < totalPages && !loading;

  return (
    <div className="space-y-6">
      <div className="bg-white/65 backdrop-blur rounded-2xl shadow-lg shadow-black/5 border border-[#E9ECF5] p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[#0F172A]/60 font-semibold">
              Explorar sedes
            </p>
            <h1 className="text-2xl font-bold text-[#0F172A]">Sedes públicas disponibles</h1>
            <p className="text-sm text-[#0F172A]/70">
              Filtra por ciudad, fecha y deporte sin necesidad de iniciar sesión.
            </p>
          </div>
          <div className="text-sm px-3 py-2 rounded-xl bg-white/80 border border-[#E9ECF5] text-[#0F172A]/80 shadow-sm">
            {loading ? 'Buscando...' : `${total} resultados`}
          </div>
        </div>
      </div>

      <PublicFilters
        values={filters}
        onChange={(next) => setFilters(next)}
        onSubmit={() => {}}
      />

      <PublicVenueGrid
        venues={venues}
        loading={loading}
        error={error}
        onSelect={(sede) => navigate(`/venues/${sede.idSede}`)}
        emptyMessage="No encontramos sedes con estos filtros públicos. Ajusta ciudad, fecha o deporte."
      />

      {canLoadMore && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-[#3A6FF8] to-[#6C63FF] text-white font-semibold shadow-md hover:-translate-y-0.5 transition"
          >
            Cargar más
          </button>
        </div>
      )}
    </div>
  );
};

export default PublicVenuesPage;
