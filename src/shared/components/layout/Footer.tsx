import React from 'react';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import roguLogo from '../../../assets/img/rogu_logo.png';
import {
  FOOTER_QUICK_LINKS,
  FOOTER_LEGAL_LINKS,
  EXTERNAL_LINKS,
  CONTACT_LINKS,
  SUPPORT_EMAIL,
  SUPPORT_PHONE_DISPLAY,
} from '../../../constants';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-white" role="contentinfo">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
            <div className="flex items-center mb-4">
              <img
                src={roguLogo}
                alt="ROGÜ"
                loading="lazy"
                className="h-8 sm:h-10 w-auto brightness-0 invert"
              />
              <span className="ml-2 text-neutral-300 text-sm sm:text-base">ROGÜ</span>
            </div>

            <p className="text-neutral-300 mb-4 max-w-md text-sm sm:text-base">
              La plataforma líder en Bolivia para reservar espacios deportivos.
              Encuentra la cancha perfecta cerca de ti y reserva al instante.
            </p>

            <div className="flex space-x-4" aria-label="Redes sociales">
              <a
                href={EXTERNAL_LINKS.FACEBOOK}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook de ROGÜ"
                className="text-neutral-400 hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
                title="Facebook"
              >
                <Facebook className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="sr-only">Facebook</span>
              </a>

              <a
                href={EXTERNAL_LINKS.TWITTER}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter de ROGÜ"
                className="text-neutral-400 hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
                title="Twitter"
              >
                <Twitter className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="sr-only">Twitter</span>
              </a>

              <a
                href={EXTERNAL_LINKS.INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de ROGÜ"
                className="text-neutral-400 hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
                title="Instagram"
              >
                <Instagram className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <nav aria-label="Enlaces rápidos">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Enlaces rápidos</h3>
            <ul className="space-y-2">
              {FOOTER_QUICK_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-neutral-300 hover:text-blue-400 transition-colors text-sm sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact Info */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Contacto</h3>
            <address className="not-italic">
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex items-center">
                  <Mail aria-hidden="true" className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 mr-2 sm:mr-3 flex-shrink-0" />
                  <a
                    href={CONTACT_LINKS.EMAIL}
                    className="text-neutral-300 text-sm sm:text-base hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                </li>
                <li className="flex items-center">
                  <Phone aria-hidden="true" className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 mr-2 sm:mr-3 flex-shrink-0" />
                  <a
                    href={CONTACT_LINKS.PHONE}
                    className="text-neutral-300 text-sm sm:text-base hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
                  >
                    {SUPPORT_PHONE_DISPLAY}
                  </a>
                </li>
                <li className="flex items-start">
                  <MapPin aria-hidden="true" className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-300 text-sm sm:text-base">Bolivia</span>
                </li>
              </ul>
            </address>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-neutral-800 mt-6 sm:mt-8 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-neutral-400 text-xs sm:text-sm text-center sm:text-left">
              © {year} ROGÜ. Todos los derechos reservados.
            </div>
            <nav aria-label="Legal">
              <ul className="flex flex-wrap justify-center sm:justify-end gap-4 sm:gap-6 text-xs sm:text-sm">
                {FOOTER_LEGAL_LINKS.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-neutral-400 hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
