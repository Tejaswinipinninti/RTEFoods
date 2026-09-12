import { Star } from 'lucide-react';
import { generateStars } from '../../utils/helpers';

const Rating = ({ rating = 0, size = 'md', showCount = false, count = 0 }) => {
  const stars = generateStars(rating);

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className="flex items-center gap-1">
      {stars.map((star, i) => (
        <Star
          key={i}
          className={`${sizeClasses[size]} ${
            star === 'full'
              ? 'text-yellow-400 fill-yellow-400'
              : star === 'half'
              ? 'text-yellow-400 fill-yellow-400/50'
              : 'text-gray-300'
          }`}
        />
      ))}
      {showCount && count > 0 && (
        <span className="text-sm text-gray-400 ml-1">({count})</span>
      )}
    </div>
  );
};

export default Rating;
