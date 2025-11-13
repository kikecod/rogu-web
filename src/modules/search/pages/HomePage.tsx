'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SportsSearchBar, { type SportSearchParams } from '../components/SearchBar';
import SedeCard from '../../venues/components/SedeCard';
import Filters from '../components/Filters';
import Footer from '@/components/Footer';
import { venueService } from '../../venues/services/venueService';
import type { SedeCard as SedeCardType } from '../../venues/types/venue-search.types';
import type { FilterState } from '../components/Filters';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [allVenues, setAllVenues] = useState<SedeCardType[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<SedeCardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearchBarSticky, setIsSearchBarSticky] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // El SearchBar se vuelve sticky cuando se scrollea más allá del hero (más compacto ahora)
      setIsSearchBarSticky(window.scrollY > 80);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadSedes = async () => {
      try {
        setIsLoading(true);
        setError(null);
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

    if (filters.sport.length > 0) {
      filtered = filtered.filter(venue => 
        filters.sport.some(sport => venue.estadisticas.deportesDisponibles.includes(sport))
      );
    }

    filtered = filtered.filter(venue => 
      venue.estadisticas.precioDesde >= filters.priceRange[0] && 
      venue.estadisticas.precioDesde <= filters.priceRange[1]
    );

    if (filters.rating > 0) {
      filtered = filtered.filter(venue => venue.estadisticas.ratingFinal >= filters.rating);
    }

    setFilteredVenues(filtered);
  };

  const handleSportSearch = (params: SportSearchParams) => {
    console.log('Searching with sports params:', params);
    let filtered = [...allVenues];

    if (params.venue) {
      filtered = filtered.filter(venue => 
        venue.nombre.toLowerCase().includes(params.venue.toLowerCase()) ||
        venue.city.toLowerCase().includes(params.venue.toLowerCase()) ||
        venue.district.toLowerCase().includes(params.venue.toLowerCase()) ||
        venue.addressLine.toLowerCase().includes(params.venue.toLowerCase())
      );
    }

    if (params.discipline) {
      filtered = filtered.filter(venue => 
        venue.estadisticas.deportesDisponibles.includes(params.discipline)
      );
    }

    setFilteredVenues(filtered);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-secondary-50">
      {/* Hero Section - Compacto con colores ROGU */}
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 overflow-hidden pt-20 pb-12">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-secondary-400 opacity-20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-300 opacity-20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          {/* Pattern overlay */}
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        </div>
      </div>

      {/* Search Bar - Normal position (below hero) */}
      <div className="relative -mt-8 mb-6 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SportsSearchBar onSearch={handleSportSearch} />
        </div>
      </div>

      {/* Search Bar - Sticky version (appears on scroll) */}
      <div className={`fixed top-16 sm:top-20 left-0 right-0 z-40 transition-all duration-300 ${
        isSearchBarSticky ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}>
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 shadow-xl border-b-2 border-primary-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <SportsSearchBar onSearch={handleSportSearch} />
          </div>
        </div>
      </div>

      
      {/* Listings Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-12 sm:py-16">
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
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
            <p className="text-gray-600">Cargando espacios deportivos...</p>
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600 mb-2">
                  Espacios Deportivos
                </h2>
                <p className="text-gray-600 text-base">
                  {filteredVenues.length > 0 ? `${filteredVenues.length} sedes disponibles` : 'No hay sedes disponibles'}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
                <Filters onFiltersChange={handleFiltersChange} />
                <button className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-primary-500 text-primary-600 rounded-lg hover:bg-primary-50 transition-all font-semibold text-sm">
                  <span>Ver Mapa</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Venues Grid */}
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
              <div className="text-center py-16 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl border-2 border-primary-200">
                <div className="text-6xl mb-4">⚽🏀🎾</div>
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600 mb-3">
                  No se encontraron espacios
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {allVenues.length === 0 
                    ? '¡Pronto tendremos más espacios disponibles para ti!'
                    : 'Prueba ajustando tus filtros o busca en otra ubicación'
                  }
                </p>
              </div>
            )}

            {/* Load More Button */}
            {filteredVenues.length > 0 && filteredVenues.length >= 12 && (
              <div className="text-center mt-12">
                <button className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-10 py-3 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-all font-semibold shadow-lg hover:shadow-xl">
                  Mostrar más espacios
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
