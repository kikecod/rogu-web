import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Loader2,
    LayoutGrid,
    Settings,
    Clock,
    Check,
    ChevronRight,
    Upload,
    Image as ImageIcon,
    AlertCircle,
    Trophy,
    Sun,
    Lightbulb,
    Umbrella,
    DollarSign,
    Users,
    Ruler,
    FileText,
    Edit3
} from 'lucide-react';
import { fieldsService } from '../services/fields.service';
import type { CrearCanchaDto } from '../types/field.types';

// Tipos para el estado del formulario
type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0: Intro, 1: Info Básica, 2: Características, 3: Horarios, 4: Disciplinas, 5: Fotos, 6: Success

interface Disciplina {
    idDisciplina: number;
    nombre: string;
    categoria: string;
}

const FieldCreationPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>(); // idSede
    const [currentStep, setCurrentStep] = useState<Step>(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Estado para datos creados
    const [createdCanchaId, setCreatedCanchaId] = useState<number | null>(null);
    const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
    const [selectedDisciplinas, setSelectedDisciplinas] = useState<number[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [customRulesMode, setCustomRulesMode] = useState(false);

    const [formData, setFormData] = useState<Omit<CrearCanchaDto, 'idSede'>>({
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

    const SURFACE_OPTIONS = [
        { id: 'Sintética', label: 'Pasto Sintético', icon: LayoutGrid, color: 'bg-green-50 text-green-600' },
        { id: 'Pasto Natural', label: 'Pasto Natural', icon: Sun, color: 'bg-emerald-50 text-emerald-600' },
        { id: 'Parquet', label: 'Parquet / Madera', icon: LayoutGrid, color: 'bg-orange-50 text-orange-600' },
        { id: 'Cemento', label: 'Cemento / Concreto', icon: LayoutGrid, color: 'bg-gray-50 text-gray-600' },
        { id: 'Tierra', label: 'Tierra / Arcilla', icon: LayoutGrid, color: 'bg-amber-50 text-amber-600' },
    ];

    const EXAMPLE_RULES = [
        "Uso obligatorio de zapatillas adecuadas",
        "Prohibido fumar en la cancha",
        "Respetar el horario reservado",
        "No ingresar con alimentos",
        "Cuidar las instalaciones"
    ];

    // Cargar disciplinas
    useEffect(() => {
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const toggleRule = (rule: string) => {
        const currentRules = formData.reglasUso ? formData.reglasUso.split(',').map(r => r.trim()).filter(r => r !== '') : [];
        if (currentRules.includes(rule)) {
            setFormData(prev => ({ ...prev, reglasUso: currentRules.filter(r => r !== rule).join(', ') }));
        } else {
            setFormData(prev => ({ ...prev, reglasUso: [...currentRules, rule].join(', ') }));
        }
    };

    const validateStep = (step: Step): boolean => {
        switch (step) {
            case 1:
                return !!formData.nombre && !!formData.superficie && !!formData.dimensiones;
            case 2:
                return true;
            case 3:
                return !!formData.horaApertura && !!formData.horaCierre && Number(formData.precio) > 0;
            case 4:
                return selectedDisciplinas.length > 0;
            default:
                return true;
        }
    };

    const handleNext = async () => {
        if (!validateStep(currentStep)) return;

        if (currentStep === 4) {
            // Crear cancha y asignar disciplinas
            await createCanchaAndDisciplines();
        } else if (currentStep === 5) {
            await uploadPhotos();
        } else {
            setCurrentStep(prev => (prev + 1) as Step);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            if (currentStep === 5) return; // No volver atrás si ya se creó la cancha
            setCurrentStep(prev => (prev - 1) as Step);
        } else {
            navigate(-1);
        }
    };

    const createCanchaAndDisciplines = async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            // 1. Crear Cancha
            const payload: CrearCanchaDto = {
                ...formData,
                idSede: Number(id),
                aforoMax: Number(formData.aforoMax),
                precio: Number(formData.precio),
            };

            const response = await fieldsService.crear(payload);
            const newId = response.idCancha;
            setCreatedCanchaId(newId);

            // 2. Asignar Disciplinas
            if (selectedDisciplinas.length > 0) {
                await fieldsService.asignarDisciplinas(newId, selectedDisciplinas);
            }

            setCurrentStep(5); // Ir a fotos
        } catch (err: any) {
            console.error('Error creating field:', err);
            setError(err.message || 'Error al crear la cancha');
        } finally {
            setLoading(false);
        }
    };

    const uploadPhotos = async () => {
        if (!createdCanchaId) return;
        setLoading(true);
        try {
            if (selectedFiles && selectedFiles.length > 0) {
                await fieldsService.subirFotos(createdCanchaId, selectedFiles);
            }
            setCurrentStep(6); // Success
        } catch (err: any) {
            console.error('Error uploading photos:', err);
            setError('Error al subir fotos');
        } finally {
            setLoading(false);
        }
    };

    const toggleDisciplina = (idDisciplina: number) => {
        setSelectedDisciplinas(prev =>
            prev.includes(idDisciplina)
                ? prev.filter(d => d !== idDisciplina)
                : [...prev, idDisciplina]
        );
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0: // Intro
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-fade-in relative z-10">
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white -z-10" />
                        <div className="w-32 h-32 bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                            <Trophy className="w-16 h-16 text-blue-600" />
                        </div>
                        <h1 className="text-5xl font-bold text-gray-900 tracking-tight">
                            Agrega una nueva cancha
                        </h1>
                        <p className="text-xl text-gray-500 max-w-lg">
                            Configura los detalles, horarios y deportes para empezar a recibir reservas.
                        </p>
                        <button
                            onClick={() => setCurrentStep(1)}
                            className="mt-8 px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                        >
                            Comenzar
                        </button>
                    </div>
                );

            case 1: // Info Básica
                return (
                    <div className="max-w-3xl mx-auto animate-fade-in">
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Información Básica</h2>
                            <p className="text-gray-500">Detalles principales de tu espacio deportivo.</p>
                        </div>

                        <div className="space-y-8">
                            {/* Nombre */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <label className="block text-sm font-medium text-gray-700 mb-3">Nombre de la Cancha <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none text-lg"
                                    placeholder="Ej: Cancha Principal"
                                    autoFocus
                                />
                            </div>

                            {/* Superficie */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <label className="block text-sm font-medium text-gray-700 mb-4">Tipo de Superficie <span className="text-red-500">*</span></label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {SURFACE_OPTIONS.map((option) => {
                                        const isSelected = formData.superficie === option.id;
                                        const Icon = option.icon;
                                        return (
                                            <button
                                                key={option.id}
                                                onClick={() => setFormData(prev => ({ ...prev, superficie: option.id }))}
                                                className={`
                                                    p-4 rounded-xl border-2 text-left transition-all flex flex-col gap-3
                                                    ${isSelected
                                                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                                        : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                                                    }
                                                `}
                                            >
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${option.color}`}>
                                                    <Icon size={20} />
                                                </div>
                                                <span className={`font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                                                    {option.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Dimensiones y Aforo */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                        <Ruler className="w-4 h-4 text-blue-500" />
                                        Dimensiones <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="dimensiones"
                                        value={formData.dimensiones}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                                        placeholder="Ej: 20x40m"
                                    />
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                        <Users className="w-4 h-4 text-blue-500" />
                                        Capacidad (Personas)
                                    </label>
                                    <input
                                        type="number"
                                        name="aforoMax"
                                        value={formData.aforoMax}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 2: // Características
                return (
                    <div className="max-w-3xl mx-auto animate-fade-in">
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Características y Reglas</h2>
                            <p className="text-gray-500">Define las condiciones de uso de la cancha.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Iluminación */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                                        Iluminación
                                    </label>
                                    <select
                                        name="iluminacion"
                                        value={formData.iluminacion}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none bg-white"
                                    >
                                        <option value="LED">LED (Alta calidad)</option>
                                        <option value="Halógena">Halógena (Estándar)</option>
                                        <option value="Natural">Natural (Solo día)</option>
                                    </select>
                                </div>

                                {/* Cubierta */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                            <Umbrella className="w-4 h-4 text-blue-500" />
                                            Cancha Techada
                                        </label>
                                        <p className="text-xs text-gray-500">¿Protegida de la lluvia/sol?</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="cubierta"
                                            checked={formData.cubierta}
                                            onChange={handleInputChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>

                            {/* Reglas */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-blue-500" />
                                        Reglas de Uso
                                    </label>
                                    <button
                                        onClick={() => setCustomRulesMode(!customRulesMode)}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        {customRulesMode ? <><Check className="w-3 h-3" /> Usar ejemplos</> : <><Edit3 className="w-3 h-3" /> Personalizado</>}
                                    </button>
                                </div>

                                {customRulesMode ? (
                                    <textarea
                                        name="reglasUso"
                                        value={formData.reglasUso}
                                        onChange={handleInputChange}
                                        rows={5}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none resize-none"
                                        placeholder="Escribe las reglas aquí..."
                                    />
                                ) : (
                                    <div className="space-y-2">
                                        {EXAMPLE_RULES.map((rule, idx) => {
                                            const isSelected = formData.reglasUso.includes(rule);
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => toggleRule(rule)}
                                                    className={`
                                                        w-full p-3 rounded-xl border text-left flex items-center gap-3 transition-all
                                                        ${isSelected
                                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                            : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50 text-gray-600'
                                                        }
                                                    `}
                                                >
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300'}`}>
                                                        {isSelected && <Check size={12} />}
                                                    </div>
                                                    <span className="text-sm">{rule}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 3: // Horarios y Precio
                return (
                    <div className="max-w-2xl mx-auto animate-fade-in">
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Horarios y Precio</h2>
                            <p className="text-gray-500">Define el valor y disponibilidad de la cancha.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <label className="block text-sm font-medium text-gray-700 mb-4 text-center">Precio por Hora</label>
                                <div className="relative max-w-xs mx-auto">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                                        <span className="text-green-600 font-bold text-lg">Bs</span>
                                    </div>
                                    <input
                                        type="number"
                                        name="precio"
                                        value={formData.precio}
                                        onChange={handleInputChange}
                                        className="w-full pl-16 pr-4 py-4 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-50 transition-all outline-none text-3xl font-bold text-center text-gray-900"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-blue-500" />
                                    Horario de Atención
                                </h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Apertura</label>
                                        <input
                                            type="time"
                                            name="horaApertura"
                                            value={formData.horaApertura}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-lg text-center"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Cierre</label>
                                        <input
                                            type="time"
                                            name="horaCierre"
                                            value={formData.horaCierre}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-lg text-center"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 4: // Disciplinas
                return (
                    <div className="max-w-4xl mx-auto animate-fade-in">
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Deportes</h2>
                            <p className="text-gray-500">Selecciona todos los deportes que se pueden practicar.</p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {disciplinas.map((disciplina) => {
                                const isSelected = selectedDisciplinas.includes(disciplina.idDisciplina);
                                return (
                                    <button
                                        key={disciplina.idDisciplina}
                                        onClick={() => toggleDisciplina(disciplina.idDisciplina)}
                                        className={`
                                            p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 text-center h-40 group
                                            ${isSelected
                                                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md transform scale-105'
                                                : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50 text-gray-600 hover:shadow-sm'
                                            }
                                        `}
                                    >
                                        <div className={`
                                            w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold
                                            ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500'}
                                        `}>
                                            {disciplina.nombre.charAt(0)}
                                        </div>
                                        <div>
                                            <span className="font-bold block">{disciplina.nombre}</span>
                                            <span className="text-xs opacity-75">{disciplina.categoria}</span>
                                        </div>
                                        {isSelected && (
                                            <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-sm">
                                                <Check size={14} />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );

            case 5: // Fotos
                return (
                    <div className="max-w-3xl mx-auto animate-fade-in text-center">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Galería de Fotos</h2>
                            <p className="text-gray-500">Muestra lo mejor de tu cancha a los usuarios.</p>
                        </div>

                        <div
                            className={`
                                border-3 border-dashed rounded-3xl p-12 transition-all cursor-pointer group
                                ${selectedFiles && selectedFiles.length > 0
                                    ? 'border-green-400 bg-green-50/30'
                                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30'
                                }
                            `}
                            onClick={triggerFileInput}
                        >
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => setSelectedFiles(e.target.files)}
                                className="hidden"
                                ref={fileInputRef}
                            />

                            <div className="flex flex-col items-center">
                                <div className={`
                                    w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-transform group-hover:scale-110
                                    ${selectedFiles && selectedFiles.length > 0 ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-500'}
                                `}>
                                    {selectedFiles && selectedFiles.length > 0 ? <Check size={40} /> : <Upload size={40} />}
                                </div>

                                {selectedFiles && selectedFiles.length > 0 ? (
                                    <>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedFiles.length} fotos seleccionadas</h3>
                                        <p className="text-gray-500 mb-6">Haz clic para cambiar la selección</p>
                                        <div className="grid grid-cols-3 gap-4 w-full max-w-lg mx-auto">
                                            {Array.from(selectedFiles).slice(0, 3).map((file, i) => (
                                                <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                                                    <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                            {selectedFiles.length > 3 && (
                                                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 font-medium">
                                                    +{selectedFiles.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Arrastra tus fotos aquí</h3>
                                        <p className="text-gray-500">o haz clic para explorar tus archivos</p>
                                        <p className="text-xs text-gray-400 mt-4">JPG, PNG hasta 10MB</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 6: // Success
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-fade-in relative z-10">
                        <div className="absolute inset-0 bg-gradient-to-b from-green-50/50 to-white -z-10" />
                        <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce-slow shadow-lg ring-8 ring-green-50">
                            <Check className="w-16 h-16 text-green-600" />
                        </div>
                        <h1 className="text-5xl font-bold text-gray-900 tracking-tight">¡Cancha Creada!</h1>
                        <p className="text-xl text-gray-500 max-w-lg">
                            Tu cancha ha sido configurada correctamente y ya está lista en el sistema.
                        </p>
                        <button
                            onClick={() => navigate('/owner/fields')}
                            className="mt-8 px-10 py-4 bg-gray-900 text-white rounded-full text-xl font-semibold shadow-xl hover:bg-gray-800 hover:scale-105 transition-all"
                        >
                            Ir a Mis Canchas
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans relative">
            {/* Header */}
            <header className="h-20 border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 bg-white/80 backdrop-blur-md z-50">
                <div className="flex items-center cursor-pointer" onClick={() => navigate(-1)}>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md mr-3 hover:shadow-lg transition-shadow">
                        <Trophy className="text-white w-6 h-6" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-gray-900">Rogu</span>
                </div>
            </header>

            {/* Progress Bar */}
            {currentStep > 0 && currentStep < 6 && (
                <div className="w-full h-1 bg-gray-100">
                    <div
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(37,99,235,0.5)]"
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

                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-400 font-medium hidden sm:block">
                                Paso {currentStep} de 5
                            </span>
                            <button
                                onClick={handleNext}
                                disabled={loading || !validateStep(currentStep)}
                                className={`
                                    px-8 py-3 rounded-xl font-semibold text-white shadow-lg transition-all flex items-center gap-2
                                    ${loading || !validateStep(currentStep)
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : 'bg-gray-900 hover:bg-gray-800 hover:scale-105 active:scale-95 shadow-gray-900/20'
                                    }
                                `}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin w-4 h-4" />
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
