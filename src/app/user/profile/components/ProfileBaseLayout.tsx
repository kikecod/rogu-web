import React from 'react';
import {
  Calendar,
  CheckCircle2,
  Mail,
  Phone,
  ShieldCheck,
  User2,
  UserCircle2,
} from 'lucide-react';
import type { UserProfileData } from '../../../../features/profile/types';

interface ProfileBaseLayoutProps {
  data: UserProfileData;
  children?: React.ReactNode;
}

const formatDate = (value: string | Date | null | undefined): string => {
  if (!value) return 'No registrado';
  try {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'No registrado';
    }
    return new Intl.DateTimeFormat('es-BO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return 'No registrado';
  }
};

const getFullName = (persona: UserProfileData['persona'], fallback: string) => {
  if (!persona) return fallback;
  const parts = [persona.nombres, persona.paterno, persona.materno]
    .filter((part) => typeof part === 'string' && part.trim().length > 0)
    .map((part) => part!.trim());
  if (!parts.length) return fallback;
  return parts.join(' ');
};

const getInitials = (persona: UserProfileData['persona'], usuario: UserProfileData['usuario']) => {
  const base =
    persona && typeof persona.nombres === 'string' && persona.nombres
      ? persona.nombres
      : usuario.usuario || usuario.correo;
  if (!base) return '';
  return base.trim().charAt(0).toUpperCase();
};

const renderRoles = (roles: string[]) => {
  if (!roles.length) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
        Rol no asignado
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {roles.map((role) => (
        <span
          key={role}
          className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wide"
        >
          {role}
        </span>
      ))}
    </div>
  );
};

const ProfileBaseLayout: React.FC<ProfileBaseLayoutProps> = ({ data, children }) => {
  const { persona, usuario } = data;
  const avatarUrl = usuario.avatar || persona?.url_foto || null;
  const fullName = getFullName(persona, usuario.usuario || usuario.correo || 'Usuario sin nombre');
  const initials = getInitials(persona, usuario);
  const documentoLabel =
    persona?.documentoTipo && persona?.documentoNumero
      ? `${persona.documentoTipo} ${persona.documentoNumero}`
      : 'No registrado';

  return (
    <div className="min-h-screen bg-neutral-50 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 px-6 sm:px-10 py-10">
            <div className="flex flex-col md:flex-row md:items-center md:gap-8 text-white">
              <div className="relative inline-flex items-center justify-center h-20 w-20 rounded-full border-4 border-white/30 bg-white/20 shadow-lg">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={fullName}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : initials ? (
                  <span className="text-3xl font-semibold">{initials}</span>
                ) : (
                  <UserCircle2 className="h-12 w-12 text-white/80" />
                )}
                <span className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-emerald-400 flex items-center justify-center shadow ring-2 ring-blue-400">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </span>
              </div>

              <div className="mt-6 md:mt-0">
                <p className="text-sm uppercase tracking-[0.2em] text-white/80 font-semibold mb-2">
                  Perfil de usuario
                </p>
                <h1 className="text-3xl sm:text-4xl font-bold">{fullName}</h1>
                <p className="mt-2 text-white/90 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{usuario.correo || 'Correo no registrado'}</span>
                </p>
                {persona?.telefono ? (
                  <p className="mt-1 text-white/90 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{persona.telefono}</span>
                  </p>
                ) : null}
                <div className="mt-4">{renderRoles(usuario.roles)}</div>
              </div>
            </div>
          </div>

          <div className="px-6 sm:px-10 pb-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 -mt-12">
              <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <User2 className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-neutral-800">Datos personales</h2>
                </div>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                  <div>
                    <dt className="text-neutral-500">Documento</dt>
                    <dd className="text-neutral-900 font-medium">{documentoLabel}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Fecha de nacimiento</dt>
                    <dd className="text-neutral-900 font-medium">
                      {formatDate(persona?.fechaNacimiento ?? null)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Genero</dt>
                    <dd className="text-neutral-900 font-medium">
                      {persona?.genero || 'No especificado'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Telefono</dt>
                    <dd className="text-neutral-900 font-medium">
                      {persona?.telefono || 'No registrado'}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-lg font-semibold text-neutral-800">
                    Credenciales y seguridad
                  </h2>
                </div>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                  <div>
                    <dt className="text-neutral-500">Correo verificado</dt>
                    <dd className="text-neutral-900 font-medium flex items-center gap-2">
                      {usuario.correoVerificado ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span>Verificado</span>
                        </>
                      ) : (
                        <>
                          <Calendar className="h-4 w-4 text-amber-500" />
                          <span>Pendiente</span>
                        </>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Usuario</dt>
                    <dd className="text-neutral-900 font-medium">{usuario.usuario || 'N/D'}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">ID persona</dt>
                    <dd className="text-neutral-900 font-medium">#{usuario.id_persona}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">ID usuario</dt>
                    <dd className="text-neutral-900 font-medium">#{usuario.id_usuario}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {children ? <div className="mt-8 space-y-6">{children}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileBaseLayout;
