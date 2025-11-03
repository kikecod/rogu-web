import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { resolveRoleVariant, type RoleVariant } from '@/auth/lib/roles';
import { type AppRole } from '../types/profile.types';
import useUserProfile from '../hooks/useUserProfile';
import { PROFILE_VARIANT_COMPONENTS, type ProfileVariantComponentProps } from '../components/profileVariants';
import { useAuth } from '@/auth/hooks/useAuth';
import { getAuthToken } from '@/core/config/api';

/** UI-only: usa utilidades del kit (card, btn, text-muted-foreground, etc.) */
const renderError = (message: string, onRetry: () => void, debugInfo?: string | null) => (
  <div className="min-h-[60vh] flex items-center justify-center bg-bg px-4 py-8 sm:py-12">
    <div
      className="card max-w-md w-full text-center"
      role="alert"
      aria-live="assertive"
    >
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <h2 className="text-lg sm:text-xl font-semibold">No se pudo cargar el perfil</h2>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed break-words">{message}</p>

      {debugInfo ? (
        <pre className="mt-4 max-h-40 overflow-auto rounded-xl border bg-card p-3 text-left text-xs text-muted-foreground whitespace-pre-wrap">
          {debugInfo}
        </pre>
      ) : null}

      <button
        type="button"
        onClick={onRetry}
        className="btn btn-primary mt-5 inline-flex items-center justify-center gap-2"
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
      <div className="min-h-[60vh] flex items-center justify-center bg-bg px-4 py-8 sm:py-12">
        <div className="card max-w-md w-full text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <RefreshCcw className="h-6 w-6 animate-spin text-primary" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold">Cargando tu perfil</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
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
