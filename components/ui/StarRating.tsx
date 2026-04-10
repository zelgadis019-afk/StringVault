'use client'

interface StarRatingProps {
  rating: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onRate?: (rating: number) => void
}

export default function StarRating({
  rating,
  max = 5,
  size = 'md',
  interactive = false,
  onRate,
}: StarRatingProps) {
  const sizes = { sm: 'text-sm', md: 'text-lg', lg: 'text-2xl' }

  return (
    <div className={`flex items-center gap-0.5 ${sizes[size]}`}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.floor(rating)
        const partial = !filled && i < rating

        return (
          <button
            key={i}
            type={interactive ? 'button' : undefined}
            onClick={interactive && onRate ? () => onRate(i + 1) : undefined}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          >
            <span
              className={
                filled
                  ? 'text-gold'
                  : partial
                  ? 'text-gold opacity-60'
                  : 'text-dark-400'
              }
            >
              ★
            </span>
          </button>
        )
      })}
    </div>
  )
}
