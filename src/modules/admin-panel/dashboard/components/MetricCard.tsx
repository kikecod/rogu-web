import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { MetricCardData } from '../../types';

interface MetricCardProps {
  data: MetricCardData;
}

const accentBackground: Record<string, string> = {
  primary: 'from-primary/20 to-secondary/15 text-primary',
  secondary: 'from-secondary/20 to-primary/15 text-secondary',
  'accent-1': 'from-accent-1/25 to-primary/15 text-primary',
  'accent-2': 'from-accent-2/25 to-secondary/15 text-secondary',
};

const MetricCard = ({ data }: MetricCardProps) => {
  const formatValue = (value: number | string, format?: string): string => {
    if (typeof value === 'string') return value;

    switch (format) {
      case 'currency':
        return `$${value.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
      case 'percentage':
        return `${value}%`;
      case 'number':
      default:
        return value.toLocaleString('es-MX');
    }
  };

  const sparkline = data.sparkline && data.sparkline.length > 0 ? data.sparkline : [];
  const maxSpark = sparkline.length > 0 ? Math.max(...sparkline) : 0;
  const accentClass = accentBackground[data.accent || 'primary'] || accentBackground.primary;

  return (
    <div className="bg-surface backdrop-blur-xl border border-border rounded-card shadow-soft p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-xs uppercase tracking-[0.14em] text-muted">{data.label}</h4>
          {data.period && <span className="text-[10px] text-muted">Periodo: {data.period}</span>}
        </div>
        {data.trend && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
              data.trend.direction === 'up'
                ? 'bg-success/15 text-success'
                : 'bg-danger/15 text-danger'
            }`}
          >
            {data.trend.direction === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{data.trend.value}%</span>
          </div>
        )}
      </div>

      <div className="flex items-end gap-2">
        <p className="text-3xl font-bold text-text-main leading-none">
          {formatValue(data.value, data.format)}
        </p>
        {data.target && <span className="text-xs text-muted mb-1">Objetivo: {data.target}</span>}
      </div>
      {data.helperText && <span className="text-xs text-muted">{data.helperText}</span>}

      {sparkline.length > 0 && maxSpark > 0 && (
        <div className={`flex h-12 items-end gap-1 p-2 rounded-input bg-gradient-to-br ${accentClass}`}>
          {sparkline.map((value, idx) => (
            <div
              key={idx}
              className="flex-1 rounded-md bg-gradient-to-b from-primary/80 to-secondary/60 transition-all"
              style={{ height: `${(value / maxSpark) * 100}%` }}
              title={`${value}`}
            />
          ))}
        </div>
      )}

      {data.trend && (
        <div className="flex items-center gap-2 text-xs text-muted">
          {data.trend.direction === 'up' ? (
            <ArrowUpRight size={14} className="text-success" />
          ) : (
            <ArrowDownRight size={14} className="text-danger" />
          )}
          <span>Seguimiento diario</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
