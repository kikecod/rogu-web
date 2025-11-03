import React from 'react';
import { getImageUrl } from '@/core/config/api';
import type { AppRole, UserProfileData } from '../types/profile.types';
import ProfileBaseLayout from './ProfileBaseLayout';
import ProfileAdminSection from './ProfileAdminSection';
import ProfileClienteSection from './ProfileClienteSection';
import ProfileDuenioSection from './ProfileDuenioSection';
import ProfileControladorSection from './ProfileControladorSection';
import ProfileAccountSettings from './ProfileAccountSettings';
import AvatarUploader from './AvatarUploader';
import ProfilePersonalInfoForm from './ProfilePersonalInfoForm';
import ProfilePreferencesForm from './ProfilePreferencesForm';
import ProfileDangerZone from './ProfileDangerZone';

interface ProfileVariantProps {
  data: UserProfileData;
  onRefresh: () => Promise<void>;
}

const ProfileAdminView: React.FC<ProfileVariantProps> = ({ data, onRefresh }) => {
  const roles = Array.isArray(data.usuario.roles) ? data.usuario.roles : [];
  const hasRole = (role: AppRole) => roles.includes(role);

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
    (data.persona?.nombres?.charAt(0)?.toUpperCase() ??
      data.usuario.usuario?.charAt(0)?.toUpperCase() ??
      data.usuario.correo?.charAt(0)?.toUpperCase() ??
      'U');

  return (
    <ProfileBaseLayout data={data}>
      <AvatarUploader
        avatarUrl={avatarUrl}
        fallbackInitials={fallbackInitial}
        onAvatarUpdated={() => { void onRefresh(); }}
      />
      <ProfilePersonalInfoForm
        persona={data.persona}
        cliente={data.cliente}
        onUpdated={() => { void onRefresh(); }}
      />
      <ProfilePreferencesForm
        preferencias={data.preferencias}
        onUpdated={() => {
          void onRefresh();
        }}
      />

      <ProfileAdminSection data={data} />
      <ProfileClienteSection cliente={data.cliente} canView={hasRole('CLIENTE')} />
      <ProfileDuenioSection duenio={data.duenio} canView={hasRole('DUENIO')} />
      <ProfileControladorSection controlador={data.controlador} canView={hasRole('CONTROLADOR')} />
      <ProfileAccountSettings usuario={data.usuario} />
      <ProfileDangerZone />
    </ProfileBaseLayout>
  );
};

export default ProfileAdminView;


