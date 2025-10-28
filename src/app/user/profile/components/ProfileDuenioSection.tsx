import React from 'react';
import { BadgeCheck, Building2, Clock3 } from 'lucide-react';
import type { DuenioProfile } from '../../../../features/profile/types';

interface ProfileDuenioSectionProps {
  duenio: DuenioProfile | null | undefined;
  canView?: boolean;
}

const formatDateTime = (value: string | Date | null | undefined): string => {
  if (!value) return 'No registrado';
  try {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return 'No registrado';
    return new Intl.DateTimeFormat('es-BO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return 'No registrado';
  }
};

const ProfileDuenioSection: React.FC<ProfileDuenioSectionProps> = ({ duenio, canView }) => {
  if (!canView || !duenio) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Building2 className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-neutral-800">Perfil como due\u00f1o</h2>
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
        <div>
          <dt className="text-neutral-500">Estado de verificacion</dt>
          <dd className="text-neutral-900 font-medium flex items-center gap-2">
            {duenio.verificado ? (
              <>
                <BadgeCheck className="h-4 w-4 text-emerald-500" />
                <span>Verificado</span>
              </>
            ) : (
              <>
                <Clock3 className="h-4 w-4 text-amber-500" />
                <span>Pendiente de verificacion</span>
              </>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-neutral-500">Ultima verificacion</dt>
          <dd className="text-neutral-900 font-medium">
            {duenio.verificado ? formatDateTime(duenio.verificado_en) : 'No registrada'}
          </dd>
        </div>
      </dl>
    </div>
  );
};

export default ProfileDuenioSection;
