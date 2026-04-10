'use client'

import { useState } from 'react'
import StarRating from '@/components/ui/StarRating'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { toast } from '@/components/ui/Toast'

interface ReviewFormProps {
  productId: string
}

export default function ReviewForm({ productId }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [name, setName] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      toast('Please select a star rating', 'warning')
      return
    }
    if (!name.trim()) {
      toast('Please enter your name', 'warning')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, rating, reviewer_name: name, comment }),
      })
      if (!res.ok) throw new Error('Failed to submit')
      setSubmitted(true)
      toast('Review submitted! It will appear after approval.', 'success')
    } catch {
      toast('Failed to submit review. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-dark-200 border border-gold/30 rounded-xl p-6 text-center">
        <div className="text-3xl mb-2">🎸</div>
        <p className="text-white font-semibold">Thanks for your review!</p>
        <p className="text-gray-400 text-sm mt-1">Your review is pending approval and will appear shortly.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-dark-100 border border-dark-300 rounded-xl p-6 space-y-4">
      <h3 className="text-white font-semibold text-lg">Leave a Review</h3>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-300">Rating <span className="text-gold">*</span></label>
        <StarRating rating={rating} interactive onRate={setRating} size="lg" />
      </div>

      <Input
        label="Your Name"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="John Doe"
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-300">Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product…"
          rows={4}
          className="bg-dark-200 border border-dark-400 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent resize-none transition-all"
        />
      </div>

      <Button type="submit" loading={loading} className="w-full">
        Submit Review
      </Button>
    </form>
  )
}
