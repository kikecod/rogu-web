import { BadgeDollarSign, Layers, Users, Ruler, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '../../../../constants';
import type { OwnerCourtSummary } from '../types/owner.types';

interface OwnerCourtCardProps {
  court: OwnerCourtSummary;
}

const OwnerCourtCard: React.FC<OwnerCourtCardProps> = ({ court }) => {
  const priceLabel =
    typeof court.precio === 'number' ? `Bs. ${court.precio.toFixed(2)}` : 'Sin precio';

  return (
    <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-lg">
      <header className="space-y-1">
        <h3 className="text-lg font-semibold text-slate-900">{court.nombre}</h3>
        <p className="text-xs uppercase tracking-wide text-indigo-500">ID #{court.id_cancha}</p>
      </header>

      <dl className="mt-4 space-y-2 text-sm text-slate-600">
        {court.superficie ? (
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-slate-400" />
            <div>
              <dt className="font-medium text-slate-700">Superficie</dt>
              <dd>{court.superficie}</dd>
            </div>
          </div>
        ) : null}

        {typeof court.aforoMax === 'number' ? (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-400" />
            <div>
              <dt className="font-medium text-slate-700">Aforo</dt>
              <dd>{court.aforoMax} personas</dd>
            </div>
          </div>
        ) : null}

        {court.iluminacion ? (
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-slate-400" />
            <div>
              <dt className="font-medium text-slate-700">Iluminacion</dt>
              <dd>{court.iluminacion}</dd>
            </div>
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          <BadgeDollarSign className="h-4 w-4 text-slate-400" />
          <div>
            <dt className="font-medium text-slate-700">Precio</dt>
            <dd>{priceLabel}</dd>
          </div>
        </div>
      </dl>

      {court.id_sede ? (
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <Ruler className="h-4 w-4 text-slate-400" />
          <span>ID sede: {court.id_sede}</span>
        </div>
      ) : null}

      <footer className="mt-auto pt-4">
        <Link
          to={ROUTE_PATHS.OWNER_COURT_DETAIL.replace(':id', String(court.id_cancha))}
          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
        >
          Ver detalle
        </Link>
      </footer>
    </article>
  );
};

export default OwnerCourtCard;
