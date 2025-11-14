import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { EntityCardData } from '../../types';

interface EntityCardProps {
  data: EntityCardData;
}

const EntityCard = ({ data }: EntityCardProps) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(data.route);
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
      {/* Icon and Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${data.iconColor}`}>
          <span className="text-2xl">{data.icon}</span>
        </div>
        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
          {data.badge.value !== undefined ? data.badge.value : ''} {data.badge.text}
        </span>
      </div>

      {/* Title and Description */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {data.title}
        </h3>
        <p className="text-sm text-gray-600">
          {data.description}
        </p>
      </div>

      {/* Action Button */}
      <button
        onClick={handleNavigate}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors group"
      >
        <span>Gestionar</span>
        <ArrowRight 
          size={16} 
          className="group-hover:translate-x-1 transition-transform" 
        />
      </button>
    </div>
  );
};

export default EntityCard;
