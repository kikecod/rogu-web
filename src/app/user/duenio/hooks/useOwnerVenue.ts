import { useCallback, useEffect, useState } from 'react';
import { sedeService } from '../../../../features/sedes/services/sede.service';
import type { OwnerVenue } from '../types/owner.types';
import { mapToOwnerVenue } from '../utils/owner.mappers';

interface UseOwnerVenueResult {
  venue: OwnerVenue | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setVenue: React.Dispatch<React.SetStateAction<OwnerVenue | null>>;
}

export const useOwnerVenue = (sedeId: number | null): UseOwnerVenueResult => {
  const [venue, setVenue] = useState<OwnerVenue | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVenue = useCallback(async () => {
    if (!sedeId) {
      setVenue(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await sedeService.getById(sedeId);
      const mapped = mapToOwnerVenue(data);
      if (!mapped) {
        throw new Error('No se reconocio el formato de la sede recibida.');
      }
      setVenue(mapped);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo cargar la sede';
      setError(message);
      setVenue(null);
    } finally {
      setLoading(false);
    }
  }, [sedeId]);

  useEffect(() => {
    void fetchVenue();
  }, [fetchVenue]);

  const refresh = useCallback(async () => {
    await fetchVenue();
  }, [fetchVenue]);

  return {
    venue,
    loading,
    error,
    refresh,
    setVenue,
  };
};
