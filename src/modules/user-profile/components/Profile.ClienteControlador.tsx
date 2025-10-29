import React from 'react';
import type { UserProfileData } from '../types/profile.types';
import ProfileBaseLayout from './ProfileBaseLayout';
import ProfileClienteSection from './ProfileClienteSection';
import ProfileControladorSection from './ProfileControladorSection';
import ProfileAccountSettings from './ProfileAccountSettings';

interface ProfileVariantProps {
  data: UserProfileData;
}

const ProfileClienteControladorView: React.FC<ProfileVariantProps> = ({ data }) => {
  const roles = Array.isArray(data.usuario.roles) ? data.usuario.roles : [];
  const canViewCliente = roles.includes('CLIENTE');
  const canViewControlador = roles.includes('CONTROLADOR');

  return (
    <ProfileBaseLayout data={data}>
      <ProfileClienteSection cliente={data.cliente} canView={canViewCliente} />
      <ProfileControladorSection controlador={data.controlador} canView={canViewControlador} />
      <ProfileAccountSettings usuario={data.usuario} />
    </ProfileBaseLayout>
  );
};

export default ProfileClienteControladorView;
