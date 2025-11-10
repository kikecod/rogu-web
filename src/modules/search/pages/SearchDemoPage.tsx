import React, { useState } from 'react';
import {
  IntegratedSearchBar,
  SearchResults,
  IntegratedFilters,
  LocationAutocomplete,
  AvailabilityChecker,
  ErrorDisplay
} from '../components';
import { useSearchFilters } from '../hooks';
import type { SearchResponse, Cancha } from '../types';

const SearchDemoPage: React.FC = () => {
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [selectedCancha, setSelectedCancha] = useState<Cancha | null>(null);
  const [showAvailabilityChecker, setShowAvailabilityChecker] = useState(false);
  
  const search = useSearchFilters({ autoSearch: false });

  // Manejar resultados de búsqueda desde el SearchBar
  const handleSearchResults = (results: any) => {
    setSearchResponse(results);
  };

  // Manejar cambio de página
  const handleLoadMore = async () => {
    if (!search.lastSearchParams || !search.pagination?.hasNext) return;
    
    const nextPage = search.pagination.page + 1;
    const newParams = {
      ...search.lastSearchParams,
      page: nextPage
    };
    
    try {
      await search.smartSearch(newParams);
    } catch (error) {
      console.error('Error cargando más resultados:', error);
    }
  };

  // Manejar cambio de ordenamiento
  const handleSortChange = async (
    sortBy: 'precio' | 'rating' | 'nombre',
    sortOrder: 'asc' | 'desc'
  ) => {
    if (!search.lastSearchParams) return;
    
    const newParams = {
      ...search.lastSearchParams,
      sortBy,
      sortOrder,
      page: 1
    };
    
    try {
      await search.smartSearch(newParams);
    } catch (error) {
      console.error('Error cambiando ordenamiento:', error);
    }
  };

  // Manejar filtros
  const handleFiltersChange = async (filters: any) => {
    if (!search.lastSearchParams) return;
    
    const newParams = {
      ...search.lastSearchParams,
      ...filters,
      page: 1
    };
    
    try {
      await search.smartSearch(newParams);
    } catch (error) {
      console.error('Error aplicando filtros:', error);
    }
  };

  // Ver detalles de cancha
  const handleViewDetails = (cancha: Cancha) => {
    setSelectedCancha(cancha);
    setShowAvailabilityChecker(true);
  };

  // Cerrar modal de disponibilidad
  const handleCloseAvailability = () => {
    setShowAvailabilityChecker(false);
    setSelectedCancha(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* HEADER */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🏟️ Demo del Sistema de Búsqueda Integrado
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Prueba todas las funcionalidades del sistema de búsqueda: autocompletado de ubicaciones, 
              filtros avanzados, verificación de disponibilidad en tiempo real y manejo de errores.
            </p>
          </div>
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA PRINCIPAL */}
      <div className="bg-white shadow-sm">
        <IntegratedSearchBar
          onSearchResults={handleSearchResults}
          autoSearch={false}
          className="sticky top-0 z-40"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* SIDEBAR CON FILTROS Y HERRAMIENTAS */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* FILTROS AVANZADOS */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Filtros Avanzados
              </h3>
              <IntegratedFilters
                onFiltersChange={handleFiltersChange}
                availableFilters={search.filters}
                currentFilters={search.lastSearchParams || undefined}
              />
            </div>

            {/* AUTOCOMPLETADO DE UBICACIONES */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Búsqueda por Ubicación
              </h3>
              <LocationAutocomplete
                onLocationChange={(location) => {
                  console.log('Ubicación seleccionada:', location);
                }}
                layout="vertical"
              />
            </div>

            {/* ESTADÍSTICAS */}
            {search.totalResults > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Estadísticas de Búsqueda
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total de canchas:</span>
                    <span className="font-medium">{search.totalResults}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Página actual:</span>
                    <span className="font-medium">{search.pagination?.page || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total de páginas:</span>
                    <span className="font-medium">{search.pagination?.totalPages || 0}</span>
                  </div>
                  {search.filters?.availableCities && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ciudades disponibles:</span>
                      <span className="font-medium">{search.filters.availableCities.length}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ÁREA PRINCIPAL DE RESULTADOS */}
          <div className="lg:col-span-3">
            
            {/* MANEJO DE ERRORES */}
            {search.error && (
              <div className="mb-6">
                <ErrorDisplay
                  error={{
                    hasError: true,
                    type: 'server',
                    message: search.error,
                    retryable: true,
                    retryCount: 0
                  }}
                  onRetry={() => {
                    if (search.lastSearchParams) {
                      search.smartSearch(search.lastSearchParams);
                    }
                  }}
                  onDismiss={() => {
                    // Lógica para limpiar error si es necesario
                  }}
                  showSuggestions={true}
                />
              </div>
            )}

            {/* RESULTADOS DE BÚSQUEDA */}
            <SearchResults
              searchResponse={searchResponse || {
                results: search.results,
                pagination: search.pagination || {
                  page: 1,
                  limit: 12,
                  total: search.totalResults,
                  totalPages: Math.ceil(search.totalResults / 12),
                  hasNext: search.hasNextPage,
                  hasPrev: search.hasPrevPage
                },
                filters: search.filters || {
                  availableCities: [],
                  availableDistricts: [],
                  availableDisciplines: [],
                  priceRange: { min: 0, max: 500 }
                }
              }}
              loading={search.loading}
              error={search.error}
              onLoadMore={handleLoadMore}
              onSortChange={handleSortChange}
              onViewDetails={handleViewDetails}
            />

            {/* INFORMACIÓN DE DESARROLLO */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                🛠️ Información para Desarrolladores
              </h3>
              <div className="space-y-3 text-sm text-blue-800">
                <div>
                  <strong>Estado del hook useSearchFilters:</strong>
                  <ul className="list-disc list-inside mt-1 ml-4 space-y-1">
                    <li>Loading: {search.loading ? '✅' : '❌'}</li>
                    <li>Has Results: {search.hasResults ? '✅' : '❌'}</li>
                    <li>Has Filters: {search.hasFilters ? '✅' : '❌'}</li>
                    <li>Has Next Page: {search.hasNextPage ? '✅' : '❌'}</li>
                    <li>Total Results: {search.totalResults}</li>
                  </ul>
                </div>
                
                {search.lastSearchParams && (
                  <div>
                    <strong>Últimos parámetros de búsqueda:</strong>
                    <pre className="mt-1 p-2 bg-white rounded text-xs overflow-x-auto">
                      {JSON.stringify(search.lastSearchParams, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE VERIFICACIÓN DE DISPONIBILIDAD */}
      {showAvailabilityChecker && selectedCancha && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Verificar Disponibilidad
                </h2>
                <button
                  onClick={handleCloseAvailability}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <AvailabilityChecker
                cancha={selectedCancha}
                autoCheck={false}
                onAvailabilityChange={(available) => {
                  console.log('Disponibilidad:', available);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchDemoPage;