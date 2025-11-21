import React from 'react';
import { Search, Calendar, CreditCard, CheckCircle, User, Building2 } from 'lucide-react';
import Footer from '@/components/Footer';
import roguLogo from '@/assets/rogu_logo.png';
import { ROUTES } from '@/config/routes';

const HowItWorksPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-center mb-8">
            <img 
              src={roguLogo} 
              alt="ROGU" 
              className="h-20 sm:h-24 w-auto brightness-0 invert drop-shadow-2xl"
            />
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
            ¿Cómo Funciona?
          </h1>
          <p className="text-xl sm:text-2xl text-blue-50 max-w-3xl mx-auto text-center font-light leading-relaxed">
            Reservar tu cancha deportiva nunca fue tan fácil ⚡
          </p>
        </div>
      </section>

      {/* Para Usuarios Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-blue-100 p-4 rounded-2xl mb-4">
              <User className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Para Usuarios
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto mb-4 rounded-full"></div>
            <p className="text-lg text-gray-600">4 pasos simples para reservar tu cancha</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Paso 1 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-blue-200 h-full">
                <div className="absolute -top-4 -left-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold shadow-lg">
                  1
                </div>
                <div className="bg-white p-4 rounded-xl mb-4 inline-block">
                  <Search className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Busca tu cancha</h3>
                <p className="text-gray-700 leading-relaxed">
                  Utiliza nuestros filtros por ubicación, deporte, precio y horario para encontrar el espacio perfecto.
                </p>
              </div>
            </div>

            {/* Paso 2 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-indigo-200 h-full">
                <div className="absolute -top-4 -left-4 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold shadow-lg">
                  2
                </div>
                <div className="bg-white p-4 rounded-xl mb-4 inline-block">
                  <Calendar className="h-10 w-10 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Selecciona fecha y hora</h3>
                <p className="text-gray-700 leading-relaxed">
                  Revisa la disponibilidad en tiempo real y elige el horario que mejor se adapte a ti.
                </p>
              </div>
            </div>

            {/* Paso 3 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-purple-200 h-full">
                <div className="absolute -top-4 -left-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold shadow-lg">
                  3
                </div>
                <div className="bg-white p-4 rounded-xl mb-4 inline-block">
                  <CreditCard className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Realiza el pago</h3>
                <p className="text-gray-700 leading-relaxed">
                  Paga de forma segura con tarjeta de crédito, débito o transferencia bancaria.
                </p>
              </div>
            </div>

            {/* Paso 4 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-green-200 h-full">
                <div className="absolute -top-4 -left-4 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold shadow-lg">
                  4
                </div>
                <div className="bg-white p-4 rounded-xl mb-4 inline-block">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">¡Listo para jugar!</h3>
                <p className="text-gray-700 leading-relaxed">
                  Recibe tu confirmación al instante y presenta tu código QR el día de tu reserva.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Para Propietarios Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-indigo-100 p-4 rounded-2xl mb-4">
              <Building2 className="h-12 w-12 text-indigo-600" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Para Propietarios
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mb-4 rounded-full"></div>
            <p className="text-lg text-gray-600">Comienza a ganar más con tu espacio deportivo</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Paso 1 Propietarios */}
            <div className="relative">
              <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-indigo-200 h-full">
                <div className="absolute -top-4 -left-4 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold shadow-lg">
                  1
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-2">Regístrate como Dueño</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Crea tu cuenta y completa tu perfil. Solo toma unos minutos.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">✓</span>
                    Información básica de contacto
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">✓</span>
                    Documentación de tu negocio
                  </li>
                </ul>
              </div>
            </div>

            {/* Paso 2 Propietarios */}
            <div className="relative">
              <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-purple-200 h-full">
                <div className="absolute -top-4 -left-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold shadow-lg">
                  2
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-2">Publica tus Espacios</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Agrega información detallada de tus canchas y espacios deportivos.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">✓</span>
                    Fotos de alta calidad
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">✓</span>
                    Descripción y características
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">✓</span>
                    Precios y disponibilidad
                  </li>
                </ul>
              </div>
            </div>

            {/* Paso 3 Propietarios */}
            <div className="relative">
              <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-blue-200 h-full">
                <div className="absolute -top-4 -left-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold shadow-lg">
                  3
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-2">Gestiona Reservas</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Administra todas tus reservas desde un panel intuitivo.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    Dashboard con estadísticas
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    Calendario de disponibilidad
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    Notificaciones en tiempo real
                  </li>
                </ul>
              </div>
            </div>

            {/* Paso 4 Propietarios */}
            <div className="relative">
              <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-green-200 h-full">
                <div className="absolute -top-4 -left-4 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold shadow-lg">
                  4
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-2">Recibe Pagos</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Los pagos se procesan automáticamente y se transfieren a tu cuenta.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    Pagos seguros y rápidos
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    Reportes financieros detallados
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    Comisión competitiva del 10-15%
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            ¿Por qué usar ROGÜ?
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto mb-12 rounded-full"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-6xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Rápido y Fácil</h3>
              <p className="text-gray-600 leading-relaxed">
                Reserva en menos de 2 minutos desde cualquier dispositivo
              </p>
            </div>

            <div className="text-center p-6">
              <div className="text-6xl mb-4">🔒</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">100% Seguro</h3>
              <p className="text-gray-600 leading-relaxed">
                Tus datos y pagos están protegidos con tecnología de encriptación
              </p>
            </div>

            <div className="text-center p-6">
              <div className="text-6xl mb-4">💰</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Mejor Precio</h3>
              <p className="text-gray-600 leading-relaxed">
                Compara precios y encuentra las mejores ofertas en tu zona
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-300 rounded-full blur-3xl animate-pulse"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 leading-tight">
            ¿Listo para comenzar? 🚀
          </h2>
          <p className="text-xl mb-10 text-blue-100 leading-relaxed">
            Únete a miles de usuarios que ya reservan sus canchas con ROGÜ
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={ROUTES.home}
              className="group bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
            >
              <span className="flex items-center justify-center">
                🔍 Buscar Canchas
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </a>
            <a
              href={ROUTES.owner.hostSpace}
              className="group bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-800 hover:to-indigo-800 transition-all duration-300 border-2 border-white shadow-xl hover:shadow-2xl hover:scale-105"
            >
              <span className="flex items-center justify-center">
                🏢 Ofrecer mi Espacio
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorksPage;
