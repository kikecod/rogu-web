import React from 'react';
import {
  Building2,
  MapPin,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  CheckCircle
} from 'lucide-react';
import type { SedeVerificacion } from '../services/verificaciones.service';

interface SedeVerificacionCardProps {
  sede: SedeVerificacion;
  onVerificar: (id: number) => Promise<void>;
  verificando: boolean;
}

const SedeVerificacionCard: React.FC<SedeVerificacionCardProps> = ({
  sede,
  onVerificar,
  verificando,
}) => {

  const handleVerificar = async () => {
    if (window.confirm(`¿Estás seguro de verificar la sede "${sede.nombre}"?`)) {
      try {
        await onVerificar(sede.idSede);
      } catch (error) {
        console.error('Error al verificar:', error);
      }
    }
  };

  // Descargar licencia directamente
  const descargarLicencia = () => {
    const url = `${import.meta.env.VITE_API_BASE_URL}/sede/${sede.idSede}/licencia`;
    const link = document.createElement('a');
    link.href = url;
    link.download = `licencia-sede-${sede.idSede}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasLicencia = !!sede.licenciaFuncionamiento;

  return (
    <>
      <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{sede.nombre}</h3>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  {sede.direccion}, {sede.ciudad}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {!hasLicencia && (
                <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                  Sin Licencia
                </span>
              )}
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                Pendiente
              </span>
            </div>
          </div>

          {/* Información del Dueño */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Información del Dueño</h4>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <User className="w-4 h-4 mr-2 text-gray-400" />
                {sede.nombreDuenio}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                {sede.emailDuenio}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                {sede.telefonoDuenio}
              </div>
            </div>
          </div>

          {/* Fecha de solicitud */}
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Calendar className="w-4 h-4 mr-2" />
            Registrada el {new Date(sede.fechaCreacion).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={descargarLicencia}
              disabled={!hasLicencia}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              title={!hasLicencia ? 'No hay licencia cargada' : 'Descargar licencia de funcionamiento'}
            >
              <FileText className="w-4 h-4" />
              Descargar Licencia
            </button>
            <button
              onClick={handleVerificar}
              disabled={verificando}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              {verificando ? 'Verificando...' : 'Verificar'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SedeVerificacionCard;
