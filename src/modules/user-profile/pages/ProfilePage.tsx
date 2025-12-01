import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { resolveRoleVariant, type RoleVariant } from '@/auth/lib/roles';
import { type AppRole } from '../types/profile.types';
import useUserProfile from '../hooks/useUserProfile';
import { PROFILE_VARIANT_COMPONENTS, type ProfileVariantComponentProps } from '../components/profileVariants';
import { useAuth } from '@/auth/hooks/useAuth';
import { getAuthToken } from '@/core/config/api';

const renderError = (message: string, onRetry: () => void, debugInfo?: string | null) => (
  <div className="min-h-[60vh] flex items-center justify-center bg-[#f5f7fb] px-4 py-8 sm:py-12">
    <div
      className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-lg shadow-indigo-100"
      role="alert"
      aria-live="assertive"
    >
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
        <AlertTriangle className="h-6 w-6 text-red-500" />
      </div>
      <h2 className="text-lg sm:text-xl font-semibold text-slate-900">No se pudo cargar el perfil</h2>
      <p className="mt-2 text-sm text-slate-600 leading-relaxed break-words">{message}</p>

      {debugInfo ? (
        <pre className="mt-4 max-h-40 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-left text-xs text-slate-700 whitespace-pre-wrap">
          {debugInfo}
        </pre>
      ) : null}

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-300 transition hover:bg-indigo-500"
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
      <div className="min-h-[60vh] flex items-center justify-center bg-[#f5f7fb] px-4 py-8 sm:py-12">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-lg shadow-indigo-100">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
            <RefreshCcw className="h-6 w-6 animate-spin text-indigo-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Cargando tu perfil</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Estamos obteniendo tu informacion. Si tarda demasiado, prueba nuevamente con Reintentar.
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    const hasToken = Boolean(getAuthToken());
    const message = authLoading
      ? 'La autenticacion aun se esta inicializando. Si no avanza, recarga la pagina o vuelve a iniciar sesion.'
      : (!isLoggedIn && !hasToken)
        ? 'No has iniciado sesion. Inicia sesion para cargar tu perfil.'
        : 'No recibimos respuesta del backend para /api/profile todavia. Revisa la pestana Network y la consola (VITE_DEBUG_PROFILE=true).';

    return renderError(message, () => { void refresh(); }, debugInfo);
  }

  const effectiveRoles = data.usuario.roles.filter((role): role is AppRole =>
    ['CLIENTE', 'DUENIO', 'CONTROLADOR', 'ADMIN'].includes(role)
  );

  const variant = resolveRoleVariant(effectiveRoles);
  const VariantComponent = getVariantComponent(variant);

  return <VariantComponent data={data} onRefresh={refresh} />;
};

export default ProfilePage;
