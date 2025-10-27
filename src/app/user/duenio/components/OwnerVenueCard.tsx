import { Building2, MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '../../../../constants';
import type { OwnerVenue } from '../types/owner.types';

interface OwnerVenueCardProps {
  venue: OwnerVenue;
  footerSlot?: React.ReactNode;
}

const OwnerVenueCard: React.FC<OwnerVenueCardProps> = ({ venue, footerSlot }) => {
  const canchaCount = venue.canchas?.length ?? 0;
  const topCourts = (venue.canchas ?? []).slice(0, 3);
  const remainingCourts = Math.max(0, canchaCount - topCourts.length);

  const firstCourtId = venue.canchas?.[0]?.id_cancha;

  return (
    <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg">
      <div className="space-y-4 p-5">
        <header className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">
              <Building2 className="h-4 w-4" />
              Sede deportiva
            </span>
            <h3 className="text-lg font-semibold text-slate-900">{venue.nombre}</h3>
            {venue.direccion ? (
              <p className="flex items-center gap-2 text-sm text-slate-500">
                <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                <span>{venue.direccion}</span>
              </p>
            ) : null}
            {venue.descripcion ? (
              <p className="line-clamp-2 text-sm text-slate-600">{venue.descripcion}</p>
            ) : null}
          </div>
          <div className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
            {canchaCount === 1 ? '1 cancha' : `${canchaCount} canchas`}
          </div>
        </header>

        {topCourts.length > 0 ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Canchas destacadas
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {topCourts.map((court) => (
                <span
                  key={court.id_cancha}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {court.nombre}
                  {typeof court.precio === 'number' ? (
                    <span className="text-[10px] text-slate-500">Bs. {court.precio}</span>
                  ) : null}
                </span>
              ))}
              {remainingCourts > 0 ? (
                <span className="inline-flex items-center rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
                  +{remainingCourts} mas
                </span>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
            Esta sede todavia no tiene canchas cargadas.
          </div>
        )}

        <dl className="grid grid-cols-1 gap-3 text-xs text-slate-500 sm:grid-cols-2">
          {venue.telefono ? (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-slate-400" />
              <div>
                <dt className="font-semibold uppercase tracking-wide">Telefono</dt>
                <dd className="text-slate-600">{venue.telefono}</dd>
              </div>
            </div>
          ) : null}
          {venue.email ? (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-400" />
              <div>
                <dt className="font-semibold uppercase tracking-wide">Email</dt>
                <dd className="text-slate-600">{venue.email}</dd>
              </div>
            </div>
          ) : null}
        </dl>
      </div>

      <footer className="mt-auto border-t border-slate-100 px-5 py-3">
        {footerSlot ?? (
          <div className="flex items-center justify-between">
            <Link
              to={ROUTE_PATHS.OWNER_VENUE_DETAIL.replace(':id', String(venue.id_sede))}
              className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
            >
              Ver detalle
            </Link>
            {firstCourtId ? (
              <Link
                to={ROUTE_PATHS.OWNER_COURT_DETAIL.replace(':id', String(firstCourtId))}
                className="text-xs text-slate-500 transition-colors hover:text-slate-700"
              >
                Abrir cancha
              </Link>
            ) : (
              <Link
                to={ROUTE_PATHS.OWNER_VENUE_DETAIL.replace(':id', String(venue.id_sede))}
                className="text-xs text-slate-500 transition-colors hover:text-slate-700"
              >
                Agregar canchas
              </Link>
            )}
          </div>
        )}
      </footer>
    </article>
  );
};

export default OwnerVenueCard;
