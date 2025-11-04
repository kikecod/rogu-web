import React, { useState } from 'react';
import { X, Star, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import StarRating from './StarRating';
import { reviewService } from '../services/reviewService';
import type { Review, UpdateReviewData } from '../types/review.types';

interface EditReviewModalProps {
  review: Review;
  onSuccess: () => void;
  onClose: () => void;
}

const EditReviewModal: React.FC<EditReviewModalProps> = ({
  review,
  onSuccess,
  onClose,
}) => {
  const [puntaje, setPuntaje] = useState<number>(review.puntaje);
  const [comentario, setComentario] = useState<string>(review.comentario || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const MAX_CHARS = 500;
  const charCount = comentario.length;
  const isOverLimit = charCount > MAX_CHARS;

  // Calcular días desde creación
  const daysSinceCreation = Math.floor(
    (Date.now() - new Date(review.creadaEn).getTime()) / (1000 * 60 * 60 * 24)
  );
  const canEdit = daysSinceCreation <= 7;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canEdit) {
      setError('Ya no puedes editar esta reseña (máximo 7 días desde su creación)');
      return;
    }
    
    // Validaciones
    if (puntaje === 0) {
      setError('Por favor selecciona una calificación');
      return;
    }

    if (isOverLimit) {
      setError(`El comentario no puede exceder ${MAX_CHARS} caracteres`);
      return;
    }

    // Verificar si hubo cambios
    if (puntaje === review.puntaje && comentario.trim() === (review.comentario || '')) {
      setError('No has realizado ningún cambio');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data: UpdateReviewData = {};
      
      if (puntaje !== review.puntaje) {
        data.puntaje = puntaje;
      }
      
      if (comentario.trim() !== (review.comentario || '')) {
        data.comentario = comentario.trim();
      }

      await reviewService.updateReview(review.idCancha, data);
      
      setSuccess(true);
      
      // Cerrar modal después de 1.5 segundos
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al editar la reseña');
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Reseña Actualizada!
          </h3>
          <p className="text-gray-600">
            Tus cambios han sido guardados exitosamente
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Editar reseña</h2>
              <p className="text-sm text-gray-600">
                Puedes editarla hasta 7 días desde su creación
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-full transition disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Time Warning */}
          {!canEdit && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <Clock className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800 font-medium">Tiempo agotado</p>
                <p className="text-sm text-red-700">
                  Ya no puedes editar esta reseña. Han pasado más de 7 días desde su creación.
                </p>
              </div>
            </div>
          )}

          {canEdit && daysSinceCreation >= 5 && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
              <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-yellow-800 font-medium">
                  ⚠️ Quedan {7 - daysSinceCreation} días para editar
                </p>
                <p className="text-sm text-yellow-700">
                  Después de este tiempo no podrás modificar tu reseña.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800 font-medium">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Rating */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Tu calificación <span className="text-red-500">*</span>
            </label>
            <div className="flex justify-center py-4 bg-gray-50 rounded-xl">
              <StarRating
                value={puntaje}
                onChange={setPuntaje}
                size="lg"
                showValue={puntaje > 0}
                readonly={!canEdit}
              />
            </div>
            {puntaje > 0 && (
              <p className="text-center text-sm text-gray-600 mt-2">
                {puntaje === 5 && '¡Excelente!'}
                {puntaje === 4 && 'Muy bueno'}
                {puntaje === 3 && 'Bueno'}
                {puntaje === 2 && 'Regular'}
                {puntaje === 1 && 'Malo'}
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label htmlFor="comentario" className="block text-sm font-bold text-gray-900 mb-2">
              Tu opinión <span className="text-gray-500 font-normal">(opcional)</span>
            </label>
            <textarea
              id="comentario"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Cuéntanos sobre tu experiencia en esta cancha..."
              rows={4}
              disabled={loading || !canEdit}
              className={`
                w-full px-4 py-3 border rounded-xl resize-none
                focus:outline-none focus:ring-2 transition-all
                disabled:bg-gray-50 disabled:text-gray-500
                ${isOverLimit 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }
              `}
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                Actualiza tu opinión sobre las instalaciones, limpieza, ubicación, etc.
              </p>
              <span 
                className={`text-sm font-medium ${
                  isOverLimit ? 'text-red-600' : charCount > MAX_CHARS * 0.9 ? 'text-yellow-600' : 'text-gray-500'
                }`}
              >
                {charCount}/{MAX_CHARS}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="
                flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl
                font-semibold text-gray-700
                hover:bg-gray-50 transition-all
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !canEdit || puntaje === 0 || isOverLimit}
              className="
                flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl
                font-semibold hover:bg-blue-700 transition-all
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
              "
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <Star className="w-5 h-5" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditReviewModal;
