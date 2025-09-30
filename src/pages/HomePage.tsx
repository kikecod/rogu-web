import React, { useState } from 'react';
import { Search, MapPin, Calendar, Clock } from 'lucide-react';
import SportFieldCard from '../components/SportFieldCard';
import Filters from '../components/Filters';
import Footer from '../components/Footer';
import { getSportFieldImages, generateAvatarUrl } from '../utils/helpers';
import type { SportField } from '../types';
import type { FilterState } from '../components/Filters';

// Mock data for demo
const mockFields: SportField[] = [
  {
    id: '1',
    name: 'Cancha de Fútbol Premium',
    description: 'Cancha de césped sintético de alta calidad con iluminación profesional y vestidores completos.',
    images: getSportFieldImages('football'),
    price: 150,
    location: {
      address: 'Av. Revolución 1234',
      city: 'Ciudad de México',
      coordinates: { lat: 19.4326, lng: -99.1332 }
    },
    sport: 'football',
    amenities: ['Estacionamiento', 'Vestidores', 'Duchas', 'Iluminación', 'Arbitro'],
    availability: [],
    rating: 4.8,
    reviews: 127,
    owner: {
      id: '1',
      name: 'Centro Deportivo Elite',
      avatar: generateAvatarUrl('Centro Deportivo Elite')
    }
  },
  {
    id: '2',
    name: 'Cancha de Básquetbol Indoor',
    description: 'Cancha techada con duela profesional, aire acondicionado y sistema de sonido.',
    images: getSportFieldImages('basketball'),
    price: 120,
    location: {
      address: 'Calle Deportiva 567',
      city: 'Guadalajara',
      coordinates: { lat: 20.6597, lng: -103.3496 }
    },
    sport: 'basketball',
    amenities: ['Estacionamiento', 'Vestidores', 'Duchas', 'Cafetería'],
    availability: [],
    rating: 4.6,
    reviews: 89,
    owner: {
      id: '2',
      name: 'Sports Complex GDL',
      avatar: generateAvatarUrl('Sports Complex GDL')
    }
  },
  {
    id: '3',
    name: 'Cancha de Tenis Clay Court',
    description: 'Cancha de polvo de ladrillo profesional con gradas para espectadores.',
    images: getSportFieldImages('tennis'),
    price: 100,
    location: {
      address: 'Club Deportivo 890',
      city: 'Monterrey',
      coordinates: { lat: 25.6866, lng: -100.3161 }
    },
    sport: 'tennis',
    amenities: ['Estacionamiento', 'Vestidores', 'Tienda', 'Equipamiento'],
    availability: [],
    rating: 4.9,
    reviews: 156,
    owner: {
      id: '3',
      name: 'Tennis Club MTY',
      avatar: generateAvatarUrl('Tennis Club MTY')
    }
  },
  {
    id: '4',
    name: 'Cancha de Voleibol Playa',
    description: 'Cancha de arena con vista al mar, perfecta para voleibol de playa.',
    images: getSportFieldImages('volleyball'),
    price: 80,
    location: {
      address: 'Playa del Carmen',
      city: 'Quintana Roo',
      coordinates: { lat: 20.6296, lng: -87.0739 }
    },
    sport: 'volleyball',
    amenities: ['Estacionamiento', 'Duchas', 'Cafetería'],
    availability: [],
    rating: 4.7,
    reviews: 92,
    owner: {
      id: '4',
      name: 'Beach Sports',
      avatar: generateAvatarUrl('Beach Sports')
    }
  },
  {
    id: '5',
    name: 'Cancha de Paddle Moderna',
    description: 'Cancha de paddle con cristales temperados y césped sintético de última generación.',
    images: getSportFieldImages('paddle'),
    price: 90,
    location: {
      address: 'Zona Rosa 123',
      city: 'Ciudad de México',
      coordinates: { lat: 19.4326, lng: -99.1332 }
    },
    sport: 'paddle',
    amenities: ['Estacionamiento', 'Vestidores', 'Duchas', 'Tienda'],
    availability: [],
    rating: 4.5,
    reviews: 73,
    owner: {
      id: '5',
      name: 'Paddle Club CDMX',
      avatar: generateAvatarUrl('Paddle Club CDMX')
    }
  },
  {
    id: '6',
    name: 'Pista de Hockey sobre Hielo',
    description: 'Pista profesional de hockey con sistema de refrigeración y gradas.',
    images: getSportFieldImages('hockey'),
    price: 200,
    location: {
      address: 'Centro Deportivo Norte',
      city: 'Tijuana',
      coordinates: { lat: 32.5149, lng: -117.0382 }
    },
    sport: 'hockey',
    amenities: ['Estacionamiento', 'Vestidores', 'Duchas', 'Equipamiento', 'Cafetería'],
    availability: [],
    rating: 4.4,
    reviews: 45,
    owner: {
      id: '6',
      name: 'Ice Hockey TJ',
      avatar: generateAvatarUrl('Ice Hockey TJ')
    }
  },
];

const HomePage: React.FC = () => {
  const [filteredFields, setFilteredFields] = useState<SportField[]>(mockFields);
  const [searchQuery, setSearchQuery] = useState('');

  const handleFiltersChange = (filters: FilterState) => {
    let filtered = [...mockFields];

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
    console.log('Selected field:', field);
    // TODO: Navigate to field details page
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
            <p className="text-base sm:text-lg text-neutral-600 px-4">
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
        {/* Filters and Results Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-1">
              Espacios deportivos
            </h2>
            <p className="text-neutral-600 text-sm sm:text-base">
              Más de {filteredFields.length} canchas disponibles
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

        {/* Grid - Airbnb style responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
          {filteredFields.map((field) => (
            <SportFieldCard
              key={field.id}
              field={field}
              onClick={handleFieldClick}
            />
          ))}
        </div>

        {filteredFields.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏟️</div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              No se encontraron canchas
            </h3>
            <p className="text-neutral-600">
              Prueba ajustando tus filtros o busca en otra ubicación
            </p>
          </div>
        )}

        {/* Load more button */}
        <div className="text-center mt-12">
          <button className="bg-neutral-900 text-white px-8 py-3 rounded-lg hover:bg-neutral-800 transition-colors">
            Mostrar más canchas
          </button>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;