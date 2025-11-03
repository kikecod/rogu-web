import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/auth/hooks/useAuth';
import profileService from '../services/profileService';
import type { UserProfileData } from '../types/profile.types';

interface UseUserProfileResult {
  data: UserProfileData | null;
  loading: boolean;
  error: string | null;
  debugInfo: string | null;
  refresh: () => Promise<void>;
}

const useUserProfile = (): UseUserProfileResult => {
  const [data, setData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const inFlightRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isLoggedIn, isLoading: authLoading, logout, user, updateUser } = useAuth();

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const SOFT_TIMEOUT = Number(((import.meta as any)?.env?.VITE_PROFILE_TIMEOUT_MS) ?? 3000);
  const HARD_TIMEOUT = Number(((import.meta as any)?.env?.VITE_PROFILE_HARD_TIMEOUT_MS) ?? 5000);
  const AUTH_HYDRATE_TIMEOUT = Number(((import.meta as any)?.env?.VITE_AUTH_HYDRATE_TIMEOUT_MS) ?? 2500);

  const fetchProfile = useCallback(async () => {
    try {
      if (!isMountedRef.current) return;
      // Si Auth aún está hidratando, no disparamos fetch ni marcamos in-flight para evitar quedar pegados
      if (authLoading) {
        setLoading(true);
        setError(null);
        setDebugInfo('AuthContext hidratando: authLoading=true, esperando antes de solicitar perfil.');
        if ((import.meta as any)?.env?.VITE_DEBUG_PROFILE === 'true') {
          // eslint-disable-next-line no-console
          console.debug('[profile] auth still hydrating, skipping fetch');
        }
        return;
      }

      if (inFlightRef.current) {
        setDebugInfo('Solicitud de perfil ignorada porque ya hay una en progreso (inFlight=true).');
        return;
      }
      inFlightRef.current = true;
      setLoading(true);

      const hasToken = Boolean(localStorage.getItem('token'));
      setDebugInfo(`Preparando solicitud de perfil: isLoggedIn=${isLoggedIn}; hasToken=${hasToken}; authLoading=${authLoading}.`);

      if (!isLoggedIn) {
        if ((import.meta as any)?.env?.VITE_DEBUG_PROFILE === 'true') {
          // eslint-disable-next-line no-console
          console.debug('[profile] not logged in, aborting fetch');
        }
        setDebugInfo(`Abortado: usuario no autenticado (isLoggedIn=false, hasToken=${hasToken}).`);
        setError('Debes iniciar sesion para ver tu perfil.');
        setData(null);
        return;
      }
      // fallback de seguridad: si tarda demasiado, corta con error visible
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;
        setError('Tiempo de espera agotado al cargar tu perfil. Intenta nuevamente.');
        setDebugInfo('SOFT_TIMEOUT excedido (VITE_PROFILE_TIMEOUT_MS)');
        setLoading(false);
        inFlightRef.current = false;
      }, SOFT_TIMEOUT);
      setDebugInfo((prev) => `${prev ?? ''} -> llamando GET /profile`.trim());
  const profile = await profileService.fetchProfile();
      if ((import.meta as any)?.env?.VITE_DEBUG_PROFILE === 'true') {
        // eslint-disable-next-line no-console
        console.debug('[profile] normalized data', profile);
      }
      if (!isMountedRef.current) return;
      setData(profile);
      // Sincroniza avatar/email/usuario con AuthContext para que Header muestre el avatar
      try {
        if (user) {
          const nextAvatar = (profile.usuario.avatar ?? profile.usuario.avatarPath ?? profile.persona?.urlFoto) || undefined;
          const needsUpdate =
            user.avatar !== nextAvatar ||
            user.usuario !== profile.usuario.usuario ||
            user.correo !== profile.usuario.correo;
          if (needsUpdate) {
            updateUser({
              ...user,
              avatar: nextAvatar,
              usuario: profile.usuario.usuario || user.usuario,
              correo: profile.usuario.correo || user.correo,
            });
          }
        }
      } catch {
        // no-op
      }
      setError(null);
      setDebugInfo('Perfil cargado correctamente.');
    } catch (err) {
      if (!isMountedRef.current) return;
      console.error('No se pudo obtener el perfil del usuario', err);
      const rawError = err as any;
      const status = (rawError && typeof rawError === 'object' && 'status' in rawError)
        ? Number(rawError.status)
        : undefined;
      const url = (rawError && typeof rawError === 'object' && 'url' in rawError)
        ? String(rawError.url)
        : undefined;
      let attemptsInfo: string | null = null;
      if (rawError && typeof rawError === 'object' && 'attempts' in rawError) {
        const attempts = Array.isArray(rawError.attempts) ? rawError.attempts : [];
        if (attempts.length > 0) {
          attemptsInfo = attempts.map((attempt: any) => {
            const parts: string[] = [];
            parts.push(attempt.endpoint ?? '?');
            if (attempt.status !== undefined) parts.push(`status=${attempt.status}`);
            if (attempt.message) parts.push(`mensaje=${attempt.message}`);
            if (attempt.error) parts.push(`error=${attempt.error}`);
            return parts.join(' | ');
          }).join(' || ');
        }
      }

      if (attemptsInfo) {
        setDebugInfo(attemptsInfo);
      } else if (url || status) {
        setDebugInfo(`status=${status ?? 'N/A'} url=${url ?? 'desconocida'}`);
      } else {
        setDebugInfo(err instanceof Error ? err.message : null);
      }

      // Log de depuración para ver exactamente el estado y URL
      if ((import.meta as any)?.env?.VITE_DEBUG_PROFILE === 'true') {
        // eslint-disable-next-line no-console
        console.debug('[profile] error', { status, url, attemptsInfo, err });
      }
      if (status === 401) {
        try { await logout(); } catch { /* ignore */ }
        setError('Tu sesion expiro. Inicia sesion nuevamente.');
        setData(null);
      } else {
        const statusText = status ? `HTTP ${status}` : 'Error de red';
        setError(`No se pudo cargar la informacion del perfil (${statusText})${url ? `
Origen: ${url}` : ''}. Intenta nuevamente.`);
      }
    } finally {
      if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
      inFlightRef.current = false;
      if (isMountedRef.current) {
        setLoading(false);
        console.log('[profile] fetch finalizado -> loading=false');
      }
    }
  }, [isLoggedIn, authLoading, logout]);

  useEffect(() => {
    // Disparar carga solo cuando Auth ya terminó de hidratar
    if (!authLoading) {
      void fetchProfile();
    } else {
      // Mientras tanto mostrar loading y limpiar errores previos
      setLoading(true);
      setError(null);
      setDebugInfo(null);

      // Watchdog: si Auth no hidrata dentro de un tiempo razonable, mostrar un error claro
      const id = setTimeout(() => {
        if (!isMountedRef.current) return;
        if (authLoading) {
          if ((import.meta as any)?.env?.VITE_DEBUG_PROFILE === 'true') {
            // eslint-disable-next-line no-console
            console.debug('[profile] auth hydration timeout');
          }
          setError('No pudimos inicializar tu sesión a tiempo. Recarga la página o vuelve a iniciar sesión.');
          setLoading(false);
          inFlightRef.current = false;
        }
      }, AUTH_HYDRATE_TIMEOUT);
      return () => clearTimeout(id);
    }
  }, [authLoading, fetchProfile]);

  // Salvaguarda adicional: si loading se mantiene mucho tiempo sin in-flight, cortar con error
  useEffect(() => {
    if (!loading) return;
    if (inFlightRef.current) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      if (loading && !inFlightRef.current) {
        setError('No pudimos cargar tu perfil a tiempo. Reintenta.');
        setDebugInfo('HARD_TIMEOUT excedido (VITE_PROFILE_HARD_TIMEOUT_MS)');
        setLoading(false);
      }
  }, HARD_TIMEOUT);
    return () => {
      if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    };
  }, [loading]);

  useEffect(() => {
    if ((import.meta as any)?.env?.VITE_DEBUG_PROFILE === 'true') {
      // eslint-disable-next-line no-console
      console.debug('[profile] data state changed', data);
    }
  }, [data]);

  return {
    data,
    loading,
    error,
    debugInfo,
    refresh: fetchProfile,
  };
};

export default useUserProfile;

