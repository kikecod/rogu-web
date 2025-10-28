import React from 'react';
import { Clock3, KeyRound, ScanBarcode } from 'lucide-react';
import type { ControladorProfile } from '../../types';

interface ProfileControladorSectionProps {
  controlador: ControladorProfile | null | undefined;
  canView?: boolean;
}

const ProfileControladorSection: React.FC<ProfileControladorSectionProps> = ({ controlador, canView }) => {
  if (!canView || !controlador) return null;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-purple-100 p-5 sm:p-6 transition-shadow duration-200 hover:shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 mb-3.5 sm:mb-4">
        <ScanBarcode className="h-5 w-5 text-purple-600" />
        <h2 className="text-base sm:text-lg font-semibold text-neutral-800">Perfil como controlador</h2>
      </div>
      <dl className="grid grid-cols-1 gap-y-3.5 sm:gap-y-4 gap-x-6 text-sm sm:grid-cols-2 lg:grid-cols-3">
        {/* Código de empleado */}
        <div className="min-w-0">
          <dt className="text-neutral-500">Código de empleado</dt>
          <dd className="text-neutral-900 font-medium flex items-center gap-2 break-all">
            <KeyRound className="h-4 w-4 text-purple-500 shrink-0" />
            <span>{controlador.codigoEmpleado || 'No asignado'}</span>
          </dd>
        </div>

        {/* Turno */}
        <div className="min-w-0">
          <dt className="text-neutral-500">Turno</dt>
          <dd className="text-neutral-900 font-medium flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-blue-500 shrink-0" />
            <span>{controlador.turno || 'No definido'}</span>
          </dd>
        </div>

        {/* Estado */}
        <div className="min-w-0">
          <dt className="text-neutral-500">Estado</dt>
          <dd className="text-neutral-900 font-medium mt-1">
            {controlador.activo ? (
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
    </div>
  );
};

export default ProfileControladorSection;
