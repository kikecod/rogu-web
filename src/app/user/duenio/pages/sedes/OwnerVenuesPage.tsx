import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, type Location } from 'react-router-dom';
import { Filter, PlusCircle, Search } from 'lucide-react';
import { ROUTE_PATHS } from '../../../../../constants';
import { useOwnerSedes } from '../../hooks/useOwnerSedes';
import OwnerVenueCard from '../../components/OwnerVenueCard';

interface LocationState {
  justCreated?: boolean;
  venueName?: string;
}

const OwnerVenuesPage: React.FC = () => {
  const { sedes, loading, error, refetch } = useOwnerSedes();
  const [query, setQuery] = useState('');
  const [banner, setBanner] = useState<string | null>(null);
  const location = useLocation() as Location & { state?: LocationState };
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.justCreated) {
      const venueName = location.state.venueName;
      setBanner(
        venueName
          ? `La sede "${venueName}" se registro correctamente.`
          : 'La sede se registro correctamente.'
      );
      void refetch();
      navigate(location.pathname, { replace: true });
    }
  }, [location.pathname, location.state, navigate, refetch]);

  const filteredVenues = useMemo(() => {
    if (!query.trim()) return sedes;
    const lowered = query.toLowerCase();
    return sedes.filter((venue) => {
      return (
        venue.nombre?.toLowerCase().includes(lowered) ||
        venue.direccion?.toLowerCase().includes(lowered) ||
        venue.descripcion?.toLowerCase().includes(lowered)
      );
    });
  }, [query, sedes]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">Sedes</p>
              <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Administrar sedes</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Revisa toda la informacion de tus sedes, manteniendo los datos actualizados y accediendo al detalle de cada ubicacion.
              </p>
            </div>
            <Link
              to={ROUTE_PATHS.OWNER_VENUE_CREATE}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              <PlusCircle className="h-4 w-4" />
              Nueva sede
            </Link>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-100/50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Buscar por nombre, direccion o descripcion"
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-600 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:border-slate-400 hover:text-slate-700"
              onClick={() => setQuery('')}
              disabled={!query}
            >
              <Filter className="h-4 w-4" />
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        {banner ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm">
            {banner}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-48 animate-pulse rounded-xl border border-slate-200 bg-slate-100"
              ></div>
            ))}
          </div>
        ) : filteredVenues.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVenues.map((venue) => (
              <OwnerVenueCard key={venue.id_sede} venue={venue} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <p className="text-sm text-slate-500">
              No encontramos sedes que coincidan con tu busqueda. Intenta con otros terminos.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default OwnerVenuesPage;
