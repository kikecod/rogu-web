import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, LayoutGrid, Users, DollarSign, Clock, Zap, Shield, ChevronRight, Ruler, CloudRain, AlertTriangle, Cigarette, Dog, Ban, Upload, Image, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '@/auth/hooks/useAuth';
import { ROUTES } from '@/config/routes';

// Tipos para el estado del formulario
type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0: Intro, 1: Basics, 2: Details, 3: Schedule, 4: Disciplines, 5: Photos, 6: Success

interface Disciplina {
    idDisciplina: number;
    nombre: string;
    categoria: string;
}

interface FieldFormData {
    nombre: string;
    superficie: string;
    cubierta: boolean;
    aforoMax: number;
    dimensiones: string;
    reglasUso: string;
    iluminacion: string;
    estado: string;
    precio: number;
    horaApertura: string;
    horaCierre: string;
}


const EXAMPLE_RULES = [
    { id: 'shoes', text: 'Uso obligatorio de zapatillas', icon: Check },
    { id: 'smoke', text: 'Prohibido fumar', icon: Cigarette },
    { id: 'pets', text: 'No se permiten mascotas', icon: Dog },
    { id: 'alcohol', text: 'Prohibido bebidas alcohólicas', icon: Ban },
    { id: 'time', text: 'Respetar horarios', icon: Clock },
];

const FieldCreationPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>(); // idSede
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState<Step>(0);
    const [submitting, setSubmitting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [customRuleMode, setCustomRuleMode] = useState(false);

    // Nuevos estados para disciplinas y fotos
    const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
    const [selectedDisciplinas, setSelectedDisciplinas] = useState<number[]>([]);
    const [createdCanchaId, setCreatedCanchaId] = useState<number | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [uploadingPhotos, setUploadingPhotos] = useState(false);

    // Cargar disciplinas al montar
    React.useEffect(() => {
        const loadDisciplinas = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/disciplina`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setDisciplinas(data);
                }
            } catch (error) {
                console.error('Error loading disciplines:', error);
            }
        };
        loadDisciplinas();
    }, []);

    // Estado del formulario
    const [formData, setFormData] = useState<FieldFormData>({
        nombre: '',
        superficie: 'Sintética',
        cubierta: false,
        aforoMax: 12,
        dimensiones: '',
        reglasUso: '',
        iluminacion: 'LED',
        estado: 'Disponible',
        precio: 0,
        horaApertura: '08:00',
        horaCierre: '22:00',
    });

    // Manejadores de cambios
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const toggleRule = (ruleText: string) => {
        setFormData(prev => {
            const currentRules = prev.reglasUso ? prev.reglasUso.split(', ').filter(Boolean) : [];
            const exists = currentRules.includes(ruleText);

            let newRules;
            if (exists) {
                newRules = currentRules.filter(r => r !== ruleText);
            } else {
                newRules = [...currentRules, ruleText];
            }

            return {
                ...prev,
                reglasUso: newRules.join(', ')
            };
        });
    };

    // Validación
    const validateStep = (step: Step): boolean => {
        switch (step) {
            case 1: // Basics
                return !!formData.nombre && !!formData.superficie;
            case 2: // Details
                return formData.precio > 0 && formData.aforoMax > 0 && !!formData.dimensiones;
            case 3: // Schedule
                return !!formData.horaApertura && !!formData.horaCierre;
            default:
                return true;
        }
    };

    // Acciones
    const handleNext = async () => {
        if (!validateStep(currentStep)) return;

        if (currentStep === 3) {
            setShowConfirmation(true);
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

    const confirmAndCreate = async () => {
        setShowConfirmation(false);
        await createCancha();
    };

    const createCancha = async () => {
        if (!id) return;
        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                idSede: Number(id),
                // Asegurar tipos numéricos
                aforoMax: Number(formData.aforoMax),
                precio: Number(formData.precio),
            };

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/cancha`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                setCreatedCanchaId(data.idCancha || data.id); // Ajustar según respuesta del backend
                setCurrentStep(4); // Ir a Disciplinas
            } else {
                const error = await response.json();
                alert('Error: ' + (error.message || 'Error al crear la cancha'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al crear la cancha');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveDisciplinas = async () => {
        if (!createdCanchaId || selectedDisciplinas.length === 0) {
            setCurrentStep(5); // Saltar si no hay selección (o forzar selección según regla de negocio)
            return;
        }

        setSubmitting(true);
        try {
            // Guardar cada disciplina seleccionada
            for (const idDisciplina of selectedDisciplinas) {
                await fetch(`${import.meta.env.VITE_API_BASE_URL}/parte`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        idCancha: createdCanchaId,
                        idDisciplina: idDisciplina
                    })
                });
            }
            setCurrentStep(5); // Ir a Fotos
        } catch (error) {
            console.error('Error saving disciplines:', error);
            alert('Error al guardar disciplinas');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUploadPhotos = async () => {
        if (!createdCanchaId) return;

        if (!selectedFiles || selectedFiles.length === 0) {
            setCurrentStep(6); // Ir a Success si no hay fotos
            return;
        }

        setUploadingPhotos(true);
        try {
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                const formData = new FormData();
                formData.append('image', file);

                await fetch(`${import.meta.env.VITE_API_BASE_URL}/fotos/upload/cancha/${createdCanchaId}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData
                });
            }
            setCurrentStep(6); // Ir a Success
        } catch (error) {
            console.error('Error uploading photos:', error);
            alert('Error al subir fotos');
        } finally {
            setUploadingPhotos(false);
        }
    };

    const toggleDisciplina = (id: number) => {
        setSelectedDisciplinas(prev =>
            prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
        );
    };

    if (!user?.idPersona) return null;

    // Renderizado de pasos
    const renderStepContent = () => {
        switch (currentStep) {
            case 0: // Intro
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-fade-in relative z-10">
                        <div className="absolute inset-0 bg-gradient-to-b from-green-50/50 to-white -z-10" />
                        <div className="w-32 h-32 bg-gradient-to-tr from-green-100 to-emerald-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                            <LayoutGrid className="w-16 h-16 text-green-600" />
                        </div>
                        <h1 className="text-5xl font-bold text-gray-900 tracking-tight">
                            Agrega una nueva cancha
                        </h1>
                        <p className="text-xl text-gray-500 max-w-lg">
                            Configura los detalles de tu espacio deportivo para empezar a recibir reservas.
                        </p>
                        <button
                            onClick={() => setCurrentStep(1)}
                            className="mt-8 px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full text-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                        >
                            Comenzar
                        </button>
                    </div>
                );

            case 1: // Basics
                return (
                    <div className="max-w-2xl mx-auto animate-fade-in">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Información Básica</h2>
                            <p className="text-gray-500">Define las características principales de la cancha.</p>
                        </div>

                        <div className="space-y-6">
                            {/* Nombre */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                    <LayoutGrid className="w-4 h-4 text-green-500" />
                                    Nombre de la Cancha <span className="text-red-500">*</span> <span className="text-gray-400 font-normal">(Debe tener 5 o mas caracteres)</span>
                                </label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-50 transition-all outline-none text-lg"
                                    placeholder="Ej: Cancha 1 - Fútbol 5"
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Superficie */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                        <LayoutGrid className="w-4 h-4 text-green-500" />
                                        Superficie
                                    </label>
                                    <select
                                        name="superficie"
                                        value={formData.superficie}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-50 transition-all outline-none bg-white"
                                    >
                                        <option value="Sintética">Sintética</option>
                                        <option value="Pasto Natural">Pasto Natural</option>
                                        <option value="Parquet">Parquet</option>
                                        <option value="Cemento">Cemento</option>
                                        <option value="Tierra">Tierra</option>
                                    </select>
                                </div>

                                {/* Iluminación */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-yellow-500" />
                                        Iluminación
                                    </label>
                                    <select
                                        name="iluminacion"
                                        value={formData.iluminacion}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-50 transition-all outline-none bg-white"
                                    >
                                        <option value="LED">LED</option>
                                        <option value="Halógena">Halógena</option>
                                        <option value="Natural">Natural (Solo día)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Cubierta Toggle */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, cubierta: !prev.cubierta }))}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 rounded-full ${formData.cubierta ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                        <CloudRain className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">Cancha Techada</h3>
                                        <p className="text-sm text-gray-500">¿La cancha cuenta con techo o cubierta?</p>
                                    </div>
                                </div>
                                <div className={`w-14 h-8 rounded-full p-1 transition-colors ${formData.cubierta ? 'bg-green-500' : 'bg-gray-300'}`}>
                                    <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform ${formData.cubierta ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 2: // Details
                return (
                    <div className="max-w-2xl mx-auto animate-fade-in">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Detalles y Precios</h2>
                            <p className="text-gray-500">Especifica la capacidad y el costo de alquiler.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Precio */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-green-500" />
                                        Precio por Hora (Bs.) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="precio"
                                        value={formData.precio}
                                        onChange={handleInputChange}
                                        min="0"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-50 transition-all outline-none text-lg"
                                        placeholder="0.00"
                                    />
                                </div>

                                {/* Aforo */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                        <Users className="w-4 h-4 text-blue-500" />
                                        Capacidad Máxima <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="aforoMax"
                                        value={formData.aforoMax}
                                        onChange={handleInputChange}
                                        min="1"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-50 transition-all outline-none text-lg"
                                        placeholder="12"
                                    />
                                </div>
                            </div>

                            {/* Dimensiones */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                    <Ruler className="w-4 h-4 text-gray-500" />
                                    Dimensiones <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="dimensiones"
                                    value={formData.dimensiones}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-50 transition-all outline-none text-lg"
                                    placeholder="Ej: 20x40 metros"
                                />
                            </div>

                            {/* Reglas */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-blue-500" />
                                        Reglas de Uso <span className="text-gray-400 font-normal">(Opcional)</span>
                                    </label>
                                    <button
                                        onClick={() => setCustomRuleMode(!customRuleMode)}
                                        className="text-sm text-green-600 font-medium hover:text-green-700 transition-colors"
                                    >
                                        {customRuleMode ? 'Usar predefinidas' : 'Escribir personalizada'}
                                    </button>
                                </div>

                                {customRuleMode ? (
                                    <textarea
                                        name="reglasUso"
                                        value={formData.reglasUso}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-50 transition-all outline-none text-lg resize-none"
                                        placeholder="Ej: Uso obligatorio de zapatillas de futsal..."
                                        autoFocus
                                    />
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {EXAMPLE_RULES.map((rule) => {
                                            const isSelected = formData.reglasUso.includes(rule.text);
                                            return (
                                                <div
                                                    key={rule.id}
                                                    onClick={() => toggleRule(rule.text)}
                                                    className={`
                                                        p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3
                                                        ${isSelected
                                                            ? 'border-green-500 bg-green-50 text-green-700 shadow-sm'
                                                            : 'border-gray-200 hover:border-green-200 hover:bg-gray-50 text-gray-600'
                                                        }
                                                    `}
                                                >
                                                    <div className={`
                                                        p-2 rounded-full
                                                        ${isSelected ? 'bg-green-200 text-green-700' : 'bg-gray-100 text-gray-400'}
                                                    `}>
                                                        <rule.icon className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-medium text-sm">{rule.text}</span>
                                                    {isSelected && <Check className="w-4 h-4 ml-auto text-green-600" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                <p className="text-xs text-gray-500 mt-2">Separa las reglas con comas (ej: No fumar, Traer toalla)</p>
                            </div>
                        </div>
                    </div>
                );

            case 3: // Schedule
                return (
                    <div className="max-w-2xl mx-auto animate-fade-in">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Horario de Atención</h2>
                            <p className="text-gray-500">Define el horario en el que esta cancha estará disponible.</p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-orange-100 rounded-full text-orange-600">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Horario Estándar</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Hora de Apertura</label>
                                    <input
                                        type="time"
                                        name="horaApertura"
                                        value={formData.horaApertura}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-50 transition-all outline-none text-2xl font-bold text-center"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Hora de Cierre</label>
                                    <input
                                        type="time"
                                        name="horaCierre"
                                        value={formData.horaCierre}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-50 transition-all outline-none text-2xl font-bold text-center"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 4: // Disciplines
                return (
                    <div className="max-w-3xl mx-auto animate-fade-in">
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Deportes y Disciplinas</h2>
                            <p className="text-gray-500">Selecciona los deportes que se pueden practicar en esta cancha.</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {disciplinas.map((disciplina) => {
                                const isSelected = selectedDisciplinas.includes(disciplina.idDisciplina);
                                return (
                                    <div
                                        key={disciplina.idDisciplina}
                                        onClick={() => toggleDisciplina(disciplina.idDisciplina)}
                                        className={`
                                            p-4 rounded-2xl border cursor-pointer transition-all flex flex-col items-center justify-center gap-3 text-center h-32
                                            ${isSelected
                                                ? 'border-green-500 bg-green-50 text-green-700 shadow-md transform scale-105'
                                                : 'border-gray-200 hover:border-green-200 hover:bg-gray-50 text-gray-600'
                                            }
                                        `}
                                    >
                                        <div className={`
                                            p-3 rounded-full
                                            ${isSelected ? 'bg-green-200 text-green-700' : 'bg-gray-100 text-gray-400'}
                                        `}>
                                            <Zap className="w-6 h-6" />
                                        </div>
                                        <span className="font-medium">{disciplina.nombre}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );

            case 5: // Photos
                return (
                    <div className="max-w-2xl mx-auto animate-fade-in">
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Fotos de la Cancha</h2>
                            <p className="text-gray-500">Sube algunas fotos para que los usuarios conozcan tu espacio.</p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-gray-300 hover:border-green-500 transition-colors text-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Upload className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Sube tus fotos aquí</h3>
                            <p className="text-gray-500 mb-6 text-sm">
                                Soporta JPG, PNG. Máximo 10MB por imagen.
                            </p>

                            <label className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 cursor-pointer transition-colors shadow-sm">
                                <Image className="w-5 h-5 mr-2" />
                                Seleccionar Archivos
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => setSelectedFiles(e.target.files)}
                                />
                            </label>
                        </div>

                        {selectedFiles && selectedFiles.length > 0 && (
                            <div className="mt-8">
                                <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-500" />
                                    {selectedFiles.length} archivos seleccionados
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {Array.from(selectedFiles).map((file, index) => (
                                        <div key={index} className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt="preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 6: // Success
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-fade-in relative z-10">
                        <div className="absolute inset-0 bg-gradient-to-b from-green-50/50 to-white -z-10" />
                        <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce-slow shadow-lg ring-8 ring-green-50">
                            <Check className="w-16 h-16 text-green-600" />
                        </div>
                        <h1 className="text-5xl font-bold text-gray-900 tracking-tight">¡Cancha creada con éxito!</h1>
                        <p className="text-xl text-gray-500 max-w-lg">
                            La cancha ha sido añadida a tu sede y está lista para ser gestionada.
                        </p>
                        <button
                            onClick={() => navigate(ROUTES.owner.venueDetail(id!))}
                            className="mt-8 px-10 py-4 bg-gray-900 text-white rounded-full text-xl font-semibold shadow-xl hover:bg-gray-800 hover:scale-105 transition-all"
                        >
                            Volver a la Sede
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
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                            <AlertTriangle className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
                            ¿Confirmas la creación de la cancha?
                        </h3>
                        <p className="text-gray-600 text-center mb-8">
                            Revisa que los datos sean correctos. Podrás editarlos más tarde si es necesario.
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
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="h-20 border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 bg-white/80 backdrop-blur-md z-50">
                <div className="flex items-center cursor-pointer" onClick={() => navigate(ROUTES.owner.venueDetail(id!))}>
                    <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-md mr-3 hover:shadow-lg transition-shadow">
                        <LayoutGrid className="text-white w-6 h-6" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-gray-900">Rogu</span>
                </div>
            </header>

            {/* Progress Bar */}
            {currentStep > 0 && currentStep < 6 && (
                <div className="w-full h-1 bg-gray-100">
                    <div
                        className="h-full bg-gradient-to-r from-green-600 to-emerald-600 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                        style={{ width: `${(currentStep / 5) * 100}%` }}
                    />
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative overflow-y-auto">
                <div className="flex-1 flex items-center justify-center p-6 pb-24">
                    {renderStepContent()}
                </div>

                {/* Footer Actions */}
                {currentStep > 0 && currentStep < 6 && (
                    <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-sm border-t border-gray-100 flex justify-between items-center z-40">
                        <button
                            onClick={handleBack}
                            className="px-6 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            Atrás
                        </button>

                        <div className="flex items-center gap-4 ml-auto">
                            <span className="text-sm text-gray-400 font-medium hidden sm:block">
                                {currentStep === 4 ? 'Paso 4 de 5' : currentStep === 5 ? 'Paso 5 de 5' : `Paso ${currentStep} de 5`}
                            </span>
                            <button
                                onClick={() => {
                                    if (currentStep === 3) handleNext();
                                    else if (currentStep === 4) handleSaveDisciplinas();
                                    else if (currentStep === 5) handleUploadPhotos();
                                    else handleNext();
                                }}
                                disabled={!validateStep(currentStep) || submitting || uploadingPhotos}
                                className={`
                                    px-8 py-3 rounded-xl font-semibold text-white shadow-lg transition-all flex items-center gap-2
                                    ${!validateStep(currentStep) || submitting || uploadingPhotos
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : 'bg-gray-900 hover:bg-gray-800 hover:scale-105 active:scale-95 shadow-gray-900/20'
                                    }
                                `}
                            >
                                {submitting || uploadingPhotos ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        {currentStep === 5 ? 'Finalizar' : 'Siguiente'}
                                        <ChevronRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default FieldCreationPage;
