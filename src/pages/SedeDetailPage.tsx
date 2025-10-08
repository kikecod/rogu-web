import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Phone, Mail, Star, ChevronLeft, Shield, 
  Clock, Users, Building2, AlertCircle
} from 'lucide-react';
import Footer from '../components/Footer';
import type { Sede, SportField } from '../types';
import { getSportFieldImages, generateAvatarUrl } from '../utils/helpers';

// Mock data de sede
const mockSede: Sede = {
  id: '1',
  ownerId: 'owner-1',
  name: 'Centro Deportivo Elite',
  description: 'Complejo deportivo de primer nivel con instalaciones modernas y servicios de calidad. Contamos con múltiples canchas para diferentes deportes, estacionamiento amplio, cafetería, vestuarios equipados y personal profesional. Ubicado en una zona céntrica con fácil acceso.',
  address: 'Av. Revolución 1234, Col. San Ángel, Ciudad de México',
  latitude: 19.4326,
  longitude: -99.1332,
  phone: '+52 55 1234 5678',
  email: 'contacto@centroelite.com',
  policies: [
    'Cancelación gratuita hasta 24 horas antes',
    'Se requiere llegar 10 minutos antes del horario reservado',
    'No se permiten alimentos del exterior en las canchas',
    'El uso de calzado deportivo es obligatorio',
    'Respetar los horarios de reserva',
    'Mantener las instalaciones limpias',
    'No fumar en las áreas deportivas',
    'Los menores de edad deben estar acompañados'
  ],
  images: getSportFieldImages('football'),
  rating: 4.8,
  reviews: 247,
  amenities: [
    'Estacionamiento gratuito',
    'Vestuarios equipados',
    'Duchas con agua caliente',
    'WiFi gratuito',
    'Cafetería',
    'Tienda deportiva',
    'Seguridad 24/7',
    'Área de espera',
    'Primeros auxilios'
  ],
  owner: {
    id: 'owner-1',
    name: 'Carlos Hernández',
    avatar: generateAvatarUrl('Carlos Hernández')
  }
};

// Mock data de canchas de la sede
const mockFields: SportField[] = [
  {
    id: '1',
    sedeId: '1',
    name: 'Cancha de Fútbol Premium',
    description: 'Cancha de fútbol profesional con césped sintético de última generación',
    images: getSportFieldImages('football'),
    price: 150,
    sport: 'football',
    amenities: ['Iluminación LED', 'Gradas', 'Marcador digital'],
    availability: [],
    rating: 4.9,
    reviews: 127
  },
  {
    id: '2',
    sedeId: '1',
    name: 'Cancha de Básquetbol Indoor',
    description: 'Cancha techada con duela profesional y aire acondicionado',
    images: getSportFieldImages('basketball'),
    price: 120,
    sport: 'basketball',
    amenities: ['Aire acondicionado', 'Tableros profesionales', 'Sistema de sonido'],
    availability: [],
    rating: 4.7,
    reviews: 89
  },
  {
    id: '3',
    sedeId: '1',
    name: 'Cancha de Tenis Clay Court',
    description: 'Cancha de polvo de ladrillo profesional',
    images: getSportFieldImages('tennis'),
    price: 100,
    sport: 'tennis',
    amenities: ['Red profesional', 'Iluminación', 'Gradas'],
    availability: [],
    rating: 4.8,
    reviews: 65
  }
];

const SedeDetailPage: React.FC = () => {
  const navigate = useNavigate();

  const handleFieldClick = (field: SportField) => {
    navigate(`/field/${field.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="font-medium">Volver</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Image */}
        <div className="mb-8">
          <div className="relative rounded-2xl overflow-hidden h-[400px]">
            <img
              src={mockSede.images[0]}
              alt={mockSede.name}
              className="w-full h-full object-cover"
            />
            
            {/* Sede Badge */}
            <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Sede Deportiva
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Sede Info */}
          <div className="lg:col-span-2 space-y-5">
            {/* Title and Rating */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
                {mockSede.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <div className="flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full">
                  <Star className="h-4 w-4 fill-blue-600 text-blue-600" />
                  <span className="font-bold text-blue-900 text-sm">{mockSede.rating}</span>
                  <span className="text-xs">({mockSede.reviews} reseñas)</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="text-xs">{mockSede.address}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Sobre esta sede</h2>
              <p className="text-gray-700 leading-relaxed text-sm">
                {mockSede.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Instalaciones y servicios</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mockSede.amenities.map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-2.5 bg-blue-50 rounded-lg"
                  >
                    <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                      <Shield className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-gray-800 font-medium text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Policies */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border-2 border-amber-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                Políticas de la sede
              </h2>
              <ul className="space-y-2">
                {mockSede.policies.map((policy, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>{policy}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Available Fields */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Canchas disponibles ({mockFields.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mockFields.map((field) => (
                  <div
                    key={field.id}
                    onClick={() => handleFieldClick(field)}
                    className="cursor-pointer transform transition-transform hover:scale-105"
                  >
                    <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
                      <div className="h-48 overflow-hidden">
                        <img
                          src={field.images[0]}
                          alt={field.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 text-base mb-2">{field.name}</h3>
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{field.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-blue-600 text-blue-600" />
                            <span className="font-bold text-sm">{field.rating}</span>
                            <span className="text-xs text-gray-600">({field.reviews})</span>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-extrabold text-blue-600">${field.price}</span>
                            <span className="text-xs text-gray-600">/hora</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Ubicación
              </h2>
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 h-64 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium text-base">{mockSede.address}</p>
                  <p className="text-gray-600 text-sm mt-1">
                    Coordenadas: {mockSede.latitude}, {mockSede.longitude}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white rounded-2xl p-5 shadow-xl border-2 border-blue-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Información de contacto
              </h3>

              {/* Owner Info */}
              <div className="mb-5 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                <p className="text-xs text-gray-600 mb-2">Propietario</p>
                <div className="flex items-center gap-3">
                  <img
                    src={mockSede.owner.avatar}
                    alt={mockSede.owner.name}
                    className="w-12 h-12 rounded-full border-2 border-white shadow"
                  />
                  <div>
                    <p className="font-bold text-gray-900">{mockSede.owner.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Shield className="h-3 w-3 text-blue-600" />
                      <span className="text-xs text-blue-600 font-medium">Verificado</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-3">
                <a
                  href={`tel:${mockSede.phone}`}
                  className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="bg-blue-600 text-white p-2 rounded-lg">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Teléfono</p>
                    <p className="font-bold text-gray-900 text-sm">{mockSede.phone}</p>
                  </div>
                </a>

                <a
                  href={`mailto:${mockSede.email}`}
                  className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="bg-blue-600 text-white p-2 rounded-lg">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Email</p>
                    <p className="font-bold text-gray-900 text-sm break-all">{mockSede.email}</p>
                  </div>
                </a>
              </div>

              {/* Quick Stats */}
              <div className="mt-5 pt-5 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-extrabold text-blue-600">{mockFields.length}</div>
                    <div className="text-xs text-gray-600">Canchas</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-extrabold text-blue-600">{mockSede.amenities.length}</div>
                    <div className="text-xs text-gray-600">Servicios</div>
                  </div>
                </div>
              </div>

              {/* Hours */}
              <div className="mt-5 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <p className="font-bold text-gray-900 text-sm">Horario de atención</p>
                </div>
                <p className="text-xs text-gray-700">
                  Lunes a Domingo<br />
                  6:00 AM - 11:00 PM
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SedeDetailPage;
