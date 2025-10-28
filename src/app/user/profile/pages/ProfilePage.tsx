import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { useAuth } from '../../../../features/auth/context/AuthContext';
import { resolveRoleVariant, type RoleVariant } from '../../../../shared/utils/roles';
import { type AppRole } from '../../../../constants';
import useUserProfile from '../hooks/useUserProfile';
import {
  PROFILE_VARIANT_COMPONENTS,
  type ProfileVariantComponentProps,
} from '../components/profileVariants';

// Eliminado: no mostramos loading en pantalla para el perfil

const renderError = (message: string, onRetry: () => void) => (
  <div className="min-h-[60vh] flex items-center justify-center bg-neutral-50 px-4">
    <div className="max-w-md w-full bg-white border border-red-100 rounded-2xl shadow-sm p-8 text-center">
      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-50 mx-auto mb-4">
        <AlertTriangle className="h-6 w-6 text-red-500" />
      </div>
      <h2 className="text-xl font-semibold text-neutral-900 mb-2">No se pudo cargar el perfil</h2>
      <p className="text-neutral-600 text-sm mb-6">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
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
  const baseUsuario = data?.usuario ?? {
    correo: user?.correo ?? '',
    usuario: user?.usuario ?? '',
    id_persona: user?.id_persona ?? 0,
    id_usuario: user?.id_usuario ?? 0,
    correoVerificado: false,
    roles: userRoles,
    avatar: user?.avatar ?? undefined,
  };
  const basePersona = data?.persona ?? null;
  const sanitizedData = {
    persona: basePersona,
    usuario: baseUsuario,
    cliente: data?.cliente ?? null,
    duenio: data?.duenio ?? null,
    controlador: data?.controlador ?? null,
  } as const;

  const profileRolesRaw = Array.isArray(sanitizedData.usuario.roles)
    ? sanitizedData.usuario.roles
    : [];
  const validRoleValues: AppRole[] = ['CLIENTE', 'DUENIO', 'CONTROLADOR', 'ADMIN'];
  const profileRoles = profileRolesRaw.filter((role): role is AppRole =>
    validRoleValues.includes(role as AppRole),
  );

  const samePersona =
    typeof user?.id_persona === 'number' && user?.id_persona === sanitizedData.usuario.id_persona;
  const sameUsuario =
    typeof user?.id_usuario === 'number' && user?.id_usuario === sanitizedData.usuario.id_usuario;

  if (!samePersona || !sameUsuario) {
    return renderError('No estas autorizado para ver este perfil.', () => {
      void refresh();
    });
  }

  const missingRoles = userRoles.filter((role) => !profileRoles.includes(role));
  if (missingRoles.length > 0) {
    return renderError('Tu sesion no tiene permisos para ver este perfil.', () => {
      void refresh();
    });
  }

  const effectiveRoles = userRoles.filter((role) => profileRoles.includes(role));
  const variant = resolveRoleVariant(effectiveRoles);
  const finalData = {
    ...sanitizedData,
    usuario: {
      ...sanitizedData.usuario,
      roles: effectiveRoles,
    },
  } as const;

  const VariantComponent = getVariantComponent(variant);

  return <VariantComponent data={finalData} />;
};

export default ProfilePage;
