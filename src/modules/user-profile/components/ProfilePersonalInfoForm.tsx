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

  const errorMessage = (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : typeof error === 'string' ? error : fallback;

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
          documentoTipo: formState.documentoTipo?.trim() || undefined,
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

      setFeedback({ type: 'success', message: 'Informacion personal actualizada correctamente.' });
      onUpdated?.();
      setIsEditing(false);
    } catch (error: unknown) {
      setFeedback({
        type: 'error',
        message: errorMessage(error, 'No se pudieron guardar los cambios.'),
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
          className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold ring-1 ring-indigo-100"
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
      : String(persona.deportesFavoritos).split(',').map((s) => s.trim()).filter(Boolean);
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
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-inner">
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="min-h-[1.5rem] text-sm sm:text-base text-slate-900">
        {value ?? <span className="text-slate-400">No registrado</span>}
      </div>
    </div>
  );

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-lg shadow-indigo-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(99,102,241,0.08),transparent_32%),radial-gradient(circle_at_90%_20%,rgba(56,189,248,0.08),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.4),transparent)]" />
      <div className="relative space-y-6 px-6 py-7 sm:px-8 sm:py-8">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <UserCircle2 className="h-5 w-5 text-indigo-500" />
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Informacion personal</h2>
              <p className="text-sm text-slate-600">Un solo bloque limpio para todos tus datos clave.</p>
            </div>
          </div>
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              <PencilLine className="h-4 w-4" />
              Editar
            </button>
          ) : null}
        </div>

        {feedback && (
          <div
            className={`inline-flex items-start gap-2 rounded-xl border px-3 py-2 text-sm ${
              feedback.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-red-200 bg-red-50 text-red-700'
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
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <ReadonlyRow label="Documento" value={documentoLabel} />
              <ReadonlyRow label="Nombres" value={persona?.nombres} />
              <ReadonlyRow label="Telefono" value={persona?.telefono} />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <ReadonlyRow label="Apellido paterno" value={persona?.paterno} />
              <ReadonlyRow label="Apellido materno" value={persona?.materno} />
              <ReadonlyRow label="Ocupacion" value={persona?.ocupacion} />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <ReadonlyRow label="Direccion" value={persona?.direccion} />
              <ReadonlyRow label="Ciudad" value={persona?.ciudad} />
              <ReadonlyRow label="Pais" value={persona?.pais} />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <ReadonlyRow label="Biografia" value={persona?.bio} />
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-inner">
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Deportes favoritos</div>
                {deportesList.length ? renderChips(deportesList) : (
                  <div className="text-sm text-slate-500">No registrado</div>
                )}
              </div>
            </div>

            {isCliente ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-slate-800">
                  <NotebookPen className="h-4 w-4 text-indigo-500" />
                  <h3 className="text-sm font-semibold uppercase tracking-wide">Perfil como cliente</h3>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <ReadonlyRow label="Apodo" value={cliente?.apodo ?? undefined} />
                  <ReadonlyRow label="Nivel" value={cliente?.nivel ?? undefined} />
                  <ReadonlyRow label="Observaciones" value={cliente?.observaciones ?? undefined} />
                </div>
              </div>
            ) : null}

            {isDuenio ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-slate-800">
                  <NotebookPen className="h-4 w-4 text-sky-500" />
                  <h3 className="text-sm font-semibold uppercase tracking-wide">Perfil como dueno</h3>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <ReadonlyRow label="Estado de verificacion" value={duenio?.verificado ? 'Verificado' : 'Pendiente'} />
                  <ReadonlyRow
                    label="Ultima verificacion"
                    value={
                      duenio?.verificado
                        ? (duenio?.verificadoEn ? new Date(duenio.verificadoEn ?? '').toLocaleString('es-BO') : 'No registrada')
                        : 'No registrada'
                    }
                  />
                </div>
              </div>
            ) : null}

            {isControlador ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-slate-800">
                  <NotebookPen className="h-4 w-4 text-purple-500" />
                  <h3 className="text-sm font-semibold uppercase tracking-wide">Perfil como controlador</h3>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <ReadonlyRow label="Codigo de empleado" value={controlador?.codigoEmpleado ?? 'No asignado'} />
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tipo de documento
                </label>
                <input
                  list="doc-types"
                  name="documentoTipo"
                  value={formState.documentoTipo}
                  onChange={handleChange}
                  placeholder="CI, DNI, NIT, Pasaporte..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
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
                label="Numero de documento"
                name="documentoNumero"
                value={formState.documentoNumero}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field
                label="Telefono"
                name="telefono"
                value={formState.telefono}
                onChange={handleChange}
                placeholder="+591 70000000"
              />
              <Field label="Ocupacion" name="ocupacion" value={formState.ocupacion} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="Direccion" name="direccion" value={formState.direccion} onChange={handleChange} icon={MapPin} />
              <Field label="Ciudad" name="ciudad" value={formState.ciudad} onChange={handleChange} />
              <Field label="Pais" name="pais" value={formState.pais} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Textarea
                label="Biografia"
                name="bio"
                value={formState.bio}
                onChange={handleChange}
                placeholder="Cuenta tu historia, experiencia o deportes favoritos."
              />
              <Textarea
                label="Deportes favoritos (separados por coma)"
                name="deportesFavoritos"
                value={formState.deportesFavoritos}
                onChange={handleChange}
                placeholder="Futbol, Running, Tenis"
              />
            </div>

            {isCliente && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-slate-800">
                  <NotebookPen className="h-4 w-4 text-indigo-500" />
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
                  <Field
                    label="Observaciones"
                    name="observaciones"
                    value={formState.observaciones}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            <div className="mt-2 flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4">
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
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 transition hover:bg-slate-50 disabled:opacity-70"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-300 transition hover:bg-indigo-500 disabled:opacity-70"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Guardar cambios
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const Field: React.FC<FieldProps> = ({ label, icon: Icon, className, ...props }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</label>
    <div className="relative">
      {Icon ? <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /> : null}
      <input
        {...props}
        className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${Icon ? 'pl-9' : ''} ${className ?? ''}`}
      />
    </div>
  </div>
);

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, className, ...props }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</label>
    <textarea
      rows={4}
      {...props}
      className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${className ?? ''}`}
    />
  </div>
);

export default ProfilePersonalInfoForm;
