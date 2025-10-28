import React from 'react';
import { Shield, Users, ClipboardList } from 'lucide-react';
import type { UserProfileData } from '../../../../features/profile/types';

interface ProfileAdminSectionProps {
  data: UserProfileData;
}

const ProfileAdminSection: React.FC<ProfileAdminSectionProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Shield className="h-5 w-5 text-slate-700" />
        <h2 className="text-lg font-semibold text-neutral-800">Privilegios de administracion</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-5">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-slate-600" />
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Roles</p>
              <p className="text-sm font-semibold text-slate-800">{data.usuario.roles.join(', ') || 'ADMIN'}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-5">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-5 w-5 text-slate-600" />
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">ID usuario</p>
              <p className="text-sm font-semibold text-slate-800">#{data.usuario.id_usuario}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Accesos</p>
            <p className="text-sm font-medium text-slate-700">
              Tiene acceso completo al panel administrativo y gestion de usuarios.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileAdminSection;

