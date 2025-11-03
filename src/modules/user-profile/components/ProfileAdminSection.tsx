import React from 'react';
import { Shield, Users, ClipboardList } from 'lucide-react';
import type { UserProfileData } from '../types/profile.types';

interface ProfileAdminSectionProps {
  data: UserProfileData;
}

const ProfileAdminSection: React.FC<ProfileAdminSectionProps> = ({ data }) => {
  const roles = data?.usuario?.roles ?? [];

  return (
    <section className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition">
      {/* Header */}
      <header className="mb-4 sm:mb-5">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-indigo-600" />
          <h2 className="text-base sm:text-lg font-semibold text-neutral-900">
            Privilegios de administración
          </h2>
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          Información operativa del usuario administrador
        </p>
      </header>

      {/* Content */}
      <div>
        <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Roles */}
          <div className="rounded-xl border border-neutral-200 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <Users className="mt-0.5 h-5 w-5 shrink-0 text-neutral-500" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Roles
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {roles.length ? (
                    roles.map((r) => (
                      <span
                        key={r}
                        className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase"
                      >
                        {r}
                      </span>
                    ))
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold uppercase">
                      ADMIN
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ID Usuario */}
          <div className="rounded-xl border border-neutral-200 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-neutral-500" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  ID usuario
                </p>
                <p className="mt-1 text-sm font-semibold text-neutral-900 break-words">
                  #{data.usuario.idUsuario}
                </p>
              </div>
            </div>
          </div>

          {/* Accesos */}
          <div className="rounded-xl border border-neutral-200 p-4 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Accesos
            </p>
            <p className="mt-2 text-sm font-medium text-neutral-800 leading-relaxed">
              Tiene acceso completo al panel administrativo y gestión de usuarios.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileAdminSection;
