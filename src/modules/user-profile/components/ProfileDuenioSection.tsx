import React from 'react';
import { BadgeCheck, Building2, Clock3 } from 'lucide-react';
import type { DuenioProfile } from '../types/profile.types';

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
  if (!canView) return null;

  // Si el usuario tiene el rol pero aún no llega/ no existe el objeto `duenio`,
  // mostramos la sección con valores por defecto para que sea visible en el perfil.
  const d: DuenioProfile = duenio ?? {
    idDuenio: 0,
    verificado: false,
    verificadoEn: null,
  };

  return (
    <section className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition">
      {/* Header */}
      <header className="mb-2 sm:mb-3">
        <div className="flex items-center gap-3">
          <Building2 className="h-5 w-5 text-blue-600" />
          <h2 className="text-base sm:text-lg font-semibold text-neutral-900">Perfil como dueño</h2>
        </div>
        <p className="mt-1 text-sm text-neutral-500">Estado y auditoría de verificación</p>
      </header>

      {/* Content */}
      <dl className="grid grid-cols-1 text-sm sm:grid-cols-2 gap-x-6 gap-y-4">
        <div className="min-w-0">
          <dt className="text-neutral-500">Estado de verificación</dt>
          <dd className="text-neutral-900 font-medium flex items-center gap-2">
            {d.verificado ? (
              <>
                <BadgeCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Verificado</span>
              </>
            ) : (
              <>
                <Clock3 className="h-4 w-4 text-amber-500 shrink-0" />
                <span>Pendiente de verificación</span>
              </>
            )}
          </dd>
        </div>

        <div className="min-w-0">
          <dt className="text-neutral-500">Última verificación</dt>
          <dd className="text-neutral-900 font-medium break-words">
            {d.verificado ? formatDateTime(d.verificadoEn) : 'No registrada'}
          </dd>
        </div>
      </dl>
    </section>
  );
};

export default ProfileDuenioSection;
