import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { resolveRoleVariant, type RoleVariant } from '@/auth/lib/roles';
import { type AppRole } from '../types/profile.types';
import useUserProfile from '../hooks/useUserProfile';
import { PROFILE_VARIANT_COMPONENTS, type ProfileVariantComponentProps } from '../components/profileVariants';
import { useAuth } from '@/auth/hooks/useAuth';
import { getAuthToken } from '@/core/config/api';

const renderError = (message: string, onRetry: () => void, debugInfo?: string | null) => (
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
      {debugInfo ? (
        <pre className="text-xs text-neutral-400 bg-neutral-50 border border-neutral-100 rounded-lg p-3 overflow-auto max-h-32 mb-4 text-left whitespace-pre-wrap">
          {debugInfo}
        </pre>
      ) : null}
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
  const { data, error, debugInfo, loading, refresh } = useUserProfile();
  const { isLoading: authLoading, isLoggedIn } = useAuth();

  if (error) {
    return renderError(error, () => {
      void refresh();
    }, debugInfo);
  }

  if (loading && !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-neutral-50 px-4 py-8 sm:py-12">
        <div className="max-w-md w-full bg-white border border-blue-100 rounded-2xl shadow-sm p-6 sm:p-8 text-center">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-50 mx-auto mb-4">
            <RefreshCcw className="h-6 w-6 text-blue-500 animate-spin" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-neutral-900 mb-2">Cargando tu perfil</h2>
          <p className="text-neutral-600 text-sm leading-relaxed mb-6 break-words">
            Estamos obteniendo tu información. Si tarda demasiado, prueba nuevamente con Reintentar.
          </p>
        </div>
      </div>
    );
  }

  // En vez de esperar silenciosamente, mostrar un error explicativo inmediato si no hay datos
  if (!data) {
    const hasToken = Boolean(getAuthToken());
    const message = authLoading
      ? 'La autenticación aún se está inicializando (authLoading=true). Si no avanza, recarga la página o vuelve a iniciar sesión.'
      : (!isLoggedIn && !hasToken)
        ? 'No has iniciado sesión. Inicia sesión para cargar tu perfil.'
        : 'No recibimos respuesta del backend para /api/profile todavía. Revisa la pestaña Network y la consola (VITE_DEBUG_PROFILE=true).';

    return renderError(message, () => { void refresh(); }, debugInfo);
  }

  // sin fallback de datos cuando aún no llegan
  
  // Si tenemos datos del backend, usarlos directamente
  if (data) {
    const effectiveRoles = data.usuario.roles.filter((role): role is AppRole =>
      ['CLIENTE', 'DUENIO', 'CONTROLADOR', 'ADMIN'].includes(role)
    );
    
    const variant = resolveRoleVariant(effectiveRoles);
    const VariantComponent = getVariantComponent(variant);
    
    return <VariantComponent data={data} onRefresh={refresh} />;
  }

  return null;
};

export default ProfilePage;
