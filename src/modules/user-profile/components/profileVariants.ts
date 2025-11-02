import type { ComponentType } from 'react';
import type { RoleVariant } from '@/auth/lib/roles';
import type { UserProfileData } from '../types/profile.types';
// Unificación: usar una sola vista que compone secciones por rol
import ProfileGenericView from './Profile.Generic';

export interface ProfileVariantComponentProps {
  data: UserProfileData;
  onRefresh: () => Promise<void>;
}

export const PROFILE_VARIANT_COMPONENTS: Record<RoleVariant, ComponentType<ProfileVariantComponentProps>> =
  {
    ADMIN: ProfileGenericView,
    CLIENTE: ProfileGenericView,
    CLIENTE_DUENIO: ProfileGenericView,
    CLIENTE_CONTROLADOR: ProfileGenericView,
    CLIENTE_DUENIO_CONTROLADOR: ProfileGenericView,
    ANON: ProfileGenericView,
  };
