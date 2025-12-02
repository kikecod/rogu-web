import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    MapPin,
    Building2,
    Edit,
    Trash2,
    Image as ImageIcon,
    CheckCircle,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { useAuth } from '@/auth/hooks/useAuth';
import { ROUTES } from '@/config/routes';
import { getImageUrl } from '@/core/config/api';
import { SedePhotoManagement } from '@/admin-panel/sedes/components';

interface Sede {
    idSede: number;
    nombre: string;
    direccion: string;
    ciudad: string;
    estado: string;
    verificada: boolean;
    fotoPrincipal?: string;
    fotos?: { urlFoto: string }[];
    canchas?: any[];
}

const OwnerSpacesPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [sedes, setSedes] = useState<Sede[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Photo Management State
    const [photoModalOpen, setPhotoModalOpen] = useState(false);
    const [selectedSedeForPhotos, setSelectedSedeForPhotos] = useState<Sede | null>(null);

    // Delete State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [sedeToDelete, setSedeToDelete] = useState<Sede | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadSedes = async () => {
        if (!user?.idPersona) return;
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/sede/duenio/${user.idPersona}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                // Filter to ensure we only get this user's sedes (API should do this but double check)
                const mySedes = data.filter((s: any) => s.idPersonaD === user.idPersona);
                setSedes(mySedes);
            }
        } catch (error) {
            console.error('Error loading sedes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSedes();
    }, [user]);

    const handleDeleteSede = async () => {
        if (!sedeToDelete) return;
        setIsDeleting(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/sede/${sedeToDelete.idSede}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                setSedes(prev => prev.filter(s => s.idSede !== sedeToDelete.idSede));
                setDeleteModalOpen(false);
                setSedeToDelete(null);
            } else {
                alert('No se pudo eliminar la sede. Asegúrate de que no tenga reservas activas.');
            }
        } catch (error) {
            console.error('Error deleting sede:', error);
            alert('Ocurrió un error al eliminar la sede.');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredSedes = sedes.filter(sede =>
        sede.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sede.ciudad?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getSedeImage = (sede: Sede) => {
        if (sede.fotoPrincipal) return getImageUrl(sede.fotoPrincipal);
        if (sede.fotos && sede.fotos.length > 0) return getImageUrl(sede.fotos[0].urlFoto);
        return '/placeholder-venue.jpg';
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mis Sedes</h1>
                    <p className="text-gray-500 mt-1">Gestiona tus complejos deportivos</p>
                </div>
                <button
                    onClick={() => navigate(ROUTES.owner.createVenue)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 hover:shadow-primary-300 hover:-translate-y-0.5 font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Nueva Sede
                </button>
            </div>

            {/* Search and Filters */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar por nombre o ciudad..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                />
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
                </div>
            ) : filteredSedes.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building2 className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No tienes sedes registradas</h3>
                    <p className="text-gray-500 mt-1 mb-6">Comienza creando tu primer complejo deportivo.</p>
                    <button
                        onClick={() => navigate(ROUTES.owner.createVenue)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Crear Sede
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSedes.map((sede) => (
                        <div
                            key={sede.idSede}
                            className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
                        >
                            {/* Image Area */}
                            <div className="relative h-48 overflow-hidden bg-gray-100">
                                <img
                                    src={getSedeImage(sede)}
                                    alt={sede.nombre}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    onError={(e) => (e.currentTarget.src = '/placeholder-venue.jpg')}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                {/* Status Badge */}
                                <div className="absolute top-3 right-3">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-md shadow-sm ${sede.estado === 'Activo'
                                        ? 'bg-green-500/90 text-white'
                                        : 'bg-gray-500/90 text-white'
                                        }`}>
                                        {sede.estado}
                                    </span>
                                </div>

                                {/* Actions Overlay (Desktop) */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-end gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedSedeForPhotos(sede);
                                            setPhotoModalOpen(true);
                                        }}
                                        className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-gray-700 hover:text-primary-600 hover:bg-white transition-colors shadow-sm"
                                        title="Gestionar Fotos"
                                    >
                                        <ImageIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(ROUTES.owner.editVenue(sede.idSede));
                                        }}
                                        className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-gray-700 hover:text-blue-600 hover:bg-white transition-colors shadow-sm"
                                        title="Editar Información"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSedeToDelete(sede);
                                            setDeleteModalOpen(true);
                                        }}
                                        className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-gray-700 hover:text-red-600 hover:bg-white transition-colors shadow-sm"
                                        title="Eliminar Sede"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
                                        {sede.nombre}
                                    </h3>
                                    {sede.verificada ? (
                                        <div title="Verificada">
                                            <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                        </div>
                                    ) : (
                                        <div title="Pendiente de verificación">
                                            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center text-sm text-gray-500 mb-4">
                                    <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
                                    <span className="line-clamp-1">{sede.ciudad}, {sede.direccion}</span>
                                </div>

                                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <div className="text-sm font-medium text-gray-600">
                                        {sede.canchas?.length || 0} Canchas
                                    </div>
                                    <button
                                        onClick={() => navigate(ROUTES.owner.spaceDetail(sede.idSede))}
                                        className="text-sm font-semibold text-primary-600 hover:text-primary-700 hover:underline"
                                    >
                                        Ver Detalles
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && sedeToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 scale-100 animate-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 mx-auto">
                            <Trash2 className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-center text-gray-900 mb-2">¿Eliminar Sede?</h3>
                        <p className="text-center text-gray-500 mb-6">
                            Estás a punto de eliminar <strong>{sedeToDelete.nombre}</strong>. Esta acción no se puede deshacer y eliminará todas las canchas y reservas asociadas.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteModalOpen(false)}
                                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteSede}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Eliminando...
                                    </>
                                ) : (
                                    'Eliminar'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Photo Management Modal */}
            {selectedSedeForPhotos && (
                <SedePhotoManagement
                    sede={{ idSede: selectedSedeForPhotos.idSede, nombre: selectedSedeForPhotos.nombre }}
                    isOpen={photoModalOpen}
                    onClose={() => {
                        setPhotoModalOpen(false);
                        setSelectedSedeForPhotos(null);
                        loadSedes(); // Reload to show new cover photo if changed
                    }}
                />
            )}
        </div>
    );
};

export default OwnerSpacesPage;
