import React from 'react';
import { FileText, Shield, AlertCircle } from 'lucide-react';
import Footer from '@/components/Footer';
import roguLogo from '@/assets/rogu_logo.png';

const TermsPage: React.FC = () => {
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
          <div className="flex items-center justify-center mb-6">
            <FileText className="h-16 w-16 mr-4" />
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
            Términos y Condiciones
          </h1>
          <p className="text-xl sm:text-2xl text-blue-50 max-w-3xl mx-auto text-center font-light leading-relaxed">
            Lee atentamente nuestros términos de uso 📋
          </p>
          <p className="text-center text-blue-200 mt-4">
            Última actualización: Enero 2025
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Important Notice */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 p-6 rounded-r-xl mb-12 shadow-md">
            <div className="flex items-start">
              <AlertCircle className="h-6 w-6 text-yellow-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-yellow-900 mb-2">Aviso Importante</h3>
                <p className="text-yellow-800 leading-relaxed">
                  Al usar la plataforma ROGÜ, aceptas estos términos y condiciones. Si no estás de acuerdo, 
                  te pedimos que no utilices nuestros servicios.
                </p>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-12">
            {/* 1. Definiciones */}
            <div className="border-l-4 border-blue-500 pl-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">1. Definiciones</h2>
              <div className="prose prose-lg text-gray-700">
                <ul className="space-y-2">
                  <li><strong>"ROGÜ"</strong> o <strong>"Nosotros"</strong>: Plataforma digital para reserva de espacios deportivos.</li>
                  <li><strong>"Usuario"</strong>: Persona que utiliza la plataforma para buscar y reservar espacios deportivos.</li>
                  <li><strong>"Propietario"</strong> o <strong>"Dueño"</strong>: Persona o entidad que ofrece espacios deportivos en la plataforma.</li>
                  <li><strong>"Espacio"</strong> o <strong>"Cancha"</strong>: Instalación deportiva ofrecida en la plataforma.</li>
                  <li><strong>"Reserva"</strong>: Acuerdo entre Usuario y Propietario para el uso de un espacio en fecha y hora específicas.</li>
                </ul>
              </div>
            </div>

            {/* 2. Aceptación de Términos */}
            <div className="border-l-4 border-indigo-500 pl-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">2. Aceptación de Términos</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Al crear una cuenta, navegar o utilizar cualquier servicio de ROGÜ, aceptas estar legalmente vinculado 
                por estos Términos y Condiciones, así como por nuestra Política de Privacidad.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en 
                vigor inmediatamente después de su publicación. Es tu responsabilidad revisar periódicamente estos términos.
              </p>
            </div>

            {/* 3. Registro y Cuenta de Usuario */}
            <div className="border-l-4 border-purple-500 pl-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">3. Registro y Cuenta de Usuario</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Requisitos</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li>Debes tener al menos 18 años para crear una cuenta</li>
                <li>Debes proporcionar información precisa, completa y actualizada</li>
                <li>Solo puedes mantener una cuenta personal</li>
                <li>Eres responsable de mantener la confidencialidad de tu contraseña</li>
              </ul>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Prohibiciones</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Compartir tu cuenta con terceros</li>
                <li>Proporcionar información falsa o engañosa</li>
                <li>Suplantar la identidad de otra persona o entidad</li>
                <li>Usar la plataforma para actividades ilegales o fraudulentas</li>
              </ul>
            </div>

            {/* 4. Uso de la Plataforma */}
            <div className="border-l-4 border-green-500 pl-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">4. Uso de la Plataforma</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Licencia de Uso</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Te otorgamos una licencia limitada, no exclusiva, intransferible y revocable para usar ROGÜ 
                exclusivamente para fines personales y no comerciales.
              </p>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Conductas Prohibidas</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Intentar obtener acceso no autorizado a sistemas o redes</li>
                <li>Interferir o interrumpir el funcionamiento de la plataforma</li>
                <li>Usar bots, scrapers o herramientas automatizadas sin autorización</li>
                <li>Publicar contenido ofensivo, difamatorio o ilegal</li>
                <li>Realizar ingeniería inversa del código de la plataforma</li>
              </ul>
            </div>

            {/* 5. Reservas y Pagos */}
            <div className="border-l-4 border-blue-500 pl-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">5. Reservas y Pagos</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Proceso de Reserva</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li>Las reservas están sujetas a disponibilidad en tiempo real</li>
                <li>El precio final incluye todos los cargos y comisiones aplicables</li>
                <li>Recibirás una confirmación por email con los detalles de tu reserva</li>
                <li>Debes presentar tu código QR y documento de identidad para acceder</li>
              </ul>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Métodos de Pago</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Aceptamos tarjetas de crédito/débito y transferencias bancarias. Todos los pagos se procesan 
                de forma segura a través de pasarelas certificadas.
              </p>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.3 Cancelaciones y Reembolsos</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Puedes cancelar hasta 24 horas antes para reembolso completo (salvo excepciones del propietario)</li>
                <li>Cancelaciones con menos de 24 horas: sin reembolso</li>
                <li>Los reembolsos se procesan en 5-10 días hábiles</li>
                <li>En caso de "no show" sin cancelación, no hay reembolso</li>
              </ul>
            </div>

            {/* 6. Responsabilidades del Propietario */}
            <div className="border-l-4 border-orange-500 pl-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">6. Responsabilidades del Propietario</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Mantener información precisa sobre espacios, precios y disponibilidad</li>
                <li>Cumplir con todas las leyes y regulaciones locales aplicables</li>
                <li>Proporcionar espacios en las condiciones descritas en la publicación</li>
                <li>Respetar todas las reservas confirmadas</li>
                <li>Pagar la comisión acordada del 10-15% sobre cada reserva</li>
                <li>Responder a consultas de usuarios en tiempo razonable</li>
              </ul>
            </div>

            {/* 7. Comisiones y Tarifas */}
            <div className="border-l-4 border-yellow-500 pl-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">7. Comisiones y Tarifas</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                ROGÜ cobra una comisión del 10% al 15% sobre cada reserva completada. Esta comisión se deduce 
                automáticamente antes de transferir el pago al propietario.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Los usuarios no pagan tarifas adicionales por usar la plataforma. Todos los costos están incluidos 
                en el precio de la reserva.
              </p>
            </div>

            {/* 8. Propiedad Intelectual */}
            <div className="border-l-4 border-pink-500 pl-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">8. Propiedad Intelectual</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Todo el contenido de la plataforma, incluyendo pero no limitado a textos, gráficos, logos, íconos, 
                imágenes, código fuente y software, es propiedad de ROGÜ y está protegido por leyes de propiedad 
                intelectual.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Al publicar contenido (fotos, descripciones, reseñas), otorgas a ROGÜ una licencia mundial, 
                no exclusiva y libre de regalías para usar, reproducir y mostrar ese contenido en la plataforma.
              </p>
            </div>

            {/* 9. Limitación de Responsabilidad */}
            <div className="border-l-4 border-red-500 pl-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">9. Limitación de Responsabilidad</h2>
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
                <p className="text-red-900 font-semibold mb-2">
                  IMPORTANTE: Lee cuidadosamente esta sección
                </p>
                <ul className="list-disc list-inside space-y-2 text-red-800 text-sm">
                  <li>ROGÜ actúa únicamente como intermediario entre usuarios y propietarios</li>
                  <li>No somos responsables de la calidad, seguridad o condición de los espacios</li>
                  <li>No garantizamos la veracidad de información proporcionada por propietarios</li>
                  <li>No somos responsables por lesiones, daños o pérdidas durante el uso de espacios</li>
                  <li>Nuestra responsabilidad máxima se limita al monto pagado por la reserva</li>
                </ul>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Recomendamos a los usuarios verificar las condiciones del espacio antes de la reserva y reportar 
                cualquier problema a través de nuestra plataforma.
              </p>
            </div>

            {/* 10. Resolución de Disputas */}
            <div className="border-l-4 border-teal-500 pl-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">10. Resolución de Disputas</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                En caso de conflictos entre usuarios y propietarios, ROGÜ puede mediar de buena fe, pero no está 
                obligado a hacerlo. Ambas partes aceptan intentar resolver disputas de manera amistosa antes de 
                acudir a instancias legales.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Cualquier disputa legal se resolverá bajo las leyes de Bolivia y la jurisdicción competente 
                será la de los tribunales de [Ciudad], Bolivia.
              </p>
            </div>

            {/* 11. Terminación */}
            <div className="border-l-4 border-gray-500 pl-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">11. Terminación</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Nos reservamos el derecho de suspender o terminar tu cuenta sin previo aviso si:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Violas estos términos y condiciones</li>
                <li>Realizas actividades fraudulentas o ilegales</li>
                <li>No pagas los montos adeudados</li>
                <li>Recibes múltiples quejas justificadas</li>
              </ul>
            </div>

            {/* 12. Contacto */}
            <div className="border-l-4 border-blue-500 pl-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">12. Contacto</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Para preguntas sobre estos términos y condiciones, contáctanos:
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <ul className="space-y-2 text-gray-700">
                  <li><strong>Email:</strong> info@rogu.bo</li>
                  <li><strong>WhatsApp:</strong> +591 622728828</li>
                  <li><strong>Dirección:</strong> Bolivia</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Acceptance Section */}
          <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl border-2 border-blue-200">
            <div className="flex items-start">
              <Shield className="h-8 w-8 text-blue-600 mr-4 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Tu Aceptación</h3>
                <p className="text-gray-700 leading-relaxed">
                  Al usar ROGÜ, confirmas que has leído, entendido y aceptado estos Términos y Condiciones 
                  en su totalidad. Si no estás de acuerdo, debes dejar de usar la plataforma inmediatamente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TermsPage;
