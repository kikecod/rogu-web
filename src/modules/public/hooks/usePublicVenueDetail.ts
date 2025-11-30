import { useEffect, useState } from 'react';
import { venueService } from '@/venues/services/venueService';
import type { SedeDetalleResponse } from '@/venues/types/venue-search.types';

export const usePublicVenueDetail = (idSede?: number) => {
  const [data, setData] = useState<SedeDetalleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!idSede) return;
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await venueService.getVenueById(idSede);
        setData(response);
      } catch (err: any) {
        setError(err?.message || 'No se pudo cargar la sede');
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [idSede]);

  return { data, loading, error };
};

export default usePublicVenueDetail;
