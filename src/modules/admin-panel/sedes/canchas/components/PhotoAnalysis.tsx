import { Camera } from 'lucide-react';
import type { FotoCanchaAdmin } from '../types';

interface PhotoAnalysisProps {
  fotos?: FotoCanchaAdmin[];
}

const PhotoAnalysis = ({ fotos = [] }: PhotoAnalysisProps) => {
  const total = fotos.length;
  const principales = fotos.filter((foto) => foto.esPrincipal).length;
  const ordenes = fotos
    .map((foto) => foto.orden)
    .filter((orden): orden is number => typeof orden === 'number');
  const maxOrden = ordenes.length ? Math.max(...ordenes) : null;
  const promedioOrden =
    ordenes.length > 0
      ? (ordenes.reduce((sum, orden) => sum + orden, 0) / ordenes.length).toFixed(1)
      : null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 shadow-sm">
      <div className="flex items-center gap-2">
        <Camera size={18} className="text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-900">Análisis de fotos</h3>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
        <div>
          <p className="text-xs uppercase tracking-wide">Total</p>
          <p className="text-2xl font-semibold text-gray-900">{total}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide">Principales</p>
          <p className="text-2xl font-semibold text-gray-900">{principales}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide">Orden máximo</p>
          <p className="text-2xl font-semibold text-gray-900">{maxOrden ?? '-'}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide">Orden promedio</p>
          <p className="text-2xl font-semibold text-gray-900">
            {promedioOrden ?? '-'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PhotoAnalysis;
