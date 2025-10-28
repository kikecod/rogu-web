import React from 'react';
import type { UserProfileData } from '../../../../features/profile/types';
import ProfileBaseLayout from './ProfileBaseLayout';
import ProfileClienteSection from './ProfileClienteSection';
import ProfileDuenioSection from './ProfileDuenioSection';
import ProfileControladorSection from './ProfileControladorSection';
import ProfileAccountSettings from './ProfileAccountSettings';

interface ProfileVariantProps {
  data: UserProfileData;
}

const ProfileClienteDuenioControladorView: React.FC<ProfileVariantProps> = ({ data }) => {
  const roles = Array.isArray(data.usuario.roles) ? data.usuario.roles : [];
  const canViewCliente = roles.includes('CLIENTE');
  const canViewDuenio = roles.includes('DUENIO');
  const canViewControlador = roles.includes('CONTROLADOR');

  return (
    <ProfileBaseLayout data={data}>
      <ProfileClienteSection cliente={data.cliente} canView={canViewCliente} />
      <ProfileDuenioSection duenio={data.duenio} canView={canViewDuenio} />
      <ProfileControladorSection controlador={data.controlador} canView={canViewControlador} />
      <ProfileAccountSettings usuario={data.usuario} />
    </ProfileBaseLayout>
  );
};

export default ProfileClienteDuenioControladorView;
