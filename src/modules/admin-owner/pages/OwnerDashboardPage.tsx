import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    Building2,
    Star,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    Plus,
    Users,
    Activity
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { useAuth } from '@/auth/hooks/useAuth';
import { ROUTES } from '@/config/routes';

interface DashboardStats {
    totalRevenue: number;
    revenueChange: number;
    bookingsToday: number;
    bookingsChange: number;
    activeVenues: number;
    averageRating: number;
    totalCustomers: number;
}

const OwnerDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats>({
        totalRevenue: 0,
        revenueChange: 0,
        bookingsToday: 0,
        bookingsChange: 0,
        activeVenues: 0,
        averageRating: 0,
        totalCustomers: 0
    });
    const [loading, setLoading] = useState(true);

    // Mock data for the chart
    const chartData = [
        { name: 'Lun', ingresos: 4000 },
        { name: 'Mar', ingresos: 3000 },
        { name: 'Mie', ingresos: 2000 },
        { name: 'Jue', ingresos: 2780 },
        { name: 'Vie', ingresos: 1890 },
        { name: 'Sab', ingresos: 2390 },
        { name: 'Dom', ingresos: 3490 },
    ];

    useEffect(() => {
        // TODO: Fetch real stats from API
        // Simulated data for now
        setTimeout(() => {
            setStats({
                totalRevenue: 45230,
                revenueChange: 12.5,
                bookingsToday: 24,
                bookingsChange: 8.2,
                activeVenues: 3,
                averageRating: 4.7,
                totalCustomers: 156
            });
            setLoading(false);
        }, 800);
    }, [user]);

    const statCards = [
        {
            title: 'Ingresos del Mes',
            value: `$${stats.totalRevenue.toLocaleString()}`,
            change: stats.revenueChange,
            icon: DollarSign,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            trend: 'up'
        },
        {
            title: 'Reservas Hoy',
            value: stats.bookingsToday.toString(),
            change: stats.bookingsChange,
            icon: Calendar,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            trend: 'up'
        },
        {
            title: 'Sedes Activas',
            value: stats.activeVenues.toString(),
            change: 0,
            icon: Building2,
            color: 'text-violet-600',
            bg: 'bg-violet-50',
            trend: 'neutral'
        },
        {
            title: 'Calificación',
            value: stats.averageRating.toFixed(1),
            change: 0,
            icon: Star,
            color: 'text-amber-500',
            bg: 'bg-amber-50',
            trend: 'neutral'
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    <p className="text-gray-500 animate-pulse">Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Hola, {user?.usuario} 👋
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Aquí tienes el resumen de tus espacios deportivos hoy.
                    </p>
                </div>
                <button
                    onClick={() => navigate(ROUTES.owner.createVenue)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-black rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 hover:shadow-primary-300 hover:-translate-y-0.5 font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Nueva Sede
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            {stat.change !== 0 && (
                                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${stat.trend === 'up' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {Math.abs(stat.change)}%
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Ingresos Semanales</h3>
                            <p className="text-sm text-gray-500">Rendimiento de los últimos 7 días</p>
                        </div>
                        <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 outline-none">
                            <option>Esta semana</option>
                            <option>Mes pasado</option>
                            <option>Año actual</option>
                        </select>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: number) => [`$${value}`, 'Ingresos']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="ingresos"
                                    stroke="#4f46e5"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorIngresos)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity & Quick Actions */}
                <div className="space-y-8">
                    {/* Quick Actions */}
                    <div className="bg-gradient-to-br from-primary-900 to-primary-800 rounded-2xl p-6 text-white shadow-lg">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5" />
                            Acciones Rápidas
                        </h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate(ROUTES.owner.spaces)}
                                className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-900 hover:bg-gray-800 transition-colors shadow-md border border-gray-700"
                            >
                                <span className="font-medium text-white">Gestionar Sedes</span>
                                <Building2 className="w-5 h-5 text-white" />
                            </button>
                            <button
                                onClick={() => navigate('/owner/bookings')}
                                className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-900 hover:bg-gray-800 transition-colors shadow-md border border-gray-700"
                            >
                                <span className="font-medium text-white">Ver Calendario</span>
                                <Calendar className="w-5 h-5 text-white" />
                            </button>
                            <button
                                onClick={() => navigate('/owner/assignments')}
                                className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-900 hover:bg-gray-800 transition-colors shadow-md border border-gray-700"
                            >
                                <span className="font-medium text-white">Controladores</span>
                                <Users className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Actividad Reciente</h3>
                            <button className="text-sm text-gray-900 hover:text-primary-600 font-medium">
                                Ver todo
                            </button>
                        </div>
                        <div className="space-y-4">
                            {[
                                { type: 'booking', text: 'Nueva reserva en Sagitario', time: 'Hace 5 min', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
                                { type: 'review', text: 'Reseña de 5 estrellas', time: 'Hace 1 hora', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
                                { type: 'payment', text: 'Pago recibido - $150', time: 'Hace 2 horas', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            ].map((activity, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-full ${activity.bg} flex items-center justify-center flex-shrink-0`}>
                                        <activity.icon className={`w-5 h-5 ${activity.color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">{activity.text}</p>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <Clock className="w-3 h-3 text-gray-400" />
                                            <p className="text-xs text-gray-500">{activity.time}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OwnerDashboardPage;
