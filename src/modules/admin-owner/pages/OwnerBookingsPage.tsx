import React, { useState, useEffect } from 'react';
import { useAuth } from '@/auth/hooks/useAuth';
import CalendarioReservasPage from '../../analytics/pages/CalendarioReservasPage';
import { Building2, MapPin, Calendar as CalendarIcon, ChevronRight } from 'lucide-react';

interface Cancha {
    idCancha: number;
    nombre: string;
    tipo: string;
    precioHora: number;
}

interface Sede {
    idSede: number;
    nombre: string;
    direccion: string;
    ciudad: string;
    canchas: Cancha[];
}

const OwnerBookingsPage: React.FC = () => {
    const { user } = useAuth();
    const [sedes, setSedes] = useState<Sede[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCancha, setSelectedCancha] = useState<{ idCancha: number; nombre: string } | null>(null);

    useEffect(() => {
        loadSedesAndCanchas();
    }, [user]);

    const loadSedesAndCanchas = async () => {
        if (!user?.idPersona) return;

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/sede/duenio/${user.idPersona}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                // Filtrar solo las sedes del dueño actual (por si acaso el endpoint trae más)
                const mySedes = data.filter((sede: any) => sede.idPersonaD === user.idPersona);
                setSedes(mySedes);
            }
        } catch (error) {
            console.error('Error loading sedes:', error);
        } finally {
            setLoading(false);
        }
    };

    if (selectedCancha) {
        return (
            <CalendarioReservasPage
                cancha={selectedCancha}
                onBack={() => setSelectedCancha(null)}
            />
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Reservas</h1>
                <p className="text-gray-500 mt-1">Selecciona una cancha para ver su calendario de reservas</p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
                </div>
            ) : sedes.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
                    <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes sedes registradas</h3>
                    <p className="text-gray-500">Registra una sede y canchas para comenzar a gestionar reservas.</p>
                </div>
            ) : (
                <div className="grid gap-8">
                    {sedes.map((sede) => (
                        <div key={sede.idSede} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100">
                                            <Building2 className="w-6 h-6 text-primary-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{sede.nombre}</h3>
                                            <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                                                <MapPin className="w-4 h-4" />
                                                {sede.direccion}, {sede.ciudad}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 shadow-sm">
                                        {sede.canchas?.length || 0} Canchas
                                    </span>
                                </div>
                            </div>

                            <div className="p-6">
                                {sede.canchas && sede.canchas.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {sede.canchas.map((cancha) => (
                                            <button
                                                key={cancha.idCancha}
                                                onClick={() => setSelectedCancha({ idCancha: cancha.idCancha, nombre: cancha.nombre })}
                                                className="group flex flex-col items-start p-4 rounded-xl border border-gray-200 hover:border-primary-500 hover:shadow-md transition-all bg-white text-left w-full"
                                            >
                                                <div className="flex items-center justify-between w-full mb-3">
                                                    <span className="px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wide">
                                                        {cancha.tipo}
                                                    </span>
                                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
                                                </div>
                                                <h4 className="font-bold text-gray-900 mb-1 group-hover:text-primary-700 transition-colors">
                                                    {cancha.nombre}
                                                </h4>
                                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-auto pt-2">
                                                    <CalendarIcon className="w-4 h-4" />
                                                    <span>Ver calendario</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        No hay canchas registradas en esta sede
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OwnerBookingsPage;
