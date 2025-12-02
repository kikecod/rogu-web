import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    TrendingUp,
    Download,
    Calendar,
    DollarSign,
    Users,
    Clock,
    TrendingDown,
    ArrowUp,
    ArrowDown,
} from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { useAuth } from '@/auth/hooks/useAuth';

interface AnalyticsData {
    revenue: { month: string; value: number }[];
    bookings: { month: string; value: number }[];
    occupancy: { month: string; rate: number }[];
    topCourts: { name: string; bookings: number; revenue: number }[];
    stats: {
        totalRevenue: number;
        totalBookings: number;
        avgOccupancy: number;
        revenueChange: number;
        bookingsChange: number;
    };
}

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

const OwnerAnalyticsPage: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
        revenue: [],
        bookings: [],
        occupancy: [],
        topCourts: [],
        stats: {
            totalRevenue: 0,
            totalBookings: 0,
            avgOccupancy: 0,
            revenueChange: 0,
            bookingsChange: 0,
        },
    });

    useEffect(() => {
        loadAnalytics();
    }, [user, timeRange]);

    const loadAnalytics = async () => {
        if (!user?.idPersona) return;

        try {
            setLoading(true);

            // Load sedes and reservas data
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
                const mySedes = sedesData.filter((s: any) => s.idPersonaD === user.idPersona);

                // Aggregate analytics (mock data for now - replace with real API calls)
                const mockData = generateMockAnalytics(mySedes);
                setAnalyticsData(mockData);
            }
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateMockAnalytics = (sedes: any[]): AnalyticsData => {
        // Generate mock data based on time range
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
        const revenue = months.map((month) => ({
            month,
            value: Math.floor(Math.random() * 10000) + 5000,
        }));

        const bookings = months.map((month) => ({
            month,
            value: Math.floor(Math.random() * 100) + 50,
        }));

        const occupancy = months.map((month) => ({
            month,
            rate: Math.floor(Math.random() * 40) + 60,
        }));

        const topCourts = sedes
            .flatMap((s) => s.canchas || [])
            .slice(0, 5)
            .map((c: any) => ({
                name: c.nombre || 'Cancha',
                bookings: Math.floor(Math.random() * 50) + 20,
                revenue: Math.floor(Math.random() * 5000) + 2000,
            }));

        const stats = {
            totalRevenue: revenue.reduce((sum, r) => sum + r.value, 0),
            totalBookings: bookings.reduce((sum, b) => sum + b.value, 0),
            avgOccupancy: Math.floor(
                occupancy.reduce((sum, o) => sum + o.rate, 0) / occupancy.length
            ),
            revenueChange: Math.floor(Math.random() * 30) - 10,
            bookingsChange: Math.floor(Math.random() * 20) - 5,
        };

        return { revenue, bookings, occupancy, topCourts, stats };
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Analíticas
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Reportes detallados y estadísticas de rendimiento
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setTimeRange('week')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${timeRange === 'week'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600'
                                }`}
                        >
                            Semana
                        </button>
                        <button
                            onClick={() => setTimeRange('month')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${timeRange === 'month'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600'
                                }`}
                        >
                            Mes
                        </button>
                        <button
                            onClick={() => setTimeRange('year')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${timeRange === 'year'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600'
                                }`}
                        >
                            Año
                        </button>
                    </div>
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all shadow-sm font-medium">
                        <Download className="w-4 h-4" />
                        Exportar
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Revenue */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                        <div className="p-3 bg-green-100 rounded-xl">
                            <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                        <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${analyticsData.stats.revenueChange >= 0
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                        >
                            {analyticsData.stats.revenueChange >= 0 ? (
                                <ArrowUp className="w-3 h-3" />
                            ) : (
                                <ArrowDown className="w-3 h-3" />
                            )}
                            {Math.abs(analyticsData.stats.revenueChange)}%
                        </span>
                    </div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                        Ingresos Totales
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                        Bs. {analyticsData.stats.totalRevenue.toLocaleString()}
                    </p>
                </div>

                {/* Total Bookings */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                        <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${analyticsData.stats.bookingsChange >= 0
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                        >
                            {analyticsData.stats.bookingsChange >= 0 ? (
                                <ArrowUp className="w-3 h-3" />
                            ) : (
                                <ArrowDown className="w-3 h-3" />
                            )}
                            {Math.abs(analyticsData.stats.bookingsChange)}%
                        </span>
                    </div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                        Reservas Totales
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                        {analyticsData.stats.totalBookings}
                    </p>
                </div>

                {/* Average Occupancy */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                        <div className="p-3 bg-purple-100 rounded-xl">
                            <BarChart3 className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                        Tasa de Ocupación
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                        {analyticsData.stats.avgOccupancy}%
                    </p>
                </div>

                {/* Average Revenue per Booking */}
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                        <div className="p-3 bg-orange-100 rounded-xl">
                            <TrendingUp className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                        Ingreso Promedio
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                        Bs.{' '}
                        {Math.floor(
                            analyticsData.stats.totalRevenue /
                            analyticsData.stats.totalBookings
                        ).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        Tendencia de Ingresos
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analyticsData.revenue}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                            <YAxis stroke="#6b7280" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#10b981"
                                strokeWidth={3}
                                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Bookings Trend */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        Tendencia de Reservas
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analyticsData.bookings}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                            <YAxis stroke="#6b7280" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                }}
                            />
                            <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Occupancy Rate */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                        Tasa de Ocupación
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analyticsData.occupancy}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                            <YAxis stroke="#6b7280" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="rate"
                                stroke="#8b5cf6"
                                strokeWidth={3}
                                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Courts */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-orange-600" />
                        Canchas Más Populares
                    </h3>
                    <div className="space-y-3">
                        {analyticsData.topCourts.map((court, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    >
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{court.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {court.bookings} reservas
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">
                                        Bs. {court.revenue.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-500">ingresos</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OwnerAnalyticsPage;
