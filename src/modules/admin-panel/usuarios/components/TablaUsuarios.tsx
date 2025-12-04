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
    if (src.startsWith('http')) return getImageUrl(src);
    return getImageUrl(src);
  };

  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-card shadow-soft p-6 space-y-3">
        {[...Array(4)].map((_, idx) => (
          <div key={idx} className="h-10 rounded-input bg-slate-200/60 animate-pulse" />
        ))}
      </div>
    );
  }

  if (usuarios.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-card shadow-soft p-8 text-center space-y-4">
        <UserPlus className="mx-auto text-muted" size={48} />
        <p className="text-muted">No se encontraron usuarios</p>
        <button
          onClick={() => navigate(ROUTES.admin.usuariosNuevo)}
          className="px-4 py-2 rounded-input bg-gradient-to-r from-primary to-secondary text-white shadow-soft"
        >
          Crear usuario
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-card shadow-soft overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-white/90 backdrop-blur sticky top-0 z-10">
            <tr>
              {['Usuario', 'Correo', 'Roles', 'Estado', 'Ultima actividad', 'Acciones'].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-[10px] font-semibold text-muted uppercase tracking-[0.12em]"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-white/70">
            {usuarios.map((usuario) => (
              <tr key={usuario.idUsuario} className="hover:bg-white transition">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex-shrink-0">
                      {usuario.avatarPath ? (
                        <img
                          src={resolveAvatarUrl(usuario.avatarPath)}
                          alt={`${usuario.persona?.nombre || usuario.usuario}`}
                          className="h-10 w-10 rounded-full object-cover border-2 border-border"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold text-sm">
                          {(usuario.persona?.nombre?.[0] || usuario.usuario[0]).toUpperCase()}
                          {(usuario.persona?.apellidoPaterno?.[0] || '').toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-text-main">
                        {usuario.nombreCompleto ||
                          `${usuario.persona?.nombre || ''} ${usuario.persona?.apellidoPaterno || ''}`.trim() ||
                          usuario.usuario}
                      </div>
                      <div className="text-xs text-muted">{usuario.persona?.ci || 'Sin CI'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-text-main">{usuario.correo}</div>
                  <div className="text-xs text-muted">@{usuario.usuario}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {usuario.roles && Array.isArray(usuario.roles) && usuario.roles.length > 0 ? (
                      usuario.roles.map((rol, index) => <RolBadge key={index} rol={rol} size="sm" />)
                    ) : (
                      <span className="text-xs text-muted">Sin roles</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <EstadoBadge estado={usuario.estado} size="sm" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
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
                      className="p-2 rounded-input border border-border bg-white hover:bg-primary/10 text-primary"
                      title="Ver detalle"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => navigate(ROUTES.admin.usuarioEditar(usuario.idUsuario))}
                      className="p-2 rounded-input border border-border bg-white hover:bg-success/10 text-success"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    {onEliminar && usuario.estado !== 'ELIMINADO' && (
                      <button
                        onClick={() => onEliminar(usuario)}
                        className="p-2 rounded-input border border-border bg-white hover:bg-danger/10 text-danger"
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
