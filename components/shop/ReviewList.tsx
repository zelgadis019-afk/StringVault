import { Review } from '@/types'
import StarRating from '@/components/ui/StarRating'

interface ReviewListProps {
  reviews: Review[]
}

export default function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p className="text-4xl mb-2">💬</p>
        <p>No reviews yet. Be the first to review this product!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="bg-dark-100 border border-dark-300 rounded-xl p-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <p className="text-white font-semibold text-sm">{review.reviewer_name}</p>
              <p className="text-gray-500 text-xs">
                {new Date(review.created_at).toLocaleDateString('en-PH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <StarRating rating={review.rating} size="sm" />
          </div>
          {review.comment && (
            <p className="text-gray-300 text-sm leading-relaxed">{review.comment}</p>
          )}
        </div>
      ))}
    </div>
  )
}
