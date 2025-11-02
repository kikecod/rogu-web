// 🔧 COMPONENTE: Selector de Filtros para Analytics

import React from 'react';
import { Filter } from 'lucide-react';

interface AnalyticsFiltrosProps {
  sedes?: Array<{ idSede: number; nombre: string }>;
  canchas?: Array<{ idCancha: number; nombre: string }>;
  selectedSedeId?: number;
  selectedCanchaId?: number;
  onSedeChange?: (idSede: number | undefined) => void;
  onCanchaChange?: (idCancha: number | undefined) => void;
  fechaInicio?: string;
  fechaFin?: string;
  onFechaInicioChange?: (fecha: string) => void;
  onFechaFinChange?: (fecha: string) => void;
  showDateFilters?: boolean;
}

const AnalyticsFiltros: React.FC<AnalyticsFiltrosProps> = ({
  sedes = [],
  canchas = [],
  selectedSedeId,
  selectedCanchaId,
  onSedeChange,
  onCanchaChange,
  fechaInicio,
  fechaFin,
  onFechaInicioChange,
  onFechaFinChange,
  showDateFilters = false
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
      <div className="flex items-center mb-4">
        <Filter className="h-5 w-5 text-gray-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Filtro de Sede */}
        {sedes.length > 0 && onSedeChange && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sede
            </label>
            <select
              value={selectedSedeId || ''}
              onChange={(e) => onSedeChange(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las sedes</option>
              {sedes.map((sede) => (
                <option key={sede.idSede} value={sede.idSede}>
                  {sede.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Filtro de Cancha */}
        {canchas.length > 0 && onCanchaChange && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cancha
            </label>
            <select
              value={selectedCanchaId || ''}
              onChange={(e) => onCanchaChange(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las canchas</option>
              {canchas.map((cancha) => (
                <option key={cancha.idCancha} value={cancha.idCancha}>
                  {cancha.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Filtros de fecha */}
        {showDateFilters && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={fechaInicio || ''}
                onChange={(e) => onFechaInicioChange && onFechaInicioChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Fin
              </label>
              <input
                type="date"
                value={fechaFin || ''}
                onChange={(e) => onFechaFinChange && onFechaFinChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsFiltros;
