import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import SedeCard from '../../venues/components/SedeCard';
import Filters from '../components/Filters';
import Footer from '@/components/Footer';
import SearchBar, { type SearchParams } from '../components/SearchBar';
import { venueService } from '../../venues/services/venueService';
import type { SedeCard as SedeCardType } from '../../venues/types/venue-search.types';
import type { FilterState } from '../components/Filters';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [allVenues, setAllVenues] = useState<SedeCardType[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<SedeCardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Scroll to top al montar el componente
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Cargar sedes al montar el componente
  useEffect(() => {
    const loadSedes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // findVenues devuelve un array directo de sedes
        const sedes = await venueService.findVenues();
        console.log('Sedes cargadas:', sedes);
        setAllVenues(sedes);
        setFilteredVenues(sedes);
      } catch (err) {
        console.error('Error al cargar sedes:', err);
        setError('No se pudieron cargar las sedes. Por favor, intenta de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSedes();
  }, []);

  const handleFiltersChange = (filters: FilterState) => {
    let filtered = [...allVenues];

    // Filter by sport - buscar en deportesDisponibles
    if (filters.sport.length > 0) {
      filtered = filtered.filter(venue => 
        filters.sport.some(sport => venue.estadisticas.deportesDisponibles.includes(sport))
      );
    }

    // Filter by price range - usar precioDesde y precioHasta
    filtered = filtered.filter(venue => 
      venue.estadisticas.precioDesde >= filters.priceRange[0] && 
      venue.estadisticas.precioDesde <= filters.priceRange[1]
    );

    // Filter by rating - usar ratingFinal
    if (filters.rating > 0) {
      filtered = filtered.filter(venue => venue.estadisticas.ratingFinal >= filters.rating);
    }

    // Filter by amenities - si existe en SedeDetalle
    if (filters.amenities.length > 0) {
      // TODO: Implementar cuando tengamos amenities en SedeCard
    }

    setFilteredVenues(filtered);
  };

  const handleSearch = (params: SearchParams) => {
    console.log('Searching with params:', params);
    let filtered = [...allVenues];

    // Filter by location (nombre de sede o ciudad)
    if (params.location) {
      filtered = filtered.filter(venue => 
        venue.nombre.toLowerCase().includes(params.location.toLowerCase()) ||
        venue.city.toLowerCase().includes(params.location.toLowerCase()) ||
        venue.district.toLowerCase().includes(params.location.toLowerCase()) ||
        venue.addressLine.toLowerCase().includes(params.location.toLowerCase())
      );
    }

    // Filter by sport
    if (params.sport) {
      filtered = filtered.filter(venue => 
        venue.estadisticas.deportesDisponibles.includes(params.sport)
      );
    }

    // TODO: Implementar filtros de fecha y hora cuando estén disponibles en la API
    
    setFilteredVenues(filtered);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-blue-50">
      {/* Hero Section - Moderno y llamativo */}
      <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 overflow-hidden">
        {/* Elementos decorativos animados */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-300 opacity-10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-300 opacity-10 rounded-full blur-3xl animate-bounce"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          {/* Badge */}
          <div className="flex justify-center mb-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
              <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
              <span className="text-white font-medium text-sm">Tu plataforma deportiva favorita</span>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white mb-4 sm:mb-6 leading-tight animate-slide-up">
              Encuentra tu espacio deportivo
              <br />
              <span className="bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-400 text-transparent bg-clip-text animate-gradient">
                ideal
              </span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto px-4 animate-slide-up-delay">
              Descubre sedes deportivas con múltiples canchas en un solo lugar. 
              <br className="hidden sm:block" />
              Compara, elige y reserva. ⚡
            </p>
          </div>

          
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </div>

      {/* SearchBar Sticky Component */}
      <SearchBar onSearch={handleSearch} />

      {/* Listings Section - Like Airbnb main content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">Error al cargar canchas</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-neutral-600">Cargando canchas...</p>
          </div>
        ) : (
          <>
            {/* Filters and Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div className="mb-4 sm:mb-0">
                <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-1">
                  Espacios deportivos
                </h2>
                <p className="text-neutral-600 text-sm sm:text-base">
                  {filteredVenues.length > 0 ? `${filteredVenues.length} sedes disponibles` : 'No hay sedes disponibles'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
                <div className="flex-1 sm:flex-none">
                  <Filters onFiltersChange={handleFiltersChange} />
                </div>
                <button className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 border border-neutral-300 rounded-lg hover:border-neutral-400 transition-colors text-sm sm:text-base min-w-[80px]">
                  <span>Mapa</span>
                </button>
              </div>
            </div>

            {/* Grid de Sedes */}
            {filteredVenues.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredVenues.map((sede) => (
                  <SedeCard 
                    key={sede.idSede} 
                    sede={sede} 
                    onClick={() => navigate(`/venues/${sede.idSede}`)} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🏟️</div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  No se encontraron sedes
                </h3>
                <p className="text-neutral-600">
                  {allVenues.length === 0 
                    ? 'No hay sedes disponibles en este momento'
                    : 'Prueba ajustando tus filtros o busca en otra ubicación'
                  }
                </p>
              </div>
            )}

            {/* Load more button - Solo mostrar si hay sedes */}
            {filteredVenues.length > 0 && filteredVenues.length >= 12 && (
              <div className="text-center mt-12">
                <button className="bg-neutral-900 text-white px-8 py-3 rounded-lg hover:bg-neutral-800 transition-colors">
                  Mostrar más sedes
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;