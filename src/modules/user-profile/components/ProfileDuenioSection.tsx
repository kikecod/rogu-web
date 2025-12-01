import React from 'react';
import { BadgeCheck, Building2, Clock3 } from 'lucide-react';
import type { DuenioProfile } from '../types/profile.types';

interface ProfileDuenioSectionProps {
  duenio: DuenioProfile | null | undefined;
  canView?: boolean;
}

const formatDateTime = (value: string | Date | null | undefined): string => {
  if (!value) return 'No registrado';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'No registrado';
  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const ProfileDuenioSection: React.FC<ProfileDuenioSectionProps> = ({ duenio, canView }) => {
  if (!canView) return null;

  const d: DuenioProfile = duenio ?? {
    idDuenio: 0,
    verificado: false,
    verificadoEn: null,
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-lg shadow-indigo-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_0%,rgba(56,189,248,0.08),transparent_32%)]" />
      <div className="relative p-6 sm:p-7">
        <header className="mb-3 space-y-1">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-sky-500" />
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Perfil como dueno</h2>
          </div>
          <p className="text-sm text-slate-600">Estado y auditoria de verificacion.</p>
        </header>

        <dl className="grid grid-cols-1 text-sm sm:grid-cols-2 gap-x-6 gap-y-4">
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <dt className="text-slate-500">Estado de verificacion</dt>
            <dd className="text-slate-900 font-medium flex items-center gap-2">
              {d.verificado ? (
                <>
                  <BadgeCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Verificado</span>
                </>
              ) : (
                <>
                  <Clock3 className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Pendiente de verificacion</span>
                </>
              )}
            </dd>
          </div>

          <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <dt className="text-slate-500">Ultima verificacion</dt>
            <dd className="text-slate-900 font-medium break-words">
              {d.verificado ? formatDateTime(d.verificadoEn) : 'No registrada'}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
};

export default ProfileDuenioSection;
