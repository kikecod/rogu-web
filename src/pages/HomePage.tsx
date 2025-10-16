import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Clock } from 'lucide-react';
import SportFieldCard from '../components/SportFieldCard';
import Filters from '../components/Filters';
import Footer from '../components/Footer';
import { fetchCanchas } from '../utils/helpers';
import type { SportField } from '../types';
import type { FilterState } from '../components/Filters';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [allFields, setAllFields] = useState<SportField[]>([]);
  const [filteredFields, setFilteredFields] = useState<SportField[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar canchas al montar el componente
  useEffect(() => {
    const loadCanchas = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const canchas = await fetchCanchas();
        setAllFields(canchas);
        setFilteredFields(canchas);
      } catch (err) {
        console.error('Error al cargar canchas:', err);
        setError('No se pudieron cargar las canchas. Por favor, intenta de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };

    loadCanchas();
  }, []);

  const handleFiltersChange = (filters: FilterState) => {
    let filtered = [...allFields];

    // Filter by sport
    if (filters.sport.length > 0) {
      filtered = filtered.filter(field => filters.sport.includes(field.sport));
    }

    // Filter by price range
    filtered = filtered.filter(field => 
      field.price >= filters.priceRange[0] && field.price <= filters.priceRange[1]
    );

    // Filter by rating
    if (filters.rating > 0) {
      filtered = filtered.filter(field => field.rating >= filters.rating);
    }

    // Filter by amenities
    if (filters.amenities.length > 0) {
      filtered = filtered.filter(field =>
        filters.amenities.every(amenity => field.amenities.includes(amenity))
      );
    }

    setFilteredFields(filtered);
  };

  const handleFieldClick = (field: SportField) => {
    navigate(`/field/${field.id}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Search Section - Simplified like Airbnb */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 mb-3 sm:mb-4">
              Encuentra espacios deportivos increíbles
            </h1>
            <p className="text-base sm:text-lg text-neutral-600 px-4 mb-4">
              Reserva la cancha perfecta para tu próximo partido
            </p>
          </div>

          {/* Responsive Search Bar */}
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="bg-white border border-neutral-300 rounded-2xl sm:rounded-full shadow-lg p-3 sm:p-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-2 items-center">
                <div className="relative">
                  <MapPin className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-3 border-0 rounded-xl sm:rounded-full bg-transparent placeholder-neutral-500 focus:outline-none text-neutral-900 text-sm sm:text-base"
                    placeholder="¿Dónde?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="date"
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-3 border-0 rounded-xl sm:rounded-full bg-transparent text-neutral-900 focus:outline-none text-sm sm:text-base"
                  />
                </div>
                <div className="relative">
                  <Clock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <select className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-3 border-0 rounded-xl sm:rounded-full bg-transparent text-neutral-900 focus:outline-none appearance-none text-sm sm:text-base">
                    <option>Hora</option>
                    <option>08:00</option>
                    <option>10:00</option>
                    <option>12:00</option>
                    <option>14:00</option>
                    <option>16:00</option>
                    <option>18:00</option>
                    <option>20:00</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl sm:rounded-full transition-colors flex items-center justify-center min-h-[48px] font-medium"
                >
                  <Search className="h-4 w-4 sm:mr-0 mr-2" />
                  <span className="sm:hidden">Buscar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

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
                  {filteredFields.length > 0 ? `${filteredFields.length} canchas disponibles` : 'No hay canchas disponibles'}
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

            {/* Carrusel horizontal - Airbnb style */}
            {filteredFields.length > 0 && (
              <div className="relative group">
                <div 
                  className="overflow-x-auto scrollbar-hide scroll-smooth"
                  style={{ scrollBehavior: 'smooth' }}
                >
                  <div className="flex gap-4 sm:gap-6 pb-4 px-1" style={{ width: 'max-content' }}>
                    {filteredFields.map((field) => (
                      <div key={field.id} className="flex-none w-72 sm:w-80 lg:w-72">
                        <SportFieldCard
                          field={field}
                          onClick={handleFieldClick}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Indicador de scroll para móvil */}
                <div className="flex justify-center mt-2 sm:hidden">
                  <div className="flex space-x-1">
                    {[...Array(Math.ceil(filteredFields.length / 1))].map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 bg-neutral-300 rounded-full"></div>
                    ))}
                  </div>
                </div>
                
                {/* Indicador de scroll para desktop */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-neutral-400 hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity">
                  Desliza horizontalmente para ver más →
                </div>
              </div>
            )}

            {filteredFields.length === 0 && !error && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🏟️</div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  No se encontraron canchas
                </h3>
                <p className="text-neutral-600">
                  {allFields.length === 0 
                    ? 'No hay canchas disponibles en este momento'
                    : 'Prueba ajustando tus filtros o busca en otra ubicación'
                  }
                </p>
              </div>
            )}

            {/* Load more button - Solo mostrar si hay canchas */}
            {filteredFields.length > 0 && (
              <div className="text-center mt-12">
                <button className="bg-neutral-900 text-white px-8 py-3 rounded-lg hover:bg-neutral-800 transition-colors">
                  Mostrar más canchas
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