import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  maxStars?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  count?: number
  className?: string
  interactive?: boolean
  onChange?: (rating: number) => void
}

export default function StarRating({
  rating,
  maxStars = 5,
  size = 'md',
  showValue = false,
  count,
  className,
  interactive = false,
  onChange,
}: StarRatingProps) {
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-4.5 h-4.5', lg: 'w-6 h-6' }
  const starSize = sizes[size]

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex gap-0.5">
        {Array.from({ length: maxStars }, (_, i) => {
          const filled = i + 1 <= Math.round(rating)
          return (
            <Star
              key={i}
              className={cn(
                starSize,
                'transition-colors',
                filled ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200',
                interactive && 'cursor-pointer hover:fill-amber-300 hover:text-amber-300'
              )}
              onClick={() => interactive && onChange?.(i + 1)}
            />
          )
        })}
      </div>
      {showValue && (
        <span className="font-semibold text-dark">{rating.toFixed(1)}</span>
      )}
      {count !== undefined && (
        <span className="text-muted text-sm">({count} avis)</span>
      )}
    </div>
  )
}
