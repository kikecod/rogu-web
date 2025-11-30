import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Upload, MapPin, Building, Mail, Phone, FileText, X, ChevronRight } from 'lucide-react';
import { useAuth } from '@/auth/hooks/useAuth';
import { ROUTES } from '@/config/routes';
import { getDepartments, getCitiesByDepartment, getDistrictsByCity, getFullAddress } from '../lib/boliviaData';
import MapPicker from '../components/MapPicker';
import type { SedeFormData } from '../types/venue.types';

// Tipos para el estado del formulario
type Step = 0 | 1 | 2 | 3 | 4 | 5; // 0: Intro, 1: Basics, 2: Contact, 3: Location, 4: Legal, 5: Success

const VenueCreationPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState<Step>(0);
    const [submitting, setSubmitting] = useState(false);
    const [createdSedeId, setCreatedSedeId] = useState<number | null>(null);
    const [licenseFile, setLicenseFile] = useState<File | null>(null);
    const [licensePreview, setLicensePreview] = useState<string | null>(null);

    // Estado del formulario
    const [formData, setFormData] = useState<SedeFormData>({
        nombre: '',
        descripcion: '',
        country: 'Bolivia',
        countryCode: 'BO',
        stateProvince: '',
        city: '',
        district: '',
        addressLine: '',
        postalCode: '00000',
        latitude: null,
        longitude: null,
        timezone: 'America/La_Paz',
        telefono: '',
        email: '',
        politicas: '',
        estado: 'Activo',
        LicenciaFuncionamiento: ''
    });

    // Estados para selectores geográficos
    const [selectedDepartment, setSelectedDepartment] = useState<string>('');
    const [selectedCity, setSelectedCity] = useState<string>('');
    const [selectedDistrict, setSelectedDistrict] = useState<string>('');

    // Manejadores de cambios
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDepartmentChange = (departmentId: string) => {
        setSelectedDepartment(departmentId);
        setSelectedCity('');
        setSelectedDistrict('');
        const departmentData = getDepartments().find(dep => dep.id === departmentId);
        if (departmentData) {
            const addressData = getFullAddress(departmentId, '', '');
            setFormData(prev => ({ ...prev, stateProvince: addressData.stateProvince, city: '', district: '' }));
        }
    };

    const handleCityChange = (cityId: string) => {
        setSelectedCity(cityId);
        setSelectedDistrict('');
        if (selectedDepartment && cityId) {
            const addressData = getFullAddress(selectedDepartment, cityId, '');
            setFormData(prev => ({ ...prev, city: addressData.city, district: '' }));
        }
    };

    const handleDistrictChange = (districtId: string) => {
        setSelectedDistrict(districtId);
        if (selectedDepartment && selectedCity && districtId) {
            const addressData = getFullAddress(selectedDepartment, selectedCity, districtId);
            setFormData(prev => ({ ...prev, district: addressData.district }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            setLicenseFile(file);
            setLicensePreview(URL.createObjectURL(file));
        } else {
            alert('Por favor selecciona un archivo PDF');
        }
    };

    // Validación
    const validateStep = (step: Step): boolean => {
        switch (step) {
            case 1: // Basics
                return !!(formData.nombre && formData.descripcion && formData.politicas);
            case 2: // Contact
                return !!(formData.telefono && formData.email);
            case 3: // Location
                return !!(formData.stateProvince && formData.city && formData.district && formData.addressLine);
            case 4: // Legal
                return !!licenseFile;
            default:
                return true;
        }
    };

    // Acciones
    const handleNext = async () => {
        if (!validateStep(currentStep)) return;

        if (currentStep === 3) {
            // Crear sede antes de pasar al paso de licencia (o después, dependiendo del flujo original)
            // En el wizard original se crea en el paso 2 (Location) y se sube licencia en el 3.
            // Aquí: 0->Intro, 1->Basics, 2->Contact, 3->Location (Create here), 4->Legal (Upload here), 5->Success
            await createSede();
        } else if (currentStep === 4) {
            await uploadLicense();
        } else {
            setCurrentStep(prev => (prev + 1) as Step);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => (prev - 1) as Step);
        } else {
            navigate(-1);
        }
    };

    const createSede = async () => {
        setSubmitting(true);
        try {
            const sanitizedData = {
                ...formData,
                ...(formData.latitude ? { latitude: Number(formData.latitude) } : {}),
                ...(formData.longitude ? { longitude: Number(formData.longitude) } : {}),
            };

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/sede`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ ...sanitizedData, idPersonaD: user?.idPersona })
            });

            if (response.ok) {
                const result = await response.json();
                setCreatedSedeId(result.idSede);
                setCurrentStep(4); // Ir a Legal
            } else {
                const error = await response.json();
                alert('Error: ' + (error.message || 'Error al crear la sede'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al crear la sede');
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

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/sede/${createdSedeId}/licencia`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: formDataUpload
            });

            if (response.ok) {
                setCurrentStep(5); // Ir a Success
            } else {
                const error = await response.json();
                alert('Error: ' + (error.message || 'Error al subir la licencia'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al subir la licencia');
        } finally {
            setSubmitting(false);
        }
    };

    if (!user?.idPersona) return null;

    // Renderizado de pasos
    const renderStepContent = () => {
        switch (currentStep) {
            case 0: // Intro
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-fade-in">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <Building className="w-12 h-12 text-blue-600" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                            Comienza a publicar tu espacio
                        </h1>
                        <p className="text-xl text-gray-500 max-w-lg">
                            En pocos pasos, tu sede estará lista para recibir reservas.
                        </p>
                        <button
                            onClick={() => setCurrentStep(1)}
                            className="mt-8 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                        >
                            ¡Vamos!
                        </button>
                    </div>
                );

            case 1: // Basics
                return (
                    <div className="max-w-2xl mx-auto animate-fade-in">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Cuéntanos sobre tu sede</h2>
                        <p className="text-gray-500 mb-8">Empieza con lo básico: nombre y descripción.</p>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Sede</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-lg"
                                    placeholder="Ej: Complejo Deportivo Los Pinos"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                                <textarea
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-lg resize-none"
                                    placeholder="Describe las instalaciones, ambiente, etc."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Políticas</label>
                                <textarea
                                    name="politicas"
                                    value={formData.politicas}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-base resize-none"
                                    placeholder="Reglas de uso, cancelaciones..."
                                />
                            </div>
                        </div>
                    </div>
                );

            case 2: // Contact
                return (
                    <div className="max-w-2xl mx-auto animate-fade-in">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Información de contacto</h2>
                        <p className="text-gray-500 mb-8">¿Cómo pueden los usuarios contactarte?</p>

                        <div className="space-y-6">
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono / WhatsApp</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="tel"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-lg"
                                        placeholder="+591 70000000"
                                    />
                                </div>
                            </div>
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-lg"
                                        placeholder="contacto@sede.com"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 3: // Location
                return (
                    <div className="max-w-4xl mx-auto animate-fade-in">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">¿Dónde está ubicada?</h2>
                        <p className="text-gray-500 mb-8">Ayuda a los deportistas a encontrarte fácilmente.</p>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                                        <select
                                            value={selectedDepartment}
                                            onChange={(e) => handleDepartmentChange(e.target.value)}
                                            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 outline-none bg-white"
                                        >
                                            <option value="">Seleccionar</option>
                                            {getDepartments().map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                                        <select
                                            value={selectedCity}
                                            onChange={(e) => handleCityChange(e.target.value)}
                                            disabled={!selectedDepartment}
                                            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 outline-none bg-white disabled:bg-gray-50"
                                        >
                                            <option value="">Seleccionar</option>
                                            {selectedDepartment && getCitiesByDepartment(selectedDepartment).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Zona / Distrito</label>
                                    <select
                                        value={selectedDistrict}
                                        onChange={(e) => handleDistrictChange(e.target.value)}
                                        disabled={!selectedCity}
                                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 outline-none bg-white disabled:bg-gray-50"
                                    >
                                        <option value="">Seleccionar</option>
                                        {selectedCity && getDistrictsByCity(selectedCity).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección Exacta</label>
                                    <input
                                        type="text"
                                        name="addressLine"
                                        value={formData.addressLine}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 outline-none"
                                        placeholder="Av. Principal #123"
                                    />
                                </div>
                            </div>
                            <div className="h-[300px] lg:h-auto rounded-xl overflow-hidden shadow-sm border border-gray-200">
                                <MapPicker
                                    latitude={formData.latitude}
                                    longitude={formData.longitude}
                                    onLocationSelect={(lat, lng) => setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))}
                                    height="100%"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 4: // Legal
                return (
                    <div className="max-w-2xl mx-auto animate-fade-in text-center">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FileText className="w-8 h-8 text-yellow-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Documentación Legal</h2>
                        <p className="text-gray-500 mb-8">Para garantizar la seguridad, necesitamos verificar tu Licencia de Funcionamiento.</p>

                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 hover:border-blue-400 transition-colors bg-gray-50 cursor-pointer relative">
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            {licensePreview ? (
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                        <Check className="w-8 h-8 text-green-600" />
                                    </div>
                                    <p className="font-medium text-gray-900">{licenseFile?.name}</p>
                                    <p className="text-sm text-green-600 mt-2">¡Archivo listo para subir!</p>
                                    <p className="text-xs text-gray-400 mt-4">Haz clic para cambiar</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <Upload className="w-12 h-12 text-gray-400 mb-4" />
                                    <p className="font-medium text-gray-900">Sube tu licencia en PDF</p>
                                    <p className="text-sm text-gray-500 mt-2">Arrastra o haz clic para seleccionar</p>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 5: // Success
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-fade-in">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce-slow">
                            <Check className="w-12 h-12 text-green-600" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900">¡Sede creada con éxito!</h1>
                        <p className="text-xl text-gray-500 max-w-lg">
                            Tu sede ha sido enviada a verificación. Te notificaremos cuando esté activa.
                        </p>
                        <button
                            onClick={() => navigate(ROUTES.owner.mode)}
                            className="mt-8 px-8 py-4 bg-gray-900 text-white rounded-full text-lg font-semibold shadow-lg hover:bg-gray-800 transition-all"
                        >
                            Volver al Panel
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header */}
            <header className="h-20 border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 bg-white/80 backdrop-blur-md z-50">
                <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md mr-3">
                        <Building className="text-white w-6 h-6" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-gray-900">Rogu</span>
                </div>
            </header>

            {/* Progress Bar */}
            {currentStep > 0 && currentStep < 5 && (
                <div className="w-full h-1 bg-gray-100">
                    <div
                        className="h-full bg-blue-600 transition-all duration-500 ease-out"
                        style={{ width: `${(currentStep / 4) * 100}%` }}
                    />
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative overflow-y-auto">
                <div className="flex-1 flex items-center justify-center p-6 pb-24">
                    {renderStepContent()}
                </div>

                {/* Footer Actions */}
                {currentStep > 0 && currentStep < 5 && (
                    <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 flex justify-between items-center z-40">
                        <button
                            onClick={handleBack}
                            className="px-6 py-3 text-gray-900 font-medium hover:bg-gray-100 rounded-lg transition-colors underline-offset-4 hover:underline"
                        >
                            Atrás
                        </button>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-400 font-medium hidden sm:block">
                                Paso {currentStep} de 4
                            </span>
                            <button
                                onClick={handleNext}
                                disabled={!validateStep(currentStep) || submitting}
                                className={`
                                    px-8 py-3 rounded-lg font-semibold text-white shadow-lg transition-all flex items-center gap-2
                                    ${!validateStep(currentStep) || submitting
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : 'bg-gray-900 hover:bg-gray-800 hover:scale-105 active:scale-95'
                                    }
                                `}
                            >
                                {submitting ? 'Procesando...' : (currentStep === 4 ? 'Finalizar' : 'Siguiente')}
                                {!submitting && <ChevronRight className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default VenueCreationPage;
