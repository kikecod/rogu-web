import React from 'react';
import { Bell, Mail, MessageSquare } from 'lucide-react';
import type { UsuarioPreferencias } from '../types/profile.types';

interface ProfilePreferencesFormProps {
  preferencias: UsuarioPreferencias | null;
  onUpdated: () => void;
}

const ProfilePreferencesForm: React.FC<ProfilePreferencesFormProps> = ({ preferencias }) => {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-lg shadow-indigo-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_5%,rgba(99,102,241,0.08),transparent_30%)]" />
      <div className="relative p-6 sm:p-7 space-y-5">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-indigo-500" />
          <h3 className="text-lg font-semibold text-slate-900">Preferencias de notificaciones</h3>
        </div>

        <div className="space-y-4">
          <PreferenceRow
            title="Notificaciones de reservas"
            description="Actualizaciones cuando cambien tus reservas."
            defaultChecked={preferencias?.notificarReservas ?? true}
            icon={Mail}
          />
          <PreferenceRow
            title="Promociones y ofertas"
            description="Recibe informacion sobre promociones especiales."
            defaultChecked={preferencias?.notificarPromociones ?? false}
            icon={Bell}
          />
          <PreferenceRow
            title="Recordatorios"
            description="Alertas antes de tus reservas o eventos."
            defaultChecked={preferencias?.notificarRecordatorios ?? true}
            icon={MessageSquare}
          />
        </div>

        <div className="pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-600 italic">
            Los cambios se guardan automaticamente al activar o desactivar cada interruptor.
          </p>
        </div>
      </div>
    </section>
  );
};

interface PreferenceRowProps {
  title: string;
  description: string;
  defaultChecked: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

const PreferenceRow: React.FC<PreferenceRowProps> = ({ title, description, defaultChecked, icon: Icon }) => (
  <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <div className="flex items-center space-x-3">
      <Icon className="h-5 w-5 text-indigo-500" />
      <div>
        <p className="font-medium text-slate-900">{title}</p>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" defaultChecked={defaultChecked} className="peer sr-only" />
      <div className="h-6 w-11 rounded-full bg-slate-200 shadow-inner transition peer-checked:bg-indigo-500">
        <div className="absolute left-[2px] top-[2px] h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-full shadow" />
      </div>
    </label>
  </div>
);

export default ProfilePreferencesForm;
