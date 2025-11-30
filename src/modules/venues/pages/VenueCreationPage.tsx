import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Upload, MapPin, Building, Mail, Phone, FileText, ChevronRight, Info, Shield, Cigarette, Dog, Clock, Edit3, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/auth/hooks/useAuth';
import { ROUTES } from '@/config/routes';
import { getDepartments, getCitiesByDepartment, getDistrictsByCity, getFullAddress } from '../lib/boliviaData';
import MapPicker from '../components/MapPicker';
import type { SedeFormData } from '../types/venue.types';

// Tipos para el estado del formulario
type Step = 0 | 1 | 2 | 3 | 4 | 5; // 0: Intro, 1: Basics, 2: Contact, 3: Location, 4: Legal, 5: Success

const EXAMPLE_POLICIES = [
    { id: 'smoke', text: 'Prohibido fumar en las instalaciones', icon: Cigarette },
    { id: 'pets', text: 'No se permiten mascotas', icon: Dog },
    { id: 'cancel', text: 'Cancelación gratuita hasta 24h antes', icon: Clock },
    { id: 'shoes', text: 'Uso obligatorio de zapatillas deportivas', icon: Check },
];

const VenueCreationPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState<Step>(0);
    const [submitting, setSubmitting] = useState(false);
    const [createdSedeId, setCreatedSedeId] = useState<number | null>(null);
    const [licenseFile, setLicenseFile] = useState<File | null>(null);
    const [licensePreview, setLicensePreview] = useState<string | null>(null);
    const [customPolicyMode, setCustomPolicyMode] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const togglePolicy = (text: string) => {
        const currentPolicies = formData.politicas ? formData.politicas.split(',').map(p => p.trim()).filter(p => p !== '') : [];
        if (currentPolicies.includes(text)) {
            setFormData(prev => ({ ...prev, politicas: currentPolicies.filter(p => p !== text).join(', ') }));
        } else {
            setFormData(prev => ({ ...prev, politicas: [...currentPolicies, text].join(', ') }));
        }
    };

    // Validación
    const validateStep = (step: Step): boolean => {
        switch (step) {
            case 1: // Basics - Solo nombre obligatorio
                return !!formData.nombre;
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
            // Mostrar confirmación antes de crear la sede
            setShowConfirmation(true);
        } else if (currentStep === 4) {
            await uploadLicense();
        } else {
            setCurrentStep(prev => (prev + 1) as Step);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            // Si ya se creó la sede (paso 4), no permitir volver atrás para editar datos
            if (currentStep === 4) {
                return;
            }
            setCurrentStep(prev => (prev - 1) as Step);
        } else {
            navigate(-1);
        }
    };

    const confirmAndCreate = async () => {
        setShowConfirmation(false);
        await createSede();
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
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-fade-in relative z-10">
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white -z-10" />
                        <div className="w-32 h-32 bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                            <Building className="w-16 h-16 text-blue-600" />
                        </div>
                        <h1 className="text-5xl font-bold text-gray-900 tracking-tight">
                            Comienza a publicar tu espacio
                        </h1>
                        <p className="text-xl text-gray-500 max-w-lg">
                            En pocos pasos, tu sede estará lista para recibir reservas.
                        </p>
                        <button
                            onClick={() => setCurrentStep(1)}
                            className="mt-8 px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                        >
                            ¡Vamos!
                        </button>
                    </div>
                );

            case 1: // Basics
                return (
                    <div className="max-w-2xl mx-auto animate-fade-in">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Cuéntanos sobre tu sede</h2>
                            <p className="text-gray-500">Solo el nombre es obligatorio, el resto puedes completarlo después.</p>
                        </div>

                        <div className="space-y-8">
                            {/* Nombre */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                    <Building className="w-4 h-4 text-blue-500" />
                                    Nombre de la Sede <span className="text-red-500">*</span> <span className="text-gray-400 font-normal">(Debe tener 5 o mas caracteres)</span>
                                </label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none text-lg"
                                    placeholder="Ej: Complejo Deportivo Los Pinos"
                                    autoFocus
                                />
                            </div>

                            {/* Descripción */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                    <Info className="w-4 h-4 text-blue-500" />
                                    Descripción <span className="text-gray-400 font-normal">(Opcional)</span>
                                </label>
                                <textarea
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none text-lg resize-none"
                                    placeholder="Describe las instalaciones, ambiente, etc."
                                />
                            </div>

                            {/* Políticas */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-center mb-4">
                                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-blue-500" />
                                        Políticas <span className="text-gray-400 font-normal">(Opcional)</span>
                                    </label>
                                    <button
                                        onClick={() => setCustomPolicyMode(!customPolicyMode)}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        {customPolicyMode ? (
                                            <>
                                                <Check className="w-3 h-3" /> Usar ejemplos
                                            </>
                                        ) : (
                                            <>
                                                <Edit3 className="w-3 h-3" /> Personalizado
                                            </>
                                        )}
                                    </button>
                                </div>

                                {customPolicyMode ? (
                                    <textarea
                                        name="politicas"
                                        value={formData.politicas}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none text-base resize-none"
                                        placeholder="Escribe tus propias reglas..."
                                        autoFocus
                                    />
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {EXAMPLE_POLICIES.map((policy) => {
                                            const isSelected = formData.politicas.includes(policy.text);
                                            const Icon = policy.icon;
                                            return (
                                                <button
                                                    key={policy.id}
                                                    onClick={() => togglePolicy(policy.text)}
                                                    className={`
                                                        p-3 rounded-xl border text-left flex items-center gap-3 transition-all
                                                        ${isSelected
                                                            ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200'
                                                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-600'
                                                        }
                                                    `}
                                                >
                                                    <div className={`
                                                        w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                                                        ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}
                                                    `}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-sm font-medium">{policy.text}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                                <p className="text-xs text-gray-500 mt-2">Separa las reglas con comas (ej: No fumar, Traer toalla)</p>
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
                            <div className="relative group">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono / WhatsApp</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center group-focus-within:bg-green-100 transition-colors">
                                        <Phone className="text-green-600 w-5 h-5" />
                                    </div>
                                    <input
                                        type="tel"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleInputChange}
                                        className="w-full pl-16 pr-4 py-4 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-50 transition-all outline-none text-lg"
                                        placeholder="70000000"
                                    />
                                </div>
                            </div>
                            <div className="relative group">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-focus-within:bg-blue-100 transition-colors">
                                        <Mail className="text-blue-600 w-5 h-5" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full pl-16 pr-4 py-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none text-lg"
                                        placeholder="contacto@sede.com"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 3: // Location
                return (
                    <div className="max-w-5xl mx-auto animate-fade-in">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">¿Dónde está ubicada?</h2>
                        <p className="text-gray-500 mb-8">Ayuda a los deportistas a encontrarte fácilmente.</p>

                        <div className="space-y-8">
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
                                        <select
                                            value={selectedDepartment}
                                            onChange={(e) => handleDepartmentChange(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none bg-white focus:ring-4 focus:ring-blue-50 transition-all"
                                        >
                                            <option value="">Seleccionar</option>
                                            {getDepartments().map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                                        <select
                                            value={selectedCity}
                                            onChange={(e) => handleCityChange(e.target.value)}
                                            disabled={!selectedDepartment}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none bg-white disabled:bg-gray-50 focus:ring-4 focus:ring-blue-50 transition-all"
                                        >
                                            <option value="">Seleccionar</option>
                                            {selectedDepartment && getCitiesByDepartment(selectedDepartment).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Zona / Distrito</label>
                                        <select
                                            value={selectedDistrict}
                                            onChange={(e) => handleDistrictChange(e.target.value)}
                                            disabled={!selectedCity}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none bg-white disabled:bg-gray-50 focus:ring-4 focus:ring-blue-50 transition-all"
                                        >
                                            <option value="">Seleccionar</option>
                                            {selectedCity && getDistrictsByCity(selectedCity).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Dirección Exacta</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                name="addressLine"
                                                value={formData.addressLine}
                                                onChange={handleInputChange}
                                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                                                placeholder="Av. Principal #123"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <MapPicker
                                latitude={formData.latitude}
                                longitude={formData.longitude}
                                onLocationSelect={(lat, lng) => setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))}
                                className="h-[400px] w-full rounded-2xl shadow-md border border-gray-200"
                            />
                        </div>
                    </div>
                );

            case 4: // Legal
                return (
                    <div className="max-w-4xl mx-auto animate-fade-in text-center">
                        <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-yellow-50/50">
                            <FileText className="w-10 h-10 text-yellow-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Documentación Legal</h2>
                        <p className="text-gray-500 mb-8">Para garantizar la seguridad, necesitamos verificar tu Licencia de Funcionamiento.</p>

                        <div
                            className={`
                                border-2 border-dashed rounded-3xl p-8 transition-all relative group
                                ${licensePreview
                                    ? 'border-green-300 bg-green-50/30'
                                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer'
                                }
                            `}
                            onClick={() => !licensePreview && triggerFileInput()}
                        >
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileChange}
                                className="hidden"
                                ref={fileInputRef}
                            />

                            {licensePreview ? (
                                <div className="flex flex-col items-center w-full">
                                    <div className="flex items-center gap-3 mb-6 bg-green-100 px-4 py-2 rounded-full">
                                        <Check className="w-5 h-5 text-green-600" />
                                        <span className="font-medium text-green-800 text-sm">Archivo seleccionado: {licenseFile?.name}</span>
                                    </div>

                                    <div className="w-full h-[500px] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
                                        <iframe
                                            src={licensePreview}
                                            className="w-full h-full"
                                            title="Vista previa de licencia"
                                        />
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            triggerFileInput();
                                        }}
                                        className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm font-medium flex items-center gap-2"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        Cambiar archivo
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center py-12">
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Upload className="w-8 h-8 text-blue-500" />
                                    </div>
                                    <p className="font-medium text-gray-900 text-lg">Sube tu licencia en PDF</p>
                                    <p className="text-sm text-gray-500 mt-2">Arrastra o haz clic para seleccionar</p>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 5: // Success
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-fade-in relative z-10">
                        <div className="absolute inset-0 bg-gradient-to-b from-green-50/50 to-white -z-10" />
                        <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce-slow shadow-lg ring-8 ring-green-50">
                            <Check className="w-16 h-16 text-green-600" />
                        </div>
                        <h1 className="text-5xl font-bold text-gray-900 tracking-tight">¡Sede creada con éxito!</h1>
                        <p className="text-xl text-gray-500 max-w-lg">
                            Tu sede ha sido enviada a verificación. Te notificaremos cuando esté activa.
                        </p>
                        <button
                            onClick={() => navigate(ROUTES.owner.mode)}
                            className="mt-8 px-10 py-4 bg-gray-900 text-white rounded-full text-xl font-semibold shadow-xl hover:bg-gray-800 hover:scale-105 transition-all"
                        >
                            Volver al Panel
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans relative">
            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all scale-100 relative z-[10000]">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                            <AlertTriangle className="w-8 h-8 text-yellow-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
                            ¿Confirmas que la información es correcta?
                        </h3>
                        <p className="text-gray-600 text-center mb-8">
                            Al pasar esta pantalla, la sede será creada y no podrás modificar estos datos aquí. Si necesitas hacer cambios después, podrás hacerlo desde el panel de administración.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowConfirmation(false)}
                                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Revisar
                            </button>
                            <button
                                onClick={confirmAndCreate}
                                className="flex-1 px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors shadow-lg"
                            >
                                Confirmar y Crear
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="h-20 border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 bg-white/80 backdrop-blur-md z-50">
                <div className="flex items-center cursor-pointer" onClick={() => navigate(ROUTES.owner.mode)}>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md mr-3 hover:shadow-lg transition-shadow">
                        <Building className="text-white w-6 h-6" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-gray-900">Rogu</span>
                </div>
            </header>

            {/* Progress Bar */}
            {currentStep > 0 && currentStep < 5 && (
                <div className="w-full h-1 bg-gray-100">
                    <div
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(37,99,235,0.5)]"
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
                    <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-sm border-t border-gray-100 flex justify-between items-center z-40">
                        {currentStep !== 4 && (
                            <button
                                onClick={handleBack}
                                className="px-6 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Atrás
                            </button>
                        )}
                        {currentStep === 4 && <div />} {/* Spacer if back button is hidden */}

                        <div className="flex items-center gap-4 ml-auto">
                            <span className="text-sm text-gray-400 font-medium hidden sm:block">
                                Paso {currentStep} de 4
                            </span>
                            <button
                                onClick={handleNext}
                                disabled={!validateStep(currentStep) || submitting}
                                className={`
                                    px-8 py-3 rounded-xl font-semibold text-white shadow-lg transition-all flex items-center gap-2
                                    ${!validateStep(currentStep) || submitting
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : 'bg-gray-900 hover:bg-gray-800 hover:scale-105 active:scale-95 shadow-gray-900/20'
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
