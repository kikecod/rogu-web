import React, { useState, useEffect } from 'react';
import { Star, Search, ThumbsUp, MessageSquare, User, Calendar, MapPin } from 'lucide-react';
import { useAuth } from '@/auth/hooks/useAuth';
import { getResumenResenas } from '@/analytics/services/analyticsService';
import type { ResumenResenasData } from '@/analytics/types/analytics.types';

const OwnerReviewsPage: React.FC = () => {
    const { user } = useAuth();
    const [resenasData, setResenasData] = useState<ResumenResenasData | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRating, setFilterRating] = useState<string>('all');

    useEffect(() => {
        loadReviews();
    }, [user]);

    const loadReviews = async () => {
        if (!user?.idPersona) return;

        try {
            setLoading(true);
            const data = await getResumenResenas({
                idPersonaD: user.idPersona,
                idSede: undefined,
                idCancha: undefined,
            });
            setResenasData(data);
        } catch (error) {
            console.error('Error loading reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-4 w-4 ${
                            star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                        }`}
                    />
                ))}
            </div>
        );
    };

    const filteredReviews = resenasData?.ultimasResenas.filter((review) => {
        const matchesSearch =
            !searchTerm ||
            review.comentario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.cliente.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRating =
            filterRating === 'all' || review.puntaje === Number(filterRating);
        return matchesSearch && matchesRating;
    }) || [];

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
                        Reseñas y Calificaciones
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {resenasData?.resumen.totalResenas || 0} reseñas totales
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Average Rating */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-yellow-100 rounded-xl">
                            <Star className="w-6 h-6 text-yellow-600 fill-yellow-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Rating Promedio
                        </h3>
                    </div>
                    <div className="flex items-end gap-3">
                        <p className="text-4xl font-bold text-gray-900">
                            {resenasData?.resumen.ratingPromedio.toFixed(1) || '0.0'}
                        </p>
                        <div className="pb-1">
                            {renderStars(resenasData?.resumen.ratingPromedio || 0)}
                        </div>
                    </div>
                </div>

                {/* Total Reviews */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <MessageSquare className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Total Reseñas
                        </h3>
                    </div>
                    <p className="text-4xl font-bold text-gray-900">
                        {resenasData?.resumen.totalResenas || 0}
                    </p>
                </div>

                {/* Positive Reviews */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-green-100 rounded-xl">
                            <ThumbsUp className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Reseñas Positivas
                        </h3>
                    </div>
                    <p className="text-4xl font-bold text-gray-900">
                        {resenasData?.distribucion
                            ? resenasData.distribucion
                                .filter((d) => d.estrellas >= 4)
                                .reduce((sum, d) => sum + d.cantidad, 0)
                            : 0}
                    </p>
                </div>
            </div>

            {/* Rating Distribution */}
            {resenasData?.distribucion && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Distribución de Calificaciones
                    </h3>
                    <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map((rating) => {
                            const distItem = resenasData.distribucion.find(d => d.estrellas === rating);
                            const count = distItem?.cantidad || 0;
                            const percentage = distItem?.porcentaje || 0;

                            return (
                                <div key={rating} className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 w-20">
                                        <span className="text-sm font-medium text-gray-700">
                                            {rating}
                                        </span>
                                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    </div>
                                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-gray-600 w-16 text-right">
                                        {count} ({Math.round(percentage)}%)
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por comentario o cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                    />
                </div>

                <select
                    value={filterRating}
                    onChange={(e) => setFilterRating(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none bg-white min-w-[160px]"
                >
                    <option value="all">Todas las estrellas</option>
                    <option value="5">5 estrellas</option>
                    <option value="4">4 estrellas</option>
                    <option value="3">3 estrellas</option>
                    <option value="2">2 estrellas</option>
                    <option value="1">1 estrella</option>
                </select>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {filteredReviews.length === 0 ? (
                    <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
                        <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No hay reseñas
                        </h3>
                        <p className="text-gray-500">
                            {searchTerm || filterRating !== 'all'
                                ? 'No se encontraron reseñas con los filtros seleccionados.'
                                : 'Aún no tienes reseñas de clientes.'}
                        </p>
                    </div>
                ) : (
                    filteredReviews.map((review, index) => (
                        <div
                            key={index}
                            className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center flex-shrink-0">
                                        <User className="w-6 h-6 text-primary-700" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="font-semibold text-gray-900">
                                                {review.cliente.nombre} {review.cliente.apellido}
                                            </h4>
                                            {renderStars(review.puntaje)}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                <span>{review.cancha.nombre}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>
                                                    {new Date(review.fecha).toLocaleDateString('es-ES')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {review.comentario && (
                                <p className="text-gray-700 leading-relaxed pl-16">
                                    {review.comentario}
                                </p>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default OwnerReviewsPage;
