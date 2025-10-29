import type { ComponentType } from 'react';
import type { RoleVariant } from '@/auth/lib/roles';
import type { UserProfileData } from '../types/profile.types';
import ProfileAdminView from './Profile.Admin';
import ProfileClienteView from './Profile.Cliente';
import ProfileClienteDuenioView from './Profile.ClienteDuenio';
import ProfileClienteControladorView from './Profile.ClienteControlador';
import ProfileClienteDuenioControladorView from './Profile.ClienteDuenioControlador';
import ProfileGenericView from './Profile.Generic';

export interface ProfileVariantComponentProps {
  data: UserProfileData;
}

export const PROFILE_VARIANT_COMPONENTS: Record<RoleVariant, ComponentType<ProfileVariantComponentProps>> =
  {
    ADMIN: ProfileAdminView,
    CLIENTE: ProfileClienteView,
    CLIENTE_DUENIO: ProfileClienteDuenioView,
    CLIENTE_CONTROLADOR: ProfileClienteControladorView,
    CLIENTE_DUENIO_CONTROLADOR: ProfileClienteDuenioControladorView,
    ANON: ProfileGenericView,
  };
