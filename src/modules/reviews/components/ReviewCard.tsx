import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, MoreVertical } from 'lucide-react';
import StarRating from './StarRating';
import { getImageUrl } from '@/core/config/api';
import type { Review } from '../types/review.types';

interface ReviewCardProps {
  review: Review;
  isOwner?: boolean;
  onEdit?: (review: Review) => void;
  onDelete?: (review: Review) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  isOwner = false,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [showActions, setShowActions] = useState(false);
  const [showFullComment, setShowFullComment] = useState(false);

  const handleViewProfile = () => {
    navigate(`/profile/${review.idCliente}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-BO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Validar y construir la URL del avatar
  const hasAvatar = review.cliente.avatar && review.cliente.avatar.trim() !== '';
  const avatarUrl = hasAvatar
    ? getImageUrl(review.cliente.avatar!) // Non-null assertion porque ya validamos arriba
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(review.cliente.nombre)}&background=3B82F6&color=fff&size=128`;

  console.log('🖼️ Avatar info:', {
    nombre: review.cliente.nombre,
    avatarOriginal: review.cliente.avatar,
    hasAvatar,
    avatarUrl
  });

  const isLongComment = review.comentario && review.comentario.length > 200;
  const displayComment = showFullComment || !isLongComment
    ? review.comentario
    : review.comentario?.substring(0, 200) + '...';

  const isEdited = review.editadaEn && review.editadaEn !== review.creadaEn;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <button
          onClick={handleViewProfile}
          className="flex items-center gap-3 flex-1 text-left hover:bg-gray-50 rounded-lg p-1 -ml-1 transition-colors group"
        >
          {/* Avatar */}
          <img
            src={avatarUrl}
            alt={review.cliente.nombre}
            className="w-12 h-12 rounded-full object-cover group-hover:ring-2 group-hover:ring-blue-500 transition-all"
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.cliente.nombre)}&background=3B82F6&color=fff&size=128`;
            }}
          />

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {review.cliente.nombre}
            </h4>
            <div className="flex items-center gap-2 flex-wrap">
              <StarRating value={review.puntaje} readonly size="sm" />
              <span className="text-xs text-gray-500">
                {formatDate(review.creadaEn)}
              </span>
              {isEdited && (
                <span className="text-xs text-gray-500 italic">
                  (editada)
                </span>
              )}
            </div>
          </div>
        </button>

        {/* Actions Menu */}
        {isOwner && (onEdit || onDelete) && (
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>

            {showActions && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowActions(false)}
                />

                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-20">
                  {onEdit && (
                    <button
                      onClick={() => {
                        onEdit(review);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Editar reseña
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        onDelete(review);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar reseña
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Comment */}
      {review.comentario && (
        <div className="mt-3">
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
            {displayComment}
          </p>
          {isLongComment && (
            <button
              onClick={() => setShowFullComment(!showFullComment)}
              className="text-blue-600 text-sm font-medium hover:text-blue-700 mt-2"
            >
              {showFullComment ? 'Ver menos' : 'Ver más'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
