import React from 'react';
import type { UserProfileData } from '../types/profile.types';
import ProfileBaseLayout from './ProfileBaseLayout';
import ProfileAccountSettings from './ProfileAccountSettings';

interface ProfileVariantProps {
  data: UserProfileData;
}

const ProfileGenericView: React.FC<ProfileVariantProps> = ({ data }) => (
  <ProfileBaseLayout data={data}>
    <ProfileAccountSettings usuario={data.usuario} />
  </ProfileBaseLayout>
);

export default ProfileGenericView;

