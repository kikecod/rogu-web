import React from 'react';
import { Clock3, KeyRound, ScanBarcode } from 'lucide-react';
import type { ControladorProfile } from '../types/profile.types';

interface ProfileControladorSectionProps {
  controlador: ControladorProfile | null | undefined;
  canView?: boolean;
}

const ProfileControladorSection: React.FC<ProfileControladorSectionProps> = ({ controlador, canView }) => {
  if (!canView) return null;

  const c: ControladorProfile = controlador ?? {
    idControlador: 0,
    codigoEmpleado: null,
    turno: null,
    activo: false,
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-lg shadow-indigo-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(168,85,247,0.08),transparent_32%)]" />
      <div className="relative p-6 sm:p-7">
        <header className="mb-3 space-y-1">
          <div className="flex items-center gap-3">
            <ScanBarcode className="h-5 w-5 text-purple-500" />
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Perfil como controlador</h2>
          </div>
          <p className="text-sm text-slate-600">Datos operativos del rol CONTROLADOR.</p>
        </header>

        <dl className="grid grid-cols-1 text-sm sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <dt className="text-slate-500">Codigo de empleado</dt>
            <dd className="text-slate-900 font-medium flex items-center gap-2 break-all">
              <KeyRound className="h-4 w-4 text-purple-500 shrink-0" />
              <span>{c.codigoEmpleado || 'No asignado'}</span>
            </dd>
          </div>

          <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <dt className="text-slate-500">Turno</dt>
            <dd className="text-slate-900 font-medium flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-sky-500 shrink-0" />
              <span>{c.turno || 'No definido'}</span>
            </dd>
          </div>

          <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <dt className="text-slate-500">Estado</dt>
            <dd className="mt-1">
              {c.activo ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold ring-1 ring-emerald-200">
                  Activo
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold ring-1 ring-amber-200">
                  Inactivo
                </span>
              )}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
};

export default ProfileControladorSection;
