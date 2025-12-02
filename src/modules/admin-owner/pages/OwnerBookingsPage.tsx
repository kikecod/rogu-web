import React, { useState, useEffect } from 'react';
import {
    Calendar as CalendarIcon,
    List,
    Filter,
    Search,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Clock,
    User,
    Phone,
    Mail,
    CheckCircle,
    XCircle,
    AlertCircle,
    X,
    LayoutGrid
} from 'lucide-react';
import { useAuth } from '@/auth/hooks/useAuth';

type ViewMode = 'calendar' | 'list';
type CalendarView = 'day' | 'week' | 'month';

interface Reserva {
    idReserva: number;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    estado: string;
    idCliente: number;
    nombreCliente?: string;
    telefonoCliente?: string;
    emailCliente?: string;
    idCancha: number;
    nombreCancha?: string;
    nombreSede?: string;
    precioTotal?: number;
}

const OwnerBookingsPage: React.FC = () => {
    const { user } = useAuth();
    const [viewMode, setViewMode] = useState<ViewMode>('calendar');
    const [calendarView, setCalendarView] = useState<CalendarView>('week');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [reservas, setReservas] = useState<Reserva[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterCancha, setFilterCancha] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadReservas();
    }, [user]);

    const loadReservas = async () => {
        if (!user?.idPersona) return;

        try {
            // Load sedes first to get all canchas
            const sedesResponse = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/sede/duenio/${user.idPersona}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            if (sedesResponse.ok) {
                const sedesData = await sedesResponse.json();
                const mySedes = sedesData.filter((sede: any) => sede.idPersonaD === user.idPersona);

                // Collect all canchas IDs
                const allReservas: Reserva[] = [];

                for (const sede of mySedes) {
                    if (sede.canchas && Array.isArray(sede.canchas)) {
                        for (const cancha of sede.canchas) {
                            // Fetch reservas for each cancha
                            try {
                                const reservasResponse = await fetch(
                                    `${import.meta.env.VITE_API_BASE_URL}/reserva/cancha/${cancha.idCancha}`,
                                    {
                                        headers: {
                                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                                        },
                                    }
                                );

                                if (reservasResponse.ok) {
                                    const canchaReservas = await reservasResponse.json();
                                    canchaReservas.forEach((reserva: any) => {
                                        allReservas.push({
                                            ...reserva,
                                            nombreCancha: cancha.nombre,
                                            nombreSede: sede.nombre,
                                        });
                                    });
                                }
                            } catch (error) {
                                console.error(`Error loading reservas for cancha ${cancha.idCancha}:`, error);
                            }
                        }
                    }
                }

                setReservas(allReservas);
            }
        } catch (error) {
            console.error('Error loading reservas:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (estado: string) => {
        switch (estado.toLowerCase()) {
            case 'confirmada':
            case 'pagada':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'pendiente':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'cancelada':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (estado: string) => {
        switch (estado.toLowerCase()) {
            case 'confirmada':
            case 'pagada':
                return <CheckCircle className="w-4 h-4" />;
            case 'pendiente':
                return <AlertCircle className="w-4 h-4" />;
            case 'cancelada':
                return <XCircle className="w-4 h-4" />;
            default:
                return <AlertCircle className="w-4 h-4" />;
        }
    };

    const filteredReservas = reservas.filter((reserva) => {
        const matchesStatus = filterStatus === 'all' || reserva.estado.toLowerCase() === filterStatus.toLowerCase();
        const matchesCancha = filterCancha === 'all' || reserva.idCancha.toString() === filterCancha;
        const matchesSearch = !searchTerm || 
            reserva.nombreCliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reserva.nombreCancha?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesCancha && matchesSearch;
    });

    const navigateDate = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        if (calendarView === 'day') {
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        } else if (calendarView === 'week') {
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        } else {
            newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        }
        setCurrentDate(newDate);
    };

    const getWeekDates = () => {
        const start = new Date(currentDate);
        start.setDate(start.getDate() - start.getDay());
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    const formatDateHeader = () => {
        const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
        if (calendarView === 'day') {
            return currentDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
        } else if (calendarView === 'week') {
            const weekDates = getWeekDates();
            const start = weekDates[0].toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
            const end = weekDates[6].toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
            return `${start} - ${end}, ${currentDate.getFullYear()}`;
        } else {
            return currentDate.toLocaleDateString('es-ES', options);
        }
    };

    const getReservasForDate = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return filteredReservas.filter(r => r.fecha === dateStr);
    };

    const renderCalendarView = () => {
        if (calendarView === 'week') {
            const weekDates = getWeekDates();
            return (
                <div className="grid grid-cols-7 gap-2">
                    {weekDates.map((date, index) => {
                        const reservasForDay = getReservasForDate(date);
                        const isToday = date.toDateString() === new Date().toDateString();
                        return (
                            <div key={index} className="min-h-[200px]">
                                <div className={`text-center p-2 rounded-t-lg ${isToday ? 'bg-primary-100 text-primary-700' : 'bg-gray-50 text-gray-700'}`}>
                                    <div className="text-xs font-medium uppercase">{date.toLocaleDateString('es-ES', { weekday: 'short' })}</div>
                                    <div className="text-lg font-bold">{date.getDate()}</div>
                                </div>
                                <div className="p-2 space-y-1 bg-white border border-t-0 rounded-b-lg min-h-[150px]">
                                    {reservasForDay.map((reserva) => (
                                        <button
                                            key={reserva.idReserva}
                                            onClick={() => setSelectedReserva(reserva)}
                                            className={`w-full text-left p-2 rounded-lg text-xs ${getStatusColor(reserva.estado)} hover:shadow-md transition-shadow`}
                                        >
                                            <div className="font-medium truncate">{reserva.horaInicio}</div>
                                            <div className="truncate">{reserva.nombreCancha}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            );
        }

        // Simple month/day view placeholder
        return (
            <div className="text-center py-12 text-gray-500">
                Vista de {calendarView} - Próximamente
            </div>
        );
    };

    const renderListView = () => {
        if (filteredReservas.length === 0) {
            return (
                <div className="text-center py-20">
                    <LayoutGrid className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay reservas</h3>
                    <p className="text-gray-500">No se encontraron reservas con los filtros seleccionados.</p>
                </div>
            );
        }

        return (
            <div className="space-y-3">
                {filteredReservas.map((reserva) => (
                    <button
                        key={reserva.idReserva}
                        onClick={() => setSelectedReserva(reserva)}
                        className="w-full bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow text-left"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(reserva.estado)}`}>
                                        {getStatusIcon(reserva.estado)}
                                        {reserva.estado}
                                    </span>
                                    <span className="text-sm font-semibold text-gray-900">{reserva.nombreCancha}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                                        {new Date(reserva.fecha).toLocaleDateString('es-ES')}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        {reserva.horaInicio} - {reserva.horaFin}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-400" />
                                        {reserva.nombreCliente || 'Cliente'}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        {reserva.nombreSede}
                                    </div>
                                </div>
                            </div>
                            {reserva.precioTotal && (
                                <div className="text-right">
                                    <div className="text-xs text-gray-500">Total</div>
                                    <div className="text-lg font-bold text-gray-900">Bs. {reserva.precioTotal}</div>
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Reservas</h1>
                    <p className="text-gray-500 mt-1">Gestiona todas las reservaciones de tus espacios</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                viewMode === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <CalendarIcon className="w-4 h-4" />
                        </button>
                    </div>

                    {viewMode === 'calendar' && (
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setCalendarView('day')}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                    calendarView === 'day' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                                }`}
                            >
                                Día
                            </button>
                            <button
                                onClick={() => setCalendarView('week')}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                    calendarView === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                                }`}
                            >
                                Semana
                            </button>
                            <button
                                onClick={() => setCalendarView('month')}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                    calendarView === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                                }`}
                            >
                                Mes
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente o cancha..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                    />
                </div>

                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none bg-white min-w-[160px]"
                >
                    <option value="all">Todos los Estados</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="cancelada">Cancelada</option>
                </select>
            </div>

            {/* Calendar Navigation */}
            {viewMode === 'calendar' && (
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100">
                    <button
                        onClick={() => navigateDate('prev')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-bold text-gray-900">{formatDateHeader()}</h2>
                    <button
                        onClick={() => navigateDate('next')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
                    </div>
                ) : viewMode === 'calendar' ? (
                    renderCalendarView()
                ) : (
                    renderListView()
                )}
            </div>

            {/* Reservation Detail Modal */}
            {selectedReserva && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">Detalle de Reserva</h2>
                            <button
                                onClick={() => setSelectedReserva(null)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(selectedReserva.estado)}`}>
                                    {getStatusIcon(selectedReserva.estado)}
                                    {selectedReserva.estado}
                                </span>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <LayoutGrid className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <div className="text-sm text-gray-500">Cancha</div>
                                        <div className="font-semibold text-gray-900">{selectedReserva.nombreCancha}</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <div className="text-sm text-gray-500">Sede</div>
                                        <div className="font-semibold text-gray-900">{selectedReserva.nombreSede}</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <div className="text-sm text-gray-500">Fecha</div>
                                        <div className="font-semibold text-gray-900">
                                            {new Date(selectedReserva.fecha).toLocaleDateString('es-ES', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <div className="text-sm text-gray-500">Horario</div>
                                        <div className="font-semibold text-gray-900">
                                            {selectedReserva.horaInicio} - {selectedReserva.horaFin}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <div className="text-sm text-gray-500">Cliente</div>
                                        <div className="font-semibold text-gray-900">{selectedReserva.nombreCliente || 'N/A'}</div>
                                    </div>
                                </div>

                                {selectedReserva.telefonoCliente && (
                                    <div className="flex items-start gap-3">
                                        <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <div className="text-sm text-gray-500">Teléfono</div>
                                            <div className="font-semibold text-gray-900">{selectedReserva.telefonoCliente}</div>
                                        </div>
                                    </div>
                                )}

                                {selectedReserva.emailCliente && (
                                    <div className="flex items-start gap-3">
                                        <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <div className="text-sm text-gray-500">Email</div>
                                            <div className="font-semibold text-gray-900">{selectedReserva.emailCliente}</div>
                                        </div>
                                    </div>
                                )}

                                {selectedReserva.precioTotal && (
                                    <div className="pt-4 border-t border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500">Total</span>
                                            <span className="text-2xl font-bold text-gray-900">Bs. {selectedReserva.precioTotal}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerBookingsPage;
