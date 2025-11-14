import React from 'react';
import { Target, Users, TrendingUp, Zap, Heart, Shield } from 'lucide-react';
import Footer from '@/components/Footer';
import roguLogo from '@/assets/rogu_logo.png';
import { ROUTES } from '@/config/routes';

const AboutUsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20 sm:py-28 overflow-hidden">
        {/* Decorative elements */}
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
            Sobre ROGÜ
          </h1>
          <p className="text-xl sm:text-2xl text-blue-50 max-w-3xl mx-auto text-center font-light leading-relaxed">
            Revolucionamos la forma en que conectamos a los deportistas con sus canchas ideales 🏆
          </p>
          <div className="flex justify-center gap-3 mt-8 flex-wrap">
            <div className="bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full text-sm font-semibold">
              🚀 Innovación
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full text-sm font-semibold">
              ⚡ Tecnología
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full text-sm font-semibold">
              💙 Pasión por el Deporte
            </div>
          </div>
        </div>
      </section>

      {/* Misión Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Decorative sport icons */}
        <div className="absolute top-10 right-10 text-8xl opacity-5">⚽</div>
        <div className="absolute bottom-20 left-10 text-8xl opacity-5">🏀</div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-4 rounded-2xl shadow-xl">
              <Target className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Nuestra Misión
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto mb-8 rounded-full"></div>
          <p className="text-lg text-gray-700 text-center max-w-4xl mx-auto leading-relaxed">
            Facilitar el acceso a <span className="font-bold text-blue-600">espacios deportivos de calidad</span> mediante una plataforma digital 
            intuitiva, promoviendo un estilo de vida activo y saludable, mientras optimizamos 
            la ocupación de instalaciones para propietarios y ofrecemos <span className="font-bold text-blue-600">transparencia y conveniencia</span> 
            a los usuarios.
          </p>
        </div>
      </section>

      {/* Visión Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 relative overflow-hidden">
        <div className="absolute top-20 right-20 text-8xl opacity-5">🎾</div>
        <div className="absolute bottom-10 left-20 text-8xl opacity-5">🏐</div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl shadow-xl">
              <TrendingUp className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Nuestra Visión
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mb-8 rounded-full"></div>
          <p className="text-lg text-gray-700 text-center max-w-4xl mx-auto leading-relaxed">
            Convertirnos en la <span className="font-bold text-indigo-600">plataforma líder en América Latina</span> para la reserva de espacios 
            deportivos, revolucionando la forma en que las personas acceden y disfrutan del deporte, 
            creando una <span className="font-bold text-indigo-600">comunidad activa y conectada</span> que impulse el bienestar y el entretenimiento 
            en cada rincón de la región. 🌎
          </p>
        </div>
      </section>

      {/* Valores Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Nuestros Valores
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto mb-12 rounded-full"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Innovación */}
            <div className="group bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-blue-200">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Innovación</h3>
              <p className="text-gray-700 leading-relaxed">
                Adoptamos tecnología de vanguardia para mejorar continuamente la experiencia del 
                usuario y adaptarnos a las necesidades del mercado.
              </p>
            </div>

            {/* Accesibilidad */}
            <div className="group bg-gradient-to-br from-indigo-50 to-indigo-100 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-indigo-200">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Accesibilidad</h3>
              <p className="text-gray-700 leading-relaxed">
                Nos esforzamos por hacer que el deporte sea accesible para todos, eliminando 
                barreras y ofreciendo opciones diversas y económicas.
              </p>
            </div>

            {/* Transparencia */}
            <div className="group bg-gradient-to-br from-cyan-50 to-cyan-100 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-cyan-200">
              <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Transparencia</h3>
              <p className="text-gray-700 leading-relaxed">
                Proporcionamos información clara, precios justos y políticas explícitas para 
                generar confianza en nuestra comunidad.
              </p>
            </div>

            {/* Comunidad */}
            <div className="group bg-gradient-to-br from-pink-50 to-pink-100 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-pink-200">
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Comunidad</h3>
              <p className="text-gray-700 leading-relaxed">
                Fomentamos conexiones entre jugadores, propietarios y entusiastas del deporte 
                para crear una red sólida y colaborativa.
              </p>
            </div>

            {/* Sostenibilidad */}
            <div className="group bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-green-200">
              <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Sostenibilidad</h3>
              <p className="text-gray-700 leading-relaxed">
                Buscamos modelos de negocio responsables que beneficien tanto a nuestros usuarios 
                como al medio ambiente y la sociedad.
              </p>
            </div>

            {/* Excelencia */}
            <div className="group bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-purple-200">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Excelencia</h3>
              <p className="text-gray-700 leading-relaxed">
                Nos comprometemos a ofrecer el mejor servicio posible, con atención al detalle 
                y un enfoque constante en la calidad.
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* Call to Action */}
      <section className="relative py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-300 rounded-full blur-3xl animate-pulse"></div>
        </div>
        
        <div className="absolute top-10 left-10 text-6xl opacity-10">⚽</div>
        <div className="absolute top-20 right-20 text-6xl opacity-10">🏀</div>
        <div className="absolute bottom-20 left-20 text-6xl opacity-10">🎾</div>
        <div className="absolute bottom-10 right-10 text-6xl opacity-10">🏐</div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="mb-8">
            <span className="inline-block bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full text-sm font-semibold mb-4">
              ¡ÚNETE HOY!
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 leading-tight">
            Únete a la Comunidad ROGÜ 🚀
          </h2>
          <p className="text-xl mb-10 text-blue-100 leading-relaxed">
            Ya seas un deportista buscando tu próxima cancha o un propietario 
            que quiere optimizar sus espacios, <span className="font-bold text-white">ROGÜ es tu aliado perfecto</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={ROUTES.home}
              className="group bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
            >
              <span className="flex items-center justify-center">
                🔍 Explorar Canchas
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
          
          <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-extrabold mb-2">1000+</div>
              <div className="text-blue-200 text-sm">Canchas</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-extrabold mb-2">50K+</div>
              <div className="text-blue-200 text-sm">Usuarios</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-extrabold mb-2">4.9★</div>
              <div className="text-blue-200 text-sm">Calificación</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUsPage;
