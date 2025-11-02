// 📊 COMPONENTE: Gráfico de Línea con Recharts

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface LineData {
  label: string;
  value: number;
}

interface SimpleLineChartProps {
  data: LineData[];
  title?: string;
  loading?: boolean;
  height?: number;
  color?: string;
}

const SimpleLineChart: React.FC<SimpleLineChartProps> = ({
  data,
  title,
  loading = false,
  height = 300,
  color = '#3B82F6'
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        {title && <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>}
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
        <p className="text-center text-gray-500 py-8">No hay datos disponibles</p>
      </div>
    );
  }

  // Transformar datos para Recharts
  const chartData = data.map(item => ({
    name: item.label,
    value: item.value
  }));

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>}
      
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`colorValue-${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            stroke="#9ca3af"
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            stroke="#9ca3af"
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
            formatter={(value: number) => [`${value.toLocaleString()}`, 'Valor']}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={3}
            fill={`url(#colorValue-${title})`}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SimpleLineChart;
