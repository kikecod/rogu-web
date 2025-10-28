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
    <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
      <div className="flex items-center gap-3 mb-4">
        <BadgeCheck className="h-5 w-5 text-emerald-600" />
        <h2 className="text-lg font-semibold text-neutral-800">Perfil como cliente</h2>
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-6 text-sm">
        <div>
          <dt className="text-neutral-500">Apodo deportivo</dt>
          <dd className="text-neutral-900 font-medium">
            {cliente.apodo ? cliente.apodo : 'Sin apodo registrado'}
          </dd>
        </div>
        <div>
          <dt className="text-neutral-500">Nivel</dt>
          <dd className="text-neutral-900 font-medium flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            <span>{nivel !== null ? nivel : 'No asignado'}</span>
          </dd>
        </div>
        <div>
          <dt className="text-neutral-500">Observaciones</dt>
          <dd className="text-neutral-900 font-medium">
            {cliente.observaciones ? cliente.observaciones : 'Sin notas registradas'}
          </dd>
        </div>
      </dl>
    </div>
  );
};

export default ProfileClienteSection;
