import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeDollarSign,
  Layers,
  Lightbulb,
  RefreshCw,
  UploadCloud,
  Users,
} from 'lucide-react';
import { canchaService } from '../../../../../features/canchas/services/cancha.service';
import type { Cancha, Foto } from '../../../../../features/canchas/types/cancha.types';
import { getReservasPorCancha, type ReservaRaw } from '../../../../../features/reservas/services/reserva.service';
import { ROUTE_PATHS } from '../../../../../constants';
import { getImageUrl } from '../../../../../lib/config/api';
import { useAuth } from '../../../../../features/auth/context/AuthContext';
import { bloqueosService, type BloqueoCancha } from '../../../../../features/bloqueos/services/bloqueos.service';
import FixedAspectImage from '../../../../../shared/components/media/FixedAspectImage';

type CanchaRecord = {
  id_cancha: number;
  id_sede: number;
  nombre: string;
  superficie?: string;
  aforoMax?: number;
  precio?: number;
  iluminacion?: string;
};

type ReservaRecord = {
  id_reserva: number;
  id_cliente: number;
  id_cancha: number;
  inicia_en: string;
  termina_en: string;
  monto_total?: number;
};

type FotoRecord = {
  id_foto: number;
  url_foto: string;
};

const mapCourt = (raw: Cancha): CanchaRecord => {
  const rawRecord = (raw as unknown) as Record<string, unknown>;
  const fallbackSede =
    typeof rawRecord.id_sede === 'number' ? (rawRecord.id_sede as number) : undefined;
  return {
    id_cancha: raw.id_cancha,
    id_sede: typeof raw.idSede === 'number' ? raw.idSede : fallbackSede ?? 0,
    nombre: raw.nombre,
    superficie: raw.superficie,
    aforoMax: raw.aforoMax,
    precio: raw.precio,
    iluminacion: raw.iluminacion,
  };
};

const mapReserva = (raw: ReservaRaw): ReservaRecord => ({
  id_reserva: raw.id_reserva,
  id_cliente: raw.id_cliente,
  id_cancha: raw.id_cancha,
  inicia_en: raw.inicia_en,
  termina_en: raw.termina_en,
  monto_total: raw.monto_total,
});

const mapFoto = (raw: Foto): FotoRecord => {
  const record = (raw as unknown) as Record<string, unknown>;
  const id_foto =
    typeof raw.id_foto === 'number' && Number.isFinite(raw.id_foto)
      ? raw.id_foto
      : typeof record.id_foto === 'number' && Number.isFinite(record.id_foto as number)
        ? (record.id_foto as number)
        : 0;
  const url_foto =
    typeof raw.url_foto === 'string' && raw.url_foto.trim().length > 0
      ? raw.url_foto
      : typeof record.url_foto === 'string' && (record.url_foto as string).trim().length > 0
        ? (record.url_foto as string)
        : '';
  return {
    id_foto: id_foto,
    url_foto: url_foto,
  };
};

const OwnerCourtDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const canchaId = Number(id);
  const { isDuenio } = useAuth();
  const [loading, setLoading] = useState(true);
  const [cancha, setCancha] = useState<CanchaRecord | null>(null);
  const [reservas, setReservas] = useState<ReservaRecord[]>([]);
  const [fotos, setFotos] = useState<FotoRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  // Bloqueos state
  const [bloqueos, setBloqueos] = useState<BloqueoCancha[]>([]);
  const [bloqLoading, setBloqLoading] = useState(false);
  const [bloqError, setBloqError] = useState<string | null>(null);
  const [crearBloq, setCrearBloq] = useState<{ fecha: string; horaInicio: string; horaFin: string; motivo: string }>({ fecha: '', horaInicio: '', horaFin: '', motivo: '' });
  const [creatingBloq, setCreatingBloq] = useState(false);

  const refresh = useCallback(async () => {
    if (!Number.isFinite(canchaId)) return;
    setLoading(true);
    try {
      setError(null);
      const court = await canchaService.getById(canchaId);
      setCancha(mapCourt(court));
      const list = await getReservasPorCancha(canchaId);
      setReservas(list.map(mapReserva));
      const gallery = await canchaService.getFotos(canchaId);
      setFotos(gallery.map(mapFoto));
      // load bloqueos
      try {
        setBloqLoading(true);
        setBloqError(null);
        const listBloq = await bloqueosService.getByCancha(canchaId);
        setBloqueos(listBloq);
      } catch (e) {
        const message = e instanceof Error ? e.message : 'No se pudieron cargar los bloqueos';
        setBloqError(message);
      } finally {
        setBloqLoading(false);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo cargar la cancha.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [canchaId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !Number.isFinite(canchaId)) return;
    setUploading(true);
    setUploadError(null);
    try {
      await canchaService.uploadFoto(canchaId, file);
      const gallery = await canchaService.getFotos(canchaId);
      setFotos(gallery.map(mapFoto));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo subir la foto.';
      setUploadError(message);
    } finally {
      setUploading(false);
    }
  };

  const toIsoLocal = (fecha: string, hora: string) => {
    // Construye un ISO con la fecha y hora locales sin zona (backend interpreta como ISO)
    if (!fecha || !hora) return '';
    const iso = new Date(`${fecha}T${hora}:00`).toISOString();
    return iso;
  };

  const onCrearBloqueo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!Number.isFinite(canchaId)) return;
    const { fecha, horaInicio, horaFin, motivo } = crearBloq;
    if (!fecha || !horaInicio || !horaFin) {
      setBloqError('Completa fecha, hora inicio y hora fin');
      return;
    }
    const inicia_en = toIsoLocal(fecha, horaInicio);
    const termina_en = toIsoLocal(fecha, horaFin);
    if (!inicia_en || !termina_en || new Date(termina_en) <= new Date(inicia_en)) {
      setBloqError('La hora fin debe ser mayor a la hora inicio');
      return;
    }
    setCreatingBloq(true);
    setBloqError(null);
    try {
      await bloqueosService.create({ id_cancha: canchaId, inicia_en, termina_en, motivo });
      const listBloq = await bloqueosService.getByCancha(canchaId);
      setBloqueos(listBloq);
      setCrearBloq({ fecha: '', horaInicio: '', horaFin: '', motivo: '' });
    } catch (err: any) {
      const msg = err?.response?.data?.message || (err instanceof Error ? err.message : 'No se pudo crear el bloqueo');
      setBloqError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setCreatingBloq(false);
    }
  };

  const onEliminarBloqueo = async (id_bloqueo: number) => {
    if (!Number.isFinite(canchaId)) return;
    try {
      await bloqueosService.remove(id_bloqueo);
      const listBloq = await bloqueosService.getByCancha(canchaId);
      setBloqueos(listBloq);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo eliminar el bloqueo';
      setBloqError(message);
    }
  };

  if (!isDuenio()) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        <h1 className="text-2xl font-bold text-slate-900">Acceso restringido</h1>
        <p className="mt-2 text-sm text-slate-600">Esta seccion requiere el rol DUENIO.</p>
      </div>
    );
  }

  const sedeLink =
    cancha?.id_sede != null
      ? ROUTE_PATHS.OWNER_VENUE_DETAIL.replace(':id', String(cancha.id_sede))
      : ROUTE_PATHS.OWNER_DASHBOARD;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              to={sedeLink}
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a la sede
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
          ) : cancha ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-400">Cancha</p>
                    <h1 className="text-3xl font-bold text-slate-900">{cancha.nombre}</h1>
                  </div>
                  <dl className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
                    {cancha.superficie ? (
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-slate-400" />
                        <div>
                          <dt className="font-medium text-slate-700">Superficie</dt>
                          <dd>{cancha.superficie}</dd>
                        </div>
                      </div>
                    ) : null}
                    {typeof cancha.aforoMax === 'number' ? (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-400" />
                        <div>
                          <dt className="font-medium text-slate-700">Aforo</dt>
                          <dd>{cancha.aforoMax} personas</dd>
                        </div>
                      </div>
                    ) : null}
                    {cancha.iluminacion ? (
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-slate-400" />
                        <div>
                          <dt className="font-medium text-slate-700">Iluminacion</dt>
                          <dd>{cancha.iluminacion}</dd>
                        </div>
                      </div>
                    ) : null}
                    <div className="flex items-center gap-2">
                      <BadgeDollarSign className="h-4 w-4 text-slate-400" />
                      <div>
                        <dt className="font-medium text-slate-700">Precio</dt>
                        <dd>{typeof cancha.precio === 'number' ? `Bs. ${cancha.precio}` : 'Sin precio'}</dd>
                      </div>
                    </div>
                  </dl>
                </div>
                <div className="space-y-2">
                  <label className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700">
                    <UploadCloud className={`h-4 w-4 ${uploading ? 'animate-bounce' : ''}`} />
                    {uploading ? 'Subiendo...' : 'Subir foto'}
                    <input
                      type="file"
                      className="hidden"
                      accept=".jpg,.jpeg,.png"
                      onChange={onUpload}
                    />
                  </label>
                  <p className="text-xs text-slate-400">
                    Formatos permitidos: JPG, JPEG, PNG (max 2MB).
                  </p>
                  {uploadError ? (
                    <p className="text-xs text-red-600">{uploadError}</p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <main className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        {/* Bloqueos de cancha */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Bloqueos de disponibilidad</h2>
              <p className="text-sm text-slate-500">Define horarios en los que esta cancha no acepta reservas.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {bloqueos.length} {bloqueos.length === 1 ? 'bloqueo' : 'bloqueos'}
            </span>
          </div>

          <form onSubmit={onCrearBloqueo} className="mt-6 grid gap-3 sm:grid-cols-4">
            <div>
              <label className="block text-xs font-medium text-slate-600">Fecha</label>
              <input
                type="date"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                value={crearBloq.fecha}
                onChange={(e) => setCrearBloq((s) => ({ ...s, fecha: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Hora inicio</label>
              <input
                type="time"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                value={crearBloq.horaInicio}
                onChange={(e) => setCrearBloq((s) => ({ ...s, horaInicio: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Hora fin</label>
              <input
                type="time"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                value={crearBloq.horaFin}
                onChange={(e) => setCrearBloq((s) => ({ ...s, horaFin: e.target.value }))}
                required
              />
            </div>
            <div className="sm:col-span-4">
              <label className="block text-xs font-medium text-slate-600">Motivo (opcional)</label>
              <input
                type="text"
                placeholder="Mantenimiento, evento privado, etc."
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                value={crearBloq.motivo}
                onChange={(e) => setCrearBloq((s) => ({ ...s, motivo: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-4">
              <button
                type="submit"
                disabled={creatingBloq}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-60"
              >
                {creatingBloq ? 'Creando bloqueo...' : 'Agregar bloqueo'}
              </button>
              {bloqError ? (
                <span className="ml-3 text-sm text-red-600">{bloqError}</span>
              ) : null}
            </div>
          </form>

          <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
            {bloqLoading ? (
              <div className="p-6 text-sm text-slate-500">Cargando bloqueos...</div>
            ) : bloqueos.length ? (
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">Inicio</th>
                    <th className="px-4 py-2">Fin</th>
                    <th className="px-4 py-2">Motivo</th>
                    <th className="px-4 py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-slate-600">
                  {bloqueos.map((b) => (
                    <tr key={b.id_bloqueo}>
                      <td className="px-4 py-2 font-medium text-slate-700">#{b.id_bloqueo}</td>
                      <td className="px-4 py-2">{new Date(b.inicia_en).toLocaleString()}</td>
                      <td className="px-4 py-2">{new Date(b.termina_en).toLocaleString()}</td>
                      <td className="px-4 py-2">{b.motivo || '-'}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => void onEliminarBloqueo(b.id_bloqueo)}
                          className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-sm text-slate-500">No hay bloqueos para esta cancha.</div>
            )}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900">Galeria</h2>
          {fotos.length ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {fotos.map((foto, idx) => {
                const rawUrl = (foto as any).url_foto || (foto as any).url_foto || '';
                const src = getImageUrl(rawUrl);
                if (!src) return null;
                const key = foto.id_foto ?? `${idx}-${rawUrl}`;
                return (
                  <FixedAspectImage
                    key={key}
                    src={src}
                    alt="Foto de la cancha"
                    ratio={4 / 3}
                    className="shadow-sm"
                  />
                );
              })}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500">
              Todavia no hay fotos para esta cancha. Sube una imagen para mostrarla a los clientes.
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Reservas</h2>
              <p className="text-sm text-slate-500">
                Historial de reservas confirmadas para esta cancha.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {reservas.length} {reservas.length === 1 ? 'reserva' : 'reservas'}
            </span>
          </div>

          {reservas.length ? (
            <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">Inicio</th>
                    <th className="px-4 py-2">Fin</th>
                    <th className="px-4 py-2">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-slate-600">
                  {reservas.map((reserva) => (
                    <tr key={reserva.id_reserva}>
                      <td className="px-4 py-2 font-medium text-slate-700">#{reserva.id_reserva}</td>
                      <td className="px-4 py-2">
                        {new Date(reserva.inicia_en).toLocaleString()}
                      </td>
                      <td className="px-4 py-2">
                        {new Date(reserva.termina_en).toLocaleString()}
                      </td>
                      <td className="px-4 py-2">
                        {typeof reserva.monto_total === 'number' ? `Bs. ${reserva.monto_total}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500">
              Todavia no hay reservas registradas para esta cancha.
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default OwnerCourtDetailPage;
