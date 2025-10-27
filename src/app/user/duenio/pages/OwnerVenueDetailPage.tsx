import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Mail, PlusCircle, RefreshCw } from 'lucide-react';
import { ROUTE_PATHS } from '../../../../constants';
import { useOwnerVenue } from '../hooks/useOwnerVenue';
import OwnerCourtCard from '../components/OwnerCourtCard';
import { canchaService } from '../../../../features/canchas/services/cancha.service';
import type { CreateCanchaRequest } from '../../../../features/canchas/types/cancha.types';

type CourtFormState = {
  nombre: string;
  superficie: string;
  cubierta: boolean;
  aforoMax: number;
  dimensiones: string;
  reglasUso: string;
  iluminacion: string;
  estado: string;
  precio: number;
};

const defaultCourtForm: CourtFormState = {
  nombre: '',
  superficie: 'Cesped sintetico',
  cubierta: false,
  aforoMax: 10,
  dimensiones: '40x20 metros',
  reglasUso: 'Respetar horarios y normas',
  iluminacion: 'LED',
  estado: 'Disponible',
  precio: 100,
};

const OwnerVenueDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const sedeId = Number(id);
  const { venue, loading, error, refresh } = useOwnerVenue(Number.isFinite(sedeId) ? sedeId : null);

  const [form, setForm] = useState<CourtFormState>(defaultCourtForm);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const handleFormChange = <K extends keyof CourtFormState>(key: K, value: CourtFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateCourt = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!sedeId) return;

    setCreating(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const payload: CreateCanchaRequest & { id_sede: number } = {
        idSede: sedeId,
        id_sede: sedeId,
        nombre: form.nombre,
        superficie: form.superficie,
        cubierta: form.cubierta,
        aforoMax: form.aforoMax,
        dimensiones: form.dimensiones,
        reglasUso: form.reglasUso,
        iluminacion: form.iluminacion,
        estado: form.estado,
        precio: form.precio,
      };

      await canchaService.create(payload);
      setForm(defaultCourtForm);
      setFormSuccess(`La cancha "${form.nombre}" se registro correctamente.`);
      await refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo crear la cancha.';
      setFormError(message);
    } finally {
      setCreating(false);
    }
  };

  const courtCount = venue?.canchas?.length ?? 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              to={ROUTE_PATHS.OWNER_DASHBOARD}
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al panel
            </Link>
            <button
              type="button"
              onClick={() => void refresh()}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-700"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>

          {loading ? (
            <div className="h-36 animate-pulse rounded-2xl bg-slate-200"></div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : venue ? (
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">Sede</p>
                  <h1 className="text-3xl font-bold text-slate-900">{venue.nombre}</h1>
                  {venue.descripcion ? (
                    <p className="mt-2 max-w-3xl text-sm text-slate-500">{venue.descripcion}</p>
                  ) : null}
                </div>
                <div className="rounded-full bg-indigo-50 px-4 py-1 text-sm font-semibold text-indigo-600">
                  {courtCount === 1 ? '1 cancha' : `${courtCount} canchas`}
                </div>
              </div>

              <div className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
                {venue.direccion ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span>{venue.direccion}</span>
                  </div>
                ) : null}
                {venue.telefono ? (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span>{venue.telefono}</span>
                  </div>
                ) : null}
                {venue.email ? (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span>{venue.email}</span>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <main className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Agregar nueva cancha</h2>
              <p className="text-sm text-slate-500">
                Completa los campos requeridos para registrar una cancha dentro de esta sede.
              </p>
            </div>
          </header>

          <form className="mt-6 space-y-6" onSubmit={handleCreateCourt}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm text-slate-600">
                Nombre
                <input
                  required
                  value={form.nombre}
                  onChange={(event) => handleFormChange('nombre', event.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                  placeholder="Ej. Cancha principal"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-slate-600">
                Superficie
                <input
                  required
                  value={form.superficie}
                  onChange={(event) => handleFormChange('superficie', event.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                  placeholder="Ej. Cesped sintetico"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-slate-600">
                Dimensiones
                <input
                  required
                  value={form.dimensiones}
                  onChange={(event) => handleFormChange('dimensiones', event.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                  placeholder="Ej. 40x20 metros"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-slate-600">
                Reglas de uso
                <input
                  required
                  value={form.reglasUso}
                  onChange={(event) => handleFormChange('reglasUso', event.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                  placeholder="Ej. Uso obligatorio de calzado adecuado"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-slate-600">
                Iluminacion
                <input
                  required
                  value={form.iluminacion}
                  onChange={(event) => handleFormChange('iluminacion', event.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-slate-600">
                Estado
                <input
                  required
                  value={form.estado}
                  onChange={(event) => handleFormChange('estado', event.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-slate-600">
                Aforo maximo
                <input
                  required
                  type="number"
                  min={1}
                  value={form.aforoMax}
                  onChange={(event) => handleFormChange('aforoMax', Number(event.target.value))}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-slate-600">
                Precio
                <input
                  required
                  type="number"
                  min={0}
                  step="0.5"
                  value={form.precio}
                  onChange={(event) => handleFormChange('precio', Number(event.target.value))}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                />
              </label>
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={form.cubierta}
                onChange={(event) => handleFormChange('cubierta', event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Cancha cubierta
            </label>

            {formError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            ) : null}
            {formSuccess ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {formSuccess}
              </div>
            ) : null}

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-60"
                disabled={creating}
              >
                <PlusCircle className={`h-4 w-4 ${creating ? 'animate-spin' : ''}`} />
                {creating ? 'Guardando...' : 'Agregar cancha'}
              </button>
            </div>
          </form>
        </section>

        <section className="space-y-4">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Canchas registradas</h2>
              <p className="text-sm text-slate-500">
                Visualiza cada cancha como una tarjeta con su informacion clave.
              </p>
            </div>
          </header>

          {venue?.canchas?.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {venue.canchas.map((court) => (
                <OwnerCourtCard key={court.id_cancha} court={court} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <p className="text-sm text-slate-500">
                Esta sede todavia no tiene canchas registradas. Utiliza el formulario de arriba para crear la primera.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default OwnerVenueDetailPage;
