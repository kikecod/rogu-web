import React, { useState } from 'react';
import { X, Star, AlertCircle, CheckCircle, MessageSquare } from 'lucide-react';
import StarRating from './StarRating';
import { reviewService } from '../services/reviewService';
import type { CreateReviewData } from '../types/review.types';

interface CreateReviewModalProps {
  idReserva: number;
  nombreCancha: string;
  onSuccess: () => void;
  onClose: () => void;
}

const CreateReviewModal: React.FC<CreateReviewModalProps> = ({
  idReserva,
  nombreCancha,
  onSuccess,
  onClose,
}) => {
  const [puntaje, setPuntaje] = useState<number>(0);
  const [comentario, setComentario] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const MAX_CHARS = 500;
  const charCount = comentario.length;
  const isOverLimit = charCount > MAX_CHARS;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (puntaje === 0) {
      setError('Por favor selecciona una calificación');
      return;
    }

    if (isOverLimit) {
      setError(`El comentario no puede exceder ${MAX_CHARS} caracteres`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data: CreateReviewData = {
        idReserva,
        puntaje,
        ...(comentario.trim() && { comentario: comentario.trim() }),
      };

      await reviewService.createReview(data);

      setSuccess(true);

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la reseña');
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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl max-w-md w-full p-10 text-center shadow-2xl transform scale-100 transition-all">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-extrabold text-gray-900 mb-2">
            ¡Reseña Publicada!
          </h3>
          <p className="text-gray-500 font-medium">
            Gracias por compartir tu experiencia con la comunidad.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-8 py-6 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">Deja tu reseña</h2>
              <p className="text-sm text-gray-500 font-medium truncate max-w-[200px]">{nombreCancha}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 animate-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="font-medium text-sm">{error}</p>
            </div>
          )}

          {/* Rating */}
          <div className="text-center space-y-4">
            <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide">
              Tu calificación
            </label>
            <div className="flex justify-center py-6 bg-gray-50 rounded-2xl border border-gray-100">
              <StarRating
                value={puntaje}
                onChange={setPuntaje}
                size="lg"
                showValue={false}
              />
            </div>
            <div className="h-6">
              {puntaje > 0 && (
                <p className="text-sm font-bold text-blue-600 animate-in fade-in slide-in-from-bottom-1">
                  {puntaje === 5 && '¡Excelente experiencia! 🤩'}
                  {puntaje === 4 && 'Muy buena experiencia 😄'}
                  {puntaje === 3 && 'Buena experiencia 🙂'}
                  {puntaje === 2 && 'Experiencia regular 😐'}
                  {puntaje === 1 && 'Mala experiencia 😞'}
                </p>
              )}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-3">
            <label htmlFor="comentario" className="block text-sm font-bold text-gray-900 uppercase tracking-wide">
              Tu opinión <span className="text-gray-400 font-normal normal-case">(Opcional)</span>
            </label>
            <div className="relative">
              <textarea
                id="comentario"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="¿Qué tal estuvieron las instalaciones? ¿El servicio fue bueno?"
                rows={4}
                disabled={loading}
                className={`
                    w-full px-5 py-4 border-2 rounded-2xl resize-none text-sm
                    focus:outline-none focus:ring-4 transition-all
                    disabled:bg-gray-50 disabled:text-gray-500
                    ${isOverLimit
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/10'
                  }
                `}
              />
              <div className="absolute bottom-3 right-3 text-xs font-medium bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md">
                <span
                  className={`${isOverLimit ? 'text-red-600' : charCount > MAX_CHARS * 0.9 ? 'text-yellow-600' : 'text-gray-400'
                    }`}
                >
                  {charCount}/{MAX_CHARS}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="
                flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl
                font-bold text-gray-600
                hover:bg-gray-50 hover:border-gray-300 transition-all
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || puntaje === 0 || isOverLimit}
              className="
                flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl
                font-bold hover:bg-blue-700 transition-all
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2 shadow-lg shadow-blue-200
              "
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Publicando...
                </>
              ) : (
                <>
                  <Star className="w-5 h-5 fill-current" />
                  Publicar Reseña
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReviewModal;
