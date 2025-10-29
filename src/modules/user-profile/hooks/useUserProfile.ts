import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/auth/hooks/useAuth';
import profileService from '../services/profileService';
import type { UserProfileData } from '../types/profile.types';

interface UseUserProfileResult {
  data: UserProfileData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const useUserProfile = (): UseUserProfileResult => {
  const [data, setData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const inFlightRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isLoggedIn, isLoading: authLoading, logout } = useAuth();

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      if (!isMountedRef.current || inFlightRef.current) return;
      inFlightRef.current = true;
      setLoading(true);

      // Esperar a que el contexto de auth termine de hidratar estado
      if (authLoading) {
        return; // el finally pondrá loading=false cuando termine el ciclo actual
      }

      if (!isLoggedIn) {
        setError('Debes iniciar sesion para ver tu perfil.');
        setData(null);
        return;
      }
      // fallback de seguridad: si tarda demasiado, corta con error visible
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;
        setError('Tiempo de espera agotado al cargar tu perfil. Intenta nuevamente.');
        setLoading(false);
        inFlightRef.current = false;
      }, 8000);
      const profile = await profileService.fetchProfile();
      if (!isMountedRef.current) return;
      setData(profile);
      setError(null);
    } catch (err) {
      if (!isMountedRef.current) return;
      console.error('No se pudo obtener el perfil del usuario', err);
      const status = (err && typeof err === 'object' && 'status' in (err as any))
        ? Number((err as any).status)
        : undefined;
      if (status === 401) {
        try { await logout(); } catch { /* ignore */ }
        setError('Tu sesion expiro. Inicia sesion nuevamente.');
        setData(null);
      } else {
        setError('No se pudo cargar la informacion del perfil. Intenta nuevamente.');
      }
    } finally {
      if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
      inFlightRef.current = false;
      if (isMountedRef.current) setLoading(false);
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
        setLoading(false);
      }
    }, 10000);
    return () => {
      if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    };
  }, [loading]);

  return {
    data,
    loading,
    error,
    refresh: fetchProfile,
  };
};

export default useUserProfile;

