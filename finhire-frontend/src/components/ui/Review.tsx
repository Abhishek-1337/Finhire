import { useState } from "react";
import { Star } from "lucide-react";

type StarRatingProps = {
  totalStars?: number;
  value?: number; // controlled value
  onChange?: (rating: number) => void;
  size?: number;
  readOnly?: boolean;
};

export default function StarRating({
  totalStars = 5,
  value = 0,
  onChange,
  size = 20,
  readOnly = false,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const handleClick = (rating: number) => {
    if (readOnly) return;
    onChange?.(rating);
  };

  return (
    <div className="flex gap-1">
      {Array.from({ length: totalStars }, (_, i) => {
        const starValue = i + 1;

        const isFilled =
          hoverValue !== null
            ? starValue <= hoverValue
            : starValue <= value;

        return (
          <button
            key={i}
            type="button"
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => !readOnly && setHoverValue(starValue)}
            onMouseLeave={() => !readOnly && setHoverValue(null)}
            className="transition-transform hover:scale-110"
          >
            <Star
              size={size}
              className={`${
                isFilled
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-400"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}