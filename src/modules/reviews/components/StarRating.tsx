import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  readonly = false,
  size = 'md',
  showValue = false,
  className = '',
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const starSize = sizeClasses[size];
  const textSize = textSizeClasses[size];

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!readonly) {
      setHoverRating(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(null);
    }
  };

  const displayRating = hoverRating !== null ? hoverRating : value;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= displayRating;
          const partial = !filled && star - 1 < displayRating && displayRating < star;
          const fillPercentage = partial ? ((displayRating - (star - 1)) * 100) : 0;

          return (
            <button
              key={star}
              type="button"
              onClick={() => handleClick(star)}
              onMouseEnter={() => handleMouseEnter(star)}
              onMouseLeave={handleMouseLeave}
              disabled={readonly}
              className={`
                relative transition-all duration-150
                ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}
                ${!readonly && 'active:scale-95'}
              `}
            >
              {partial ? (
                // Estrella parcial con gradiente
                <div className="relative">
                  <Star className={`${starSize} text-gray-300`} />
                  <div 
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: `${fillPercentage}%` }}
                  >
                    <Star className={`${starSize} text-yellow-400 fill-yellow-400`} />
                  </div>
                </div>
              ) : (
                // Estrella completa o vacía
                <Star
                  className={`
                    ${starSize}
                    transition-colors duration-150
                    ${filled 
                      ? 'text-yellow-400 fill-yellow-400' 
                      : 'text-gray-300'
                    }
                    ${!readonly && hoverRating !== null && star <= hoverRating && 'fill-yellow-400 text-yellow-400'}
                  `}
                />
              )}
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className={`${textSize} font-semibold text-gray-900 ml-1`}>
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
