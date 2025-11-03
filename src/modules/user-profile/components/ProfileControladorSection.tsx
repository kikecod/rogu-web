import React from 'react';
import { Clock3, KeyRound, ScanBarcode } from 'lucide-react';
import type { ControladorProfile } from '../types/profile.types';

interface ProfileControladorSectionProps {
  controlador: ControladorProfile | null | undefined;
  canView?: boolean;
}

const ProfileControladorSection: React.FC<ProfileControladorSectionProps> = ({ controlador, canView }) => {
  if (!canView) return null;

  // Si el rol existe pero no llegó el objeto `controlador`, renderizamos con valores por defecto
  const c: ControladorProfile = controlador ?? {
    idControlador: 0,
    codigoEmpleado: null,
    turno: null,
    activo: false,
  };

  return (
    <section className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition">
      <header className="mb-2 sm:mb-3">
        <div className="flex items-center gap-3">
          <ScanBarcode className="h-5 w-5 text-purple-600" />
          <h2 className="text-base sm:text-lg font-semibold text-neutral-900">Perfil como controlador</h2>
        </div>
        <p className="mt-1 text-sm text-neutral-500">Datos operativos del rol CONTROLADOR</p>
      </header>

      <dl className="grid grid-cols-1 text-sm sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
        {/* Código de empleado */}
        <div className="min-w-0">
          <dt className="text-neutral-500">Código de empleado</dt>
          <dd className="text-neutral-900 font-medium flex items-center gap-2 break-all">
            <KeyRound className="h-4 w-4 text-purple-500 shrink-0" />
            <span>{c.codigoEmpleado || 'No asignado'}</span>
          </dd>
        </div>

        {/* Turno */}
        <div className="min-w-0">
          <dt className="text-neutral-500">Turno</dt>
          <dd className="text-neutral-900 font-medium flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-blue-500 shrink-0" />
            <span>{c.turno || 'No definido'}</span>
          </dd>
        </div>

        {/* Estado */}
        <div className="min-w-0">
          <dt className="text-neutral-500">Estado</dt>
          <dd className="mt-1">
            {c.activo ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                Activo
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                Inactivo
              </span>
            )}
          </dd>
        </div>
      </dl>
    </section>
  );
};

export default ProfileControladorSection;
