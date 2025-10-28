import React from 'react';
import { Shield, Users, ClipboardList } from 'lucide-react';
import type { UserProfileData } from '../../types';

interface ProfileAdminSectionProps {
  data: UserProfileData;
}

const ProfileAdminSection: React.FC<ProfileAdminSectionProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-5 sm:p-6 transition-shadow duration-200 hover:shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 mb-3.5 sm:mb-4">
        <Shield className="h-5 w-5 text-slate-700" />
        <h2 className="text-base sm:text-lg font-semibold text-neutral-800">Privilegios de administracion</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Roles */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-4 sm:py-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-slate-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs uppercase tracking-wide text-slate-500 font-semibold">Roles</p>
              <p className="text-sm font-semibold text-slate-800 break-words">
                {data.usuario.roles.join(', ') || 'ADMIN'}
              </p>
            </div>
          </div>
        </div>

        {/* ID Usuario */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-4 sm:py-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start gap-3">
            <ClipboardList className="h-5 w-5 text-slate-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs uppercase tracking-wide text-slate-500 font-semibold">ID usuario</p>
              <p className="text-sm font-semibold text-slate-800 break-words">#{data.usuario.id_usuario}</p>
            </div>
          </div>
        </div>

        {/* Accesos */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-4 sm:py-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs uppercase tracking-wide text-slate-500 font-semibold">Accesos</p>
            <p className="text-sm font-medium text-slate-700 leading-relaxed">
              Tiene acceso completo al panel administrativo y gestion de usuarios.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileAdminSection;
