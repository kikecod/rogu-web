import { TrendingUp, TrendingDown } from 'lucide-react';
import type { MetricCardData } from '../../types';

interface MetricCardProps {
  data: MetricCardData;
}

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

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Label and Period */}
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-600">
          {data.label}
        </h4>
        {data.period && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {data.period}
          </span>
        )}
      </div>

      {/* Value */}
      <div className="mb-2">
        <p className="text-3xl font-bold text-gray-900">
          {formatValue(data.value, data.format)}
        </p>
      </div>

      {/* Helper Text and Trend */}
      <div className="flex items-center justify-between">
        {data.helperText && (
          <span className="text-xs text-gray-500">
            {data.helperText}
          </span>
        )}
        {data.trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            data.trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {data.trend.direction === 'up' ? (
              <TrendingUp size={14} />
            ) : (
              <TrendingDown size={14} />
            )}
            <span>{data.trend.value}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
