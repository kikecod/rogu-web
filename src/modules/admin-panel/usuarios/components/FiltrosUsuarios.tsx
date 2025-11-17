import { Search, Filter, X } from 'lucide-react';
import { useState } from 'react';
import type { TipoRol, EstadoUsuario } from '../../types';

interface FiltrosUsuariosProps {
  onBuscar: (termino: string) => void;
  onFiltrarRol: (rol?: TipoRol) => void;
  onFiltrarEstado: (estado?: EstadoUsuario) => void;
  rolActual?: TipoRol;
  estadoActual?: EstadoUsuario;
  busquedaActual?: string;
}

export const FiltrosUsuarios = ({
  onBuscar,
  onFiltrarRol,
  onFiltrarEstado,
  rolActual,
  estadoActual,
  busquedaActual,
}: FiltrosUsuariosProps) => {
  const [termino, setTermino] = useState(busquedaActual || '');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    onBuscar(termino);
  };

  const limpiarBusqueda = () => {
    setTermino('');
    onBuscar('');
  };

  const limpiarFiltros = () => {
    onFiltrarRol(undefined);
    onFiltrarEstado(undefined);
    setTermino('');
    onBuscar('');
  };

  const hayFiltrosActivos = rolActual || estadoActual || busquedaActual;

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      {/* Barra de búsqueda */}
      <form onSubmit={handleBuscar} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={termino}
            onChange={(e) => setTermino(e.target.value)}
            placeholder="Buscar por nombre, correo, usuario o CI..."
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {termino && (
            <button
              type="button"
              onClick={limpiarBusqueda}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Buscar
        </button>
        <button
          type="button"
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition inline-flex items-center gap-2"
        >
          <Filter size={20} />
          Filtros
        </button>
      </form>

      {/* Panel de filtros */}
      {mostrarFiltros && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          {/* Filtro por rol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rol
            </label>
            <select
              value={rolActual || ''}
              onChange={(e) => onFiltrarRol(e.target.value as TipoRol || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los roles</option>
              <option value="ADMIN">Admin</option>
              <option value="CLIENTE">Cliente</option>
              <option value="DUENIO">Dueño</option>
              <option value="CONTROLADOR">Controlador</option>
            </select>
          </div>

          {/* Filtro por estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={estadoActual || ''}
              onChange={(e) => onFiltrarEstado(e.target.value as EstadoUsuario || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
              <option value="BLOQUEADO">Bloqueado</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="ELIMINADO">Eliminado</option>
            </select>
          </div>
        </div>
      )}

      {/* Filtros activos */}
      {hayFiltrosActivos && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600">Filtros activos:</span>
          {rolActual && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              Rol: {rolActual}
              <button onClick={() => onFiltrarRol(undefined)} className="hover:text-blue-900">
                <X size={14} />
              </button>
            </span>
          )}
          {estadoActual && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              Estado: {estadoActual}
              <button onClick={() => onFiltrarEstado(undefined)} className="hover:text-green-900">
                <X size={14} />
              </button>
            </span>
          )}
          {busquedaActual && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              Búsqueda: "{busquedaActual}"
              <button onClick={limpiarBusqueda} className="hover:text-purple-900">
                <X size={14} />
              </button>
            </span>
          )}
          <button
            onClick={limpiarFiltros}
            className="text-sm text-red-600 hover:text-red-800 underline"
          >
            Limpiar todos los filtros
          </button>
        </div>
      )}
    </div>
  );
};
