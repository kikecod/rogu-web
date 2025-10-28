import React from 'react';
import { BadgeCheck, Trophy } from 'lucide-react';
import type { ClienteProfile } from '../../../../features/profile/types';

interface ProfileClienteSectionProps {
  cliente: ClienteProfile | null | undefined;
  canView?: boolean;
}

const ProfileClienteSection: React.FC<ProfileClienteSectionProps> = ({ cliente, canView }) => {
  if (!canView || !cliente) return null;

  const nivel =
    typeof cliente.nivel === 'number' && Number.isFinite(cliente.nivel) ? cliente.nivel : null;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-emerald-100 p-5 sm:p-6 transition-shadow duration-200 hover:shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 mb-3.5 sm:mb-4">
        <BadgeCheck className="h-5 w-5 text-emerald-600" />
        <h2 className="text-base sm:text-lg font-semibold text-neutral-800">Perfil como cliente</h2>
      </div>
      <dl className="grid grid-cols-1 gap-y-3.5 sm:gap-y-4 gap-x-6 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <div className="min-w-0">
          <dt className="text-neutral-500">Apodo deportivo</dt>
          <dd className="text-neutral-900 font-medium break-words">
            {cliente.apodo ? cliente.apodo : 'Sin apodo registrado'}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-neutral-500">Nivel</dt>
          <dd className="text-neutral-900 font-medium flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500 shrink-0" />
            <span>{nivel !== null ? nivel : 'No asignado'}</span>
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-neutral-500">Observaciones</dt>
          <dd className="text-neutral-900 font-medium leading-relaxed break-words">
            {cliente.observaciones ? cliente.observaciones : 'Sin notas registradas'}
          </dd>
        </div>
      </dl>
    </div>
  );
};

export default ProfileClienteSection;
