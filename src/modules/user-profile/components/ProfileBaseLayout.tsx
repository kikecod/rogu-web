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
import type { UserProfileData } from '../types/profile.types';

interface ProfileBaseLayoutProps {
  data: UserProfileData;
  children?: React.ReactNode;
}

// === Utilidades (SIN CAMBIOS DE LÓGICA) ===
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
          className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xxs sm:text-xs font-semibold uppercase tracking-wide"
        >
          {role}
        </span>
      ))}
    </div>
  );
};

// === Componente ===
const ProfileBaseLayout: React.FC<ProfileBaseLayoutProps> = ({ data, children }) => {
  const { persona, usuario } = data;
  
  // Log para debugging
  console.log('👤 Datos de persona en ProfileBaseLayout:', persona);
  console.log('👤 Datos de usuario en ProfileBaseLayout:', usuario);
  
  const avatarUrl = usuario.avatar || persona?.urlFoto || null;
  const fullName = getFullName(persona, usuario.usuario || usuario.correo || 'Usuario sin nombre');
  const initials = getInitials(persona, usuario);
  const documentoLabel =
    persona?.documentoTipo && persona?.documentoNumero
      ? `${persona.documentoTipo} ${persona.documentoNumero}`
      : 'No registrado';

  return (
    <div className="min-h-screen bg-neutral-50 pb-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden">
          {/* Encabezado */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 px-4 sm:px-8 md:px-10 pt-8 sm:pt-10 pb-20 sm:pb-24 md:pb-28">
            <div className="flex flex-col md:flex-row md:items-center md:gap-8 text-white">
              {/* Avatar */}
              <div className="relative inline-flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-28 lg:w-28 rounded-full border-4 border-white/30 bg-white/20 shadow-lg ring-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={fullName}
                    className="h-full w-full rounded-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : initials ? (
                  <span className="text-2xl sm:text-3xl font-semibold select-none">{initials}</span>
                ) : (
                  <UserCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-white/80" />
                )}
                <span className="absolute -bottom-1 -right-1 h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-emerald-400 flex items-center justify-center shadow ring-2 ring-blue-400">
                  <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                </span>
              </div>

              {/* Datos principales */}
              <div className="mt-5 sm:mt-6 md:mt-0">
                <p className="text-[11px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.2em] text-white/80 font-semibold mb-1.5 sm:mb-2">
                  Perfil de usuario
                </p>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">{fullName}</h1>
                <p className="mt-2 text-white/90 flex flex-wrap items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="break-all">{usuario.correo || 'Correo no registrado'}</span>
                </p>
                {persona?.telefono ? (
                  <p className="mt-1 text-white/90 flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span className="break-all">{persona.telefono}</span>
                  </p>
                ) : null}
                <div className="mt-4">{renderRoles(usuario.roles)}</div>
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="px-4 sm:px-8 md:px-10 pb-8 sm:pb-10">
            {/* Cards en grid */}
            <div className="grid grid-cols-1 gap-16 sm:gap-6 md:gap-8 lg:grid-cols-2">
              {/* Card: Datos personales */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-md transition-all duration-200 hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-500/30">
                <div className="flex items-center gap-2.5 sm:gap-3 mb-3.5 sm:mb-4">
                  <User2 className="h-5 w-5 text-blue-600" />
                  <h2 className="text-base sm:text-lg font-semibold text-neutral-800">Datos personales</h2>
                </div>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 sm:gap-y-4 gap-x-6 text-sm">
                  <div>
                    <dt className="text-neutral-500">Documento</dt>
                    <dd className="text-neutral-900 font-medium break-words">{documentoLabel}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Fecha de nacimiento</dt>
                    <dd className="text-neutral-900 font-medium">{formatDate(persona?.fechaNacimiento ?? null)}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Genero</dt>
                    <dd className="text-neutral-900 font-medium">{persona?.genero || 'No especificado'}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Telefono</dt>
                    <dd className="text-neutral-900 font-medium break-all">{persona?.telefono || 'No registrado'}</dd>
                
                  </div>
                  <div>
                    <dt className="text-neutral-500">Telefono verificado</dt>
                    <dd className="text-neutral-900 font-medium">{persona?.telefonoVerificado ? 'Confirmado' : 'No verificado'}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Registrado el</dt>
                    <dd className="text-neutral-900 font-medium">{formatDate(persona?.creadoEn ?? null)}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Actualizado el</dt>
                    <dd className="text-neutral-900 font-medium">{formatDate(persona?.actualizadoEn ?? null)}</dd>
                  </div>
                </dl>
              </div>

              {/* Card: Credenciales y seguridad */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-md transition-all duration-200 hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-500/30">
                <div className="flex items-center gap-2.5 sm:gap-3 mb-3.5 sm:mb-4">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-base sm:text-lg font-semibold text-neutral-800">Credenciales y seguridad</h2>
                </div>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 sm:gap-y-4 gap-x-6 text-sm">
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
                    <dd className="text-neutral-900 font-medium break-words">{usuario.usuario || 'N/D'}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">ID persona</dt>
                    <dd className="text-neutral-900 font-medium">#{usuario.idPersona}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">ID usuario</dt>
                    <dd className="text-neutral-900 font-medium">#{usuario.idUsuario}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Slot children */}
            {children ? <div className="mt-6 sm:mt-8 space-y-6">{children}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileBaseLayout;
