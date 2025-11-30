import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Trash2, MapPin, Phone, Mail, FileText,
  Building, CheckCircle, AlertCircle, Image as ImageIcon,
  LayoutGrid, Loader2, Eye, Upload, Download, X
} from 'lucide-react';
import { venueService } from '../services/venueService';
import { SedePhotoManagement } from '@/admin-panel/sedes/components';
import { ROUTES } from '@/config/routes';
import { getImageUrl } from '@/core/config/api';
import MapPicker from '../components/MapPicker';
import FieldManagementCard from '../components/FieldManagementCard';
import type { CanchaResumen } from '../types/venue-search.types';

const VenueDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sede, setSede] = useState<any>(null);
  const [fields, setFields] = useState<CanchaResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [photoManagementOpen, setPhotoManagementOpen] = useState(false);

  // License Management State
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [licensePreview, setLicensePreview] = useState<string | null>(null);
  const [existingLicenseUrl, setExistingLicenseUrl] = useState<string | null>(null);
  const [wantToChangeLicense, setWantToChangeLicense] = useState(false);
  const [licenseLoaded, setLicenseLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);

  const loadVenue = async () => {
    if (!id) return;
    try {
      setLoading(true);
      // Load venue and fields in parallel
      const [venueData, fieldsData] = await Promise.all([
        venueService.getVenueById(Number(id)),
        venueService.getVenueFields(Number(id))
      ]);
      setSede(venueData.sede);
      setFields(fieldsData.canchas);
    } catch (err: any) {
      console.error('Error loading venue:', err);
      setError(err.message || 'Error al cargar la sede');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVenue();
  }, [id]);

  // Load license when sede is loaded
  useEffect(() => {
    const loadLicenseData = async () => {
      if (!sede?.idSede) return;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/sede/${sede.idSede}/licencia`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );


        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setExistingLicenseUrl(url);
          setLicenseLoaded(true);
        } else {

        }
      } catch (error) {
        console.error('❌ Error loading license:', error);
      }
    };

    loadLicenseData();
  }, [sede?.idSede]);

  const handleVerLicencia = async () => {
    if (!sede?.idSede) return;

    // If we already loaded it, just show the modal
    if (licenseLoaded && existingLicenseUrl) {
      setShowLicenseModal(true);
      return;
    }

    setLoadingPreview(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/sede/${sede.idSede}/licencia`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setExistingLicenseUrl(url);
        setLicenseLoaded(true);
        setShowLicenseModal(true);
      } else {
        alert('No se pudo cargar la licencia');
      }
    } catch (error) {
      console.error('Error loading license:', error);
      alert('Error al cargar el documento de la licencia');
    } finally {
      setLoadingPreview(false);
    }
  };

  const closeLicenseModal = () => {
    setShowLicenseModal(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setLicenseFile(file);
      const url = URL.createObjectURL(file);
      setLicensePreview(url);
    } else {
      alert('Por favor selecciona un archivo PDF');
    }
  };

  const uploadLicense = async () => {
    if (!licenseFile || !sede?.idSede) return;

    setSubmitting(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('licencia', licenseFile);

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/sede/${sede.idSede}/licencia`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formDataUpload
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al subir la licencia');
      }

      // If license changed, update status to unverified if needed
      if (wantToChangeLicense) {
        await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/sede/${sede.idSede}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ verificada: false })
          }
        );
      }

      alert('Licencia actualizada exitosamente');
      setWantToChangeLicense(false);
      setLicenseFile(null);
      setLicensePreview(null);

      // Reload venue data
      await loadVenue();

      // Reload the license immediately after upload
      try {
        const licenseResponse = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/sede/${sede.idSede}/licencia`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (licenseResponse.ok) {
          const blob = await licenseResponse.blob();
          const url = URL.createObjectURL(blob);
          setExistingLicenseUrl(url);
          setLicenseLoaded(true);
        }
      } catch (error) {
      }

    } catch (error) {
      console.error('Error uploading license:', error);
      alert('Error al subir la licencia');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta sede?')) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/sede/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        navigate(ROUTES.owner.mode);
      } else {
        alert('Error al eliminar la sede');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar la sede');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  if (error || !sede) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Error al cargar la sede</h2>
        <p className="text-gray-600 mb-4">{error || 'Sede no encontrada'}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Volver
        </button>
      </div>
    );
  }

  const imagenPath = sede.fotoPrincipal || sede.fotos?.[0]?.urlFoto;
  const imagenPrincipal = imagenPath
    ? (imagenPath.startsWith('http') ? imagenPath : getImageUrl(imagenPath))
    : '/placeholder-venue.jpg';

  const location = sede.city && sede.stateProvince
    ? `${sede.city}, ${sede.stateProvince}`
    : (sede.addressLine || sede.direccion || 'Sin ubicación');

  const isActive = sede.estado === 'Activo';

  // Check for license - use licenseLoaded state which is set when we successfully fetch the license
  const hasLicense = licenseLoaded;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Banner Image */}
      <div className="relative h-64 md:h-80 lg:h-96 w-full bg-gray-900">
        <img
          src={imagenPrincipal}
          alt={sede.nombre}
          className="w-full h-full object-cover opacity-60"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-venue.jpg';
          }}
        />

        <div className="absolute top-4 left-4">
          <button
            onClick={() => navigate(-1)}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white p-2 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 md:p-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{sede.nombre}</h1>
              <div className="flex items-center text-white/90 gap-4 flex-wrap">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium backdrop-blur-md border ${isActive
                    ? 'bg-green-500/20 text-green-100 border-green-500/30'
                    : 'bg-red-500/20 text-red-100 border-red-500/30'
                    }`}>
                    {isActive ? 'Activo' : 'Inactivo'}
                  </span>
                  {sede.verificada && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-100 border border-blue-500/30 backdrop-blur-md flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Verificada
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setPhotoManagementOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-lg transition-colors border border-white/30"
            >
              <ImageIcon className="h-5 w-5" />
              Gestionar Fotos
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Description Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Descripción</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {sede.descripcion || 'Sin descripción disponible.'}
              </p>
            </div>

            {/* Location Map */}
            {sede.latitude && sede.longitude && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Ubicación</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Departamento</p>
                    <p className="font-medium text-gray-900">{sede.stateProvince || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ciudad</p>
                    <p className="font-medium text-gray-900">{sede.city || 'No especificada'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Distrito/Zona</p>
                    <p className="font-medium text-gray-900">{sede.district || 'No especificado'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Dirección Específica</p>
                    <p className="font-medium text-gray-900">{sede.addressLine || sede.direccion || 'No especificada'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Latitud</p>
                    <p className="font-medium text-gray-900">{Number(sede.latitude).toFixed(6)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Longitud</p>
                    <p className="font-medium text-gray-900">{Number(sede.longitude).toFixed(6)}</p>
                  </div>
                </div>

                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <MapPicker
                    latitude={Number(sede.latitude)}
                    longitude={Number(sede.longitude)}
                    onLocationSelect={() => { }}
                    height="300px"
                    readOnly={true}
                  />
                </div>
              </div>
            )}

            {/* Courts Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  Canchas Disponibles ({fields.length})
                </h2>
              </div>

              {fields.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <p className="text-gray-500">No hay canchas registradas.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {fields.map((field) => (
                    <FieldManagementCard
                      key={field.idCancha}
                      field={field}
                      onClick={() => navigate(ROUTES.owner.venueFieldManagement(id!, field.idCancha))}
                    />
                  ))}
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-100">
                <button
                  onClick={() => {
                    alert("Funcionalidad de gestión de canchas pendiente de refactorización para página completa.");
                  }}
                  className="w-full py-2.5 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                >
                  <LayoutGrid className="h-4 w-4" />
                  Gestionar Canchas
                </button>
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Actions Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Acciones</h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    alert("Funcionalidad de edición pendiente de refactorización.");
                  }}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Edit2 className="mr-2 h-4 w-4 text-blue-500" />
                  Editar Información
                </button>

                <button
                  onClick={handleDelete}
                  className="w-full flex items-center justify-center px-4 py-2 border border-red-200 rounded-lg shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar Sede
                </button>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Información de Contacto</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Teléfono</p>
                    <p className="font-medium text-gray-900">{sede.telefono || 'No registrado'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{sede.email || 'No registrado'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Datos Legales</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Licencia de Funcionamiento</p>
                  {hasLicense && !wantToChangeLicense ? (
                    <div className="border-2 border-green-300 rounded-lg bg-green-50 p-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center">
                          <FileText className="h-8 w-8 text-green-600 mr-3 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-green-800">Licencia registrada</p>
                            <p className="text-xs text-green-600">Documento cargado</p>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button
                            onClick={handleVerLicencia}
                            disabled={loadingPreview}
                            className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
                          >
                            {loadingPreview ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                            Ver
                          </button>
                          <button
                            onClick={() => setWantToChangeLicense(true)}
                            className="flex-1 sm:flex-none px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                          >
                            Cambiar
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {wantToChangeLicense && (
                        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-sm text-yellow-800">
                            ⚠️ Al cambiar la licencia, tu sede pasará a estado "Pendiente de Aprobación" hasta que sea verificada nuevamente.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setWantToChangeLicense(false);
                              setLicenseFile(null);
                              setLicensePreview(null);
                            }}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Cancelar cambio
                          </button>
                        </div>
                      )}

                      <div className="border-2 border-gray-200 border-dashed rounded-lg p-6 text-center">
                        {licensePreview ? (
                          <div className="space-y-3">
                            <FileText className="mx-auto h-12 w-12 text-green-600" />
                            <div className="text-sm text-gray-600">
                              <p className="font-medium text-green-600">Archivo seleccionado</p>
                              <p className="text-xs text-gray-500 mt-1">{licenseFile?.name}</p>
                            </div>
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => {
                                  setLicenseFile(null);
                                  setLicensePreview(null);
                                }}
                                className="text-sm text-red-600 hover:text-red-700"
                              >
                                Cambiar archivo
                              </button>
                              <button
                                onClick={uploadLicense}
                                disabled={submitting}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium flex items-center gap-2"
                              >
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                Subir Licencia
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-gray-500 mb-2">
                              {wantToChangeLicense ? 'Sube la nueva licencia (PDF)' : 'No hay licencia registrada'}
                            </p>
                            <label className="cursor-pointer inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm">
                              <Upload className="h-4 w-4" />
                              {wantToChangeLicense ? 'Seleccionar archivo' : 'Cargar Licencia'}
                              <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileChange}
                                className="hidden"
                              />
                            </label>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* License Preview Modal */}
      {showLicenseModal && existingLicenseUrl && sede && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Licencia de Funcionamiento - {sede.nombre}
              </h3>
              <div className="flex items-center gap-2">
                <a
                  href={existingLicenseUrl}
                  download={`licencia-${sede.idSede}.pdf`}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Descargar PDF"
                >
                  <Download className="w-5 h-5" />
                </a>
                <button
                  onClick={closeLicenseModal}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 p-4 bg-gray-100 overflow-hidden">
              <iframe
                src={existingLicenseUrl}
                className="w-full h-full rounded-lg border border-gray-300 bg-white"
                title={`Licencia ${sede.nombre}`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Photo Management Modal */}
      {sede && (
        <SedePhotoManagement
          sede={{ idSede: sede.idSede, nombre: sede.nombre }}
          isOpen={photoManagementOpen}
          onClose={() => setPhotoManagementOpen(false)}
        />
      )}
    </div>
  );
};

export default VenueDetailPage;
