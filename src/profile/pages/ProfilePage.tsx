import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { resolveRoleVariant, type RoleVariant } from '../../utils/roles';
import { type AppRole, type UserProfileData } from '../../types';
import useUserProfile from '../hooks/useUserProfile';
import {
  PROFILE_VARIANT_COMPONENTS,
  type ProfileVariantComponentProps,
} from '../components/profileVariants';

// Eliminado: no mostramos loading en pantalla para el perfil

const renderError = (message: string, onRetry: () => void) => (
  <div className="min-h-[60vh] flex items-center justify-center bg-neutral-50 px-4 py-8 sm:py-12">
    <div
      className="max-w-md w-full bg-white border border-red-100 rounded-2xl shadow-sm p-6 sm:p-8 text-center transition-shadow duration-200 hover:shadow-md"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-50 mx-auto mb-4">
        <AlertTriangle className="h-6 w-6 text-red-500" />
      </div>
      <h2 className="text-lg sm:text-xl font-semibold text-neutral-900 mb-2">No se pudo cargar el perfil</h2>
      <p className="text-neutral-600 text-sm leading-relaxed mb-6 break-words">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-blue-600 text-white rounded-full font-medium shadow-sm hover:bg-blue-600/90 active:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-0 transition disabled:opacity-70"
      >
        <RefreshCcw className="h-4 w-4" />
        Reintentar
      </button>
    </div>
  </div>
);

const getVariantComponent = (
  variant: RoleVariant,
): React.ComponentType<ProfileVariantComponentProps> => {
  return PROFILE_VARIANT_COMPONENTS[variant] ?? PROFILE_VARIANT_COMPONENTS.ANON;
};

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { data, loading: _loading, error, refresh } = useUserProfile();

  if (error) {
    return renderError(error, () => {
      void refresh();
    });
  }

  const userRoles = (Array.isArray(user?.roles) ? user?.roles : []) as AppRole[];
  
  // Si tenemos datos del backend, usarlos directamente
  if (data) {
    const effectiveRoles = data.usuario.roles.filter((role): role is AppRole =>
      ['CLIENTE', 'DUENIO', 'CONTROLADOR', 'ADMIN'].includes(role)
    );
    
    const variant = resolveRoleVariant(effectiveRoles);
    const VariantComponent = getVariantComponent(variant);
    
    return <VariantComponent data={data} />;
  }

  // Fallback con datos del usuario en memoria
  const baseUsuario = {
    correo: user?.correo ?? '',
    usuario: user?.usuario ?? '',
    idPersona: user?.idPersona ?? 0,
    idUsuario: user?.idUsuario ?? 0,
    correoVerificado: false,
    roles: userRoles,
    avatar: user?.avatar ?? undefined,
  };
  
  const basePersona = null;
  const sanitizedData: UserProfileData = {
    persona: basePersona,
    usuario: baseUsuario,
    cliente: null,
    duenio: null,
    controlador: null,
  };

  const variant = resolveRoleVariant(userRoles);
  const VariantComponent = getVariantComponent(variant);

  return <VariantComponent data={sanitizedData} />;
};

export default ProfilePage;
