import React from 'react';
import { Star, MapPin, Users, Calendar } from 'lucide-react';

const StatsSection: React.FC = () => {
  const stats = [
    {
      icon: <MapPin className="h-8 w-8 text-green-600" />,
      number: '5,000+',
      label: 'Canchas disponibles',
    },
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      number: '250,000+',
      label: 'Usuarios activos',
    },
    {
      icon: <Calendar className="h-8 w-8 text-green-600" />,
      number: '1M+',
      label: 'Reservas exitosas',
    },
    {
      icon: <Star className="h-8 w-8 text-green-600" />,
      number: '4.8/5',
      label: 'Calificación promedio',
    },
  ];

  const testimonials = [
    {
      name: 'Carlos Martínez',
      role: 'Capitán de equipo',
      avatar: '/api/placeholder/60/60',
      comment: 'ROGU cambió la forma en que organizamos nuestros partidos. Ahora encontrar canchas es súper fácil.',
      rating: 5,
    },
    {
      name: 'Ana Rodríguez',
      role: 'Entrenadora',
      avatar: '/api/placeholder/60/60',
      comment: 'La calidad de las canchas es excelente y el proceso de reserva es muy intuitivo.',
      rating: 5,
    },
    {
      name: 'Miguel Torres',
      role: 'Propietario de cancha',
      avatar: '/api/placeholder/60/60',
      comment: 'Desde que uso ROGU, mis canchas tienen un 90% más de ocupación. ¡Increíble!',
      rating: 5,
    },
  ];

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            ROGU en números
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Miles de personas confían en nosotros para sus actividades deportivas
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Lo que dicen nuestros usuarios
          </h2>
          <p className="text-lg text-gray-600">
            Experiencias reales de nuestra comunidad deportiva
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role}
                  </div>
                </div>
              </div>
              
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <p className="text-gray-600 italic">
                "{testimonial.comment}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsSection;