import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server'
import { sendStatusUpdate } from '@/lib/email'
import { Order } from '@/types'

interface RouteParams {
  params: { id: string }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { status } = await req.json()
  const validStatuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const admin = createAdminSupabaseClient()
  const { data: order, error } = await admin
    .from('orders')
    .update({ status })
    .eq('id', params.id)
    .select()
    .single()

  if (error || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  // Send status update email to customer
  await sendStatusUpdate(order as Order)

  return NextResponse.json({ order })
}
