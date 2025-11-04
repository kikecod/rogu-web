import React from 'react';
import { getImageUrl } from '@/core/config/api';
import type { AppRole, UserProfileData } from '../types/profile.types';
import ProfileBaseLayout from './ProfileBaseLayout';
import ProfileAccountSettings from './ProfileAccountSettings';
import AvatarUploader from './AvatarUploader';
import ProfilePersonalInfoForm from './ProfilePersonalInfoForm';
import ProfilePreferencesForm from './ProfilePreferencesForm';
import ProfileDangerZone from './ProfileDangerZone';
import ProfileDuenioSection from './ProfileDuenioSection';
import ProfileControladorSection from './ProfileControladorSection';
import ProfileClienteSection from './ProfileClienteSection';
import ProfileAdminSection from './ProfileAdminSection';

interface ProfileVariantProps {
  data: UserProfileData;
  onRefresh: () => Promise<void>;
}

const ProfileGenericView: React.FC<ProfileVariantProps> = ({ data, onRefresh }) => {
  const avatarCandidate =
    data.usuario.avatar ??
    data.usuario.avatarPath ??
    data.persona?.urlFoto ??
    null;

  const avatarUrl = avatarCandidate
    ? avatarCandidate.startsWith('http')
      ? avatarCandidate
      : getImageUrl(avatarCandidate)
    : null;

  const fallbackInitial =
    data.persona?.nombres?.charAt(0)?.toUpperCase() ??
    data.usuario.usuario?.charAt(0)?.toUpperCase() ??
    data.usuario.correo?.charAt(0)?.toUpperCase() ??
    'U';

  const roles = Array.isArray(data.usuario.roles) ? data.usuario.roles : [];
  const hasRole = (role: AppRole) => roles.includes(role);

  return (
    <ProfileBaseLayout data={data}>
      <AvatarUploader
        avatarUrl={avatarUrl}
        fallbackInitials={fallbackInitial}
        onAvatarUpdated={() => {
          void onRefresh();
        }}
      />
      <ProfilePersonalInfoForm
        persona={data.persona}
        cliente={data.cliente}
        duenio={data.duenio}
        controlador={data.controlador}
        onUpdated={() => {
          void onRefresh();
        }}
      />
      <ProfilePreferencesForm
        preferencias={data.preferencias}
        onUpdated={() => {
          void onRefresh();
        }}
      />
      <ProfileAccountSettings usuario={data.usuario} />
      {/* Secciones por rol en vista genérica/unificada */}
      {hasRole('ADMIN') ? <ProfileAdminSection data={data} /> : null}
      <ProfileClienteSection cliente={data.cliente} canView={hasRole('CLIENTE')} />
      <ProfileDuenioSection duenio={data.duenio} canView={hasRole('DUENIO')} />
      <ProfileControladorSection controlador={data.controlador} canView={hasRole('CONTROLADOR')} />
      <ProfileDangerZone />
    </ProfileBaseLayout>
  );
};

export default ProfileGenericView;


