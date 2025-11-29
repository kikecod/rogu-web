import React from 'react';
import { Shield, Users, ClipboardList } from 'lucide-react';
import type { UserProfileData } from '../types/profile.types';

interface ProfileAdminSectionProps {
  data: UserProfileData;
}

const ProfileAdminSection: React.FC<ProfileAdminSectionProps> = ({ data }) => {
  const roles = data?.usuario?.roles ?? [];

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-lg shadow-indigo-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(99,102,241,0.08),transparent_30%)]" />
      <div className="relative space-y-5 p-6 sm:p-7">
        <header className="space-y-1">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-indigo-500" />
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Privilegios de administracion</h2>
          </div>
          <p className="text-sm text-slate-600">Resumen operativo del usuario administrador.</p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5 shadow-inner">
            <div className="flex items-start gap-3">
              <Users className="mt-0.5 h-5 w-5 shrink-0 text-indigo-500" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Roles</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {roles.length ? (
                    roles.map((r) => (
                      <span
                        key={r}
                        className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold uppercase ring-1 ring-indigo-100"
                      >
                        {r}
                      </span>
                    ))
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold uppercase ring-1 ring-slate-200">
                      ADMIN
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5 shadow-inner">
            <div className="flex items-start gap-3">
              <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-indigo-500" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">ID usuario</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 break-words">
                  #{data.usuario.idUsuario}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5 shadow-inner">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Accesos</p>
            <p className="mt-2 text-sm font-medium text-slate-800 leading-relaxed">
              Acceso completo al panel administrativo y gestion de usuarios. Usa autenticacion reforzada y doble verificacion.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileAdminSection;
