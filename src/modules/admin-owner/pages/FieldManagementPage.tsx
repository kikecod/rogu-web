import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Check,
    LayoutGrid,
    Users,
    DollarSign,
    Clock,
    Zap,
    Shield,
    Ruler,
    CloudRain,
    AlertTriangle,
    Cigarette,
    Dog,
    Ban,
    Upload,
    Image,
    Loader2,
    ArrowLeft,
    Save,
    Trash2,
    X
} from 'lucide-react';
import { useAuth } from '@/auth/hooks/useAuth';
import { getImageUrl } from '@/core/config/api';

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

interface Foto {
    idFoto: number;
    urlFoto: string;
}

const EXAMPLE_RULES = [
    { id: 'shoes', text: 'Uso obligatorio de zapatillas', icon: Check },
    { id: 'smoke', text: 'Prohibido fumar', icon: Cigarette },
    { id: 'pets', text: 'No se permiten mascotas', icon: Dog },
    { id: 'alcohol', text: 'Prohibido bebidas alcohólicas', icon: Ban },
    { id: 'time', text: 'Respetar horarios', icon: Clock },
];

const FieldManagementPage: React.FC = () => {
    const navigate = useNavigate();
    const { id, idCancha } = useParams<{ id: string; idCancha: string }>();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [customRuleMode, setCustomRuleMode] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Estados
    const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
    const [selectedDisciplinas, setSelectedDisciplinas] = useState<number[]>([]);
    const [fotos, setFotos] = useState<Foto[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [uploadingPhotos, setUploadingPhotos] = useState(false);

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

    useEffect(() => {
        const loadData = async () => {
            try {
                // Load field data
                const fieldResponse = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL}/cancha/${idCancha}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    }
                );

                if (fieldResponse.ok) {
                    const fieldData = await fieldResponse.json();
                    setFormData({
                        nombre: fieldData.nombre || '',
                        superficie: fieldData.superficie || 'Sintética',
                        cubierta: fieldData.cubierta || false,
                        aforoMax: fieldData.aforoMax || 12,
                        dimensiones: fieldData.dimensiones || '',
                        reglasUso: fieldData.reglasUso || '',
                        iluminacion: fieldData.iluminacion || 'LED',
                        estado: fieldData.estado || 'Disponible',
                        precio: fieldData.precio || 0,
                        horaApertura: fieldData.horaApertura || '08:00',
                        horaCierre: fieldData.horaCierre || '22:00',
                    });

                    // Load photos
                    if (fieldData.fotos && Array.isArray(fieldData.fotos)) {
                        setFotos(fieldData.fotos);
                    }

                    // Load disciplines for this field
                    if (fieldData.partes && Array.isArray(fieldData.partes)) {
                        setSelectedDisciplinas(
                            fieldData.partes.map((p: any) => p.idDisciplina)
                        );
                    }
                }

                // Load all disciplines
                const disciplinasResponse = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL}/disciplina`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    }
                );

                if (disciplinasResponse.ok) {
                    const data = await disciplinasResponse.json();
                    setDisciplinas(data);
                }
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [idCancha]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const toggleRule = (ruleText: string) => {
        setFormData((prev) => {
            const currentRules = prev.reglasUso
                ? prev.reglasUso.split(', ').filter(Boolean)
                : [];
            const exists = currentRules.includes(ruleText);

            let newRules;
            if (exists) {
                newRules = currentRules.filter((r) => r !== ruleText);
            } else {
                newRules = [...currentRules, ruleText];
            }

            return {
                ...prev,
                reglasUso: newRules.join(', '),
            };
        });
    };

    const toggleDisciplina = (id: number) => {
        setSelectedDisciplinas((prev) =>
            prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
        );
    };

    const handleSave = async () => {
        if (!idCancha) return;

        setSubmitting(true);
        try {
            // Update field data
            const payload = {
                ...formData,
                aforoMax: Number(formData.aforoMax),
                precio: Number(formData.precio),
            };

            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/cancha/${idCancha}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (response.ok) {
                // Update disciplines
                await updateDisciplinas();
                // Upload new photos if any
                if (selectedFiles && selectedFiles.length > 0) {
                    await uploadPhotos();
                }
                alert('Cancha actualizada exitosamente');
                navigate(`/owner/spaces/${id}`);
            } else {
                const error = await response.json();
                alert('Error: ' + (error.message || 'Error al actualizar la cancha'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al actualizar la cancha');
        } finally {
            setSubmitting(false);
        }
    };

    const updateDisciplinas = async () => {
        if (!idCancha) return;

        try {
            // First, delete all existing disciplines for this field
            // Note: This depends on your backend API structure
            // You might need to adjust this based on your actual endpoints

            // Then add the selected disciplines
            for (const idDisciplina of selectedDisciplinas) {
                await fetch(`${import.meta.env.VITE_API_BASE_URL}/parte`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({
                        idCancha: Number(idCancha),
                        idDisciplina: idDisciplina,
                    }),
                });
            }
        } catch (error) {
            console.error('Error updating disciplines:', error);
        }
    };

    const uploadPhotos = async () => {
        if (!idCancha || !selectedFiles) return;

        setUploadingPhotos(true);
        try {
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                const formData = new FormData();
                formData.append('image', file);

                await fetch(
                    `${import.meta.env.VITE_API_BASE_URL}/fotos/upload/cancha/${idCancha}`,
                    {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                        body: formData,
                    }
                );
            }
        } catch (error) {
            console.error('Error uploading photos:', error);
        } finally {
            setUploadingPhotos(false);
        }
    };

    const handleDeletePhoto = async (idFoto: number) => {
        if (!confirm('¿Eliminar esta foto?')) return;

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/fotos/${idFoto}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            if (response.ok) {
                setFotos((prev) => prev.filter((f) => f.idFoto !== idFoto));
            }
        } catch (error) {
            console.error('Error deleting photo:', error);
        }
    };

    const handleDelete = async () => {
        if (!idCancha) return;

        setSubmitting(true);
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/cancha/${idCancha}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            if (response.ok) {
                alert('Cancha eliminada exitosamente');
                navigate(`/owner/spaces/${id}`);
            } else {
                alert('Error al eliminar la cancha');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar la cancha');
        } finally {
            setSubmitting(false);
            setShowDeleteConfirm(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/owner/spaces/${id}`)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                            Editar Cancha
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Modifica los detalles de tu cancha
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-colors font-medium"
                    >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={submitting}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 hover:shadow-primary-300 hover:-translate-y-0.5 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Guardar Cambios
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Main Form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <LayoutGrid className="w-5 h-5 text-primary-600" />
                            Información Básica
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre de la Cancha <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                                    placeholder="Ej: Cancha 1 - Fútbol 5"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Superficie
                                    </label>
                                    <select
                                        name="superficie"
                                        value={formData.superficie}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none bg-white"
                                    >
                                        <option value="Sintética">Sintética</option>
                                        <option value="Pasto Natural">Pasto Natural</option>
                                        <option value="Parquet">Parquet</option>
                                        <option value="Cemento">Cemento</option>
                                        <option value="Tierra">Tierra</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Iluminación
                                    </label>
                                    <select
                                        name="iluminacion"
                                        value={formData.iluminacion}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none bg-white"
                                    >
                                        <option value="LED">LED</option>
                                        <option value="Halógena">Halógena</option>
                                        <option value="Natural">Natural (Solo día)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                <CloudRain className="w-5 h-5 text-gray-400" />
                                <span className="text-sm font-medium text-gray-700">
                                    Cancha Techada
                                </span>
                                <label className="ml-auto relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="cubierta"
                                        checked={formData.cubierta}
                                        onChange={handleInputChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Details & Pricing */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            Detalles y Precios
                        </h2>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Precio por Hora (Bs.) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="precio"
                                        value={formData.precio}
                                        onChange={handleInputChange}
                                        min="0"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Capacidad Máxima <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="aforoMax"
                                        value={formData.aforoMax}
                                        onChange={handleInputChange}
                                        min="1"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                                        placeholder="12"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Estado
                                    </label>
                                    <select
                                        name="estado"
                                        value={formData.estado}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none bg-white"
                                    >
                                        <option value="Disponible">Disponible</option>
                                        <option value="Mantenimiento">Mantenimiento</option>
                                        <option value="Ocupado">Ocupado</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Dimensiones <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="dimensiones"
                                    value={formData.dimensiones}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                                    placeholder="Ej: 20x40 metros"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Schedule */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                            Horario de Atención
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Hora de Apertura
                                </label>
                                <input
                                    type="time"
                                    name="horaApertura"
                                    value={formData.horaApertura}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Hora de Cierre
                                </label>
                                <input
                                    type="time"
                                    name="horaCierre"
                                    value={formData.horaCierre}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Rules */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-blue-600" />
                                Reglas de Uso
                            </h2>
                            <button
                                onClick={() => setCustomRuleMode(!customRuleMode)}
                                className="text-sm text-primary-600 font-medium hover:text-primary-700 transition-colors"
                            >
                                {customRuleMode ? 'Usar predefinidas' : 'Escribir personalizada'}
                            </button>
                        </div>

                        {customRuleMode ? (
                            <textarea
                                name="reglasUso"
                                value={formData.reglasUso}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none resize-none"
                                placeholder="Escribe las reglas de uso personalizadas..."
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
                                                    ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                                                    : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50 text-gray-600'
                                                }
                                            `}
                                        >
                                            <div
                                                className={`
                                                p-2 rounded-full
                                                ${isSelected ? 'bg-primary-200 text-primary-700' : 'bg-gray-100 text-gray-400'}
                                            `}
                                            >
                                                <rule.icon className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium text-sm">{rule.text}</span>
                                            {isSelected && (
                                                <Check className="w-4 h-4 ml-auto text-primary-600" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Disciplines & Photos */}
                <div className="space-y-6">
                    {/* Disciplines */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-orange-600" />
                            Disciplinas
                        </h2>

                        <div className="space-y-2">
                            {disciplinas.map((disciplina) => {
                                const isSelected = selectedDisciplinas.includes(
                                    disciplina.idDisciplina
                                );
                                return (
                                    <div
                                        key={disciplina.idDisciplina}
                                        onClick={() => toggleDisciplina(disciplina.idDisciplina)}
                                        className={`
                                            p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3
                                            ${isSelected
                                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50 text-gray-600'
                                            }
                                        `}
                                    >
                                        <Zap className="w-4 h-4" />
                                        <span className="font-medium text-sm flex-1">
                                            {disciplina.nombre}
                                        </span>
                                        {isSelected && (
                                            <Check className="w-4 h-4 text-primary-600" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Photos */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Image className="w-5 h-5 text-purple-600" />
                            Fotos
                        </h2>

                        {/* Existing Photos */}
                        {fotos.length > 0 && (
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {fotos.map((foto) => (
                                    <div
                                        key={foto.idFoto}
                                        className="relative group rounded-xl overflow-hidden aspect-square"
                                    >
                                        <img
                                            src={getImageUrl(foto.urlFoto)}
                                            alt="Cancha"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={() => handleDeletePhoto(foto.idFoto)}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Upload New Photos */}
                        <label className="block p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-500 transition-colors cursor-pointer text-center">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <span className="text-sm text-gray-600 block mb-1">
                                Agregar más fotos
                            </span>
                            <span className="text-xs text-gray-400">
                                JPG, PNG - Max 10MB
                            </span>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => setSelectedFiles(e.target.files)}
                            />
                        </label>

                        {selectedFiles && selectedFiles.length > 0 && (
                            <div className="mt-3 text-sm text-green-600 flex items-center gap-2">
                                <Check className="w-4 h-4" />
                                {selectedFiles.length} archivo(s) listo(s) para subir
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 scale-100 animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
                            ¿Eliminar cancha?
                        </h3>
                        <p className="text-gray-600 text-center mb-8">
                            Esta acción no se puede deshacer. Se eliminarán todas las fotos y
                            reservas asociadas.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={submitting}
                                className="flex-1 px-6 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors shadow-lg disabled:opacity-50"
                            >
                                {submitting ? 'Eliminando...' : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FieldManagementPage;
