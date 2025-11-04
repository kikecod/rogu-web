import React from 'react';
import { Star } from 'lucide-react';

interface RatingDistributionProps {
  distribucion: { [key: string]: number };
  totalResenas: number;
}

const RatingDistribution: React.FC<RatingDistributionProps> = ({
  distribucion,
  totalResenas,
}) => {
  // Ordenar de 5 a 1 estrellas
  const ratings = [5, 4, 3, 2, 1];

  const getPercentage = (count: number) => {
    if (totalResenas === 0) return 0;
    return (count / totalResenas) * 100;
  };

  const getBarColor = (rating: number) => {
    if (rating >= 4) return 'bg-green-500';
    if (rating === 3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-3">
      {ratings.map((rating) => {
        const count = distribucion[rating.toString()] || 0;
        const percentage = getPercentage(count);

        return (
          <div key={rating} className="flex items-center gap-3">
            {/* Rating Label */}
            <div className="flex items-center gap-1 w-16">
              <span className="text-sm font-medium text-gray-700">
                {rating}
              </span>
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            </div>

            {/* Progress Bar */}
            <div className="flex-1 relative">
              <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getBarColor(rating)} transition-all duration-500 ease-out rounded-full`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            {/* Count and Percentage */}
            <div className="w-24 text-right">
              <span className="text-sm font-medium text-gray-900">
                {count}
              </span>
              <span className="text-sm text-gray-500 ml-1">
                ({percentage.toFixed(0)}%)
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RatingDistribution;
