// src/modules/admin-panel/usuarios/components/TablaUsuarios.tsx

import { Eye, Edit, Trash2, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RolBadge } from './RolBadge';
import { EstadoBadge } from './EstadoBadge';
import { ROUTES } from '@/config/routes';
import type { Usuario } from '../../types';
import { getImageUrl } from '@/core/config/api';

interface TablaUsuariosProps {
  usuarios: Usuario[];
  onEliminar?: (usuario: Usuario) => void;
  loading?: boolean;
}

export const TablaUsuarios = ({ usuarios, onEliminar, loading }: TablaUsuariosProps) => {
  const navigate = useNavigate();

  const resolveAvatarUrl = (src: string): string => {
    if (!src) return '';
    if (src.startsWith('data:')) return src;
    if (src.startsWith('http')) {
      try {
        const url = new URL(src);
        return getImageUrl(url.pathname);
      } catch {
        return src;
      }
    }
    return getImageUrl(src);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center text-gray-600">Cargando usuarios...</div>
      </div>
    );
  }

  if (usuarios.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center">
          <UserPlus className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 mb-4">No se encontraron usuarios</p>
          <button
            onClick={() => navigate(ROUTES.admin.usuariosNuevo)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Crear primer usuario
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Correo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Roles
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Última actividad
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usuarios.map((usuario) => (
              <tr key={usuario.idUsuario} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      {usuario.avatarPath ? (
                        <img
                          src={resolveAvatarUrl(usuario.avatarPath)}
                          alt={`${usuario.persona?.nombre || usuario.usuario}`}
                          className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">${(usuario.persona?.nombre?.[0] || usuario.usuario[0]).toUpperCase()}${(usuario.persona?.apellidoPaterno?.[0] || '').toUpperCase()}</div>`;
                            }
                          }}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                          {(usuario.persona?.nombre?.[0] || usuario.usuario[0]).toUpperCase()}{(usuario.persona?.apellidoPaterno?.[0] || '').toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {usuario.nombreCompleto || `${usuario.persona?.nombre || ''} ${usuario.persona?.apellidoPaterno || ''}`.trim() || usuario.usuario}
                      </div>
                      <div className="text-sm text-gray-500">
                        {usuario.persona?.ci || 'Sin CI'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{usuario.correo}</div>
                  <div className="text-sm text-gray-500">@{usuario.usuario}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {(usuario.roles && Array.isArray(usuario.roles) && usuario.roles.length > 0) ? (
                      usuario.roles.map((rol, index) => (
                        <RolBadge key={index} rol={rol} size="sm" />
                      ))
                    ) : (
                      <span className="text-xs text-gray-500">Sin roles</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <EstadoBadge estado={usuario.estado} size="sm" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {usuario.ultimoAccesoEn
                    ? new Date(usuario.ultimoAccesoEn).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Nunca'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => navigate(ROUTES.admin.usuarioDetalle(usuario.idUsuario))}
                      className="text-blue-600 hover:text-blue-900 transition"
                      title="Ver detalle"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => navigate(ROUTES.admin.usuarioEditar(usuario.idUsuario))}
                      className="text-green-600 hover:text-green-900 transition"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    {onEliminar && usuario.estado !== 'ELIMINADO' && (
                      <button
                        onClick={() => onEliminar(usuario)}
                        className="text-red-600 hover:text-red-900 transition"
                        title="Dar de baja"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
