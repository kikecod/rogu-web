'use client';

import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PublicHero from '@/modules/public/components/PublicHero';
import PublicFilters from '@/modules/public/components/PublicFilters';
import PublicVenueGrid from '@/modules/public/components/PublicVenueGrid';
import { usePublicVenues } from '@/modules/public/hooks/usePublicVenues';
import Footer from '@/components/Footer';

const HomePage = () => {
  const navigate = useNavigate();
  const listRef = useRef<HTMLDivElement | null>(null);
  const {
    filters,
    setFilters,
    venues,
    loading,
    error,
    total,
    loadMore,
    totalPages,
    page,
    refetch,
  } = usePublicVenues({}, 12);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleExplore = () => {
    listRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const canLoadMore = page < totalPages && !loading;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef2fb] via-white to-[#f3f6ff]">
      <section className="w-full">
        <PublicHero onExplore={handleExplore} />
      </section>

      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10">
        <PublicFilters values={filters} onChange={setFilters} onSubmit={() => refetch()} />
      </section>

      <section ref={listRef} className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-14">
        <div className="space-y-5 bg-white/65 backdrop-blur rounded-3xl border border-[#E9ECF5] shadow-lg shadow-black/5 p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-[#0F172A]/60 font-semibold">
                Exploración pública
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">Sedes disponibles</h2>
              <p className="text-sm text-[#0F172A]/70">
                Busca, filtra y visualiza. Al reservar te pediremos iniciar sesión.
              </p>
            </div>
            <div className="text-sm px-4 py-2 rounded-xl bg-white/80 border border-[#E9ECF5] text-[#0F172A]/80 shadow-sm">
              {loading ? 'Cargando...' : `${total} sedes`}
            </div>
          </div>

          <PublicVenueGrid
            venues={venues}
            loading={loading}
            error={error}
            onSelect={(sede) => navigate(`/venues/${sede.idSede}`)}
            emptyMessage="No encontramos sedes con estos filtros. Ajusta ciudad, fecha o deporte."
          />

          {canLoadMore && (
            <div className="flex justify-center">
              <button
                onClick={loadMore}
                className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-[#3A6FF8] to-[#6C63FF] text-white font-semibold shadow-md hover:-translate-y-0.5 transition"
              >
                Mostrar más
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
