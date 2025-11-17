import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  Shield,
} from 'lucide-react';
import { useCanchaDetalle } from '../hooks/useCanchaDetalle';
import PhotoGallery from '../components/PhotoGallery';
import PhotoAnalysis from '../components/PhotoAnalysis';
import DisciplinaBadge from '../components/DisciplinaBadge';
import PhotoCrudManager from '../components/PhotoCrudManager';
import { canchasService } from '../services/canchas.service';
import { ROUTES } from '@/config/routes';

const SedeCanchaDetailPage = () => {
  const { id, idCancha } = useParams<{ id: string; idCancha: string }>();
  const canchaId = Number(idCancha);
  const sedeId = Number(id);
  const navigate = useNavigate();
  const { cancha, loading, error, recargar } = useCanchaDetalle(canchaId);

  const handleVolver = () => {
    navigate(ROUTES.admin.sedesCanchas(sedeId));
  };

  const handleEditar = () => {
    navigate(ROUTES.admin.sedeCanchaEditar(sedeId, canchaId));
  };

  const handleDesactivar = async () => {
    const motivo = window.prompt('Motivo para desactivar la cancha');
    if (!motivo) return;
    try {
      await canchasService.desactivar(canchaId, motivo);
      alert('Cancha desactivada');
      recargar();
    } catch (err: any) {
      console.error('Error al desactivar cancha:', err);
      alert(err?.message || 'No se pudo desactivar');
    }
  };

  const handleEliminar = async () => {
    const motivo = window.prompt('Motivo de eliminación (obligatorio)');
    if (!motivo) return;
    try {
      await canchasService.eliminar(canchaId, motivo);
      alert('Cancha eliminada');
      navigate(ROUTES.admin.sedesCanchas(sedeId));
    } catch (err: any) {
      console.error('Error eliminando cancha:', err);
      alert(err?.message || 'No se pudo eliminar la cancha');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !cancha) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3 text-center text-sm text-red-600">
        <AlertCircle size={36} />
        <p>No se pudo cargar la cancha</p>
        <p className="text-xs text-red-400">{error}</p>
        <button
          onClick={recargar}
          className="rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleVolver}
            className="rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="text-sm uppercase tracking-wide text-gray-400">Cancha</p>
            <h1 className="text-2xl font-semibold text-gray-900">{cancha.nombre}</h1>
            <p className="text-sm text-gray-500">
              {cancha.sede?.nombre || 'Sede deportiva'} · {cancha.estado || 'Estado desconocido'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleEditar}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Edit size={16} />
            Editar cancha
          </button>
          <button
            onClick={handleDesactivar}
            className="flex items-center gap-2 rounded-lg bg-yellow-50 px-4 py-2 text-sm font-semibold text-yellow-700"
          >
            <Shield size={16} />
            Desactivar
          </button>
          <button
            onClick={handleEliminar}
            className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600"
          >
            <Trash2 size={16} />
            Eliminar
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <PhotoGallery fotos={cancha.fotos} />
      </div>

      <PhotoCrudManager
        canchaId={cancha.idCancha}
        canchaNombre={cancha.nombre}
        onFotosChange={recargar}
      />

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-4">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Detalle rápido</h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-gray-400 uppercase tracking-wide">Precio</dt>
                <dd className="text-lg font-semibold text-gray-900">
                  {cancha.precio ? `Bs ${cancha.precio.toFixed(2)}` : 'Sin precio'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400 uppercase tracking-wide">Dimensiones</dt>
                <dd className="text-base text-gray-700">{cancha.dimensiones || 'Sin especificar'}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400 uppercase tracking-wide">Horario</dt>
                <dd className="text-base text-gray-700">
                  {cancha.horaApertura || '—'} – {cancha.horaCierre || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400 uppercase tracking-wide">Tipo</dt>
                <dd className="text-base text-gray-700">
                  {cancha.superficie || 'No definido'} · {cancha.cubierta ? 'Techada' : 'Abierta'}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Descripción</h2>
            <p className="mt-3 text-sm text-gray-600">{cancha.descripcion || 'Sin descripción'}</p>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Disciplinas</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {cancha.disciplinas && cancha.disciplinas.length > 0 ? (
                cancha.disciplinas.map((disciplina) => (
                  <DisciplinaBadge key={disciplina.idDisciplina} nombre={disciplina.nombre} />
                ))
              ) : (
                <p className="text-sm text-gray-500">No hay disciplinas asociadas</p>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <PhotoAnalysis fotos={cancha.fotos} />
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Status</h2>
            <p className="mt-2 text-sm text-gray-500">
              Disponible:{' '}
              <span className="font-semibold text-gray-900">
                {cancha.disponible ? 'Sí' : 'No'}
              </span>
            </p>
            <p className="text-sm text-gray-500">
              Estado interno: <span className="font-semibold text-gray-900">{cancha.estado}</span>
            </p>
            <p className="text-sm text-gray-500">
              Última actualización:{' '}
              <span className="font-semibold text-gray-900">
                {cancha.actualizadoEn
                  ? new Date(cancha.actualizadoEn).toLocaleDateString('es-ES')
                  : 'No disponible'}
              </span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SedeCanchaDetailPage;
