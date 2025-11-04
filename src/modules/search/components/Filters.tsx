import React, { useState } from 'react';
import { Filter, X, DollarSign, Star } from 'lucide-react';

interface FiltersProps {
  onFiltersChange: (filters: FilterState) => void;
}

export interface FilterState {
  sport: string[];
  priceRange: [number, number];
  rating: number;
  amenities: string[];
  location: string;
}

const Filters: React.FC<FiltersProps> = ({ onFiltersChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    sport: [],
    priceRange: [0, 1000],
    rating: 0,
    amenities: [],
    location: '',
  });

  const sports = [
    { id: 'football', name: 'Fútbol', icon: '⚽' },
    { id: 'basketball', name: 'Básquetbol', icon: '🏀' },
    { id: 'tennis', name: 'Tenis', icon: '🎾' },
    { id: 'volleyball', name: 'Voleibol', icon: '🏐' },
    { id: 'paddle', name: 'Paddle', icon: '🏓' },
    { id: 'hockey', name: 'Hockey', icon: '🏒' },
  ];

  const amenitiesList = [
    'Estacionamiento',
    'Vestidores',
    'Duchas',
    'Cafetería',
    'Tienda',
    'Iluminación',
    'Arbitro',
    'Equipamiento',
  ];

  const handleSportToggle = (sportId: string) => {
    const newSports = filters.sport.includes(sportId)
      ? filters.sport.filter(s => s !== sportId)
      : [...filters.sport, sportId];
    
    const newFilters = { ...filters, sport: newSports };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleAmenityToggle = (amenity: string) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];
    
    const newFilters = { ...filters, amenities: newAmenities };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handlePriceChange = (value: number, index: number) => {
    const newPriceRange: [number, number] = [...filters.priceRange];
    newPriceRange[index] = value;
    
    const newFilters = { ...filters, priceRange: newPriceRange };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleRatingChange = (rating: number) => {
    const newFilters = { ...filters, rating };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const newFilters = {
      sport: [],
      priceRange: [0, 1000] as [number, number],
      rating: 0,
      amenities: [],
      location: '',
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const activeFiltersCount = 
    filters.sport.length + 
    filters.amenities.length + 
    (filters.rating > 0 ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000 ? 1 : 0);

  return (
    <>
      {/* Filter toggle button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 border border-neutral-300 rounded-lg hover:border-neutral-400 transition-colors text-sm sm:text-base whitespace-nowrap"
      >
        <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className="hidden xs:inline">Filtros</span>
        <span className="xs:hidden">•</span>
        {activeFiltersCount > 0 && (
          <span className="bg-blue-600 text-white text-xs rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1 min-w-[18px] text-center">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Filter modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end sm:items-center justify-center min-h-screen p-0 sm:p-4">
            {/* Background overlay */}
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsOpen(false)}></div>
            </div>

            {/* Modal content */}
            <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg sm:w-full max-h-[90vh] overflow-hidden shadow-xl transform transition-all"
                 style={{ marginBottom: 'env(safe-area-inset-bottom)' }}>
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-neutral-200 px-4 sm:px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900">Filtros</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="overflow-y-auto px-4 sm:px-6 py-4 space-y-6">
                {/* Sports filter */}
                <div>
                  <h4 className="text-sm font-medium text-neutral-900 mb-3">Tipo de deporte</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {sports.map((sport) => (
                      <button
                        key={sport.id}
                        onClick={() => handleSportToggle(sport.id)}
                        className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-lg border transition-colors text-sm ${
                          filters.sport.includes(sport.id)
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-neutral-300 hover:border-neutral-400'
                        }`}
                      >
                        <span>{sport.icon}</span>
                        <span className="text-sm">{sport.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price range filter */}
                <div>
                  <h4 className="text-sm font-medium text-neutral-900 mb-3">Precio por hora</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-4 w-4 text-neutral-400" />
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        step="50"
                        value={filters.priceRange[0]}
                        onChange={(e) => handlePriceChange(Number(e.target.value), 0)}
                        className="flex-1 accent-primary-600"
                      />
                      <span className="text-sm text-neutral-600 min-w-0 w-16">
                        Bs {filters.priceRange[0]}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-4 w-4 text-neutral-400" />
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        step="50"
                        value={filters.priceRange[1]}
                        onChange={(e) => handlePriceChange(Number(e.target.value), 1)}
                        className="flex-1 accent-primary-600"
                      />
                      <span className="text-sm text-neutral-600 min-w-0 w-16">
                        Bs {filters.priceRange[1]}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rating filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Calificación mínima</h4>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleRatingChange(rating)}
                        className={`flex items-center space-x-1 px-3 py-2 rounded-lg border transition-colors ${
                          filters.rating >= rating
                            ? 'border-yellow-400 bg-yellow-50 text-yellow-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <Star className={`h-4 w-4 ${filters.rating >= rating ? 'fill-current' : ''}`} />
                        <span className="text-sm">{rating}+</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amenities filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Servicios</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {amenitiesList.map((amenity) => (
                      <button
                        key={amenity}
                        onClick={() => handleAmenityToggle(amenity)}
                        className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                          filters.amenities.includes(amenity)
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {amenity}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex space-x-3 mt-6 pt-6 border-t border-neutral-200">
                <button
                  onClick={clearFilters}
                  className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Limpiar
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Aplicar filtros
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Filters;