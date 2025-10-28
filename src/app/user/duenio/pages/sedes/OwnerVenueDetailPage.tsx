import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  PlusCircle,
  RefreshCw,
  Building2,
} from "lucide-react";
import { ROUTE_PATHS } from "../../../../../constants";
import { useOwnerVenue } from "../../hooks/useOwnerVenue";
import OwnerCourtCard from "../../components/OwnerCourtCard";
import { canchaService } from "../../../../../features/canchas/services/cancha.service";
import { formatPrice } from "../../../../../shared/utils/format";
import { getImageUrl } from "../../../../../lib/config/api";

const OwnerVenueDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const sedeId = Number(id);
  const { venue, loading, error, refresh } = useOwnerVenue(
    Number.isFinite(sedeId) ? sedeId : null,
  );

  const [galleryItems, setGalleryItems] = useState<
    Array<{ id: string; url: string; courtId: number; courtName: string }>
  >([]);
  const [, setGalleryLoading] = useState(false);

  const venueStats = useMemo(() => {
    if (!venue) {
      const pendingLabel = loading ? "Cargando..." : "Sin datos";
      return [
        {
          label: "Canchas registradas",
          value: pendingLabel,
          helper: "Cantidad total asociada a esta sede.",
        },
        {
          label: "Capacidad combinada",
          value: pendingLabel,
          helper: "Suma de los aforos maximos declarados.",
        },
        {
          label: "Precio promedio",
          value: pendingLabel,
          helper: "Promedio de los precios base por cancha.",
        },
      ];
    }

    const canchas = venue.canchas ?? [];
    const totalCapacity = canchas.reduce(
      (acc, court) => acc + (typeof court.aforoMax === "number" ? court.aforoMax : 0),
      0,
    );
    const priceValues = canchas
      .map((court) =>
        typeof court.precio === "number" && Number.isFinite(court.precio) ? court.precio : null,
      )
      .filter((value): value is number => value !== null);
    const averagePrice =
      priceValues.length > 0
        ? formatPrice(
            priceValues.reduce((acc, value) => acc + value, 0) / Math.max(priceValues.length, 1),
          )
        : null;

    return [
      {
        label: "Canchas registradas",
        value: canchas.length || "Sin datos",
        helper: "Disponibles para tus clientes.",
      },
      {
        label: "Capacidad combinada",
        value: totalCapacity ? `${totalCapacity} personas` : "Sin datos",
        helper: "Suma de los aforos declarados.",
      },
      {
        label: "Precio promedio",
        value: averagePrice ?? "Sin datos",
        helper: priceValues.length
          ? "Promedio de los precios base por cancha."
          : "Registra precios para mostrar la media.",
      },
    ];
  }, [venue, loading]);

  useEffect(() => {
    let cancelled = false;

    const loadGallery = async () => {
      if (!venue?.canchas?.length) {
        if (!cancelled) {
          setGalleryItems([]);
          setGalleryLoading(false);
        }
        return;
      }

      setGalleryLoading(true);
      try {
        const results = await Promise.all(
          venue.canchas.map(async (court) => {
            try {
              const fotos = await canchaService.getFotos(court.id_cancha);
              return fotos
                .map((foto, index) => {
                  const rawUrl =
                    typeof (foto as any).url_foto === "string" && (foto as any).url_foto.trim().length > 0
                      ? (foto as any).url_foto
                      : typeof (foto as any).url_foto === "string"
                        ? (foto as any).url_foto
                        : "";
                  const resolvedUrl = rawUrl ? getImageUrl(rawUrl) : "";
                  if (!resolvedUrl) return null;
                  const uniqueId =
                    (foto as any).id_foto ?? (foto as any).id_foto ?? `${court.id_cancha}-${index}`;
                  return {
                    id: `${court.id_cancha}-${uniqueId}`,
                    url: resolvedUrl,
                    courtId: court.id_cancha,
                    courtName: court.nombre,
                  };
                })
                .filter(
                  (
                    item,
                  ): item is {
                    id: string;
                    url: string;
                    courtId: number;
                    courtName: string;
                  } => Boolean(item && item.url),
                );
            } catch {
              return [];
            }
          }),
        );

        if (!cancelled) {
          const flattened = results.flat();
          const unique: Array<{
            id: string;
            url: string;
            courtId: number;
            courtName: string;
          }> = [];
          const seen = new Set<string>();
          for (const item of flattened) {
            if (!item || seen.has(item.url)) continue;
            seen.add(item.url);
            unique.push(item);
            if (unique.length >= 12) break;
          }
          setGalleryItems(unique);
        }
      } finally {
        if (!cancelled) {
          setGalleryLoading(false);
        }
      }
    };

    if (venue?.canchas?.length) {
      void loadGallery();
    } else {
      setGalleryItems([]);
      setGalleryLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [venue?.canchas]);

  const courtCoverMap = useMemo(() => {
    const map = new Map<number, string>();
    galleryItems.forEach((item) => {
      if (!map.has(item.courtId)) {
        map.set(item.courtId, item.url);
      }
    });
    return map;
  }, [galleryItems]);

  const contactCards = useMemo(
    () => [
      {
        icon: MapPin,
        label: "Direccion",
        value: venue?.direccion ?? "No registrada",
        helper: "Ubicacion principal de la sede.",
      },
      {
        icon: Phone,
        label: "Telefono",
        value: venue?.telefono ?? "No disponible",
        helper: "Numero de contacto para clientes.",
      },
      {
        icon: Mail,
        label: "Correo electronico",
        value: venue?.email ?? "No especificado",
        helper: "Canal oficial para consultas.",
      },
    ],
    [venue?.direccion, venue?.telefono, venue?.email],
  );

  const courtCount = venue?.canchas?.length ?? 0;
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-blue-700 to-indigo-600 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.25),_transparent_55%)] opacity-60" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-4">
              <Link
                to={ROUTE_PATHS.OWNER_DASHBOARD}
                className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition-colors hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al panel
              </Link>
              <div className="space-y-2">
                <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-white/70">
                  <Building2 className="h-4 w-4" />
                  Gestion de sede
                </p>
                <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
                  {loading ? "Cargando sede..." : venue?.nombre ?? "Sede no encontrada"}
                </h1>
                <p className="max-w-3xl text-sm text-indigo-100">
                  {venue?.descripcion
                    ? venue.descripcion
                    : "Manten actualizada la informacion de esta sede para brindar una mejor experiencia a tus clientes."}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                {courtCount === 1 ? "1 cancha registrada" : `${courtCount} canchas registradas`}
              </span>
              <button
                type="button"
                onClick={() => void refresh()}
                className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-60"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Actualizar datos
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {venueStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/20 bg-white/10 p-5 shadow-sm backdrop-blur"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-100">
                  {stat.label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
                <p className="mt-1 text-xs text-indigo-100/80">{stat.helper}</p>
              </div>
            ))}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid gap-6">
            <div className="h-32 animate-pulse rounded-2xl bg-slate-200" />
            <div className="h-56 animate-pulse rounded-2xl bg-slate-200" />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-48 animate-pulse rounded-2xl bg-slate-200" />
              <div className="h-48 animate-pulse rounded-2xl bg-slate-200" />
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        ) : !venue ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 text-sm text-amber-700 shadow-sm">
            No se encontro la sede solicitada. Verifica el enlace o selecciona otra desde el panel.
          </div>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              {contactCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <card.icon className="h-5 w-5 text-indigo-500" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {card.label}
                      </p>
                      <p className="text-sm font-medium text-slate-900">{card.value}</p>
                      <p className="text-xs text-slate-500">{card.helper}</p>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            <section className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm sm:p-8">
              <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Gestionar canchas</h2>
                  <p className="text-sm text-slate-500">
                    Registra nuevas canchas desde la vista dedicada y continua administrando fotos, bloqueos y reservas desde aqui.
                  </p>
                </div>
                <Link
                  to={
                    sedeId
                      ? ROUTE_PATHS.OWNER_COURT_CREATE.replace(":sedeId?", String(sedeId))
                      : ROUTE_PATHS.OWNER_COURT_CREATE.replace("/:sedeId?", "")
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
                >
                  <PlusCircle className="h-4 w-4" />
                  Agregar cancha
                </Link>
              </header>
            </section>

            <section className="space-y-4">
              <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Canchas registradas</h2>
                  <p className="text-sm text-slate-500">
                    Visualiza informacion resumida y accede rapidamente al detalle de cada cancha.
                  </p>
                </div>
              </header>

              {venue.canchas?.length ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {venue.canchas.map((court) => (
                    <OwnerCourtCard
                      key={court.id_cancha}
                      court={court}
                      coverImage={courtCoverMap.get(court.id_cancha) ?? null}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
                  Esta sede todavia no tiene canchas registradas. Usa el boton "Agregar cancha" para registrar la primera.
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default OwnerVenueDetailPage;



