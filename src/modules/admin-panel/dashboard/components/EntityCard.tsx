import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { EntityCardData } from '../../types';

interface EntityCardProps {
  data: EntityCardData;
}

const badgeTone = {
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger/15 text-danger',
  info: 'bg-primary/12 text-primary',
};

const EntityCard = ({ data }: EntityCardProps) => {
  const navigate = useNavigate();
  const Icon = data.icon;
  const badgeClass = data.badge.tone ? badgeTone[data.badge.tone] : 'bg-white/80 text-muted';

  return (
    <div className="bg-surface backdrop-blur-xl border border-border rounded-card shadow-soft p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`h-12 w-12 rounded-2xl bg-gradient-to-br text-white flex items-center justify-center shadow-lg ${
              data.iconColor || 'from-primary to-secondary'
            }`}
          >
            <Icon size={22} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-muted">{data.badge.text}</p>
            <h3 className="text-lg font-semibold text-text-main leading-tight">{data.title}</h3>
          </div>
        </div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${badgeClass}`}>
          {data.badge.value !== undefined ? `${data.badge.value} ` : ''}
          {data.badge.text}
        </span>
      </div>

      <p className="text-sm text-muted">{data.description}</p>

      {data.meta && (
        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
          <Sparkles size={14} />
          {data.meta.label}: {data.meta.value}
        </div>
      )}

      <button
        onClick={() => navigate(data.route)}
        className="mt-auto inline-flex items-center gap-2 w-fit px-3 py-2 text-sm rounded-input bg-gradient-to-r from-primary to-secondary text-white shadow-soft"
      >
        Gestionar
        <ArrowRight size={16} />
      </button>
    </div>
  );
};

export default EntityCard;
