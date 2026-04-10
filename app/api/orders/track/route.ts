import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q) return NextResponse.json({ error: 'Query required' }, { status: 400 })

  const supabase = createAdminSupabaseClient()

  // Try by ID first (UUID format), then by email
  const isUuid = /^[0-9a-f-]{36}$/i.test(q)

  let orderQuery = supabase
    .from('orders')
    .select('*')

  if (isUuid) {
    orderQuery = orderQuery.eq('id', q)
  } else {
    orderQuery = orderQuery.eq('customer_email', q).order('created_at', { ascending: false }).limit(1)
  }

  const { data: orders, error } = await orderQuery

  if (error || !orders || orders.length === 0) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const order = orders[0]

  // Fetch order items with products
  const { data: items } = await supabase
    .from('order_items')
    .select('*, product:products(name, brand, image_url)')
    .eq('order_id', order.id)

  return NextResponse.json({ order: { ...order, order_items: items ?? [] } })
}
