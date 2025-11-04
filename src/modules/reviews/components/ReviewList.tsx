import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import ReviewCard from './ReviewCard';
import RatingDistribution from './RatingDistribution';
import EditReviewModal from './EditReviewModal';
import { reviewService } from '../services/reviewService';
import { useAuth } from '@/auth/hooks/useAuth';
import type { ReviewsResponse, Review, ReviewSortOrder } from '../types/review.types';

interface ReviewListProps {
  idCancha: number;
  onReviewDeleted?: () => void;
}

const ReviewList: React.FC<ReviewListProps> = ({ idCancha, onReviewDeleted }) => {
  const { user } = useAuth();
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<ReviewSortOrder>('recientes');
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [deletingReview, setDeletingReview] = useState<Review | null>(null);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await reviewService.getFieldReviews(idCancha, {
        page: currentPage,
        limit: 10,
        ordenar: sortOrder,
      });
      
      setData(response);
    } catch (err) {
      console.error('Error loading reviews:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar las reseñas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [idCancha, currentPage, sortOrder]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (newSort: ReviewSortOrder) => {
    setSortOrder(newSort);
    setCurrentPage(1); // Reset to first page
  };

  const handleEditSuccess = () => {
    setEditingReview(null);
    loadReviews(); // Reload reviews
  };

  const handleDelete = async (review: Review) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
      return;
    }

    try {
      setDeletingReview(review);
      await reviewService.deleteReview(review.idCancha);
      
      // Reload reviews
      await loadReviews();
      
      // Notify parent
      if (onReviewDeleted) {
        onReviewDeleted();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar la reseña');
    } finally {
      setDeletingReview(null);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-800">{error}</p>
        <button
          onClick={loadReviews}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!data || data.totalResenas === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
        <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Aún no hay reseñas
        </h3>
        <p className="text-gray-600">
          Sé el primero en compartir tu experiencia en esta cancha
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Rating Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Average Rating */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <div className="text-5xl font-extrabold text-gray-900">
                {(data.ratingPromedio || 0).toFixed(1)}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(data.ratingPromedio || 0)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  {data.totalResenas} {data.totalResenas === 1 ? 'reseña' : 'reseñas'}
                </p>
              </div>
            </div>
          </div>

          {/* Distribution */}
          <div>
            <RatingDistribution
              distribucion={data.distribucion}
              totalResenas={data.totalResenas}
            />
          </div>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h3 className="text-lg font-bold text-gray-900">
          Todas las reseñas
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => handleSortChange('recientes')}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${sortOrder === 'recientes'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            Más recientes
          </button>
          <button
            onClick={() => handleSortChange('mejores')}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${sortOrder === 'mejores'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            Mejor valoradas
          </button>
          <button
            onClick={() => handleSortChange('peores')}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${sortOrder === 'peores'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            Peor valoradas
          </button>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid gap-4">
        {data.resenas.map((review) => (
          <ReviewCard
            key={`${review.idCliente}-${review.idCancha}`}
            review={review}
            isOwner={user?.idUsuario === review.idCliente}
            onEdit={() => setEditingReview(review)}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Pagination */}
      {data.paginacion.totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="
              p-2 rounded-lg border border-gray-300 
              hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
              transition-all
            "
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex gap-2">
            {Array.from({ length: data.paginacion.totalPaginas }, (_, i) => i + 1).map((page) => {
              // Show first, last, current, and adjacent pages
              const showPage = 
                page === 1 ||
                page === data.paginacion.totalPaginas ||
                (page >= currentPage - 1 && page <= currentPage + 1);

              if (!showPage) {
                // Show ellipsis
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="px-2 text-gray-400">...</span>;
                }
                return null;
              }

              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-all
                    ${currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === data.paginacion.totalPaginas}
            className="
              p-2 rounded-lg border border-gray-300 
              hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
              transition-all
            "
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Page Info */}
      <p className="text-center text-sm text-gray-600">
        Página {currentPage} de {data.paginacion.totalPaginas}
        {' · '}
        Mostrando {data.resenas.length} de {data.paginacion.total} reseñas
      </p>

      {/* Edit Modal */}
      {editingReview && (
        <EditReviewModal
          review={editingReview}
          onSuccess={handleEditSuccess}
          onClose={() => setEditingReview(null)}
        />
      )}

      {/* Loading Overlay */}
      {(loading || deletingReview) && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="font-medium text-gray-900">
              {deletingReview ? 'Eliminando reseña...' : 'Cargando...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
