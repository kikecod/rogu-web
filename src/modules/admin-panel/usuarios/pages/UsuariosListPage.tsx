import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, RefreshCw } from 'lucide-react';
import { useUsuarios } from '../hooks/useUsuarios';
import { FiltrosUsuarios } from '../components/FiltrosUsuarios';
import { TablaUsuarios } from '../components/TablaUsuarios';
import { Paginacion } from '../components/Paginacion';
import { ROUTES } from '@/config/routes';
import type { Usuario } from '../../types';

const UsuariosListPage = () => {
  const navigate = useNavigate();
  const {
    usuarios,
    loading,
    error,
    total,
    paginas,
    filtros,
    cambiarPagina,
    buscar,
    filtrarPorRol,
    filtrarPorEstado,
    refrescar,
  } = useUsuarios();

  const [usuarioAEliminar, setUsuarioAEliminar] = useState<Usuario | null>(null);
  const [motivoBaja, setMotivoBaja] = useState('');
  const [eliminando, setEliminando] = useState(false);

  const handleEliminar = async () => {
    if (!usuarioAEliminar) return;

    setEliminando(true);
    try {
      const { usuariosService } = await import('../services/usuarios.service');
      await usuariosService.eliminar(usuarioAEliminar.idUsuario, motivoBaja);
      setUsuarioAEliminar(null);
      setMotivoBaja('');
      refrescar();
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      alert('Error al dar de baja al usuario');
    } finally {
      setEliminando(false);
    }
  };

  const limit = filtros.limit || 20;
  const mostrandoDesde = ((filtros.page || 1) - 1) * limit + 1;
  const mostrandoHasta = Math.min((filtros.page || 1) * limit, total);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="mt-2 text-sm text-gray-600">
            Administra todos los usuarios del sistema
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => refrescar()}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw size={20} />
            Refrescar
          </button>
          <button
            onClick={() => navigate(ROUTES.admin.usuariosNuevo)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <UserPlus size={20} />
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">Total Usuarios</div>
          <div className="mt-1 text-3xl font-semibold text-gray-900">{total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">Mostrando</div>
          <div className="mt-1 text-3xl font-semibold text-gray-900">{usuarios.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">Página Actual</div>
          <div className="mt-1 text-3xl font-semibold text-gray-900">{filtros.page}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">Total Páginas</div>
          <div className="mt-1 text-3xl font-semibold text-gray-900">{paginas}</div>
        </div>
      </div>

      {/* Filtros */}
      <FiltrosUsuarios
        onBuscar={buscar}
        onFiltrarRol={filtrarPorRol}
        onFiltrarEstado={filtrarPorEstado}
        rolActual={filtros.rol}
        estadoActual={filtros.estado}
        busquedaActual={filtros.buscar}
      />

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Tabla */}
      <TablaUsuarios
        usuarios={usuarios}
        onEliminar={setUsuarioAEliminar}
        loading={loading}
      />

      {/* Paginación */}
      {!loading && usuarios.length > 0 && (
        <Paginacion
          paginaActual={filtros.page || 1}
          totalPaginas={paginas}
          onCambiarPagina={cambiarPagina}
          total={total}
          mostrandoDesde={mostrandoDesde}
          mostrandoHasta={mostrandoHasta}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      {usuarioAEliminar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirmar baja de usuario
            </h3>
            <p className="text-gray-600 mb-4">
              ¿Estás seguro de dar de baja a{' '}
              <strong>
                {usuarioAEliminar.persona?.nombre} {usuarioAEliminar.persona?.apellidoPaterno}
              </strong>
              ?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo de la baja (opcional)
              </label>
              <textarea
                value={motivoBaja}
                onChange={(e) => setMotivoBaja(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows={3}
                placeholder="Describe el motivo..."
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setUsuarioAEliminar(null);
                  setMotivoBaja('');
                }}
                disabled={eliminando}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminar}
                disabled={eliminando}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {eliminando ? 'Eliminando...' : 'Confirmar Baja'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosListPage;
