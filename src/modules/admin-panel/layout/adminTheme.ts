const palette = {
  primary: '#3A6FF8',
  secondary: '#6C63FF',
  textMain: '#0F172A',
  muted: '#6B7280',
  border: '#E9ECF5',
  success: '#4AD991',
  warning: '#F6B968',
  danger: '#F37B83',
  surface: 'rgba(255,255,255,0.65)',
};

export const applyAdminTheme = () => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  Object.entries(palette).forEach(([key, value]) => {
    const cssVar = key === 'textMain' ? '--text-main' : `--${key}`;
    root.style.setProperty(cssVar, value);
  });
};

export const adminButtons = {
  primary:
    'inline-flex items-center gap-2 px-4 py-2 rounded-input bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-soft transition hover:-translate-y-[1px] hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed',
  ghost:
    'inline-flex items-center gap-2 px-3 py-2 rounded-input border border-border bg-white/80 text-text-main hover:bg-white transition',
  muted:
    'inline-flex items-center gap-2 px-3 py-2 rounded-input border border-border text-muted bg-white/70 hover:bg-white transition',
};

export const adminChips = {
  glass:
    'inline-flex items-center gap-1 px-3 py-1 rounded-full border border-border bg-white/70 backdrop-blur text-text-main shadow-soft',
};
