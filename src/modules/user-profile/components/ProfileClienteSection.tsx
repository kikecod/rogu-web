import React from 'react';
import { BadgeCheck, Trophy } from 'lucide-react';
import type { ClienteProfile } from '../types/profile.types';

interface ProfileClienteSectionProps {
  cliente: ClienteProfile | null | undefined;
  canView?: boolean;
}

const ProfileClienteSection: React.FC<ProfileClienteSectionProps> = ({ cliente, canView }) => {
  if (!canView || !cliente) return null;

  const nivel =
    typeof cliente.nivel === 'number' && Number.isFinite(cliente.nivel) ? cliente.nivel : null;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-lg shadow-indigo-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(99,102,241,0.08),transparent_35%)]" />
      <div className="relative p-6 sm:p-7">
        <header className="mb-4 flex items-center gap-3">
          <BadgeCheck className="h-5 w-5 text-emerald-500" />
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Perfil como cliente</h2>
        </header>

        <dl className="grid grid-cols-1 text-sm sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <dt className="text-slate-500">Apodo deportivo</dt>
            <dd className="text-slate-900 font-medium break-words">
              {cliente.apodo ? cliente.apodo : 'Sin apodo registrado'}
            </dd>
          </div>

          <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <dt className="text-slate-500">Nivel</dt>
            <dd className="text-slate-900 font-medium flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500 shrink-0" />
              <span>{nivel !== null ? nivel : 'No asignado'}</span>
            </dd>
          </div>

          <div className="min-w-0 sm:col-span-2 lg:col-span-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <dt className="text-slate-500">Observaciones</dt>
            <dd className="text-slate-900 font-medium leading-relaxed break-words">
              {cliente.observaciones ? cliente.observaciones : 'Sin notas registradas'}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
};

export default ProfileClienteSection;
