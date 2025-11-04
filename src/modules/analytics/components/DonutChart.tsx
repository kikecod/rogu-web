// 📊 COMPONENTE: Gráfico de Dona con Recharts

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

interface DonutData {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutData[];
  title?: string;
  loading?: boolean;
  centerText?: string;
  size?: number;
}

const DonutChart: React.FC<DonutChartProps> = ({
  data,
  title,
  loading = false,
  centerText,
  size = 300
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        {title && <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>}
        <div className="flex justify-center">
          <div
            className="rounded-full bg-gray-200 animate-pulse"
            style={{ width: size, height: size }}
          ></div>
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
    value: item.value,
    color: item.color
  }));

  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Custom label renderer para mostrar porcentajes
  const renderLabel = (entry: any) => {
    const percent = ((entry.value / total) * 100).toFixed(0);
    return `${percent}%`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>}
      
      <div className="flex flex-col items-center">
        <div className="relative">
          <ResponsiveContainer width={size} height={size}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={size * 0.25}
                outerRadius={size * 0.35}
                paddingAngle={5}
                dataKey="value"
                animationDuration={1000}
                label={renderLabel}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                formatter={(value: number) => [
                  `${value} (${((value / total) * 100).toFixed(1)}%)`,
                  ''
                ]}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Texto central */}
          {centerText && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{centerText}</p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
            </div>
          )}
        </div>

        {/* Leyenda personalizada */}
        <div className="mt-6 w-full space-y-2">
          {chartData.map((segment, index) => {
            const percentage = ((segment.value / total) * 100).toFixed(1);
            return (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-2"
                    style={{ backgroundColor: segment.color }}
                  ></div>
                  <span className="text-gray-700">{segment.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900">{segment.value}</span>
                  <span className="text-gray-500">({percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DonutChart;
