import React from "react";
import { Star } from "lucide-react";

interface Props {
  rating: number;
  setRating: (value: number) => void;
}

const CalificacionEstrellas: React.FC<Props> = ({ rating, setRating }) => {
  return (
    <div className="flex justify-center gap-2">
      {[1, 2, 3, 4, 5].map((num) => (
        <button
          key={num}
          type="button"
          onClick={() => setRating(num)}
          className="focus:outline-none"
        >
          <Star
            size={36}
            className={`transition ${
              num <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default CalificacionEstrellas;
