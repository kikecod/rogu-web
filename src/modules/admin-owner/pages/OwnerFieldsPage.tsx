import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Home,
    Filter,
    Search,
    Plus,
    Building2,
    X,
    MapPin,
    Users,
    DollarSign,
    MoreVertical,
    Edit,
    Trash2,
    Calendar,
    LayoutGrid,
    AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/auth/hooks/useAuth';
import { getImageUrl } from '@/core/config/api';
import { ROUTES } from '@/config/routes';

interface Cancha {
    idCancha: number;
    nombre: string;
    superficie: string;
    precio: number;
    aforoMax: number;
    estado: string;
    idSede: number;
    sedeNombre?: string; // Helper for display
    fotos?: { urlFoto: string }[];
}

interface Sede {
    idSede: number;
    nombre: string;
    ciudad?: string;
    canchas?: Cancha[];
}

const OwnerFieldsPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [sedes, setSedes] = useState<Sede[]>([]);
    const [allCanchas, setAllCanchas] = useState<Cancha[]>([]);
    const [loading, setLoading] = useState(true);
    const [showVenueSelector, setShowVenueSelector] = useState(false);
    const [deletingCanchaId, setDeletingCanchaId] = useState<number | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSedeId, setSelectedSedeId] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');

    useEffect(() => {
        const loadData = async () => {
            if (!user?.idPersona) return;

            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/sede/duenio/${user.idPersona}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.ok) {
                    const allSedesData = await response.json();
                    const mySedes = allSedesData.filter((sede: any) => sede.idPersonaD === user.idPersona);
                    setSedes(mySedes);

                    // Flatten canchas from all sedes
                    const flattenedCanchas: Cancha[] = [];
                    mySedes.forEach((sede: Sede) => {
                        if (sede.canchas && Array.isArray(sede.canchas)) {
                            sede.canchas.forEach((cancha: any) => {
                                flattenedCanchas.push({
                                    ...cancha,
                                    idSede: sede.idSede,
                                    sedeNombre: sede.nombre
                                });
                            });
                        }
                    });
                    setAllCanchas(flattenedCanchas);
                }
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user]);

    const handleCreateCourt = (idSede: number) => {
        setShowVenueSelector(false);
        navigate(ROUTES.owner.createField(idSede));
    };

    const handleDeleteCourt = async (idCancha: number) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/cancha/${idCancha}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                // Remove from local state
                setAllCanchas(prev => prev.filter(c => c.idCancha !== idCancha));
                setDeletingCanchaId(null);
            } else {
                alert('Error al eliminar la cancha');
            }
        } catch (error) {
            console.error('Error deleting court:', error);
            alert('Error al eliminar la cancha');
        }
    };

    const getCanchaImage = (cancha: Cancha) => {
        if (cancha.fotos && cancha.fotos.length > 0) return getImageUrl(cancha.fotos[0].urlFoto);
        return '/placeholder-court.jpg'; // You might want a specific placeholder for courts
    };

    // Filter Logic
    const filteredCanchas = allCanchas.filter(cancha => {
        const matchesSearch = cancha.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (cancha.sedeNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
        const matchesSede = selectedSedeId === 'all' || cancha.idSede.toString() === selectedSedeId;
        const matchesStatus = selectedStatus === 'all' || cancha.estado === selectedStatus;

        return matchesSearch && matchesSede && matchesStatus;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mis Canchas</h1>
                    <p className="text-gray-500 mt-1">Administra todas tus canchas y sus disponibilidades</p>
                </div>
                <button
                    onClick={() => setShowVenueSelector(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 hover:shadow-primary-300 hover:-translate-y-0.5 font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Nueva Cancha
                </button>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar cancha o sede..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                    />
                </div>

                <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <select
                        value={selectedSedeId}
                        onChange={(e) => setSelectedSedeId(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none bg-white min-w-[160px]"
                    >
                        <option value="all">Todas las Sedes</option>
                        {sedes.map(sede => (
                            <option key={sede.idSede} value={sede.idSede}>{sede.nombre}</option>
                        ))}
                    </select>

                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none bg-white min-w-[140px]"
                    >
                        <option value="all">Todos los Estados</option>
                        <option value="Disponible">Disponible</option>
                        <option value="Mantenimiento">Mantenimiento</option>
                        <option value="Ocupado">Ocupado</option>
                    </select>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
                </div>
            ) : filteredCanchas.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <LayoutGrid className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No se encontraron canchas</h3>
                    <p className="text-gray-500 mt-1 mb-6">
                        {searchTerm || selectedSedeId !== 'all' || selectedStatus !== 'all'
                            ? 'Intenta ajustar los filtros de búsqueda.'
                            : 'Comienza creando tu primera cancha en una de tus sedes.'}
                    </p>
                    {(searchTerm || selectedSedeId !== 'all' || selectedStatus !== 'all') ? (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedSedeId('all');
                                setSelectedStatus('all');
                            }}
                            className="text-primary-600 font-medium hover:underline"
                        >
                            Limpiar filtros
                        </button>
                    ) : (
                        <button
                            onClick={() => setShowVenueSelector(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Crear Cancha
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCanchas.map((cancha) => (
                        <div
                            key={cancha.idCancha}
                            className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
                        >
                            {/* Image Area */}
                            <div className="relative h-48 overflow-hidden bg-gray-100">
                                <img
                                    src={getCanchaImage(cancha)}
                                    alt={cancha.nombre}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    onError={(e) => (e.currentTarget.src = '/placeholder-court.jpg')}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                <div className="absolute top-3 right-3">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-md shadow-sm ${cancha.estado === 'Disponible' ? 'bg-green-500/90 text-white' :
                                            cancha.estado === 'Mantenimiento' ? 'bg-yellow-500/90 text-white' :
                                                'bg-red-500/90 text-white'
                                        }`}>
                                        {cancha.estado}
                                    </span>
                                </div>

                                {/* Actions Overlay */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-end gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/owner/spaces/${cancha.idSede}/fields/${cancha.idCancha}`);
                                        }}
                                        className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-gray-700 hover:text-blue-600 hover:bg-white transition-colors shadow-sm"
                                        title="Editar Cancha"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeletingCanchaId(cancha.idCancha);
                                        }}
                                        className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-gray-700 hover:text-red-600 hover:bg-white transition-colors shadow-sm"
                                        title="Eliminar Cancha"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="mb-3">
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-primary-600 mb-1">
                                        <Building2 className="w-3 h-3" />
                                        <span className="truncate">{cancha.sedeNombre || 'Sede desconocida'}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
                                        {cancha.nombre}
                                    </h3>
                                </div>

                                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-500 mb-4">
                                    <div className="flex items-center gap-2">
                                        <LayoutGrid className="w-4 h-4 text-gray-400" />
                                        <span className="truncate">{cancha.superficie}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        <span>{cancha.aforoMax} pers.</span>
                                    </div>
                                    <div className="flex items-center gap-2 col-span-2">
                                        <DollarSign className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium text-gray-900">Bs. {cancha.precio}/hora</span>
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <button
                                        onClick={() => navigate(`/owner/spaces/${cancha.idSede}/fields/${cancha.idCancha}`)}
                                        className="text-sm font-semibold text-primary-600 hover:text-primary-700 hover:underline"
                                    >
                                        Ver Detalles
                                    </button>
                                    <button
                                        onClick={() => navigate(`/owner/spaces/${cancha.idSede}/fields/${cancha.idCancha}`)} // Assuming calendar is in details or separate
                                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                        title="Ver Calendario"
                                    >
                                        <Calendar className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Venue Selector Modal */}
            {showVenueSelector && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Selecciona una Sede</h2>
                                <p className="text-gray-600 mt-1">¿A qué sede pertenece la nueva cancha?</p>
                            </div>
                            <button
                                onClick={() => setShowVenueSelector(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
                            {sedes.length === 0 ? (
                                <div className="text-center py-12">
                                    <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        No tienes sedes creadas
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        Primero debes crear una sede antes de agregar canchas.
                                    </p>
                                    <button
                                        onClick={() => {
                                            setShowVenueSelector(false);
                                            navigate(ROUTES.owner.createVenue);
                                        }}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Crear Sede
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {sedes.map((sede) => (
                                        <button
                                            key={sede.idSede}
                                            onClick={() => handleCreateCourt(sede.idSede)}
                                            className="p-4 rounded-xl border-2 border-gray-100 hover:border-primary-500 hover:bg-primary-50 transition-all text-left group flex items-center gap-4"
                                        >
                                            <div className="w-12 h-12 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                                <Building2 className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 mb-0.5 truncate">
                                                    {sede.nombre}
                                                </h3>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {sede.ciudad || 'Sin ubicación'}
                                                </p>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-primary-600 shadow-sm">
                                                <Plus className="w-4 h-4" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingCanchaId && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 scale-100 animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
                            ¿Eliminar cancha?
                        </h3>
                        <p className="text-gray-600 text-center mb-8">
                            Esta acción no se puede deshacer. Se eliminarán todas las fotos y reservas asociadas.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setDeletingCanchaId(null)}
                                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleDeleteCourt(deletingCanchaId)}
                                className="flex-1 px-6 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors shadow-lg"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerFieldsPage;
