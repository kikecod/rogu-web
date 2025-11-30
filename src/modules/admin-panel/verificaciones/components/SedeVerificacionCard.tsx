import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  User,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  FileText,
  Download,
  X,
  Loader2
} from 'lucide-react';
import type { SedeVerificacion } from '../services/verificaciones.service';
import { verificacionesService } from '../services/verificaciones.service';

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
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const handleVerificar = async () => {
    if (window.confirm(`¿Estás seguro de verificar la sede "${sede.nombre}"?`)) {
      try {
        await onVerificar(sede.idSede);
      } catch (error) {
        console.error('Error al verificar:', error);
      }
    }
  };

  const handleVerLicencia = async () => {
    try {
      setLoadingPreview(true);


      const blob = await verificacionesService.getLicenciaBlob(sede.idSede);

      if (blob.size === 0) {
        console.warn('⚠️ El blob recibido está vacío');
        alert('El documento de la licencia parece estar vacío (0 bytes).');
        return;
      }

      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setShowPreview(true);
    } catch (error: any) {
      console.error('❌ Error al cargar la licencia:', error);
      if (error.response) {
        console.error('📡 Datos respuesta error:', error.response.data);
        console.error('🔢 Status error:', error.response.status);
      }
      alert(`Error al cargar la licencia: ${error.message || 'Error desconocido'}`);
    } finally {
      setLoadingPreview(false);
    }
  };

  const closePreview = () => {
    setShowPreview(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

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
              onClick={handleVerLicencia}
              disabled={loadingPreview}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              title="Ver licencia de funcionamiento"
            >
              {loadingPreview ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              {loadingPreview ? 'Cargando...' : 'Ver Licencia'}
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

      {/* Modal de Previsualización de Licencia */}
      {showPreview && previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Licencia de Funcionamiento - {sede.nombre}
              </h3>
              <div className="flex items-center gap-2">
                <a
                  href={previewUrl}
                  download={`licencia-${sede.idSede}.pdf`}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Descargar PDF"
                >
                  <Download className="w-5 h-5" />
                </a>
                <button
                  onClick={closePreview}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 p-4 bg-gray-100 overflow-hidden">
              <iframe
                src={previewUrl}
                className="w-full h-full rounded-lg border border-gray-300 bg-white"
                title={`Licencia ${sede.nombre}`}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SedeVerificacionCard;
