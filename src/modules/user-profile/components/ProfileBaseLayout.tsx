import React, { useMemo } from 'react';
import { Calendar, Camera, CheckCircle2, MailCheck, ShieldCheck, UserCircle2 } from 'lucide-react';
import { getImageUrl } from '@/core/config/api';
import type { UserProfileData } from '../types/profile.types';

interface ProfileBaseLayoutProps {
  data: UserProfileData;
  children?: React.ReactNode;
}

const formatDate = (value: string | Date | null | undefined): string => {
  if (!value) return 'No registrado';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'No registrado';
  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const getFullName = (persona: UserProfileData['persona'], fallback: string) => {
  if (!persona) return fallback;
  const parts = [persona.nombres, persona.paterno, persona.materno]
    .filter((part) => typeof part === 'string' && part.trim().length > 0)
    .map((part) => part!.trim());
  return parts.length ? parts.join(' ') : fallback;
};

const getInitials = (persona: UserProfileData['persona'], usuario: UserProfileData['usuario']) => {
  const base =
    persona && typeof persona.nombres === 'string' && persona.nombres
      ? persona.nombres
      : usuario.usuario || usuario.correo;
  if (!base) return '';
  return base.trim().charAt(0).toUpperCase();
};

const ProfileBaseLayout: React.FC<ProfileBaseLayoutProps> = ({ data, children }) => {
  const { persona, usuario } = data;

  const avatarCandidate = usuario.avatar ?? usuario.avatarPath ?? persona?.urlFoto ?? null;
  const avatarUrl = avatarCandidate ? getImageUrl(avatarCandidate) : null;

  const fullName = getFullName(persona, usuario.usuario || usuario.correo || 'Usuario sin nombre');
  const initials = getInitials(persona, usuario);
  const roles = Array.isArray(usuario.roles) ? usuario.roles : [];
  const primaryRole = roles[0] ?? 'CLIENTE';

  const statusLabel = usuario.correoVerificado ? 'Cuenta verificada' : 'Verificacion pendiente';
  const statusTone = usuario.correoVerificado
    ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200'
    : 'bg-amber-100 text-amber-700 ring-1 ring-amber-200';

  const metaCards = useMemo(
    () => [
      {
        icon: ShieldCheck,
        label: 'Rol principal',
        value: primaryRole,
      },
      {
        icon: Calendar,
        label: 'Registro',
        value: formatDate(persona?.creadoEn),
      },
      {
        icon: MailCheck,
        label: 'Verificacion',
        value: statusLabel,
      },
    ],
    [persona?.creadoEn, primaryRole, statusLabel],
  );

  const triggerAvatarUpload = () => {
    const input = document.getElementById('avatar-uploader-input') as HTMLInputElement | null;
    input?.click();
  };

  return (
    <div className="relative min-h-screen bg-[#f5f7fb] text-slate-900 pb-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-indigo-200/40 blur-[96px]" />
        <div className="absolute right-[-40px] top-28 h-72 w-72 rounded-full bg-purple-200/35 blur-[120px]" />
        <div className="absolute left-6 bottom-10 h-56 w-56 rounded-full bg-sky-200/30 blur-[90px]" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-10 py-10 space-y-8">
        <section className="relative overflow-hidden rounded-3xl border border-white shadow-lg shadow-indigo-100 bg-gradient-to-br from-[#f8fbff] via-white to-[#eef2ff]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.12),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(236,72,153,0.10),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.6),transparent)]" />
          <div className="relative flex flex-col items-center px-6 py-10 sm:px-10 sm:py-12 text-center gap-6">
            <div className="relative">
              <div className="h-32 w-32 sm:h-36 sm:w-36 rounded-full border border-white shadow-xl bg-white overflow-hidden flex items-center justify-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={fullName}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : initials ? (
                  <span className="text-3xl sm:text-4xl font-semibold text-indigo-600 select-none">
                    {initials}
                  </span>
                ) : (
                  <UserCircle2 className="h-12 w-12 text-indigo-400" />
                )}
              </div>
              <button
                type="button"
                onClick={triggerAvatarUpload}
                className="absolute -bottom-1 -right-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg ring-4 ring-white transition hover:bg-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-300"
                aria-label="Actualizar foto de perfil"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.32em] text-indigo-500/70">
                Perfil de usuario
              </p>
              <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 leading-tight">
                {fullName}
              </h1>
              <p className="text-sm sm:text-base text-indigo-700">
                {usuario.usuario ? `@${usuario.usuario}` : usuario.correo || 'Usuario'}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusTone}`}
              >
                <CheckCircle2 className="h-4 w-4" />
                {statusLabel}
              </span>
              {roles.map((role) => (
                <span
                  key={role}
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100"
                >
                  {role}
                </span>
              ))}
            </div>

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
              {metaCards.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm"
                >
                  <div className="flex items-center gap-2 text-indigo-700 text-xs uppercase tracking-wide">
                    <item.icon className="h-4 w-4 text-indigo-500" />
                    <span>{item.label}</span>
                  </div>
                  <p className="mt-1 text-base font-semibold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {children ? <div className="space-y-6">{children}</div> : null}
      </div>
    </div>
  );
};

export default ProfileBaseLayout;
