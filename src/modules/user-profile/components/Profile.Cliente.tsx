import React from 'react';
import type { UserProfileData } from '../types/profile.types';
import ProfileBaseLayout from './ProfileBaseLayout';
import ProfileClienteSection from './ProfileClienteSection';
import ProfileAccountSettings from './ProfileAccountSettings';

interface ProfileVariantProps {
  data: UserProfileData;
}

const ProfileClienteView: React.FC<ProfileVariantProps> = ({ data }) => {
  const roles = Array.isArray(data.usuario.roles) ? data.usuario.roles : [];
  const canViewCliente = roles.includes('CLIENTE');

  return (
    <ProfileBaseLayout data={data}>
      <ProfileClienteSection cliente={data.cliente} canView={canViewCliente} />
      <ProfileAccountSettings usuario={data.usuario} />
    </ProfileBaseLayout>
  );
};

export default ProfileClienteView;
