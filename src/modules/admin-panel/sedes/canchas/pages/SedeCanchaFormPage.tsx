import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useCanchaDetalle } from '../hooks/useCanchaDetalle';
import { useSedeDetalle } from '../../hooks/useSedeDetalle';
import { canchasService } from '../services/canchas.service';
import { disciplinasService, type DisciplinaItem } from '@/favorites/services/disciplinasService';
import { ROUTES } from '@/config/routes';

const estados = ['Disponible', 'Reservada', 'Mantenimiento', 'Inactiva'];

const SedeCanchaFormPage = () => {
  const { id, idCancha } = useParams<{ id: string; idCancha?: string }>();
  const sedeId = Number(id);
  const canchasId = idCancha ? Number(idCancha) : undefined;
  const navigate = useNavigate();
  const { sede } = useSedeDetalle(sedeId);
  const { cancha, loading: loadingDetalle } = useCanchaDetalle(canchasId);

  const [disciplinas, setDisciplinas] = useState<DisciplinaItem[]>([]);
  const [loadingDisciplinas, setLoadingDisciplinas] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formState, setFormState] = useState({
    nombre: '',
    descripcion: '',
    superficie: '',
    precio: '',
    dimensiones: '',
    aforoMax: '',
    iluminacion: '',
    cubierta: false,
    horaApertura: '',
    horaCierre: '',
    estado: estados[0],
    disciplinas: [] as number[],
  });

  const isEditing = Boolean(canchasId);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoadingDisciplinas(true);
      try {
        const list = await disciplinasService.list();
        if (active) {
          setDisciplinas(list);
        }
      } catch (err) {
        console.error('Error cargando disciplinas:', err);
      } finally {
        if (active) {
          setLoadingDisciplinas(false);
        }
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!cancha) return;
    setFormState({
      nombre: cancha.nombre,
      descripcion: cancha.descripcion || '',
      superficie: cancha.superficie || '',
      precio: cancha.precio ? cancha.precio.toString() : '',
      dimensiones: cancha.dimensiones || '',
      aforoMax: cancha.aforoMax ? cancha.aforoMax.toString() : '',
      iluminacion: cancha.iluminacion || '',
      cubierta: Boolean(cancha.cubierta),
      horaApertura: cancha.horaApertura || '',
      horaCierre: cancha.horaCierre || '',
      estado: cancha.estado || estados[0],
      disciplinas: cancha.disciplinas?.map((disc) => disc.idDisciplina) || [],
    });
  }, [cancha]);

  const disciplinasMarcadas = useMemo(
    () => new Set(formState.disciplinas),
    [formState.disciplinas]
  );

  const toggleDisciplina = (idDisciplina: number) => {
    setFormState((prev) => {
      const yaSeleccionada = prev.disciplinas.includes(idDisciplina);
      return {
        ...prev,
        disciplinas: yaSeleccionada
          ? prev.disciplinas.filter((discId) => discId !== idDisciplina)
          : [...prev.disciplinas, idDisciplina],
      };
    });
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      nombre: formState.nombre,
      descripcion: formState.descripcion || undefined,
      superficie: formState.superficie || undefined,
      precio: formState.precio ? Number(formState.precio) : undefined,
      dimensiones: formState.dimensiones || undefined,
      aforoMax: formState.aforoMax ? Number(formState.aforoMax) : undefined,
      iluminacion: formState.iluminacion || undefined,
      cubierta: formState.cubierta,
      horaApertura: formState.horaApertura || undefined,
      horaCierre: formState.horaCierre || undefined,
      estado: formState.estado || undefined,
      disciplinas: formState.disciplinas,
    };

    try {
      if (isEditing && canchasId) {
        await canchasService.editar(canchasId, payload);
        navigate(ROUTES.admin.sedeCanchaDetalle(sedeId, canchasId), { replace: true });
      } else {
        await canchasService.crear({ ...payload, idSede: sedeId });
        navigate(ROUTES.admin.sedesCanchas(sedeId));
      }
    } catch (err: any) {
      console.error('Error guardando cancha:', err);
      setError(err?.message || 'No se pudieron guardar los cambios');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVolver = () => {
    navigate(ROUTES.admin.sedesCanchas(sedeId));
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <button
          onClick={handleVolver}
          className="rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">Cancha</p>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEditing ? 'Editar cancha' : 'Nueva cancha'}
          </h1>
          <p className="text-sm text-gray-500">
            {sede?.nombre || 'Gestiona el contenido deportivo del sistema'}
          </p>
        </div>
      </div>

      {(loadingDetalle || loadingDisciplinas) && !formState.nombre ? (
        <div className="flex h-52 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm text-gray-600">
              <span>Nombre</span>
              <input
                type="text"
                value={formState.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </label>
            <label className="space-y-1 text-sm text-gray-600">
              <span>Superficie</span>
              <input
                type="text"
                value={formState.superficie}
                onChange={(e) => handleChange('superficie', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </label>
            <label className="space-y-1 text-sm text-gray-600">
              <span>Precio por hora</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={formState.precio}
                onChange={(e) => handleChange('precio', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </label>
            <label className="space-y-1 text-sm text-gray-600">
              <span>Dimensiones</span>
              <input
                type="text"
                value={formState.dimensiones}
                onChange={(e) => handleChange('dimensiones', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </label>
            <label className="space-y-1 text-sm text-gray-600">
              <span>Aforo máximo</span>
              <input
                type="number"
                min={0}
                value={formState.aforoMax}
                onChange={(e) => handleChange('aforoMax', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </label>
            <label className="space-y-1 text-sm text-gray-600">
              <span>Iluminación</span>
              <input
                type="text"
                value={formState.iluminacion}
                onChange={(e) => handleChange('iluminacion', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-1 text-sm text-gray-600">
              <span>Hora apertura</span>
              <input
                type="time"
                value={formState.horaApertura}
                onChange={(e) => handleChange('horaApertura', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </label>
            <label className="space-y-1 text-sm text-gray-600">
              <span>Hora cierre</span>
              <input
                type="time"
                value={formState.horaCierre}
                onChange={(e) => handleChange('horaCierre', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </label>
            <label className="space-y-1 text-sm text-gray-600">
              <span>Estado</span>
              <select
                value={formState.estado}
                onChange={(e) => handleChange('estado', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                {estados.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={formState.cubierta}
              onChange={(e) => handleChange('cubierta', e.target.checked)}
            />
            Techada
          </label>

          <label className="space-y-1 text-sm text-gray-600">
            <span>Descripción</span>
            <textarea
              value={formState.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </label>

          <div className="space-y-2 text-sm text-gray-600">
            <p className="text-sm font-semibold text-gray-900">Disciplinas</p>
            <div className="flex flex-wrap gap-2">
              {loadingDisciplinas ? (
                <p className="text-xs text-gray-400">Cargando disciplinas...</p>
              ) : (
                disciplinas.map((disc) => (
                  <button
                    key={disc.idDisciplina}
                    type="button"
                    onClick={() => toggleDisciplina(disc.idDisciplina)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                      disciplinasMarcadas.has(disc.idDisciplina)
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-200 bg-white text-gray-600'
                    }`}
                  >
                    {disc.nombre}
                  </button>
                ))
              )}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : isEditing ? 'Actualizar cancha' : 'Crear cancha'}
            </button>
            <button
              type="button"
              onClick={handleVolver}
              className="text-sm font-semibold text-gray-600 hover:text-gray-900"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SedeCanchaFormPage;
