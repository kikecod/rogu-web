import React from 'react';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import roguLogo from '../assets/rogu_logo.png';
import { ROUTES } from '@/config/routes';

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
            <div className="flex items-center mb-4">
              <img 
                src={roguLogo} 
                alt="ROGU" 
                className="h-8 sm:h-10 w-auto brightness-0 invert"
              />
              <span className="ml-2 text-neutral-300 text-sm sm:text-base">ROGÜ</span>
            </div>
            <p className="text-neutral-300 mb-4 max-w-md text-sm sm:text-base">
              La plataforma líder en Bolivia para reservar espacios deportivos. 
              Encuentra la cancha perfecta cerca de ti y reserva al instante.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-blue-400 transition-colors">
                <Facebook className="h-5 w-5 sm:h-6 sm:w-6" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-blue-400 transition-colors">
                <Twitter className="h-5 w-5 sm:h-6 sm:w-6" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-blue-400 transition-colors">
                <Instagram className="h-5 w-5 sm:h-6 sm:w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Enlaces rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to={ROUTES.home} className="text-neutral-300 hover:text-blue-400 transition-colors text-sm sm:text-base">
                  Buscar canchas
                </Link>
              </li>
              <li>
                <Link to={ROUTES.owner.hostSpace} className="text-neutral-300 hover:text-blue-400 transition-colors text-sm sm:text-base">
                  Ofrece tu espacio
                </Link>
              </li>
              <li>
                <Link to={ROUTES.about} className="text-neutral-300 hover:text-blue-400 transition-colors text-sm sm:text-base">
                  Sobre nosotros
                </Link>
              </li>
              <li>
                <Link to={ROUTES.howItWorks} className="text-neutral-300 hover:text-blue-400 transition-colors text-sm sm:text-base">
                  Cómo funciona
                </Link>
              </li>
              <li>
                <Link to={ROUTES.faq} className="text-neutral-300 hover:text-blue-400 transition-colors text-sm sm:text-base">
                  Preguntas frecuentes
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Contacto</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li className="flex items-center">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 mr-2 sm:mr-3 flex-shrink-0" />
                <span className="text-neutral-300 text-sm sm:text-base">info@rogu.bo</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 mr-2 sm:mr-3 flex-shrink-0" />
                <span className="text-neutral-300 text-sm sm:text-base">+591 622728828</span>
              </li>
              <li className="flex items-start">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-neutral-300 text-sm sm:text-base">Bolivia</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-neutral-800 mt-6 sm:mt-8 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-neutral-400 text-xs sm:text-sm text-center sm:text-left">
              © 2025 ROGU. Todos los derechos reservados.
            </div>
            <div className="flex flex-wrap justify-center sm:justify-end space-x-4 sm:space-x-6 text-xs sm:text-sm">
              <Link to={ROUTES.terms} className="text-neutral-400 hover:text-blue-400 transition-colors">
                Términos y Condiciones
              </Link>
              <a href="#" className="text-neutral-400 hover:text-blue-400 transition-colors">
                Política de privacidad
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;