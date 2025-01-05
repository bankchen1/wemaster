import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingFilterProps {
  value: number | null;
  onChange: (rating: number | null) => void;
}

export function RatingFilter({ value, onChange }: RatingFilterProps) {
  const ratings = [5, 4, 3, 2, 1];

  return (
    <div className="space-y-2">
      {ratings.map((rating) => (
        <button
          key={rating}
          onClick={() => onChange(rating === value ? null : rating)}
          className={cn(
            'w-full flex items-center justify-between p-2 rounded-md text-sm transition-colors',
            value === rating ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'
          )}
        >
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(rating)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'w-4 h-4',
                    value === rating ? 'fill-primary-foreground' : 'fill-yellow-400'
                  )}
                />
              ))}
              {[...Array(5 - rating)].map((_, i) => (
                <Star
                  key={i + rating}
                  className={cn(
                    'w-4 h-4',
                    value === rating ? 'stroke-primary-foreground' : 'stroke-gray-300'
                  )}
                />
              ))}
            </div>
            <span>& Up</span>
          </div>
          <span className="text-sm">
            {rating === 5 ? 'Only the best' : rating === 4 ? 'Very good' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Any rating'}
          </span>
        </button>
      ))}
    </div>
  );
}
