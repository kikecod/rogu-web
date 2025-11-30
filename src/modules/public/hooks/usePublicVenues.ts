import { useCallback, useEffect, useMemo, useState } from 'react';
import { searchApiService } from '@/search/services/searchApi.service';
import { venueService } from '@/venues/services/venueService';
import type { SedeCard } from '@/venues/types/venue-search.types';
import { mapCanchasToSedes } from '../lib/adapters';

export interface PublicVenueFilters {
  city?: string;
  district?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  sport?: string;
  sortBy?: 'rating' | 'precio' | 'nombre';
}

interface PublicVenueState {
  venues: SedeCard[];
  loading: boolean;
  error: string | null;
  total: number;
  totalPages: number;
  page: number;
}

const DEFAULT_LIMIT = 12;

export const usePublicVenues = (initialFilters: PublicVenueFilters = {}, initialLimit = DEFAULT_LIMIT) => {
  const [filters, setFilters] = useState<PublicVenueFilters>(initialFilters);
  const [page, setPage] = useState(1);
  const [limit] = useState(initialLimit);
  const [{ venues, loading, error, total, totalPages }, setState] = useState<PublicVenueState>({
    venues: [],
    loading: false,
    error: null,
    total: 0,
    totalPages: 1,
    page: 1,
  });

  const hasDateFilters = useMemo(
    () => Boolean(filters.date || filters.startTime || filters.endTime),
    [filters.date, filters.startTime, filters.endTime]
  );

  const fetchVenues = useCallback(
    async ({ append = false, targetPage }: { append?: boolean; targetPage?: number } = {}) => {
      const currentPage = targetPage ?? page;
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        if (hasDateFilters) {
          const response = await searchApiService.searchMain({
            city: filters.city || undefined,
            district: filters.district || undefined,
            fecha: filters.date || undefined,
            horaInicio: filters.startTime || undefined,
            horaFin: filters.endTime || undefined,
            disciplina: filters.sport || undefined,
            page: currentPage,
            limit,
            sortBy: filters.sortBy,
          });

          const aggregated = mapCanchasToSedes(response.results);
          const start = (currentPage - 1) * limit;
          const paginated = aggregated.slice(start, start + limit);
          const computedTotalPages = Math.max(1, Math.ceil(aggregated.length / limit));

          setState((prev) => ({
            ...prev,
            venues: append ? [...prev.venues, ...paginated] : paginated,
            total: aggregated.length,
            totalPages: computedTotalPages,
            page: currentPage,
            loading: false,
          }));
        } else {
          const fallback = await venueService.findVenues().catch(() => []);
          const start = (currentPage - 1) * limit;
          const paginated = fallback.slice(start, start + limit);
          const computedTotalPages = Math.max(1, Math.ceil(fallback.length / limit));

          setState((prev) => ({
            ...prev,
            venues: append ? [...prev.venues, ...paginated] : paginated,
            total: fallback.length,
            totalPages: computedTotalPages,
            page: currentPage,
            loading: false,
            error: null,
          }));
        }
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err?.message || 'No se pudieron cargar las sedes públicas',
        }));
      }
    },
    [filters, hasDateFilters, limit, page]
  );

  // Reset page and fetch when filters change (except page)
  useEffect(() => {
    setPage(1);
    fetchVenues({ append: false, targetPage: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.city, filters.district, filters.date, filters.startTime, filters.endTime, filters.sport, filters.sortBy]);

  const updateFilters = (next: Partial<PublicVenueFilters>) => {
    setFilters((prev) => ({ ...prev, ...next }));
  };

  const loadMore = () => {
    const nextPage = page + 1;
    if (nextPage > totalPages) return;
    setPage(nextPage);
    fetchVenues({ append: true, targetPage: nextPage });
  };

  return {
    filters,
    venues,
    loading,
    error,
    total,
    totalPages,
    page,
    setFilters: updateFilters,
    loadMore,
    refetch: () => fetchVenues({ append: false, targetPage: 1 }),
  };
};

export default usePublicVenues;
