'use client'

import { useState, useEffect, useCallback } from 'react'
import { Review } from '@/types'
import ReviewsTable from '@/components/admin/ReviewsTable'

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/reviews')
    const data = await res.json()
    setReviews(data.reviews ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  const filtered = reviews.filter((r) => {
    if (filter === 'pending') return !r.approved
    if (filter === 'approved') return r.approved
    return true
  })

  const pendingCount = reviews.filter((r) => !r.approved).length

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reviews</h1>
          {pendingCount > 0 && (
            <p className="text-yellow-400 text-sm mt-1">{pendingCount} review{pendingCount > 1 ? 's' : ''} pending approval</p>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 bg-dark-100 border border-dark-300 rounded-xl p-1 w-fit">
        {(['all', 'pending', 'approved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              filter === f ? 'bg-gold text-dark-DEFAULT' : 'text-gray-400 hover:text-white'
            }`}
          >
            {f}
            {f === 'pending' && pendingCount > 0 && (
              <span className="ml-1.5 bg-yellow-500/30 text-yellow-400 text-xs px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading reviews…</div>
      ) : (
        <ReviewsTable reviews={filtered} onRefresh={fetchReviews} />
      )}
    </div>
  )
}
