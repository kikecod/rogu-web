import { Search, X } from 'lucide-react';
import type { FiltrosSedes } from '../types';

interface SedesFiltrosProps {
  filtros: FiltrosSedes;
  onFiltrosChange: (filtros: FiltrosSedes) => void;
  onLimpiarFiltros: () => void;
}

export const SedesFiltros = ({ filtros, onFiltrosChange, onLimpiarFiltros }: SedesFiltrosProps) => {
  const handleChange = (key: keyof FiltrosSedes, value: any) => {
    onFiltrosChange({ ...filtros, [key]: value });
  };

  const tieneFiltrosActivos = () => {
    return (
      filtros.buscar ||
      filtros.ciudad ||
      filtros.estado ||
      filtros.verificada !== undefined ||
      filtros.activa !== undefined
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      {/* Búsqueda principal */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar sedes por nombre..."
          value={filtros.buscar || ''}
          onChange={(e) => handleChange('buscar', e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filtros adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Filtro por Ciudad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
          <input
            type="text"
            placeholder="Filtrar por ciudad..."
            value={filtros.ciudad || ''}
            onChange={(e) => handleChange('ciudad', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filtro por Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <input
            type="text"
            placeholder="Filtrar por estado..."
            value={filtros.estado || ''}
            onChange={(e) => handleChange('estado', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filtro por Verificación */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Verificación</label>
          <select
            value={filtros.verificada === undefined ? '' : filtros.verificada ? 'true' : 'false'}
            onChange={(e) =>
              handleChange(
                'verificada',
                e.target.value === '' ? undefined : e.target.value === 'true'
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas</option>
            <option value="true">Verificadas</option>
            <option value="false">No verificadas</option>
          </select>
        </div>

        {/* Filtro por Estado Activo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            value={filtros.activa === undefined ? '' : filtros.activa ? 'true' : 'false'}
            onChange={(e) =>
              handleChange('activa', e.target.value === '' ? undefined : e.target.value === 'true')
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas</option>
            <option value="true">Activas</option>
            <option value="false">Inactivas</option>
          </select>
        </div>
      </div>

      {/* Botón para limpiar filtros */}
      {tieneFiltrosActivos() && (
        <div className="flex justify-end">
          <button
            onClick={onLimpiarFiltros}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X size={16} />
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
};
