import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, UserCircle2, MapPin, NotebookPen, Sparkles, XCircle, PencilLine } from 'lucide-react';
import type { ClienteProfile, ControladorProfile, DuenioProfile, PersonaProfile } from '../types/profile.types';
import profileService from '../services/profileService';

type Feedback =
  | { type: 'success'; message: string }
  | { type: 'error'; message: string }
  | null;

interface Props {
  persona: PersonaProfile | null;
  cliente: ClienteProfile | null;
  duenio?: DuenioProfile | null;
  controlador?: ControladorProfile | null;
  onUpdated?: () => void;
}

const ProfilePersonalInfoForm: React.FC<Props> = ({ persona, cliente, duenio, controlador, onUpdated }) => {
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formState, setFormState] = useState(() => ({
    nombres: persona?.nombres ?? '',
    paterno: persona?.paterno ?? '',
    materno: persona?.materno ?? '',
    documentoTipo: (persona?.documentoTipo as string) ?? '',
    documentoNumero: persona?.documentoNumero ?? '',
    telefono: persona?.telefono ?? '',
    direccion: persona?.direccion ?? '',
    ciudad: persona?.ciudad ?? '',
    pais: persona?.pais ?? '',
    ocupacion: persona?.ocupacion ?? '',
    bio: persona?.bio ?? '',
    deportesFavoritos: Array.isArray(persona?.deportesFavoritos)
      ? persona?.deportesFavoritos?.join(', ') ?? ''
      : typeof persona?.deportesFavoritos === 'string'
        ? persona.deportesFavoritos
        : '',
    apodo: cliente?.apodo ?? '',
    nivel: cliente?.nivel ?? 1,
    observaciones: cliente?.observaciones ?? '',
  }));

  useEffect(() => {
    setFormState({
      nombres: persona?.nombres ?? '',
      paterno: persona?.paterno ?? '',
      materno: persona?.materno ?? '',
      documentoTipo: (persona?.documentoTipo as string) ?? '',
      documentoNumero: persona?.documentoNumero ?? '',
      telefono: persona?.telefono ?? '',
      direccion: persona?.direccion ?? '',
      ciudad: persona?.ciudad ?? '',
      pais: persona?.pais ?? '',
      ocupacion: persona?.ocupacion ?? '',
      bio: persona?.bio ?? '',
      deportesFavoritos: Array.isArray(persona?.deportesFavoritos)
        ? persona?.deportesFavoritos?.join(', ') ?? ''
        : typeof persona?.deportesFavoritos === 'string'
          ? persona.deportesFavoritos
          : '',
      apodo: cliente?.apodo ?? '',
      nivel: cliente?.nivel ?? 1,
      observaciones: cliente?.observaciones ?? '',
    });
    setIsEditing(false);
  }, [persona, cliente]);

  const isCliente = useMemo(() => Boolean(cliente), [cliente]);
  const isDuenio = useMemo(() => Boolean(duenio), [duenio]);
  const isControlador = useMemo(() => Boolean(controlador), [controlador]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: name === 'nivel' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback(null);
    setSaving(true);

    try {
      const deportes = formState.deportesFavoritos
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      await profileService.updateProfileSections({
        persona: {
          nombres: formState.nombres.trim(),
          paterno: formState.paterno.trim(),
          materno: formState.materno.trim(),
          documentoTipo: formState.documentoTipo?.trim() || undefined, // <- mantiene cualquier valor (soluciona "documento" perdido)
          documentoNumero: formState.documentoNumero?.trim() || undefined,
          telefono: formState.telefono.trim(),
          direccion: formState.direccion.trim(),
          ciudad: formState.ciudad.trim(),
          pais: formState.pais.trim(),
          ocupacion: formState.ocupacion.trim(),
          bio: formState.bio.trim(),
          deportesFavoritos: deportes,
        },
        cliente: isCliente
          ? {
              apodo: formState.apodo.trim() || null,
              nivel: Number(formState.nivel) || 1,
              observaciones: formState.observaciones.trim() || null,
            }
          : undefined,
      });

      setFeedback({ type: 'success', message: 'Información personal actualizada correctamente.' });
      onUpdated?.();
      setIsEditing(false);
    } catch (error: any) {
      setFeedback({
        type: 'error',
        message: error?.message ?? 'No se pudieron guardar los cambios.',
      });
    } finally {
      setSaving(false);
    }
  };

  const renderChips = (items: string[]) => (
    <div className="flex flex-wrap gap-2">
      {items.map((tag, idx) => (
        <span
          key={`${tag}-${idx}`}
          className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xxs sm:text-xs font-medium"
        >
          {tag}
        </span>
      ))}
    </div>
  );

  const deportesList = (() => {
    if (!persona?.deportesFavoritos) return [] as string[];
    return Array.isArray(persona.deportesFavoritos)
      ? persona.deportesFavoritos.filter(Boolean)
      : String(persona.deportesFavoritos).split(',').map(s => s.trim()).filter(Boolean);
  })();

  const documentoLabel = (() => {
    const tipo = persona?.documentoTipo?.toString().trim();
    const num = persona?.documentoNumero?.toString().trim();
    if (tipo && num) return `${tipo} ${num}`;
    if (num) return num;
    if (tipo) return tipo;
    return 'No registrado';
  })();

  const ReadonlyRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
    <div>
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="min-h-[1.5rem] text-sm sm:text-base text-neutral-900">
        {value ?? <span className="text-neutral-400">No registrado</span>}
      </div>
    </div>
  );

  return (
    <section className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 md:p-7 shadow-sm hover:shadow-md transition">
      {/* header tipo card */}
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <UserCircle2 className="h-5 w-5 text-indigo-600" />
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-neutral-900">Información personal</h2>
            <p className="text-sm text-neutral-500">Ve tus datos y edítalos cuando lo necesites.</p>
          </div>
        </div>
        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-300 text-sm text-neutral-700 hover:bg-neutral-100 transition"
          >
            <PencilLine className="h-4 w-4" />
            Editar
          </button>
        ) : null}
      </div>

      {feedback && (
        <div
          className={`mb-5 inline-flex items-start gap-2 px-3 py-2 rounded-lg border text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <Sparkles className="mt-0.5 h-4 w-4" />
          ) : (
            <XCircle className="mt-0.5 h-4 w-4" />
          )}
          <span className="break-words">{feedback.message}</span>
        </div>
      )}

      {!isEditing ? (
        <div className="space-y-6">
          {/* Documento (visible en modo lectura) */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <ReadonlyRow label="Documento" value={documentoLabel} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <ReadonlyRow label="Nombres" value={persona?.nombres} />
            <ReadonlyRow label="Apellido paterno" value={persona?.paterno} />
            <ReadonlyRow label="Apellido materno" value={persona?.materno} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <ReadonlyRow label="Teléfono" value={persona?.telefono} />
            <ReadonlyRow label="Ocupación" value={persona?.ocupacion} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <ReadonlyRow label="Dirección" value={persona?.direccion} />
            <ReadonlyRow label="Ciudad" value={persona?.ciudad} />
            <ReadonlyRow label="País" value={persona?.pais} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ReadonlyRow label="Biografía" value={persona?.bio} />
            <div>
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Deportes favoritos</div>
              {deportesList.length ? renderChips(deportesList) : (
                <div className="text-sm text-neutral-400">No registrado</div>
              )}
            </div>
          </div>

          {isCliente ? (
            <div className="rounded-xl border border-neutral-200 p-4 bg-white space-y-4">
              <div className="flex items-center gap-2 text-neutral-700">
                <NotebookPen className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-semibold uppercase tracking-wide">Perfil como cliente</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <ReadonlyRow label="Apodo" value={cliente?.apodo ?? undefined} />
                <ReadonlyRow label="Nivel" value={cliente?.nivel ?? undefined} />
              </div>
              <ReadonlyRow label="Observaciones" value={cliente?.observaciones ?? undefined} />
            </div>
          ) : null}

          {/* Resumen de roles no editables: Due f1o y Controlador */}
          {isDuenio ? (
            <div className="rounded-xl border border-neutral-200 p-4 bg-white space-y-3">
              <div className="flex items-center gap-2 text-neutral-700">
                <NotebookPen className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-semibold uppercase tracking-wide">Perfil como due f1o</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ReadonlyRow label="Estado de verificaci f3n" value={duenio?.verificado ? 'Verificado' : 'Pendiente'} />
                <ReadonlyRow label=" daltima verificaci f3n" value={duenio?.verificado ? (duenio?.verificadoEn ? new Date(duenio.verificadoEn as any).toLocaleString('es-BO') : 'No registrada') : 'No registrada'} />
              </div>
            </div>
          ) : null}

          {isControlador ? (
            <div className="rounded-xl border border-neutral-200 p-4 bg-white space-y-3">
              <div className="flex items-center gap-2 text-neutral-700">
                <NotebookPen className="h-4 w-4 text-purple-600" />
                <h3 className="text-sm font-semibold uppercase tracking-wide">Perfil como controlador</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <ReadonlyRow label="C f3digo de empleado" value={controlador?.codigoEmpleado ?? 'No asignado'} />
                <ReadonlyRow label="Turno" value={controlador?.turno ?? 'No definido'} />
                <ReadonlyRow label="Estado" value={controlador?.activo ? 'Activo' : 'Inactivo'} />
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field
              label="Nombres"
              name="nombres"
              value={formState.nombres}
              onChange={handleChange}
              required
            />
            <Field label="Apellido paterno" name="paterno" value={formState.paterno} onChange={handleChange} />
            <Field label="Apellido materno" name="materno" value={formState.materno} onChange={handleChange} />
          </div>

          {/* Documento (tipo libre con sugerencias + número) */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500">
                Tipo de documento
              </label>
              <input
                list="doc-types"
                name="documentoTipo"
                value={formState.documentoTipo}
                onChange={handleChange}
                placeholder="CI, DNI, NIT, Pasaporte…"
                className="w-full px-3 py-2 rounded-lg text-sm border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition bg-white"
              />
              <datalist id="doc-types">
                <option value="CI" />
                <option value="DNI" />
                <option value="NIT" />
                <option value="Pasaporte" />
                <option value="CE" />
                <option value="TI" />
              </datalist>
            </div>

            <Field
              label="Número de documento"
              name="documentoNumero"
              value={formState.documentoNumero}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field
              label="Teléfono"
              name="telefono"
              value={formState.telefono}
              onChange={handleChange}
              placeholder="+591 70000000"
            />
            <Field label="Ocupación" name="ocupacion" value={formState.ocupacion} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Dirección" name="direccion" value={formState.direccion} onChange={handleChange} icon={MapPin} />
            <Field label="Ciudad" name="ciudad" value={formState.ciudad} onChange={handleChange} />
            <Field label="País" name="pais" value={formState.pais} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Textarea
              label="Biografía"
              name="bio"
              value={formState.bio}
              onChange={handleChange}
              placeholder="Cuéntales a los demás sobre ti, tu experiencia o tus deportes favoritos."
            />
            <Textarea
              label="Deportes favoritos (separados por coma)"
              name="deportesFavoritos"
              value={formState.deportesFavoritos}
              onChange={handleChange}
              placeholder="Fútbol, Running, Tenis"
            />
          </div>

          {isCliente && (
            <div className="rounded-xl border border-neutral-200 p-4 bg-white space-y-4">
              <div className="flex items-center gap-2 text-neutral-700">
                <NotebookPen className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-semibold uppercase tracking-wide">Perfil como cliente</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Field label="Apodo deportivo" name="apodo" value={formState.apodo} onChange={handleChange} />
                <Field
                  label="Nivel"
                  name="nivel"
                  type="number"
                  min={1}
                  value={String(formState.nivel ?? '')}
                  onChange={handleChange}
                />
              </div>
              <Textarea
                label="Observaciones"
                name="observaciones"
                value={formState.observaciones}
                onChange={handleChange}
                placeholder="Notas sobre tu estilo de juego, posiciones favoritas, etc."
              />
            </div>
          )}

          {/* footer tipo card */}
          <div className="mt-2 border-t border-neutral-200 pt-4 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setFormState({
                  nombres: persona?.nombres ?? '',
                  paterno: persona?.paterno ?? '',
                  materno: persona?.materno ?? '',
                  documentoTipo: (persona?.documentoTipo as string) ?? '',
                  documentoNumero: persona?.documentoNumero ?? '',
                  telefono: persona?.telefono ?? '',
                  direccion: persona?.direccion ?? '',
                  ciudad: persona?.ciudad ?? '',
                  pais: persona?.pais ?? '',
                  ocupacion: persona?.ocupacion ?? '',
                  bio: persona?.bio ?? '',
                  deportesFavoritos: Array.isArray(persona?.deportesFavoritos)
                    ? persona?.deportesFavoritos?.join(', ') ?? ''
                    : typeof persona?.deportesFavoritos === 'string'
                      ? persona.deportesFavoritos
                      : '',
                  apodo: cliente?.apodo ?? '',
                  nivel: cliente?.nivel ?? 1,
                  observaciones: cliente?.observaciones ?? '',
                });
                setIsEditing(false);
                setFeedback(null);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-300 text-sm text-neutral-700 hover:bg-neutral-100 transition"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium shadow-sm hover:bg-indigo-600/90 disabled:opacity-70 transition"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Guardar cambios
            </button>
          </div>
        </form>
      )}
    </section>
  );
};

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const Field: React.FC<FieldProps> = ({ label, icon: Icon, className, ...props }) => (
  <div>
    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</label>
    <div className="relative">
      {Icon ? <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" /> : null}
      <input
        {...props}
        className={`w-full px-3 py-2 rounded-lg text-sm border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition ${Icon ? 'pl-9' : ''} ${className ?? ''}`}
      />
    </div>
  </div>
);

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, className, ...props }) => (
  <div>
    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</label>
    <textarea
      rows={4}
      {...props}
      className={`w-full px-3 py-2 rounded-lg text-sm border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition ${className ?? ''}`}
    />
  </div>
);

export default ProfilePersonalInfoForm;
