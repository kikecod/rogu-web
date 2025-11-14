import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, ChevronRight, Check } from 'lucide-react';
import { usuariosService } from '../services/usuarios.service';
import type { Usuario, EstadoUsuario, TipoRol } from '../../types';
import { ROUTES } from '@/config/routes';

const UsuariosListPage = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRol, setSelectedRol] = useState<TipoRol | ''>('');
  const [selectedEstado, setSelectedEstado] = useState<EstadoUsuario | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadUsuarios();
  }, [searchTerm, selectedRol, selectedEstado, currentPage]);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const response = await usuariosService.getAll({
        buscar: searchTerm || undefined,
        rol: selectedRol || undefined,
        estado: selectedEstado || undefined,
        page: currentPage,
        limit: 20,
      });
      setUsuarios(response.usuarios);
      setTotalPages(response.paginas);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadgeColor = (estado: EstadoUsuario) => {
    const colors = {
      ACTIVO: 'bg-green-100 text-green-800',
      INACTIVO: 'bg-gray-100 text-gray-800',
      BLOQUEADO: 'bg-red-100 text-red-800',
      PENDIENTE: 'bg-yellow-100 text-yellow-800',
      DESACTIVADO: 'bg-orange-100 text-orange-800',
      ELIMINADO: 'bg-red-100 text-red-800',
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  const getRolBadgeColor = (rol: string) => {
    const colors: Record<string, string> = {
      ADMIN: 'bg-purple-100 text-purple-800',
      DUENIO: 'bg-blue-100 text-blue-800',
      CLIENTE: 'bg-green-100 text-green-800',
      CONTROLADOR: 'bg-indigo-100 text-indigo-800',
    };
    return colors[rol] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="text-gray-600 mt-1">Administra todos los usuarios del sistema</p>
          </div>
          <button
            onClick={() => navigate(ROUTES.admin.dashboard)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <UserPlus size={20} />
            Nuevo Usuario
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por nombre, email, usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filtro por Rol */}
            <div>
              <select
                value={selectedRol}
                onChange={(e) => setSelectedRol(e.target.value as TipoRol | '')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los roles</option>
                <option value="ADMIN">Administrador</option>
                <option value="DUENIO">Dueño</option>
                <option value="CLIENTE">Cliente</option>
                <option value="CONTROLADOR">Controlador</option>
              </select>
            </div>

            {/* Filtro por Estado */}
            <div>
              <select
                value={selectedEstado}
                onChange={(e) => setSelectedEstado(e.target.value as EstadoUsuario | '')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
                <option value="BLOQUEADO">Bloqueado</option>
                <option value="PENDIENTE">Pendiente</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla de Usuarios */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : usuarios.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron usuarios</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roles
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Registro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Último Acceso
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usuarios.map((usuario) => (
                    <tr key={usuario.idUsuario} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {usuario.avatarPath ? (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={usuario.avatarPath}
                                alt={usuario.usuario}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                {usuario.usuario.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{usuario.usuario}</div>
                            <div className="text-sm text-gray-500">{usuario.correo}</div>
                            {usuario.persona && (
                              <div className="text-xs text-gray-400">
                                {usuario.persona.nombre} {usuario.persona.apellidoPaterno}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {usuario.roles.map((usuarioRol) => (
                            <span
                              key={usuarioRol.idUsuarioRol}
                              className={`px-2 py-1 text-xs rounded-full ${getRolBadgeColor(usuarioRol.rol.rol)}`}
                            >
                              {usuarioRol.rol.rol}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getEstadoBadgeColor(usuario.estado)}`}>
                          {usuario.estado}
                        </span>
                        {usuario.correoVerificado && (
                          <Check className="inline ml-2 text-green-600" size={16} />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(usuario.creadoEn).toLocaleDateString('es-BO')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {usuario.ultimoAccesoEn
                          ? new Date(usuario.ultimoAccesoEn).toLocaleDateString('es-BO')
                          : 'Nunca'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => navigate(ROUTES.admin.usuarioDetalle(usuario.idUsuario))}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1 ml-auto"
                        >
                          Ver detalles
                          <ChevronRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Página <span className="font-medium">{currentPage}</span> de{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Siguiente
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
    </div>
  );
};

export default UsuariosListPage;
