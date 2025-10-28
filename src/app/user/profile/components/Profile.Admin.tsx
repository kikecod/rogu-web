import React from 'react';
import type { UserProfileData } from '../../../../features/profile/types';
import ProfileBaseLayout from './ProfileBaseLayout';
import ProfileAdminSection from './ProfileAdminSection';
import ProfileClienteSection from './ProfileClienteSection';
import ProfileDuenioSection from './ProfileDuenioSection';
import ProfileControladorSection from './ProfileControladorSection';
import ProfileAccountSettings from './ProfileAccountSettings';

interface ProfileVariantProps {
  data: UserProfileData;
}

const ProfileAdminView: React.FC<ProfileVariantProps> = ({ data }) => {
  const roles = Array.isArray(data.usuario.roles) ? data.usuario.roles : [];
  const hasRole = (role: string) => roles.includes(role);

  return (
    <ProfileBaseLayout data={data}>
      <ProfileAdminSection data={data} />
      <ProfileClienteSection cliente={data.cliente} canView={hasRole('CLIENTE')} />
      <ProfileDuenioSection duenio={data.duenio} canView={hasRole('DUENIO')} />
      <ProfileControladorSection controlador={data.controlador} canView={hasRole('CONTROLADOR')} />
      <ProfileAccountSettings usuario={data.usuario} />
    </ProfileBaseLayout>
  );
};

export default ProfileAdminView;
