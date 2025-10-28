import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, PlusCircle, Loader2, Building2 } from "lucide-react";
import { ROUTE_PATHS } from "../../../../../constants";
import { useOwnerSedes } from "../../hooks/useOwnerSedes";
import { canchaService } from "../../../../../features/canchas/services/cancha.service";
import type { CreateCanchaRequest } from "../../../../../features/canchas/types/cancha.types";

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

const defaultFormState: CourtFormState = {
  nombre: "",
  superficie: "Cesped sintetico",
  cubierta: false,
  aforoMax: 10,
  dimensiones: "40x20 metros",
  reglasUso: "Respetar horarios y normas",
  iluminacion: "LED",
  estado: "Disponible",
  precio: 100,
};

const OwnerCourtCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { sedeId: sedeIdParam } = useParams<{ sedeId?: string }>();
  const parsedInitialSedeId = sedeIdParam ? Number(sedeIdParam) : undefined;
  const initialSedeId =
    typeof parsedInitialSedeId === "number" && Number.isFinite(parsedInitialSedeId)
      ? parsedInitialSedeId
      : undefined;

  const { sedes, loading: loadingSedes, error: sedesError } = useOwnerSedes();

  const [selectedSedeId, setSelectedSedeId] = useState<number | "">(
    Number.isFinite(initialSedeId) ? (initialSedeId as number) : ""
  );
  const [form, setForm] = useState<CourtFormState>(defaultFormState);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const hasSedes = useMemo(() => sedes && sedes.length > 0, [sedes]);
  const selectedSedeExists = useMemo(() => {
    if (selectedSedeId === "") return false;
    return sedes.some((sede) => sede.id_sede === selectedSedeId);
  }, [selectedSedeId, sedes]);

  useEffect(() => {
    if (!hasSedes) return;
    const firstSedeId = sedes[0].id_sede;

    if (selectedSedeId === "" || !sedes.some((s) => s.id_sede === selectedSedeId)) {
      setSelectedSedeId(firstSedeId);
    }
  }, [hasSedes, sedes, selectedSedeId]);

  const handleFormChange = <K extends keyof CourtFormState>(
    key: K,
    value: CourtFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    if (selectedSedeId === "") {
      setSubmitError("Selecciona una sede para asociar la cancha.");
      return;
    }

    const payload: CreateCanchaRequest = {
      id_sede: selectedSedeId,
      nombre: form.nombre.trim(),
      superficie: form.superficie.trim(),
      cubierta: Boolean(form.cubierta),
      aforoMax: Number(form.aforoMax),
      dimensiones: form.dimensiones.trim(),
      reglasUso: form.reglasUso.trim(),
      iluminacion: form.iluminacion.trim(),
      estado: form.estado.trim(),
      precio: Number(form.precio),
    };

    try {
      setSubmitting(true);
      await canchaService.create(payload);
      setForm(defaultFormState);
      const destination = ROUTE_PATHS.OWNER_VENUE_DETAIL.replace(
        ":id",
        String(selectedSedeId),
      );
      navigate(destination, { replace: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo crear la cancha.";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderContent = () => {
    if (loadingSedes) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-12 text-sm text-slate-600 shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          <span>Cargando sedes disponibles...</span>
        </div>
      );
    }

    if (sedesError) {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700 shadow-sm">
          {sedesError}
        </div>
      );
    }

    if (!hasSedes) {
      return (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 text-sm text-amber-700 shadow-sm">
          <p className="font-semibold">Aún no tienes sedes registradas.</p>
          <p className="mt-1">
            Crea una sede primero para poder asociar tus canchas.
          </p>
          <Link
            to={ROUTE_PATHS.OWNER_VENUE_CREATE}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            <Building2 className="h-4 w-4" />
            Crear sede
          </Link>
        </div>
      );
    }

    return (
      <form className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-slate-600 md:col-span-2">
            Sede
            <select
              required
              value={selectedSedeId === "" ? "" : selectedSedeId}
              onChange={(event) => {
                const value = event.target.value;
                setSelectedSedeId(value ? Number(value) : "");
              }}
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
            >
              <option value="" disabled>
                Selecciona la sede
              </option>
              {sedes.map((sede) => (
                <option key={sede.id_sede} value={sede.id_sede}>
                  {sede.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-600 md:col-span-2">
            Nombre de la cancha
            <input
              required
              value={form.nombre}
              onChange={(event) => handleFormChange("nombre", event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
              placeholder="Ej. Cancha principal"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-600">
            Superficie
            <input
              required
              value={form.superficie}
              onChange={(event) => handleFormChange("superficie", event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
              placeholder="Ej. Cesped sintetico"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-600">
            Dimensiones
            <input
              required
              value={form.dimensiones}
              onChange={(event) => handleFormChange("dimensiones", event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
              placeholder="Ej. 40x20 metros"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-600 md:col-span-2">
            Reglas de uso
            <textarea
              required
              rows={3}
              value={form.reglasUso}
              onChange={(event) => handleFormChange("reglasUso", event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
              placeholder="Ej. Uso obligatorio de calzado adecuado"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-600">
            Iluminación
            <input
              required
              value={form.iluminacion}
              onChange={(event) => handleFormChange("iluminacion", event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
            />
          </label>

  <label className="flex flex-col gap-1 text-sm text-slate-600">
            Estado
            <input
              required
              value={form.estado}
              onChange={(event) => handleFormChange("estado", event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
              placeholder="Ej. Disponible"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-600">
            Aforo máximo
            <input
              required
              type="number"
              min={1}
              value={form.aforoMax}
              onChange={(event) => handleFormChange("aforoMax", Number(event.target.value))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-600">
            Precio base (BOB)
            <input
              required
              type="number"
              min={0}
              step="0.5"
              value={form.precio}
              onChange={(event) => handleFormChange("precio", Number(event.target.value))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
              placeholder="Ej. 120"
            />
          </label>
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={form.cubierta}
            onChange={(event) => handleFormChange("cubierta", event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Cancha cubierta
        </label>

        {submitError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        ) : null}

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4" />
                Registrar cancha
              </>
            )}
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3">
            <Link
              to={
                selectedSedeExists && selectedSedeId !== ""
                  ? ROUTE_PATHS.OWNER_VENUE_DETAIL.replace(
                      ":id",
                      String(selectedSedeId),
                    )
                  : ROUTE_PATHS.OWNER_VENUES
              }
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Registrar una nueva cancha
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Completa la información principal y asocia la cancha a una de tus sedes activas.
            </p>
          </div>
        </header>

        <main className="mt-8 space-y-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default OwnerCourtCreatePage;

