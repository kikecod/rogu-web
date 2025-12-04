// src/modules/admin-panel/usuarios/pages/UsuarioDetallePage.tsx

import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Shield, Mail, Phone, IdCard, User, Edit, Trash2, RotateCcw, Calendar, Info } from 'lucide-react';
import { useUsuarioDetalle } from '../hooks/useUsuarioDetalle';
import { RolBadge } from '../components/RolBadge';
import { EstadoBadge } from '../components/EstadoBadge';
import { ROUTES } from '@/config/routes';
import { useState } from 'react';
import { getImageUrl } from '@/core/config/api';

const UsuarioDetallePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario, loading, error, eliminar, reactivar } = useUsuarioDetalle(Number(id));
  const [motivoBaja, setMotivoBaja] = useState('');
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const resolveAvatarUrl = (src: string): string => {
    if (!src) return '';
    if (src.startsWith('data:')) return src;
    if (src.startsWith('http')) return getImageUrl(src);
    return getImageUrl(src);
  };

  const handleEliminar = async () => {
    setEliminando(true);
    try {
      await eliminar(motivoBaja);
      setMostrarModalEliminar(false);
      alert('Usuario dado de baja correctamente');
    } catch (err) {
      alert('Error al dar de baja al usuario');
    } finally {
      setEliminando(false);
    }
  };

  const handleReactivar = async () => {
    const motivo = prompt('Motivo de la reactivación (opcional):');
    if (motivo !== null) {
      await reactivar(motivo);
      alert('Usuario reactivado correctamente');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Cargando usuario...</p>
      </div>
    );
  }

  if (error || !usuario) {
    return (
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <p className="text-red-600">{error || 'Usuario no encontrado'}</p>
        <button
          onClick={() => navigate(ROUTES.admin.usuarios)}
          className="text-sm text-blue-600 hover:underline inline-flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Volver a usuarios
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(ROUTES.admin.usuarios)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Detalle de Usuario</h1>
            <p className="text-gray-600 mt-1">
              {usuario.persona?.nombre} {usuario.persona?.apellidoPaterno}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {usuario.estado === 'ELIMINADO' ? (
            <button
              onClick={handleReactivar}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <RotateCcw size={20} />
              Reactivar
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate(ROUTES.admin.usuarioEditar(usuario.idUsuario))}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Edit size={20} />
                Editar
              </button>
              <button
                onClick={() => setMostrarModalEliminar(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <Trash2 size={20} />
                Dar de Baja
              </button>
            </>
          )}
        </div>
      </div>

      {/* Información principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card de foto y datos básicos */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              {usuario.avatarPath ? (
                <img
                  src={resolveAvatarUrl(usuario.avatarPath)}
                  alt={usuario.nombreCompleto || usuario.usuario}
                  className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-blue-200 shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<div class="w-32 h-32 rounded-full mx-auto bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center border-4 border-blue-200 shadow-lg"><span class="text-white text-5xl font-bold">${(usuario.persona?.nombre?.[0] || usuario.usuario[0]).toUpperCase()}</span></div>`;
                    }
                  }}
                />
              ) : (
                <div className="w-32 h-32 rounded-full mx-auto bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center border-4 border-blue-200 shadow-lg">
                  <span className="text-white text-5xl font-bold">
                    {(usuario.persona?.nombre?.[0] || usuario.usuario[0]).toUpperCase()}
                  </span>
                </div>
              )}
              <h2 className="mt-4 text-xl font-bold text-gray-900">
                {usuario.nombreCompleto || `${usuario.persona?.nombre || ''} ${usuario.persona?.apellidoPaterno || ''}`.trim() || usuario.usuario}
              </h2>
              <p className="text-gray-600">@{usuario.usuario}</p>
              <div className="mt-4">
                <EstadoBadge estado={usuario.estado} size="lg" />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-gray-700">
                <Mail size={20} className="text-gray-400" />
                <span className="text-sm">{usuario.correo}</span>
              </div>
              {usuario.persona?.telefono && (
                <div className="flex items-center gap-3 text-gray-700">
                  <Phone size={20} className="text-gray-400" />
                  <span className="text-sm">{usuario.persona.telefono}</span>
                </div>
              )}
              {usuario.persona?.ci && (
                <div className="flex items-center gap-3 text-gray-700">
                  <IdCard size={20} className="text-gray-400" />
                  <span className="text-sm">CI: {usuario.persona.ci}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detalles completos */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos personales */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User size={20} />
              Datos Personales
            </h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Nombre Completo</dt>
                <dd className="mt-1 text-sm text-gray-900 font-medium">
                  {usuario.nombreCompleto || `${usuario.persona?.nombre || ''} ${usuario.persona?.apellidoPaterno || ''} ${usuario.persona?.apellidoMaterno || ''}`.trim() || 'No especificado'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Usuario</dt>
                <dd className="mt-1 text-sm text-gray-900">@{usuario.usuario}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Correo Electrónico</dt>
                <dd className="mt-1 text-sm text-gray-900">{usuario.correo}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">CI</dt>
                <dd className="mt-1 text-sm text-gray-900">{usuario.persona?.ci || 'No especificado'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                <dd className="mt-1 text-sm text-gray-900">{usuario.persona?.telefono || 'No especificado'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Dirección</dt>
                <dd className="mt-1 text-sm text-gray-900">{usuario.persona?.direccion || 'No especificada'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Fecha de Registro</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {usuario.creadoEn ? new Date(usuario.creadoEn).toLocaleDateString('es-ES', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'No disponible'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Última Modificación</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {usuario.modificadoEn ? new Date(usuario.modificadoEn).toLocaleDateString('es-ES', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'Nunca'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Roles */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield size={20} />
              Roles Asignados
            </h3>
            <div className="flex flex-wrap gap-2">
              {usuario.roles && usuario.roles.length > 0 ? (
                usuario.roles.map((rol, index) => (
                  <RolBadge key={index} rol={rol} size="lg" />
                ))
              ) : (
                <p className="text-gray-500 text-sm">No tiene roles asignados</p>
              )}
            </div>
          </div>

          {/* Información de cuenta */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar size={20} />
              Información de Cuenta
            </h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Correo Verificado</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {usuario.correoVerificado ? (
                    <span className="text-green-600 font-medium">✓ Verificado</span>
                  ) : (
                    <span className="text-red-600 font-medium">✗ No verificado</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Fecha de Registro</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(usuario.creadoEn).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Última Actualización</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(usuario.actualizadoEn).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Último Acceso</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {usuario.ultimoAccesoEn
                    ? new Date(usuario.ultimoAccesoEn).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'Nunca'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Asociaciones Cliente / Dueño / Controlador */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Info size={20} />
              Relaciones en el sistema
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <Info size={16} className="text-blue-500" />
                  <h4 className="text-sm font-semibold text-gray-800">Cliente</h4>
                </div>
                {usuario.cliente ? (
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium">Apodo:</span>{' '}
                      {usuario.cliente.apodo || '—'}
                    </p>
                    <p>
                      <span className="font-medium">Nivel:</span>{' '}
                      {usuario.cliente.nivel ?? '—'}
                    </p>
                    <p>
                      <span className="font-medium">Observaciones:</span>{' '}
                      {usuario.cliente.observaciones || '—'}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Sin registro de cliente.</p>
                )}
              </div>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <Info size={16} className="text-blue-500" />
                  <h4 className="text-sm font-semibold text-gray-800">Dueño</h4>
                </div>
                {usuario.duenio ? (
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium">Verificado:</span>{' '}
                      {usuario.duenio.verificado ? 'Sí' : 'No'}
                    </p>
                    <p>
                      <span className="font-medium">Sedes:</span>{' '}
                      {Array.isArray(usuario.duenio.sedes) ? usuario.duenio.sedes.length : '0'}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Sin registro de dueño.</p>
                )}
              </div>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <Info size={16} className="text-blue-500" />
                  <h4 className="text-sm font-semibold text-gray-800">Controlador</h4>
                </div>
                {usuario.controlador ? (
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium">Código:</span>{' '}
                      {usuario.controlador.codigoEmpleado || '—'}
                    </p>
                    <p>
                      <span className="font-medium">Turno:</span>{' '}
                      {usuario.controlador.turno || '—'}
                    </p>
                    <p>
                      <span className="font-medium">Activo:</span>{' '}
                      {usuario.controlador.activo ? 'Sí' : 'No'}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Sin registro de controlador.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Modal de eliminación */}
      {mostrarModalEliminar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirmar baja de usuario
            </h3>
            <p className="text-gray-600 mb-4">
              ¿Estás seguro de dar de baja a <strong>{usuario.persona?.nombre} {usuario.persona?.apellidoPaterno}</strong>?
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
                onClick={() => setMostrarModalEliminar(false)}
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

export default UsuarioDetallePage;
