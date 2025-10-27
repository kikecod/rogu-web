import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { ROUTE_PATHS } from '../../../../constants';
import { useAuth } from '../../../../features/auth/context/AuthContext';
import { sedeService } from '../../../../features/sedes/services/sede.service';
import type { CreateSedeRequest } from '../../../../features/sedes/types/sede.types';

type VenueFormState = {
  nombre: string;
  descripcion: string;
  direccion: string;
  latitud: string;
  longitud: string;
  telefono: string;
  email: string;
  politicas: string;
  estado: string;
  NIT: string;
  licencia_funcionamiento: string;
};

const defaultForm: VenueFormState = {
  nombre: '',
  descripcion: '',
  direccion: '',
  latitud: '-16.5',
  longitud: '-68.15',
  telefono: '',
  email: '',
  politicas: 'Reglamento general',
  estado: 'ACTIVO',
  NIT: '',
  licencia_funcionamiento: '',
};

type CreateVenuePayload = VenueFormState & { id_persona_d: number };

const OwnerVenueCreatePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<VenueFormState>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    field: keyof VenueFormState,
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.id_persona) {
      setError('No se pudo identificar al usuario autenticado.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload: CreateVenuePayload = {
        id_persona_d: user.id_persona,
        ...form,
      };

      await sedeService.create(payload as unknown as CreateSedeRequest);

      navigate(ROUTE_PATHS.OWNER_VENUES, {
        replace: true,
        state: { justCreated: true, venueName: form.nombre },
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'No se pudo registrar la sede. Intenta nuevamente.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <Link
            to={ROUTE_PATHS.OWNER_VENUES}
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a sedes
          </Link>
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">Nueva sede</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Registrar una nueva sede</h1>
            <p className="mt-2 text-sm text-slate-500">
              Completa la informacion de la ubicacion y guarda para comenzar a agregar canchas.
            </p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <form
          className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          onSubmit={handleSubmit}
        >
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Informacion general</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm text-slate-600">
                Nombre de la sede
                <input
                  required
                  value={form.nombre}
                  onChange={(event) => handleChange('nombre', event.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                  placeholder="Ej. Centro Deportivo La Paz"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-slate-600">
                Telefono de contacto
                <input
                  value={form.telefono}
                  onChange={(event) => handleChange('telefono', event.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                  placeholder="Ej. 70000000"
                />
              </label>
            </div>
            <label className="flex flex-col gap-1 text-sm text-slate-600">
              Descripcion
              <textarea
                rows={4}
                value={form.descripcion}
                onChange={(event) => handleChange('descripcion', event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                placeholder="Incluye detalles generales de la sede."
              />
            </label>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Ubicacion y contacto</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm text-slate-600 sm:col-span-2">
                Direccion
                <input
                  required
                  value={form.direccion}
                  onChange={(event) => handleChange('direccion', event.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                  placeholder="Ej. Av. Siempre Viva 123"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-slate-600">
                Latitud
                <input
                  value={form.latitud}
                  onChange={(event) => handleChange('latitud', event.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-slate-600">
                Longitud
                <input
                  value={form.longitud}
                  onChange={(event) => handleChange('longitud', event.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-slate-600">
                Correo electronico
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => handleChange('email', event.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                  placeholder="Ej. contacto@sede.com"
                />
              </label>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Detalles adicionales</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm text-slate-600">
                Politicas
                <textarea
                  rows={3}
                  value={form.politicas}
                  onChange={(event) => handleChange('politicas', event.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-slate-600">
                Estado
                <select
                  value={form.estado}
                  onChange={(event) => handleChange('estado', event.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm text-slate-600">
                NIT
                <input
                  value={form.NIT}
                  onChange={(event) => handleChange('NIT', event.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-slate-600">
                Licencia de funcionamiento
                <input
                  value={form.licencia_funcionamiento}
                  onChange={(event) => handleChange('licencia_funcionamiento', event.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                />
              </label>
            </div>
          </section>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Link
              to={ROUTE_PATHS.OWNER_VENUES}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-700"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-60"
              disabled={submitting}
            >
              <Save className={`h-4 w-4 ${submitting ? 'animate-pulse' : ''}`} />
              {submitting ? 'Guardando...' : 'Guardar sede'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default OwnerVenueCreatePage;
