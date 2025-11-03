// 📊 COMPONENTE: Tarjeta KPI (Key Performance Indicator)

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  loading?: boolean;
  subtitle?: string;
  valueColor?: string;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  trend = 'neutral',
  icon,
  loading = false,
  subtitle,
  valueColor = 'text-gray-900'
}) => {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600 bg-green-50';
    if (trend === 'down') return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          {icon && <div className="h-10 w-10 bg-gray-200 rounded-full"></div>}
        </div>
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {icon && (
          <div className="p-2 bg-blue-50 rounded-lg">
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className={`text-3xl font-bold ${valueColor}`}>
          {value}
        </p>

        {subtitle && (
          <p className="text-sm text-gray-500">{subtitle}</p>
        )}

        {change !== undefined && (
          <div className="flex items-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="ml-1">
                {change > 0 ? '+' : ''}{change.toFixed(1)}%
              </span>
            </span>
            <span className="ml-2 text-xs text-gray-500">vs mes anterior</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;
