import { Link } from 'react-router-dom';
import { BarChart3, Building2, PlusCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../../../features/auth/context/AuthContext';
import { ROUTE_PATHS } from '../../../../constants';
import OwnerVenueCard from '../components/OwnerVenueCard';
import { useOwnerSedes } from '../hooks/useOwnerSedes';

const StatCard = ({
  label,
  value,
  icon: Icon,
  helper,
}: {
  label: string;
  value: string | number;
  icon: typeof Building2;
  helper?: string;
}) => (
  <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <Icon className="h-5 w-5 text-indigo-500" />
    </div>
    <p className="mt-3 text-2xl font-semibold text-slate-900">{value}</p>
    {helper ? <p className="mt-2 text-xs text-slate-500">{helper}</p> : null}
  </article>
);

const OwnerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { sedes, loading, error, refetch } = useOwnerSedes();

  const totalCourts = sedes.reduce((acc, sede) => acc + (sede.canchas?.length ?? 0), 0);
  const hasVenues = sedes.length > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <div>
            <p className="text-xs uppercase tracking-[0.25rem] text-indigo-200">
              Panel de administracion
            </p>
            <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">
              Hola{user?.usuario ? `, ${user.usuario}` : ''}. Gestiona tus sedes desde un mismo lugar.
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-indigo-100 sm:text-base">
              Revisa tus sedes, agrega nuevas ubicaciones y administra las canchas que ofreces a los clientes.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to={ROUTE_PATHS.OWNER_VENUES}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm transition-colors hover:bg-indigo-50"
            >
              <Building2 className="h-4 w-4" />
              Gestionar sedes
            </Link>
            <Link
              to={ROUTE_PATHS.OWNER_RESERVATIONS}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm transition-colors hover:bg-indigo-50"
            >
              <BarChart3 className="h-4 w-4" />
              Ver reservas
            </Link>
            <Link
              to={ROUTE_PATHS.OWNER_VENUE_CREATE}
              className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <PlusCircle className="h-4 w-4" />
              Agregar nueva sede
            </Link>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Sedes activas"
            value={sedes.length}
            icon={Building2}
            helper="Cantidad total de sedes registradas a tu nombre."
          />
          <StatCard
            label="Canchas registradas"
            value={totalCourts}
            icon={BarChart3}
            helper="Suma de todas las canchas asociadas a tus sedes."
          />
        </section>

        <section className="space-y-5">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Tus sedes</h2>
              <p className="text-sm text-slate-500">
                Accede al detalle de cada sede para administrar canchas, horarios y reservas.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void refetch()}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-700"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </header>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-48 animate-pulse rounded-xl border border-slate-200 bg-slate-100"
                ></div>
              ))}
            </div>
          ) : hasVenues ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {sedes.map((sede) => (
                <OwnerVenueCard key={sede.id_sede} venue={sede} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <div className="rounded-full bg-indigo-50 p-3 text-indigo-500">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-slate-900">Aun no tienes sedes registradas</h3>
                <p className="text-sm text-slate-500">
                  Empieza creando tu primera sede y luego agrega canchas para ofrecer a los clientes.
                </p>
              </div>
              <Link
                to={ROUTE_PATHS.OWNER_VENUE_CREATE}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
              >
                <PlusCircle className="h-4 w-4" />
                Crear sede
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default OwnerDashboardPage;
