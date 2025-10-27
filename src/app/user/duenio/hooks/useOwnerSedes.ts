import { useCallback, useEffect, useRef, useState } from 'react';
import { sedeService } from '../../../../features/sedes/services/sede.service';
import { useAuth } from '../../../../features/auth/context/AuthContext';
import type { OwnerVenue } from '../types/owner.types';
import { mapToOwnerVenue } from '../utils/owner.mappers';

interface UseOwnerSedesResult {
  sedes: OwnerVenue[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setSedes: React.Dispatch<React.SetStateAction<OwnerVenue[]>>;
}

export const useOwnerSedes = (): UseOwnerSedesResult => {
  const { user, isLoggedIn, isDuenio } = useAuth();
  const [sedes, setSedes] = useState<OwnerVenue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const requestIdRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchSedes = useCallback(async () => {
    const isOwner = isDuenio();
    if (!isLoggedIn || !isOwner) {
      if (mountedRef.current) {
        setSedes([]);
        setLoading(false);
        setError(null);
      }
      return;
    }

    const currentRequest = ++requestIdRef.current;
    if (mountedRef.current) {
      setLoading(true);
      setError(null);
    }

    try {
      const all = await sedeService.getAll();
      // Evitar actualizar si hay una petición más reciente o el componente se desmontó
      if (!mountedRef.current || currentRequest !== requestIdRef.current) return;

      const ownerId = user?.id_persona;
      const own = (all as unknown[])
        .map(mapToOwnerVenue)
        .filter((v): v is OwnerVenue => v != null)
        .filter((venue) => venue.id_persona_d === ownerId);
      if (mountedRef.current && currentRequest === requestIdRef.current) {
        setSedes(own);
      }
    } catch (err) {
      if (!mountedRef.current || currentRequest !== requestIdRef.current) return;
      const message =
        err instanceof Error ? err.message : 'No se pudieron cargar tus sedes';
      setError(message);
    } finally {
      if (mountedRef.current && currentRequest === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [isLoggedIn, isDuenio, user?.id_persona]);

  useEffect(() => {
    void fetchSedes();
  }, [fetchSedes]);

  const refetch = useCallback(async () => {
    await fetchSedes();
  }, [fetchSedes]);

  return {
    sedes,
    loading,
    error,
    refetch,
    setSedes,
  };
};
