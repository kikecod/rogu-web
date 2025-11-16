import { Edit2, Eye, Trash2 } from 'lucide-react';
import type { CanchaAdmin } from '../types';
import DisciplinaBadge from './DisciplinaBadge';

const CanchaCard = ({
  cancha,
  onView,
  onEdit,
  onDelete,
}: {
  cancha: CanchaAdmin;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const placeholderImage = 'https://placehold.co/600x360/0f172a/ffffff?text=Cancha+sin+foto';
  const fotoPrincipal = cancha.fotos?.[0]?.urlFoto;
  const resumenDisciplina = cancha.disciplinas?.slice(0, 3) || [];

  return (
    <article className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-48 w-full overflow-hidden bg-gray-100">
        <img
          src={fotoPrincipal || placeholderImage}
          alt={cancha.nombre}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col p-4 space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{cancha.nombre}</h3>
          <p className="text-sm text-gray-500">
            {cancha.superficie || 'Superficie pendente'} •{' '}
            {cancha.dimensiones || 'Dimensiones no definidas'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <span>
            {typeof cancha.precio === 'number' ? `Bs ${cancha.precio.toFixed(2)}` : 'Precio no definido'}
          </span>
          <span className="text-xs uppercase tracking-wide text-gray-400">·</span>
          <span className="capitalize">{cancha.estado || 'sin estado'}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {resumenDisciplina.length > 0 ? (
            resumenDisciplina.map((disciplina) => (
              <DisciplinaBadge key={disciplina.idDisciplina} nombre={disciplina.nombre} />
            ))
          ) : (
            <span className="text-xs text-gray-400">No hay disciplinas asignadas</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span>{(cancha.fotos?.length || 0)} fotos</span>
          <span>•</span>
          <span>{cancha.disciplinas?.length || 0} disciplinas</span>
        </div>

        <div className="mt-auto flex flex-wrap gap-2">
          <button
            onClick={onView}
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Eye size={14} className="inline mr-1" />
            Ver detalle
          </button>
          <button
            onClick={onEdit}
            className="flex items-center gap-1 rounded-lg border border-blue-500 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
          >
            <Edit2 size={14} />
            Editar
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-1 rounded-lg border border-red-500 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <Trash2 size={14} />
            Eliminar
          </button>
        </div>
      </div>
    </article>
  );
};

export default CanchaCard;
