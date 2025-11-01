import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, UserCircle2, MapPin, NotebookPen, Sparkles, XCircle } from 'lucide-react';
import type { ClienteProfile, PersonaProfile } from '../types/profile.types';
import profileService from '../services/profileService';

type Feedback =
  | { type: 'success'; message: string }
  | { type: 'error'; message: string }
  | null;

interface Props {
  persona: PersonaProfile | null;
  cliente: ClienteProfile | null;
  onUpdated?: () => void;
}

const ProfilePersonalInfoForm: React.FC<Props> = ({ persona, cliente, onUpdated }) => {
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const [formState, setFormState] = useState(() => ({
    nombres: persona?.nombres ?? '',
    paterno: persona?.paterno ?? '',
    materno: persona?.materno ?? '',
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
  }, [persona, cliente]);

  const isCliente = useMemo(() => Boolean(cliente), [cliente]);

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
    } catch (error: any) {
      setFeedback({
        type: 'error',
        message: error?.message ?? 'No se pudieron guardar los cambios.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-neutral-200 p-5 sm:p-6 md:p-7 transition-shadow duration-200 hover:shadow-lg">
      <div className="flex items-center gap-2 mb-5">
        <UserCircle2 className="h-5 w-5 text-emerald-600" />
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-neutral-800">Información personal</h2>
          <p className="text-sm text-neutral-500">Mantén actualizado tu perfil para mejorar tu experiencia.</p>
        </div>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field
            label="Teléfono"
            name="telefono"
            value={formState.telefono}
            onChange={handleChange}
            placeholder="+591 70000000"
          />
          <Field label="Ocupación" name="ocupacion" value={formState.ocupacion} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Dirección" name="direccion" value={formState.direccion} onChange={handleChange} icon={MapPin} />
          <Field label="Ciudad" name="ciudad" value={formState.ciudad} onChange={handleChange} />
          <Field label="País" name="pais" value={formState.pais} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <NotebookPen className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-semibold uppercase tracking-wide">Perfil como cliente</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium shadow-sm hover:bg-emerald-600/90 disabled:opacity-70 transition"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Guardar información
          </button>
        </div>
      </form>
    </div>
  );
};

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const Field: React.FC<FieldProps> = ({ label, icon: Icon, ...props }) => (
  <div>
    <label className="block text-xs font-medium text-neutral-500 mb-1 uppercase tracking-wide">{label}</label>
    <div className="relative">
      {Icon ? <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" /> : null}
      <input
        {...props}
        className={`w-full px-3 py-2 rounded-lg text-sm border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition ${
          Icon ? 'pl-9' : ''
        } ${props.className ?? ''}`}
      />
    </div>
  </div>
);

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, ...props }) => (
  <div>
    <label className="block text-xs font-medium text-neutral-500 mb-1 uppercase tracking-wide">{label}</label>
    <textarea
      rows={4}
      {...props}
      className={`w-full px-3 py-2 rounded-lg text-sm border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition ${
        props.className ?? ''
      }`}
    />
  </div>
);

export default ProfilePersonalInfoForm;
