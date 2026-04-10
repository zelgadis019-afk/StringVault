import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { product_id, rating, reviewer_name, comment } = body

    if (!product_id || !rating || !reviewer_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    const supabase = createAdminSupabaseClient()

    const { error } = await supabase.from('reviews').insert({
      product_id,
      rating,
      reviewer_name: reviewer_name.trim(),
      comment: comment?.trim() ?? null,
      approved: false,
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('Review submission error:', err)
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }
}
