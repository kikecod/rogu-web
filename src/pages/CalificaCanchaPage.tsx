import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import ReactStars from 'react-stars';
import { useState } from 'react';
import { createCalificacion, type CreateCalificacionRequest } from '../utils/helpers';

const CalificaCanchaPage = () => {
  const { canchaId } = useParams<{ canchaId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<CreateCalificacionRequest>();
  const [puntaje, setPuntaje] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (data: CreateCalificacionRequest) => {
    if (!user?.idPersona || !canchaId) {
      alert('No se puede enviar la calificación: faltan datos de usuario o cancha.');
      return;
    }
    if (puntaje === 0) {
      alert('Por favor selecciona una calificación de estrellas.');
      return;
    }

    setLoading(true);
    try {
      const calificacionData: CreateCalificacionRequest = {
        idCliente: String(user.idPersona),
        idCancha: String(canchaId),
        puntaje,
        dimensiones: data.dimensiones,
        comentario: data.comentario,
      };

      const ok = await createCalificacion(calificacionData);
      if (ok) {
        setSuccess(true);
        setTimeout(() => navigate(-1), 1500); // regresa a la pantalla anterior
      }
    } catch (err) {
      console.error('❌ Error al enviar la calificación:', err);
      alert('Ocurrió un error al enviar la calificación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">Calificar Cancha</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto"
      >
        {/* PUNTAJE */}
        <div className="mb-6 text-center">
          <label className="block mb-2 font-semibold text-lg">Puntaje</label>
          <ReactStars
            count={5}
            value={puntaje}
            onChange={(newValue) => setPuntaje(newValue)}
            size={36}
            color2={'#ffd700'}
          />
          {puntaje === 0 && (
            <p className="text-red-500 text-sm mt-1">Selecciona un puntaje</p>
          )}
        </div>

        {/* DIMENSIONES (opcional) */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Dimensiones (opcional)</label>
          <input
            {...register('dimensiones')}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
            placeholder="Ej. 30x20 metros"
          />
        </div>

        {/* COMENTARIO */}
        <div className="mb-6">
          <label className="block mb-2 font-semibold">Comentario</label>
          <textarea
            {...register('comentario', { required: 'Campo obligatorio' })}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200 min-h-[100px]"
            placeholder="Describe tu experiencia en la cancha..."
          />
          {errors.comentario && (
            <p className="text-red-500 text-sm">{errors.comentario.message}</p>
          )}
        </div>

        {/* BOTÓN */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white font-semibold transition-colors ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Enviando...' : 'Enviar Calificación'}
        </button>

        {/* MENSAJE DE ÉXITO */}
        {success && (
          <p className="mt-4 text-green-600 text-center font-semibold">
            ✅ Calificación enviada exitosamente.
          </p>
        )}
      </form>
    </div>
  );
};

export default CalificaCanchaPage;
