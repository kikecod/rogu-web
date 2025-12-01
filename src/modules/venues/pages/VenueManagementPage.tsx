import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Trash2, MapPin, Phone, Mail, FileText,
  Building, CheckCircle, AlertCircle, Image as ImageIcon,
  Loader2, Eye, Upload, Download, X, Plus, Shield, Save
} from 'lucide-react';
import { venueService } from '../services/venueService';
import { SedePhotoManagement } from '@/admin-panel/sedes/components';
import { ROUTES } from '@/config/routes';
import { getImageUrl } from '@/core/config/api';
import MapPicker from '../components/MapPicker';
import FieldManagementCard from '../components/FieldManagementCard';
import type { CanchaResumen } from '../types/venue-search.types';
import {
  getDepartments,
  getCitiesByDepartment,
  getDistrictsByCity,
  getFullAddress
} from '../lib/boliviaData';

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

  // Edit States
  const [editingHeader, setEditingHeader] = useState(false);
  const [headerForm, setHeaderForm] = useState({
    nombre: '',
    estado: ''
  });

  const [editingDescription, setEditingDescription] = useState(false);
  const [descriptionForm, setDescriptionForm] = useState('');

  const [editingPolicies, setEditingPolicies] = useState(false);
  const [policiesForm, setPoliciesForm] = useState('');

  const [editingLocation, setEditingLocation] = useState(false);

  // Location Dropdown States
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');

  const [locationForm, setLocationForm] = useState({
    stateProvince: '',
    city: '',
    district: '',
    addressLine: '',
    latitude: 0,
    longitude: 0
  });

  const [editingContact, setEditingContact] = useState(false);
  const [contactForm, setContactForm] = useState({
    telefono: '',
    email: ''
  });

  const handleSave = async (data: any, section: string) => {
    if (!sede?.idSede) return;
    try {
      setLoading(true);
      await venueService.updateVenue(sede.idSede, data);
      const [venueData, fieldsData] = await Promise.all([
        venueService.getVenueById(Number(id)),
        venueService.getVenueFields(Number(id))
      ]);
      setSede(venueData.sede);
      setFields(fieldsData.canchas);

      // Close editing mode based on section
      switch (section) {
        case 'header':
          setEditingHeader(false);
          break;
        case 'description':
          setEditingDescription(false);
          break;
        case 'policies':
          setEditingPolicies(false);
          break;
        case 'location':
          setEditingLocation(false);
          break;
        case 'contact':
          setEditingContact(false);
          break;
      }

      alert('Cambios guardados exitosamente');
    } catch (err: any) {
      console.error('Error loading venue:', err);
      setError(err.message || 'Error al cargar la sede');
    } finally {
      setLoading(false);
    }
  };

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

  const startEditingLocation = () => {
    // Initialize dropdowns based on current values
    const departments = getDepartments();
    const foundDept = departments.find(d => d.name === (sede.stateProvince || ''));

    let deptId = '';
    let cityId = '';
    let districtId = '';

    if (foundDept) {
      deptId = foundDept.id;
      const cities = getCitiesByDepartment(deptId);
      const foundCity = cities.find(c => c.name === (sede.city || ''));

      if (foundCity) {
        cityId = foundCity.id;
        const districts = getDistrictsByCity(cityId);
        const foundDistrict = districts.find(d => d.name === (sede.district || ''));
        if (foundDistrict) {
          districtId = foundDistrict.id;
        }
      }
    }

    setSelectedDepartment(deptId);
    setSelectedCity(cityId);
    setSelectedDistrict(districtId);

    setLocationForm({
      stateProvince: sede.stateProvince || '',
      city: sede.city || '',
      district: sede.district || '',
      addressLine: sede.addressLine || sede.direccion || '',
      latitude: Number(sede.latitude) || 0,
      longitude: Number(sede.longitude) || 0
    });
    setEditingLocation(true);
  };

  const handleDepartmentChange = (deptId: string) => {
    setSelectedDepartment(deptId);
    setSelectedCity('');
    setSelectedDistrict('');

    if (deptId) {
      const addressData = getFullAddress(deptId, '', '');
      setLocationForm(prev => ({
        ...prev,
        stateProvince: addressData.stateProvince,
        city: '',
        district: ''
      }));
    } else {
      setLocationForm(prev => ({ ...prev, stateProvince: '', city: '', district: '' }));
    }
  };

  const handleCityChange = (cityId: string) => {
    setSelectedCity(cityId);
    setSelectedDistrict('');

    if (selectedDepartment && cityId) {
      const addressData = getFullAddress(selectedDepartment, cityId, '');
      setLocationForm(prev => ({
        ...prev,
        city: addressData.city,
        district: ''
      }));
    }
  };

  const handleDistrictChange = (districtId: string) => {
    setSelectedDistrict(districtId);

    if (selectedDepartment && selectedCity && districtId) {
      const addressData = getFullAddress(selectedDepartment, selectedCity, districtId);
      setLocationForm(prev => ({
        ...prev,
        district: addressData.district
      }));
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
        console.error('Error reloading license:', error);
      }

    } catch (error: any) {
      console.error('Error uploading license:', error);
      alert(error.message || 'Error al subir la licencia');
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
            onClick={() => navigate(ROUTES.owner.mode)}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white p-2 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 md:p-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
              {!editingHeader ? (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl md:text-4xl font-bold text-white">{sede.nombre}</h1>
                    <button
                      onClick={() => {
                        setHeaderForm({
                          nombre: sede.nombre,
                          estado: sede.estado
                        });
                        setEditingHeader(true);
                      }}
                      className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex items-center text-white/90 gap-4 flex-wrap">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span>{location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium backdrop-blur-md border ${sede.estado === 'Activo'
                        ? 'bg-green-500/20 text-green-100 border-green-500/30'
                        : sede.estado === 'Mantenimiento'
                          ? 'bg-yellow-500/20 text-yellow-100 border-yellow-500/30'
                          : 'bg-red-500/20 text-red-100 border-red-500/30'
                        }`}>
                        {sede.estado}
                      </span>
                      {sede.verificada && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-100 border border-blue-500/30 backdrop-blur-md flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Verificada
                        </span>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-3 bg-black/40 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                  <div>
                    <label className="block text-xs font-medium text-white/80 mb-1">Nombre de la Sede</label>
                    <input
                      type="text"
                      value={headerForm.nombre}
                      onChange={(e) => setHeaderForm({ ...headerForm, nombre: e.target.value })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/80 mb-1">Estado</label>
                    <select
                      value={headerForm.estado}
                      onChange={(e) => setHeaderForm({ ...headerForm, estado: e.target.value })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent [&>option]:text-gray-900"
                    >
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                      <option value="Mantenimiento">Mantenimiento</option>
                    </select>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setEditingHeader(false)}
                      className="px-3 py-1.5 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleSave(headerForm, 'header')}
                      className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </div>
              )}
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Descripción</h2>
                {!editingDescription ? (
                  <button
                    onClick={() => {
                      setDescriptionForm(sede.descripcion || '');
                      setEditingDescription(true);
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingDescription(false)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleSave({ descripcion: descriptionForm }, 'description')}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <Save className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>

              {editingDescription ? (
                <textarea
                  value={descriptionForm}
                  onChange={(e) => setDescriptionForm(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[150px]"
                  placeholder="Describe tu sede..."
                />
              ) : (
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {sede.descripcion || 'Sin descripción disponible.'}
                </p>
              )}
            </div>

            {/* Policies Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Políticas
                </h2>
                {!editingPolicies ? (
                  <button
                    onClick={() => {
                      setPoliciesForm(sede.politicas || '');
                      setEditingPolicies(true);
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingPolicies(false)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleSave({ politicas: policiesForm }, 'policies')}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <Save className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>

              {editingPolicies ? (
                <div>
                  <textarea
                    value={policiesForm}
                    onChange={(e) => setPoliciesForm(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] mb-2"
                    placeholder="Políticas de la sede (separadas por comas)..."
                  />
                  <p className="text-xs text-gray-500">Separa las políticas con comas (ej: No fumar, Traer toalla)</p>
                </div>
              ) : (
                sede.politicas ? (
                  <ul className="space-y-3">
                    {sede.politicas.split(',').map((policy: string, index: number) => (
                      <li key={index} className="flex items-start gap-3 text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                        <span>{policy.trim()}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">No hay políticas registradas.</p>
                )
              )}
            </div>

            {/* Location Map */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Ubicación</h3>
                {!editingLocation ? (
                  <button
                    onClick={startEditingLocation}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingLocation(false)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleSave(locationForm, 'location')}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <Save className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>

              {editingLocation ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                      <select
                        value={selectedDepartment}
                        onChange={(e) => handleDepartmentChange(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Seleccionar...</option>
                        {getDepartments().map(dept => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                      <select
                        value={selectedCity}
                        onChange={(e) => handleCityChange(e.target.value)}
                        disabled={!selectedDepartment}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      >
                        <option value="">Seleccionar...</option>
                        {selectedDepartment && getCitiesByDepartment(selectedDepartment).map(city => (
                          <option key={city.id} value={city.id}>{city.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Distrito/Zona</label>
                      <select
                        value={selectedDistrict}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        disabled={!selectedCity}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      >
                        <option value="">Seleccionar...</option>
                        {selectedCity && getDistrictsByCity(selectedCity).map(district => (
                          <option key={district.id} value={district.id}>{district.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                      <input
                        type="text"
                        value={locationForm.addressLine}
                        onChange={(e) => setLocationForm({ ...locationForm, addressLine: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="rounded-lg overflow-hidden border border-gray-200">
                    <MapPicker
                      latitude={locationForm.latitude}
                      longitude={locationForm.longitude}
                      onLocationSelect={(lat, lng) => setLocationForm({ ...locationForm, latitude: lat, longitude: lng })}
                      height="300px"
                    />
                  </div>
                  <p className="text-sm text-gray-500 text-center">
                    Arrastra el marcador para ajustar la ubicación exacta
                  </p>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>

            {/* Courts Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  Canchas Disponibles ({fields.length})
                </h2>
              </div>


              <div className="mt-6 pt-6 border-t border-gray-100">
                <button
                  onClick={() => {
                    navigate(ROUTES.owner.createField(id!));
                  }}
                  className="w-full py-2.5 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Nueva Cancha
                </button>
              </div>


              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
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
              </div>

            </div>

          </div>


          {/* Sidebar */}
          <div className="space-y-6">

            {/* Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Información de Contacto</h3>
                {!editingContact ? (
                  <button
                    onClick={() => {
                      setContactForm({
                        telefono: sede.telefono || '',
                        email: sede.email || ''
                      });
                      setEditingContact(true);
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingContact(false)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleSave(contactForm, 'contact')}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <Save className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>

              {editingContact ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input
                      type="text"
                      value={contactForm.telefono}
                      onChange={(e) => setContactForm({ ...contactForm, telefono: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              ) : (
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
              )}
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

            {/* Danger Zone */}
            <div className="bg-red-50 rounded-xl shadow-sm border border-red-100 p-6">
              <h3 className="font-semibold text-red-900 mb-4">Zona de Peligro</h3>
              <p className="text-sm text-red-600 mb-4">
                Estas acciones son irreversibles. Ten cuidado.
              </p>
              <button
                onClick={handleDelete}
                className="w-full flex items-center justify-center px-4 py-2 border border-red-200 rounded-lg shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar Sede
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* License Preview Modal */}
      {
        showLicenseModal && existingLicenseUrl && sede && (
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
        )
      }

      {/* Photo Management Modal */}
      {
        sede && (
          <SedePhotoManagement
            sede={{ idSede: sede.idSede, nombre: sede.nombre }}
            isOpen={photoManagementOpen}
            onClose={() => setPhotoManagementOpen(false)}
          />
        )
      }
    </div >
  );
};

export default VenueDetailPage;
