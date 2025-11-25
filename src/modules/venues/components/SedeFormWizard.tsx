import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, Upload, FileText, AlertCircle, MapPin, X, Eye } from 'lucide-react';
import type { SedeFormData } from '../types/venue.types';
import { getDepartments, getCitiesByDepartment, getDistrictsByCity, getFullAddress } from '../lib/boliviaData';
import MapPicker from './MapPicker';

interface SedeFormWizardProps {
  initialData?: SedeFormData & { idSede?: number };
  isEditing?: boolean;
  idPersonaD: number;
  onComplete: () => void;
  onCancel: () => void;
}

type Step = 1 | 2 | 3 | 4;

const SedeFormWizard: React.FC<SedeFormWizardProps> = ({
  initialData,
  isEditing = false,
  idPersonaD,
  onComplete,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [createdSedeId, setCreatedSedeId] = useState<number | null>(initialData?.idSede || null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [licensePreview, setLicensePreview] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [existingLicenseUrl, setExistingLicenseUrl] = useState<string | null>(null);
  const [wantToChangeLicense, setWantToChangeLicense] = useState(false);
  const [licenseLoaded, setLicenseLoaded] = useState(false);

  const [formData, setFormData] = useState<SedeFormData>({
    nombre: initialData?.nombre || '',
    descripcion: initialData?.descripcion || '',
    country: initialData?.country || 'Bolivia',
    countryCode: initialData?.countryCode || 'BO',
    stateProvince: initialData?.stateProvince || '',
    city: initialData?.city || '',
    district: initialData?.district || '',
    addressLine: initialData?.addressLine || '',
    postalCode: initialData?.postalCode || '00000',
    latitude: initialData?.latitude || null,
    longitude: initialData?.longitude || null,
    timezone: initialData?.timezone || 'America/La_Paz',
    telefono: initialData?.telefono || '',
    email: initialData?.email || '',
    politicas: initialData?.politicas || '',
    estado: initialData?.estado || 'Activo',
    LicenciaFuncionamiento: initialData?.LicenciaFuncionamiento || ''
  });

  // Inicializar selectores geográficos cuando hay datos iniciales
  useEffect(() => {
    if (initialData?.stateProvince) {
      const departments = getDepartments();
      const foundDept = departments.find(dept => dept.name === initialData.stateProvince);
      if (foundDept) {
        setSelectedDepartment(foundDept.id);

        if (initialData.city) {
          const cities = getCitiesByDepartment(foundDept.id);
          const foundCity = cities.find(city => city.name === initialData.city);
          if (foundCity) {
            setSelectedCity(foundCity.id);

            if (initialData.district) {
              const districts = getDistrictsByCity(foundCity.id);
              const foundDistrict = districts.find(district => district.name === initialData.district);
              if (foundDistrict) {
                setSelectedDistrict(foundDistrict.id);
              }
            }
          }
        }
      }
    }
  }, [initialData]);

  // Función para cargar licencia existente manualmente
  const loadExistingLicense = async () => {
    if (isEditing && initialData?.idSede) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/sede/${initialData.idSede}/licencia`,
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
          alert('No se pudo cargar la licencia');
        }
      } catch (error) {
        console.error('Error al cargar la licencia existente:', error);
        alert('Error al cargar la licencia');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDepartmentChange = (departmentId: string) => {
    setSelectedDepartment(departmentId);
    setSelectedCity('');
    setSelectedDistrict('');

    const departmentData = getDepartments().find(dep => dep.id === departmentId);
    if (departmentData) {
      const addressData = getFullAddress(departmentId, '', '');
      setFormData(prev => ({
        ...prev,
        stateProvince: addressData.stateProvince,
        city: '',
        district: ''
      }));
    }
  };

  const handleCityChange = (cityId: string) => {
    setSelectedCity(cityId);
    setSelectedDistrict('');

    if (selectedDepartment && cityId) {
      const addressData = getFullAddress(selectedDepartment, cityId, '');
      setFormData(prev => ({
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
      setFormData(prev => ({
        ...prev,
        district: addressData.district
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setLicenseFile(file);

      // Crear preview URL
      const url = URL.createObjectURL(file);
      setLicensePreview(url);
    } else {
      alert('Por favor selecciona un archivo PDF');
    }
  };

  const validateStep = (step: Step): boolean => {
    switch (step) {
      case 1:
        return !!(formData.nombre && formData.descripcion && formData.telefono && formData.email && formData.politicas);
      case 2:
        return !!(formData.stateProvince && formData.city && formData.district && formData.addressLine);
      case 3:
        return !!(licenseFile || isEditing);
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      // Si es el paso 2, crear o actualizar la sede
      if (currentStep === 2) {
        await createSede();
      }

      // Si es el paso 3, subir la licencia (solo si hay archivo nuevo o cambio de licencia)
      if (currentStep === 3 && licenseFile) {
        await uploadLicense();
      }

      if (currentStep < 4) {
        setCurrentStep((prev) => (prev + 1) as Step);
      }
    } catch (error) {
      console.error('Error en handleNext:', error);
      // No avanzar al siguiente paso si hay error
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const createSede = async () => {
    setSubmitting(true);
    try {
      const sanitizedData = {
        ...formData,
        ...(formData.latitude !== null && !isNaN(Number(formData.latitude))
          ? { latitude: Number(formData.latitude) }
          : {}),
        ...(formData.longitude !== null && !isNaN(Number(formData.longitude))
          ? { longitude: Number(formData.longitude) }
          : {}),
      };

      const url = isEditing && initialData?.idSede
        ? `${import.meta.env.VITE_API_BASE_URL}/sede/${initialData.idSede}`
        : `${import.meta.env.VITE_API_BASE_URL}/sede`;

      const method = isEditing ? 'PATCH' : 'POST';
      const payload = isEditing ? sanitizedData : { ...sanitizedData, idPersonaD };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        setCreatedSedeId(isEditing && initialData?.idSede ? initialData.idSede : result.idSede);
      } else {
        const error = await response.json();
        const errorMessage = error.message || (isEditing ? 'Error al actualizar la sede' : 'Error al crear la sede');
        alert('Error: ' + errorMessage);
        throw new Error(isEditing ? 'Error al actualizar la sede' : 'Error al crear la sede');
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const uploadLicense = async () => {
    if (!licenseFile || !createdSedeId) return;

    setSubmitting(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('licencia', licenseFile);

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/sede/${createdSedeId}/licencia`,
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
        alert('Error al subir la licencia: ' + (error.message || 'Error desconocido'));
        throw new Error('Error al subir la licencia');
      }

      // Si se cambió la licencia en modo edición, actualizar verificada a false
      if (isEditing && wantToChangeLicense) {
        await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/sede/${createdSedeId}`,
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
    } catch (error) {
      console.error('Error:', error);
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = () => {
    onComplete();
  };

  const steps = [
    { number: 1, title: 'Información Básica', icon: FileText },
    { number: 2, title: 'Ubicación', icon: FileText },
    { number: 3, title: 'Documentación Legal', icon: Upload },
    { number: 4, title: 'Verificación', icon: Check }
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-6 border w-11/12 max-w-5xl shadow-lg rounded-lg bg-white min-h-[600px] mb-10">
        {/* Header con steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Editar Sede' : 'Nueva Sede'}
            </h2>
            <button
              type="button"
              onClick={onCancel}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Cerrar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center flex-1">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center mb-2
                      ${isCompleted ? 'bg-green-500' : isActive ? 'bg-blue-600' : 'bg-gray-300'}
                      ${isCompleted || isActive ? 'text-white' : 'text-gray-600'}
                    `}>
                      {isCompleted ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <span className={`text-xs text-center ${isActive ? 'font-semibold text-blue-600' : 'text-gray-600'}`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-1 flex-1 mx-2 rounded ${currentStep > step.number ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Contenido de cada paso */}
        <div className="mb-8 min-h-[400px]">
          {/* Paso 1: Información Básica */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Sede *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado *
                  </label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                    <option value="Mantenimiento">En Mantenimiento</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    required
                    placeholder="+591 70000000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="contacto@sede.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Políticas *
                  </label>
                  <textarea
                    name="politicas"
                    value={formData.politicas}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    placeholder="Políticas de uso, cancelación, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Paso 2: Ubicación Geográfica */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Ubicación Geográfica
              </h3>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  Esta información será utilizada para mostrar tu sede en el mapa y permitir que los usuarios te encuentren.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    País *
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departamento *
                  </label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar departamento</option>
                    {getDepartments().map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad *
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => handleCityChange(e.target.value)}
                    required
                    disabled={!selectedDepartment}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  >
                    <option value="">Seleccionar ciudad</option>
                    {selectedDepartment && getCitiesByDepartment(selectedDepartment).map(city => (
                      <option key={city.id} value={city.id}>{city.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Distrito/Zona *
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    required
                    disabled={!selectedCity}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  >
                    <option value="">Seleccionar distrito</option>
                    {selectedCity && getDistrictsByCity(selectedCity).map(district => (
                      <option key={district.id} value={district.id}>{district.name}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección Específica *
                  </label>
                  <input
                    type="text"
                    name="addressLine"
                    value={formData.addressLine}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: Av. Saavedra #2540 esq. Calle 18"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código Postal *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required
                    placeholder="00000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zona Horaria *
                  </label>
                  <input
                    type="text"
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleInputChange}
                    required
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  />
                </div>

                {/* Mapa Interactivo */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación en el Mapa
                  </label>
                  <MapPicker
                    latitude={formData.latitude}
                    longitude={formData.longitude}
                    onLocationSelect={(lat, lng) => {
                      setFormData(prev => ({
                        ...prev,
                        latitude: lat,
                        longitude: lng
                      }));
                    }}
                    height="450px"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Paso 3: Documentación Legal */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentación Legal</h3>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Documento Requerido</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      {isEditing
                        ? 'Puedes cambiar tu Licencia de Funcionamiento. Al hacerlo, deberás esperar una nueva verificación.'
                        : 'Debes subir tu Licencia de Funcionamiento en formato PDF. Este documento será verificado por nuestro equipo.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Mostrar licencia existente en modo edición */}
                {isEditing && !wantToChangeLicense ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Licencia de Funcionamiento Actual
                    </label>
                    <div className="border-2 border-green-300 rounded-lg bg-green-50 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <FileText className="h-8 w-8 text-green-600 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-green-800">Licencia registrada</p>
                            <p className="text-xs text-green-600">Documento verificado</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!licenseLoaded ? (
                            <button
                              type="button"
                              onClick={loadExistingLicense}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              Ver Licencia
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => setWantToChangeLicense(true)}
                            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm font-medium"
                          >
                            Cambiar Licencia
                          </button>
                        </div>
                      </div>
                      {licenseLoaded && existingLicenseUrl && (
                        <div className="border-2 border-gray-300 rounded-lg overflow-hidden mt-3">
                          <iframe
                            src={existingLicenseUrl}
                            className="w-full h-96"
                            title="Licencia actual"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Licencia de Funcionamiento (PDF) *
                    </label>
                    {isEditing && wantToChangeLicense && (
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
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors">
                      <div className="space-y-1 text-center">
                        {licensePreview ? (
                          <div className="space-y-3">
                            <FileText className="mx-auto h-12 w-12 text-green-600" />
                            <div className="text-sm text-gray-600">
                              <p className="font-medium text-green-600">Archivo seleccionado</p>
                              <p className="text-xs text-gray-500 mt-1">{licenseFile?.name}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setLicenseFile(null);
                                setLicensePreview(null);
                              }}
                              className="text-sm text-red-600 hover:text-red-700"
                            >
                              Cambiar archivo
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                              <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                <span>Seleccionar archivo</span>
                                <input
                                  type="file"
                                  accept="application/pdf"
                                  onChange={handleFileChange}
                                  className="sr-only"
                                />
                              </label>
                              <p className="pl-1">o arrastra y suelta</p>
                            </div>
                            <p className="text-xs text-gray-500">PDF hasta 10MB</p>
                          </>
                        )}
                      </div>
                    </div>
                    {licensePreview && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Vista Previa del Documento
                        </label>
                        <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                          <iframe
                            src={licensePreview}
                            className="w-full h-96"
                            title="Vista previa de licencia"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Paso 4: Verificación */}
          {currentStep === 4 && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isEditing && !wantToChangeLicense ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                {isEditing && !wantToChangeLicense ? (
                  <Check className="w-12 h-12 text-green-600" />
                ) : (
                  <AlertCircle className="w-12 h-12 text-yellow-600" />
                )}
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {isEditing
                  ? (wantToChangeLicense ? '¡Sede Actualizada - Requiere Verificación!' : '¡Sede Actualizada Exitosamente!')
                  : '¡Sede Creada Exitosamente!'}
              </h3>

              <div className="max-w-2xl text-center space-y-4 mb-8">
                <p className="text-gray-600">
                  {isEditing
                    ? (wantToChangeLicense
                      ? 'Tu sede ha sido actualizada y la nueva licencia ha sido enviada para verificación.'
                      : 'Los cambios en tu sede han sido guardados correctamente.')
                    : 'Tu sede ha sido creada y la documentación ha sido enviada para verificación.'}
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
                  <h4 className="font-semibold text-blue-900 mb-3">¿Qué sigue?</h4>
                  <ul className="space-y-2 text-sm text-blue-800">
                    {isEditing && wantToChangeLicense ? (
                      <>
                        <li className="flex items-start">
                          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 text-yellow-600" />
                          <span>Tu licencia será revisada. Durante este período, tu sede tendrá el estado "Verificación Pendiente"</span>
                        </li>
                        <li className="flex items-start">
                          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 text-yellow-600" />
                          <span>Tu sede NO será visible al público hasta que sea verificada nuevamente</span>
                        </li>
                        <li className="flex items-start">
                          <FileText className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 text-blue-600" />
                          <span>Recibirás una notificación cuando la verificación esté completa</span>
                        </li>
                      </>
                    ) : !isEditing ? (
                      <>
                        <li className="flex items-start">
                          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 text-blue-600" />
                          <span>Tu sede tendrá el estado "Verificación Pendiente" hasta que sea aprobada</span>
                        </li>
                        <li className="flex items-start">
                          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 text-yellow-600" />
                          <span>Tu sede NO será visible al público hasta que sea verificada</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 text-green-600" />
                          <span>Mientras tanto, puedes agregar canchas a tu sede</span>
                        </li>
                        <li className="flex items-start">
                          <FileText className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 text-blue-600" />
                          <span>Recibirás una notificación cuando la verificación esté completa</span>
                        </li>
                      </>
                    ) : (
                      <li className="flex items-start">
                        <Check className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 text-green-600" />
                        <span>Tu sede sigue verificada y visible para los usuarios</span>
                      </li>
                    )}
                  </ul>
                </div>

                {(wantToChangeLicense || !isEditing) && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Tiempo estimado de verificación:</strong> 24-48 horas hábiles<br />
                      <strong className="text-red-600">Importante:</strong> Tu sede no será visible al público hasta completar la verificación.
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={handleFinish}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Ir a Mis Sedes
              </button>
            </div>
          )}
        </div>

        {/* Footer con botones */}
        {currentStep < 4 && (
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={currentStep === 1 ? onCancel : handleBack}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {currentStep === 1 ? 'Cancelar' : 'Atrás'}
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={submitting || !validateStep(currentStep)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {submitting ? (
                'Procesando...'
              ) : (
                <>
                  {currentStep === 3 ? 'Finalizar' : 'Siguiente'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SedeFormWizard;
