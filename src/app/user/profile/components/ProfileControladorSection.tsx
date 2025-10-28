import React from 'react';
import { Clock3, KeyRound, ScanBarcode } from 'lucide-react';
import type { ControladorProfile } from '../../../../features/profile/types';

interface ProfileControladorSectionProps {
  controlador: ControladorProfile | null | undefined;
  canView?: boolean;
}

const ProfileControladorSection: React.FC<ProfileControladorSectionProps> = ({ controlador, canView }) => {
  if (!canView || !controlador) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
      <div className="flex items-center gap-3 mb-4">
        <ScanBarcode className="h-5 w-5 text-purple-600" />
        <h2 className="text-lg font-semibold text-neutral-800">Perfil como controlador</h2>
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-6 text-sm">
        <div>
          <dt className="text-neutral-500">Codigo de empleado</dt>
          <dd className="text-neutral-900 font-medium flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-purple-500" />
            <span>{controlador.codigoEmpleado || 'No asignado'}</span>
          </dd>
        </div>
        <div>
          <dt className="text-neutral-500">Turno</dt>
          <dd className="text-neutral-900 font-medium flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-blue-500" />
            <span>{controlador.turno || 'No definido'}</span>
          </dd>
        </div>
        <div>
          <dt className="text-neutral-500">Estado</dt>
          <dd className="text-neutral-900 font-medium">
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
