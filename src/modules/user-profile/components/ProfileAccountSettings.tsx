import React, { useState } from 'react';
import { Shield, Save, KeyRound, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import type { UsuarioProfile } from '../types/profile.types';
import profileService from '../services/profileService';
import { useAuth } from '@/auth/hooks/useAuth';

interface Props {
  usuario: UsuarioProfile;
}

const ProfileAccountSettings: React.FC<Props> = ({ usuario }) => {
  const { updateUser } = useAuth();

  const [email, setEmail] = useState(usuario.correo);
  const [username, setUsername] = useState(usuario.usuario);
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');

  const [savingBasic, setSavingBasic] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const resetAlerts = () => {
    setMsg(null);
    setErr(null);
  };

  const errorMessage = (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : typeof error === 'string' ? error : fallback;

  const onSaveBasic = async () => {
    resetAlerts();
    if (!email || !username) {
      setErr('Correo y usuario son requeridos');
      return;
    }
    try {
      setSavingBasic(true);
      await profileService.updateUserBasic({
        idUsuario: usuario.idUsuario,
        correo: email,
        usuario: username,
      });
      updateUser({
        correo: email,
        usuario: username,
        idPersona: usuario.idPersona,
        idUsuario: usuario.idUsuario,
        roles: usuario.roles,
        avatar: usuario.avatar ?? undefined,
      });
      setMsg('Datos actualizados');
    } catch (error: unknown) {
      setErr(errorMessage(error, 'No se pudo actualizar'));
    } finally {
      setSavingBasic(false);
    }
  };

  const onChangePassword = async () => {
    resetAlerts();
    if (!pwd || pwd.length < 8 || pwd.length > 20) {
      setErr('La contrasena debe tener entre 8 y 20 caracteres');
      return;
    }
    if (pwd !== pwd2) {
      setErr('Las contrasenas no coinciden');
      return;
    }
    try {
      setSavingPwd(true);
      await profileService.changePasswordSimple({
        idUsuario: usuario.idUsuario,
        nuevaContrasena: pwd,
      });
      setPwd('');
      setPwd2('');
      setMsg('Contrasena actualizada');
    } catch (error: unknown) {
      setErr(errorMessage(error, 'No se pudo cambiar la contrasena'));
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-lg shadow-indigo-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(99,102,241,0.08),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(236,72,153,0.08),transparent_30%)]" />
      <div className="relative space-y-6 px-6 py-7 sm:px-8 sm:py-8">
        <header className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-indigo-500" />
            <h2 className="text-xl font-semibold text-slate-900">Cuenta y seguridad</h2>
          </div>
          <p className="text-sm text-slate-600">Gestiona correo, usuario y contrasena en un solo lugar.</p>
        </header>

        {msg ? (
          <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700" role="status" aria-live="polite">
            <CheckCircle2 className="h-4 w-4" />
            <span className="break-words">{msg}</span>
          </div>
        ) : null}

        {err ? (
          <div className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert" aria-live="assertive">
            <XCircle className="h-4 w-4" />
            <span className="break-words">{err}</span>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-inner">
            <label className="mb-1 block text-sm font-semibold text-slate-800">Correo</label>
            <input
              type="email"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label className="mb-1 mt-3 block text-sm font-semibold text-slate-800">Usuario</label>
            <input
              type="text"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <button
              type="button"
              onClick={onSaveBasic}
              disabled={savingBasic}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-300 transition hover:bg-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {savingBasic ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Guardar cambios
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-inner">
            <label className="mb-1 block text-sm font-semibold text-slate-800">Nueva contrasena</label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
            />

            <label className="mb-1 mt-3 block text-sm font-semibold text-slate-800">Confirmar contrasena</label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              value={pwd2}
              onChange={(e) => setPwd2(e.target.value)}
            />

            <button
              type="button"
              onClick={onChangePassword}
              disabled={savingPwd}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-200 transition hover:bg-purple-500 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {savingPwd ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              Cambiar contrasena
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileAccountSettings;
