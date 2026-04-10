'use client'

import { useState } from 'react'
import { Review } from '@/types'
import StarRating from '@/components/ui/StarRating'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'

interface ReviewsTableProps {
  reviews: Review[]
  onRefresh: () => void
}

export default function ReviewsTable({ reviews, onRefresh }: ReviewsTableProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleAction = async (reviewId: string, action: 'approve' | 'delete') => {
    setLoading(reviewId + action)
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: action === 'delete' ? 'DELETE' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: action === 'approve' ? JSON.stringify({ approved: true }) : undefined,
      })
      if (!res.ok) throw new Error()
      toast(action === 'approve' ? 'Review approved!' : 'Review deleted', 'success')
      onRefresh()
    } catch {
      toast('Action failed', 'error')
    } finally {
      setLoading(null)
    }
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-4xl mb-2">💬</p>
        <p>No reviews yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <div key={review.id} className="bg-dark-100 border border-dark-300 rounded-xl p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-white font-semibold text-sm">{review.reviewer_name}</span>
                <StarRating rating={review.rating} size="sm" />
                <Badge variant={review.approved ? 'success' : 'warning'}>
                  {review.approved ? 'Approved' : 'Pending'}
                </Badge>
              </div>
              <p className="text-gray-500 text-xs mb-2">
                {new Date(review.created_at).toLocaleDateString('en-PH', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </p>
              {review.comment && (
                <p className="text-gray-300 text-sm">{review.comment}</p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              {!review.approved && (
                <Button
                  size="sm"
                  variant="outline"
                  loading={loading === review.id + 'approve'}
                  onClick={() => handleAction(review.id, 'approve')}
                >
                  Approve
                </Button>
              )}
              <Button
                size="sm"
                variant="danger"
                loading={loading === review.id + 'delete'}
                onClick={() => handleAction(review.id, 'delete')}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
