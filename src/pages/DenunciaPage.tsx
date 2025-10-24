import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { createDenuncia, type CreateDenunciaRequest } from '../utils/helpers';
import { useState } from 'react';

const DenunciaPage = () => {
  const { idCliente } = useParams<{ idCliente: string }>(); // cliente denunciado
  const { user } = useAuth(); // denunciante (puede ser cliente o controlador)
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<CreateDenunciaRequest>();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: CreateDenunciaRequest) => {
    if (!user?.idPersona || !idCliente) {
      alert('No se puede enviar la denuncia: faltan datos de usuario o cliente.');
      return;
    }

    setLoading(true);
    try {
      const denunciaData: CreateDenunciaRequest = {
        reporterId: String(user.idPersona),
        reportedId: idCliente,
        categoria: data.categoria,
        gravedad: data.gravedad,
        titulo: data.titulo,
        descripcion: data.descripcion,
      };

      const ok = await createDenuncia(denunciaData);
      if (ok) {
        setSuccess(true);
        setTimeout(() => navigate(-1), 1500); // vuelve a la pantalla anterior
      }
    } catch (err) {
      console.error('❌ Error al enviar denuncia:', err);
      alert('Ocurrió un error al enviar la denuncia.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-red-600">Formulario de Denuncia</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto"
      >
        {/* Categoría */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Categoría</label>
          <input
            {...register('categoria', { required: 'Campo obligatorio' })}
            className="w-full border px-3 py-2 rounded"
            placeholder="Ej. Comportamiento inapropiado"
          />
          {errors.categoria && <p className="text-red-500 text-sm">{errors.categoria.message}</p>}
        </div>

        {/* Gravedad */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Gravedad</label>
          <select
            {...register('gravedad', { required: 'Campo obligatorio' })}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Selecciona una gravedad</option>
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </select>
          {errors.gravedad && <p className="text-red-500 text-sm">{errors.gravedad.message}</p>}
        </div>

        {/* Título */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Título</label>
          <input
            {...register('titulo', { required: 'Campo obligatorio' })}
            className="w-full border px-3 py-2 rounded"
            placeholder="Título breve de la denuncia"
          />
          {errors.titulo && <p className="text-red-500 text-sm">{errors.titulo.message}</p>}
        </div>

        {/* Descripción */}
        <div className="mb-6">
          <label className="block mb-2 font-semibold">Descripción</label>
          <textarea
            {...register('descripcion', { required: 'Campo obligatorio' })}
            className="w-full border px-3 py-2 rounded min-h-[100px]"
            placeholder="Describe brevemente lo sucedido..."
          />
          {errors.descripcion && <p className="text-red-500 text-sm">{errors.descripcion.message}</p>}
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white font-semibold ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-500 hover:bg-red-600 transition-colors'
          }`}
        >
          {loading ? 'Enviando...' : 'Enviar Denuncia'}
        </button>

        {/* Mensaje de éxito */}
        {success && (
          <p className="mt-4 text-green-600 text-center font-semibold">
            ✅ Denuncia enviada exitosamente.
          </p>
        )}
      </form>
    </div>
  );
};

export default DenunciaPage;
