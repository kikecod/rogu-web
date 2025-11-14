import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import Footer from '@/components/Footer';
import roguLogo from '@/assets/rogu_logo.png';

interface FAQItem {
  question: string;
  answer: string;
  category: 'usuarios' | 'propietarios' | 'pagos' | 'general';
}

const FAQPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const faqs: FAQItem[] = [
    // Usuarios
    {
      category: 'usuarios',
      question: '¿Cómo puedo reservar una cancha?',
      answer: 'Es muy simple: 1) Busca la cancha que te interesa usando nuestros filtros de ubicación, deporte y precio. 2) Selecciona la fecha y hora disponible. 3) Completa el pago de forma segura. 4) Recibirás una confirmación instantánea con tu código QR para acceder a la cancha.',
    },
    {
      category: 'usuarios',
      question: '¿Puedo cancelar mi reserva?',
      answer: 'Sí, puedes cancelar tu reserva desde tu panel de "Mis Reservas". La política de cancelación varía según el establecimiento, pero generalmente puedes cancelar con al menos 24 horas de anticipación para recibir un reembolso completo. Revisa los términos específicos al momento de reservar.',
    },
    {
      category: 'usuarios',
      question: '¿Qué necesito llevar el día de mi reserva?',
      answer: 'Solo necesitas llevar tu código QR (puedes mostrarlo desde tu celular o impreso) y un documento de identidad. Algunos establecimientos pueden solicitar documentos adicionales o tener requisitos específicos que se indicarán en los detalles de la reserva.',
    },
    {
      category: 'usuarios',
      question: '¿Puedo modificar mi reserva?',
      answer: 'Depende de la disponibilidad y las políticas del establecimiento. Te recomendamos contactar directamente con el propietario a través de nuestra plataforma o cancelar y hacer una nueva reserva.',
    },

    // Propietarios
    {
      category: 'propietarios',
      question: '¿Cómo registro mi espacio deportivo en ROGÜ?',
      answer: 'Primero crea una cuenta como propietario. Luego, desde tu panel, selecciona "Agregar Nuevo Espacio" y completa la información: fotos de calidad, descripción detallada, ubicación exacta, horarios de atención, precios y servicios adicionales. Nuestro equipo revisará tu publicación en 24-48 horas.',
    },
    {
      category: 'propietarios',
      question: '¿Cuánto cobra ROGÜ por sus servicios?',
      answer: 'Cobramos una comisión del 10% al 15% sobre cada reserva confirmada. El porcentaje exacto depende del tipo de instalación y el volumen de reservas. No hay costos de registro ni cuotas mensuales, solo pagas cuando recibes reservas.',
    },
    {
      category: 'propietarios',
      question: '¿Cuándo recibo los pagos de las reservas?',
      answer: 'Los pagos se procesan automáticamente y se transfieren a tu cuenta bancaria cada 15 días. Recibirás un reporte detallado de todas las transacciones. Para comenzar a recibir pagos, debes completar tu información bancaria en el panel de configuración.',
    },
    {
      category: 'propietarios',
      question: '¿Puedo bloquear horarios en mi calendario?',
      answer: 'Sí, desde tu panel de administración puedes bloquear fechas y horarios específicos cuando tu espacio no esté disponible por mantenimiento, eventos privados o cualquier otra razón. Los cambios se actualizan en tiempo real.',
    },
    {
      category: 'propietarios',
      question: '¿Qué pasa si un cliente no se presenta?',
      answer: 'Si un cliente no se presenta y tú no recibiste una cancelación previa, el pago de esa reserva se mantiene. Contamos con un sistema de verificación mediante código QR para registrar las asistencias. Puedes reportar ausencias desde tu panel.',
    },

    // Pagos
    {
      category: 'pagos',
      question: '¿Qué métodos de pago aceptan?',
      answer: 'Aceptamos tarjetas de crédito y débito (Visa, Mastercard), transferencias bancarias y billeteras digitales. Todos los pagos se procesan de forma segura a través de pasarelas de pago certificadas con encriptación SSL.',
    },
    {
      category: 'pagos',
      question: '¿Es seguro pagar en línea?',
      answer: 'Absolutamente. Utilizamos tecnología de encriptación de última generación (SSL 256-bit) y cumplimos con los estándares internacionales PCI DSS. Nunca almacenamos información completa de tarjetas de crédito en nuestros servidores.',
    },
    {
      category: 'pagos',
      question: '¿Recibiré un comprobante de pago?',
      answer: 'Sí, después de cada transacción recibirás automáticamente un comprobante por correo electrónico con todos los detalles de tu reserva y pago. También puedes descargar tus comprobantes desde tu panel de usuario en cualquier momento.',
    },
    {
      category: 'pagos',
      question: '¿Cómo funcionan los reembolsos?',
      answer: 'Si cancelas dentro del período permitido, el reembolso se procesa automáticamente al método de pago original en 5-10 días hábiles. Si usaste tarjeta, aparecerá en tu estado de cuenta. Para transferencias, se devuelve a la cuenta bancaria registrada.',
    },

    // General
    {
      category: 'general',
      question: '¿ROGÜ tiene una aplicación móvil?',
      answer: 'Actualmente nuestra plataforma web está optimizada para dispositivos móviles y tablets, ofreciendo una experiencia completa desde cualquier navegador. Estamos trabajando en aplicaciones nativas para iOS y Android que estarán disponibles próximamente.',
    },
    {
      category: 'general',
      question: '¿En qué ciudades está disponible ROGÜ?',
      answer: 'Actualmente operamos en las principales ciudades de Bolivia: La Paz, El Alto, Santa Cruz, Cochabamba, Sucre y Tarija. Estamos expandiéndonos constantemente a nuevas ciudades. ¿No ves tu ciudad? Contáctanos para solicitar expansión.',
    },
    {
      category: 'general',
      question: '¿Cómo puedo contactar con soporte?',
      answer: 'Puedes contactarnos por: Email a info@rogu.bo (respondemos en 24h), WhatsApp al +591 622728828, o a través del chat en vivo disponible en nuestra plataforma de lunes a sábado de 8:00 AM a 8:00 PM.',
    },
    {
      category: 'general',
      question: '¿Qué deportes están disponibles?',
      answer: 'Ofrecemos espacios para fútbol (5, 7, 11), básquetbol, vóleibol, tenis, pádel, squash, y más. Nuevos deportes se agregan constantemente según la demanda y disponibilidad de espacios.',
    },
    {
      category: 'general',
      question: '¿Puedo hacer reservas para torneos o eventos?',
      answer: 'Sí, muchos de nuestros espacios ofrecen paquetes especiales para torneos y eventos. Contacta directamente al propietario a través de la plataforma para coordinar reservas múltiples o de larga duración con descuentos especiales.',
    },
  ];

  const categories = [
    { id: 'all', label: 'Todas', icon: '🔍' },
    { id: 'usuarios', label: 'Para Usuarios', icon: '👤' },
    { id: 'propietarios', label: 'Para Propietarios', icon: '🏢' },
    { id: 'pagos', label: 'Pagos y Reembolsos', icon: '💳' },
    { id: 'general', label: 'General', icon: '❓' },
  ];

  const filteredFaqs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
            <HelpCircle className="h-16 w-16 mr-4" />
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
            Preguntas Frecuentes
          </h1>
          <p className="text-xl sm:text-2xl text-blue-50 max-w-3xl mx-auto text-center font-light leading-relaxed">
            Encuentra respuestas rápidas a las dudas más comunes 💡
          </p>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-8 bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 sm:px-6 py-2.5 rounded-full font-medium text-sm sm:text-base transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-2 border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </span>
                  {openIndex === index ? (
                    <ChevronUp className="h-6 w-6 text-blue-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-6 w-6 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-6 py-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-t-2 border-blue-100">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No se encontraron preguntas en esta categoría</p>
            </div>
          )}
        </div>
      </section>

      {/* Still Have Questions Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white p-10 rounded-3xl shadow-xl border-2 border-blue-100">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              ¿Aún tienes dudas? 🤔
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Nuestro equipo de soporte está listo para ayudarte. Contáctanos y te responderemos lo antes posible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:info@rogu.bo"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                📧 Enviar Email
              </a>
              <a
                href="https://wa.me/591622728828"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                💬 WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQPage;
