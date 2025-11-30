import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Edit2, Trash2, Camera, Tag,
    Clock, Users, MapPin, Zap, Shield, DollarSign,
    Loader2, AlertCircle, Calendar, Image as ImageIcon,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import PhotoManagement from '../components/PhotoManagement';
import CalendarioReservasPage from '../../analytics/pages/CalendarioReservasPage';
import FieldFormWizard from '../components/FieldFormWizard';
import { getApiUrl } from '@/core/config/api';

interface Cancha {
    idCancha: number;
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
    fotos?: any[];
    parte?: any[];
    id_Sede?: number;
}

interface Disciplina {
    idDisciplina: number;
    nombre: string;
    categoria: string;
    descripcion: string;
}

const FieldManagementPage: React.FC = () => {
    const { id, idCancha } = useParams<{ id: string; idCancha: string }>();
    const navigate = useNavigate();

    const [cancha, setCancha] = useState<Cancha | null>(null);
    const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showForm, setShowForm] = useState(false);
    const [showDisciplinaModal, setShowDisciplinaModal] = useState(false);
    const [selectedDisciplinas, setSelectedDisciplinas] = useState<number[]>([]);
    const [showFotoModal, setShowFotoModal] = useState(false);
    const [showReservas, setShowReservas] = useState(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    // Load field data
    const loadCancha = async () => {
        if (!idCancha) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/cancha/${idCancha}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                const data = await response.json();

                // Load parts (disciplines) for the field
                try {
                    const parteResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/parte`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    });

                    if (parteResponse.ok) {
                        const allPartes = await parteResponse.json();
                        data.parte = allPartes.filter((parte: any) => parte.idCancha === data.idCancha);
                    } else {
                        data.parte = [];
                    }
                } catch (error) {
                    data.parte = [];
                }

                setCancha(data);
            } else {
                setError('No se pudo cargar la cancha');
            }
        } catch (err: any) {
            console.error('Error loading cancha:', err);
            setError(err.message || 'Error al cargar la cancha');
        }
    };

    // Load disciplines
    const loadDisciplinas = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(getApiUrl('/disciplina'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const allDisciplinas = await response.json();
                setDisciplinas(allDisciplinas);
            }
        } catch (error) {
            console.error('Error loading disciplinas:', error);
        }
    };

    useEffect(() => {
        Promise.all([loadCancha(), loadDisciplinas()]).finally(() => setLoading(false));
    }, [idCancha]);

    const handleDelete = async () => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta cancha?')) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/cancha/${idCancha}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                navigate(-1); // Go back to venue management
            } else {
                alert('Error al eliminar la cancha');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar la cancha');
        }
    };

    const openDisciplinaModal = () => {
        if (!cancha) return;
        const canchaParteDisciplinas =
            cancha.parte?.map(p => p.idDisciplina).filter(id => id) || [];
        setSelectedDisciplinas(canchaParteDisciplinas);
        setShowDisciplinaModal(true);
    };

    const saveDisciplinas = async () => {
        if (!cancha) return;

        try {
            // Delete existing parts
            if (cancha.parte && cancha.parte.length > 0) {
                for (const parte of cancha.parte) {
                    try {
                        await fetch(
                            `${import.meta.env.VITE_API_BASE_URL}/parte/${cancha.idCancha}/${parte.idDisciplina}`,
                            {
                                method: 'DELETE',
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                                },
                            }
                        );
                    } catch (deleteError) {
                        // Continue if error
                    }
                }
            }

            // Add new selected disciplines
            for (const idDisciplina of selectedDisciplinas) {
                try {
                    await fetch(`${import.meta.env.VITE_API_BASE_URL}/parte`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                        body: JSON.stringify({
                            idCancha: cancha.idCancha,
                            idDisciplina: idDisciplina,
                        }),
                    });
                } catch (error) {
                    // Continue if error
                }
            }

            await loadCancha();
            setShowDisciplinaModal(false);
        } catch (error) {
            console.error('Error saving disciplinas:', error);
            alert('Error al guardar las disciplinas');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            </div>
        );
    }

    if (error || !cancha) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Error al cargar la cancha</h2>
                <p className="text-gray-600 mb-4">{error || 'Cancha no encontrada'}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Volver
                </button>
            </div>
        );
    }

    // If showing reservations
    if (showReservas) {
        return (
            <CalendarioReservasPage
                cancha={cancha}
                onBack={() => setShowReservas(false)}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span className="font-medium">Volver</span>
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                {/* Photo Carousel */}
                <div className="mb-8">
                    <div className="relative rounded-2xl overflow-hidden bg-gray-900">
                        {cancha.fotos && cancha.fotos.length > 0 ? (
                            <div className="relative h-[400px]">
                                <img
                                    src={cancha.fotos[currentPhotoIndex]?.urlFoto || '/placeholder-field.jpg'}
                                    alt={cancha.nombre}
                                    className="w-full h-full object-cover transition-opacity duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                {/* Navigation Buttons */}
                                {cancha.fotos.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setCurrentPhotoIndex((prev) => (prev === 0 ? cancha.fotos!.length - 1 : prev - 1))}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-full transition-colors border border-white/30"
                                        >
                                            <ChevronLeft className="h-6 w-6" />
                                        </button>
                                        <button
                                            onClick={() => setCurrentPhotoIndex((prev) => (prev === cancha.fotos!.length - 1 ? 0 : prev + 1))}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-full transition-colors border border-white/30"
                                        >
                                            <ChevronRight className="h-6 w-6" />
                                        </button>
                                    </>
                                )}

                                {/* Photo Indicators */}
                                {cancha.fotos.length > 1 && (
                                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
                                        {cancha.fotos.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentPhotoIndex(index)}
                                                className={`h-2 rounded-full transition-all ${index === currentPhotoIndex
                                                        ? 'w-8 bg-white'
                                                        : 'w-2 bg-white/50 hover:bg-white/75'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-[400px] flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                                <div className="text-center">
                                    <ImageIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-400 text-lg font-medium">No hay fotos disponibles</p>
                                </div>
                            </div>
                        )}

                        {/* Gestionar Fotos Button */}
                        <div className="absolute bottom-4 right-4">
                            <button
                                onClick={() => setShowFotoModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-lg transition-colors border border-white/30"
                            >
                                <Camera className="h-5 w-5" />
                                Gestionar Fotos
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title and Status */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{cancha.nombre}</h1>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${cancha.estado === 'Disponible'
                                                    ? 'bg-green-100 text-green-700'
                                                    : cancha.estado === 'Mantenimiento' || cancha.estado === 'En Mantenimiento'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-red-100 text-red-700'
                                                }`}
                                        >
                                            {cancha.estado}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {(cancha.parte && cancha.parte.length) || 0} disciplinas
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Disciplines with Manage Button */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Disciplinas
                                    </p>
                                    <button
                                        onClick={openDisciplinaModal}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors shadow-sm border border-purple-200 hover:shadow-md"
                                    >
                                        <Tag className="h-4 w-4" />
                                        Gestionar Disciplinas
                                    </button>
                                </div>
                                {cancha.parte && cancha.parte.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {cancha.parte.map((parte: any, index: number) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium border border-blue-200"
                                            >
                                                {parte.disciplina?.nombre || `Disciplina ${parte.idDisciplina}`}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">No hay disciplinas asignadas</p>
                                )}
                            </div>

                            {/* Schedule */}
                            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                    Horario: <span className="font-semibold text-gray-900">{cancha.horaApertura} - {cancha.horaCierre}</span>
                                </span>
                            </div>
                        </div>

                        {/* Specifications */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Especificaciones</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-purple-50">
                                        <MapPin className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Superficie</p>
                                        <p className="text-sm font-semibold text-gray-900">{cancha.superficie}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-green-50">
                                        <Users className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Aforo</p>
                                        <p className="text-sm font-semibold text-gray-900">{cancha.aforoMax} personas</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-yellow-50">
                                        <Zap className="h-5 w-5 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Iluminación</p>
                                        <p className="text-sm font-semibold text-gray-900">{cancha.iluminacion}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-50">
                                        <Shield className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Cubierta</p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {cancha.cubierta ? 'Sí' : 'No'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-indigo-50">
                                        <MapPin className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Dimensiones</p>
                                        <p className="text-sm font-semibold text-gray-900">{cancha.dimensiones}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-emerald-50">
                                        <DollarSign className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Precio</p>
                                        <p className="text-sm font-semibold text-emerald-600">Bs. {cancha.precio}/hora</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rules */}
                        {cancha.reglasUso && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-3">Reglas de Uso</h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                    {cancha.reglasUso}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Actions */}
                    <div className="space-y-6">
                        {/* Actions Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Acciones</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => setShowForm(true)}
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
                                    Eliminar Cancha
                                </button>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Gestión de Reservas</h3>
                            <button
                                onClick={() => setShowReservas(true)}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-100 text-blue-700 font-semibold hover:from-blue-100 hover:to-indigo-200 transition-all shadow-sm hover:shadow-md"
                            >
                                <Calendar className="h-5 w-5" />
                                <span>Ver Calendario</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Wizard Modal */}
            {showForm && cancha && (
                <FieldFormWizard
                    initialData={{
                        idCancha: cancha.idCancha,
                        nombre: cancha.nombre,
                        superficie: cancha.superficie,
                        cubierta: cancha.cubierta,
                        aforoMax: cancha.aforoMax,
                        dimensiones: cancha.dimensiones,
                        reglasUso: cancha.reglasUso,
                        iluminacion: cancha.iluminacion,
                        estado: cancha.estado,
                        precio: cancha.precio,
                        horaApertura: cancha.horaApertura,
                        horaCierre: cancha.horaCierre,
                    }}
                    isEditing={true}
                    idSede={cancha.id_Sede || Number(id)}
                    onComplete={() => {
                        setShowForm(false);
                        loadCancha();
                    }}
                    onCancel={() => {
                        setShowForm(false);
                    }}
                />
            )}

            {/* Disciplines Modal */}
            {showDisciplinaModal && cancha && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-purple-50 to-indigo-50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    Disciplinas para {cancha.nombre}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Selecciona las disciplinas disponibles en esta cancha
                                </p>
                            </div>
                            <button
                                onClick={() => setShowDisciplinaModal(false)}
                                className="p-2 rounded-full bg-white hover:bg-gray-100 text-gray-500 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="max-h-96 overflow-y-auto px-6 py-4 space-y-3">
                            {disciplinas.map(disciplina => (
                                <div
                                    key={disciplina.idDisciplina}
                                    className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 hover:bg-gray-100 transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedDisciplinas.includes(disciplina.idDisciplina)}
                                        onChange={e => {
                                            if (e.target.checked) {
                                                setSelectedDisciplinas([...selectedDisciplinas, disciplina.idDisciplina]);
                                            } else {
                                                setSelectedDisciplinas(
                                                    selectedDisciplinas.filter(id => id !== disciplina.idDisciplina)
                                                );
                                            }
                                        }}
                                        className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-gray-900">
                                            {disciplina.nombre}
                                        </h4>
                                        <p className="text-xs text-gray-500">{disciplina.categoria}</p>
                                        <p className="mt-1 text-xs text-gray-400">
                                            {disciplina.descripcion}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4 bg-gray-50">
                            <button
                                onClick={() => setShowDisciplinaModal(false)}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={saveDisciplinas}
                                className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition-colors"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Photo Management Modal */}
            {cancha && (
                <PhotoManagement
                    cancha={cancha}
                    isOpen={showFotoModal}
                    onClose={() => {
                        setShowFotoModal(false);
                        loadCancha();
                    }}
                />
            )}
        </div>
    );
};

export default FieldManagementPage;
