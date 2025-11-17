// src/modules/admin-panel/usuarios/pages/UsuarioFormPage.tsx

import { useEffect, useState, type FormEvent, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Info, Upload, Trash2, Edit2, X } from 'lucide-react';
import { usuariosService } from '../services/usuarios.service';
import { useUsuarioDetalle } from '../hooks/useUsuarioDetalle';
import type { TipoRol, EstadoUsuario, UsuarioDetalle } from '../../types';
import { EstadoUsuario as EstadoUsuarioEnum, TipoRol as TipoRolEnum } from '../../types';
import { ROUTES } from '@/config/routes';
import { getImageUrl } from '@/core/config/api';

type FormMode = 'create' | 'edit';

const ROLES_OPCIONES: TipoRol[] = [
  TipoRolEnum.ADMIN,
  TipoRolEnum.DUENIO,
  TipoRolEnum.CLIENTE,
  TipoRolEnum.CONTROLADOR,
];

const ESTADOS_OPCIONES: EstadoUsuario[] = [
  EstadoUsuarioEnum.ACTIVO,
  EstadoUsuarioEnum.INACTIVO,
  EstadoUsuarioEnum.BLOQUEADO,
  EstadoUsuarioEnum.PENDIENTE,
];

const emptyForm = {
  usuario: '',
  correo: '',
  estado: EstadoUsuarioEnum.ACTIVO as EstadoUsuario,
  roles: [] as TipoRol[],
  avatarPath: '',
  persona: {
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    telefono: '',
    ci: '',
  },
  cliente: {
    apodo: '',
    nivel: 0,
    observaciones: '',
  },
  duenio: {
    verificado: false,
    imagenCI: '',
    imagenFacial: '',
  },
  controlador: {
    codigoEmpleado: '',
    turno: '',
    activo: true,
  },
};

const UsuarioFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const idNumber = id ? Number(id) : undefined;
  const mode: FormMode = idNumber ? 'edit' : 'create';
  const [form, setForm] = useState(structuredClone(emptyForm));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [editandoCliente, setEditandoCliente] = useState(false);
  const [editandoDuenio, setEditandoDuenio] = useState(false);
  const [editandoControlador, setEditandoControlador] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    usuario,
    loading: loadingDetalle,
    error: errorDetalle,
    actualizar,
  } = useUsuarioDetalle(idNumber ?? 0);

  const resolveAvatarUrl = (src: string | null): string | null => {
    if (!src) return null;
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

  useEffect(() => {
    if (mode === 'edit' && usuario) {
      const u = usuario as UsuarioDetalle;
      console.log('🔍 DATOS RECIBIDOS DEL BACKEND:', u);
      console.log('🔍 PERSONA:', u.persona);
      console.log('🖼️ AVATAR PATH:', u.avatarPath);
      console.log('🖼️ AVATAR EN USUARIO:', usuario.avatarPath);
      
      setForm({
        usuario: u.usuario || '',
        correo: u.correo || '',
        estado: u.estado || EstadoUsuarioEnum.ACTIVO,
        roles: Array.isArray(u.roles) ? u.roles : [],
        avatarPath: u.avatarPath || '',
        persona: {
          nombre: (u.persona as any)?.nombres || u.persona?.nombre || '',
          apellidoPaterno: (u.persona as any)?.paterno || u.persona?.apellidoPaterno || '',
          apellidoMaterno: (u.persona as any)?.materno || u.persona?.apellidoMaterno || '',
          telefono: u.persona?.telefono || '',
          ci: (u.persona as any)?.documentoNumero || u.persona?.ci || '',
        },
        cliente: {
          apodo: u.cliente?.apodo || '',
          nivel: u.cliente?.nivel ?? 0,
          observaciones: u.cliente?.observaciones || '',
        },
        duenio: {
          verificado: u.duenio?.verificado ?? false,
          imagenCI: u.duenio?.imagenCI || '',
          imagenFacial: u.duenio?.imagenFacial || '',
        },
        controlador: {
          codigoEmpleado: u.controlador?.codigoEmpleado || '',
          turno: u.controlador?.turno || '',
          activo: u.controlador?.activo ?? true,
        },
      });
      
      if (u.avatarPath) {
        console.log('✅ Cargando avatar preview:', u.avatarPath);
        setAvatarPreview(u.avatarPath);
      } else {
        console.log('❌ No hay avatarPath en el usuario');
      }
    }
  }, [mode, usuario]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (mode === 'create') {
        if (!password || password.trim().length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres');
          setLoading(false);
          return;
        }
      }

      const payload: any = { ...form };
      
      if (mode === 'create') {
        payload.contrasena = password.trim();
      }
      
      // Limpiar avatarPath vacío
      if (!payload.avatarPath) {
        delete payload.avatarPath;
      }
      
      // Solo incluir datos de rol si el usuario tiene ese rol
      if (!form.roles.includes(TipoRolEnum.CLIENTE)) {
        delete payload.cliente;
      }
      if (!form.roles.includes(TipoRolEnum.DUENIO)) {
        delete payload.duenio;
      }
      if (!form.roles.includes(TipoRolEnum.CONTROLADOR)) {
        delete payload.controlador;
      }

      console.log('📤 PAYLOAD A ENVIAR:', payload);
      console.log('📤 ROLES:', form.roles);

      if (mode === 'create') {
        const nuevoUsuario = await usuariosService.crear(payload);
        
        // Si hay avatar, subirlo después de crear
        if (avatarFile && nuevoUsuario.idUsuario) {
          await usuariosService.uploadAvatar(nuevoUsuario.idUsuario, avatarFile);
        }
        
        // Solo al crear, redirigir a la lista
        navigate(ROUTES.admin.usuarios);
      } else if (idNumber) {
        const result = await actualizar(payload);
        if (!result.success) {
          throw new Error(result.error);
        }

        // Si se especificó una nueva contraseña, cambiarla desde el panel admin
        if (newPassword.trim()) {
          await usuariosService.cambiarContrasenaAdmin(idNumber, newPassword.trim());
        }

        // Manejar avatar
        if (avatarFile) {
          // Subir nueva imagen
          await usuariosService.uploadAvatar(idNumber, avatarFile);
          // Limpiar el archivo temporal después de subir
          setAvatarFile(null);
        } else if (!avatarPreview && usuario?.avatarPath) {
          // Eliminar avatar si se removió
          await usuariosService.deleteAvatar(idNumber);
        }
        
        // Al actualizar, mostrar mensaje de éxito y permanecer en el formulario
        setSuccess('Usuario actualizado correctamente');
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      console.error('Error al guardar usuario', err);
      setError(err?.message || 'No se pudo guardar el usuario');
    } finally {
      setLoading(false);
    }
  };

  const toggleRol = (rol: TipoRol) => {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(rol) ? prev.roles.filter((r) => r !== rol) : [...prev.roles, rol],
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona un archivo de imagen válido');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no debe superar los 5MB');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setForm((prev) => ({ ...prev, avatarPath: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (mode === 'edit' && loadingDetalle) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Cargando usuario...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={18} />
          Volver
        </button>
      </div>

      {mode === 'edit' && usuario && (
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-semibold">
            {usuario.avatarPath ? (
              <img
                src={resolveAvatarUrl(usuario.avatarPath) ?? undefined}
                alt={usuario.nombreCompleto || usuario.usuario}
                className="h-full w-full object-cover"
              />
            ) : (
              <>
                {(usuario.persona?.nombre?.[0] || usuario.usuario[0]).toUpperCase()}
                {(usuario.persona?.apellidoPaterno?.[0] || '').toUpperCase()}
              </>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {usuario.nombreCompleto ||
                `${usuario.persona?.nombre || ''} ${usuario.persona?.apellidoPaterno || ''}`.trim() ||
                usuario.usuario}
            </h2>
            <p className="text-sm text-gray-500">{usuario.correo}</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Crear usuario' : 'Editar usuario'}
          </h1>
          <p className="text-gray-600">
            {mode === 'create'
              ? 'Registra un nuevo usuario con sus roles.'
              : 'Actualiza los datos personales, roles y estado.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {(error || errorDetalle) && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded">
            {error || errorDetalle}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Usuario</label>
            <input
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.usuario}
              onChange={(e) => setForm((prev) => ({ ...prev, usuario: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Correo</label>
            <input
              type="email"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.correo}
              onChange={(e) => setForm((prev) => ({ ...prev, correo: e.target.value }))}
              required
            />
          </div>
          {mode === 'create' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Contraseña</label>
              <input
                type="password"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}
          {mode === 'edit' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Nueva contraseña (opcional)</label>
              <input
                type="password"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Dejar vacío para no cambiar"
              />
              <p className="text-xs text-gray-500 mt-1">
                Si ingresas una nueva contraseña, se actualizará para este usuario.
              </p>
            </div>
          )}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Foto de perfil</label>
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-semibold flex-shrink-0">
                {avatarPreview ? (
                  <img src={resolveAvatarUrl(avatarPreview) ?? undefined} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span>
                    {form.persona.nombre?.[0]?.toUpperCase() || 'U'}
                    {form.persona.apellidoPaterno?.[0]?.toUpperCase() || ''}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
                  >
                    <Upload size={16} />
                    {avatarPreview ? 'Cambiar imagen' : 'Subir imagen'}
                  </button>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 text-sm"
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Formato: JPG, PNG, WEBP. Máximo 5MB.</p>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombres</label>
            <input
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.persona.nombre}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, persona: { ...prev.persona, nombre: e.target.value } }))
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Apellido paterno</label>
            <input
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.persona.apellidoPaterno}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  persona: { ...prev.persona, apellidoPaterno: e.target.value },
                }))
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Apellido materno</label>
            <input
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.persona.apellidoMaterno}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  persona: { ...prev.persona, apellidoMaterno: e.target.value },
                }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.persona.telefono}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, persona: { ...prev.persona, telefono: e.target.value } }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">CI</label>
            <input
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.persona.ci}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, persona: { ...prev.persona, ci: e.target.value } }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Estado</label>
            <select
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.estado}
              onChange={(e) => setForm((prev) => ({ ...prev, estado: e.target.value as EstadoUsuario }))}
            >
              {ESTADOS_OPCIONES.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Roles</p>
          <div className="flex gap-4 flex-wrap">
            {ROLES_OPCIONES.map((rol) => (
              <label key={rol} className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.roles.includes(rol)}
                  onChange={() => toggleRol(rol)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {rol}
              </label>
            ))}
          </div>
        </div>

        {form.roles.includes(TipoRolEnum.CLIENTE) && (
          <div className="border rounded-lg p-4 bg-blue-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Info size={18} className="text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-900">Datos de Cliente</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditandoCliente(!editandoCliente)}
                className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                {editandoCliente ? <><X size={14} /> Cancelar</> : <><Edit2 size={14} /> Editar</>}
              </button>
            </div>
            {editandoCliente ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Apodo</label>
                  <input
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.cliente.apodo}
                    onChange={(e) => setForm((prev) => ({ ...prev, cliente: { ...prev.cliente, apodo: e.target.value } }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nivel</label>
                  <input
                    type="number"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.cliente.nivel}
                    onChange={(e) => setForm((prev) => ({ ...prev, cliente: { ...prev.cliente, nivel: Number(e.target.value) } }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Observaciones</label>
                  <textarea
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    value={form.cliente.observaciones}
                    onChange={(e) => setForm((prev) => ({ ...prev, cliente: { ...prev.cliente, observaciones: e.target.value } }))}
                  />
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-700 space-y-1">
                <p><span className="font-medium">Apodo:</span> {form.cliente.apodo || '—'}</p>
                <p><span className="font-medium">Nivel:</span> {form.cliente.nivel ?? '—'}</p>
                <p><span className="font-medium">Observaciones:</span> {form.cliente.observaciones || '—'}</p>
              </div>
            )}
          </div>
        )}

        {form.roles.includes(TipoRolEnum.DUENIO) && (
          <div className="border rounded-lg p-4 bg-purple-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Info size={18} className="text-purple-600" />
                <h3 className="text-sm font-semibold text-gray-900">Datos de Dueño</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditandoDuenio(!editandoDuenio)}
                className="text-sm text-purple-600 hover:text-purple-700 inline-flex items-center gap-1"
              >
                {editandoDuenio ? <><X size={14} /> Cancelar</> : <><Edit2 size={14} /> Editar</>}
              </button>
            </div>
            {editandoDuenio ? (
              <div className="space-y-3">
                <div>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.duenio.verificado}
                      onChange={(e) => setForm((prev) => ({ ...prev, duenio: { ...prev.duenio, verificado: e.target.checked } }))}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="font-medium text-gray-700">Verificado</span>
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Imagen CI (URL)</label>
                  <input
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="/uploads/ci/imagen.jpg"
                    value={form.duenio.imagenCI}
                    onChange={(e) => setForm((prev) => ({ ...prev, duenio: { ...prev.duenio, imagenCI: e.target.value } }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Imagen Facial (URL)</label>
                  <input
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="/uploads/facial/imagen.jpg"
                    value={form.duenio.imagenFacial}
                    onChange={(e) => setForm((prev) => ({ ...prev, duenio: { ...prev.duenio, imagenFacial: e.target.value } }))}
                  />
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-700 space-y-1">
                <p><span className="font-medium">Verificado:</span> {form.duenio.verificado ? 'Sí' : 'No'}</p>
                <p><span className="font-medium">Imagen CI:</span> {form.duenio.imagenCI || '—'}</p>
                <p><span className="font-medium">Imagen Facial:</span> {form.duenio.imagenFacial || '—'}</p>
              </div>
            )}
          </div>
        )}

        {form.roles.includes(TipoRolEnum.CONTROLADOR) && (
          <div className="border rounded-lg p-4 bg-green-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Info size={18} className="text-green-600" />
                <h3 className="text-sm font-semibold text-gray-900">Datos de Controlador</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditandoControlador(!editandoControlador)}
                className="text-sm text-green-600 hover:text-green-700 inline-flex items-center gap-1"
              >
                {editandoControlador ? <><X size={14} /> Cancelar</> : <><Edit2 size={14} /> Editar</>}
              </button>
            </div>
            {editandoControlador ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Código de empleado</label>
                  <input
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={form.controlador.codigoEmpleado}
                    onChange={(e) => setForm((prev) => ({ ...prev, controlador: { ...prev.controlador, codigoEmpleado: e.target.value } }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Turno</label>
                  <input
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Mañana / Tarde / Noche"
                    value={form.controlador.turno}
                    onChange={(e) => setForm((prev) => ({ ...prev, controlador: { ...prev.controlador, turno: e.target.value } }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.controlador.activo}
                      onChange={(e) => setForm((prev) => ({ ...prev, controlador: { ...prev.controlador, activo: e.target.checked } }))}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="font-medium text-gray-700">Activo</span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-700 space-y-1">
                <p><span className="font-medium">Código:</span> {form.controlador.codigoEmpleado || '—'}</p>
                <p><span className="font-medium">Turno:</span> {form.controlador.turno || '—'}</p>
                <p><span className="font-medium">Activo:</span> {form.controlador.activo ? 'Sí' : 'No'}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(ROUTES.admin.usuarios)}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? 'Guardando...' : mode === 'create' ? 'Crear usuario' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UsuarioFormPage;
