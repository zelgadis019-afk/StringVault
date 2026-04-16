import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-server'
import { verifyWebhookSignature, createPayment } from '@/lib/paymongo'
import { sendStatusUpdate } from '@/lib/email'
import { Order } from '@/types'

// ✅ Required for dynamic routes (replaces old config)
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('paymongo-signature') ?? ''

    // Verify signature
    if (process.env.PAYMONGO_WEBHOOK_SECRET) {
      const sigParts = signature.split(',')
      const sigValue =
        sigParts.find((p) => p.startsWith('se='))?.replace('se=', '') ?? ''

      if (!verifyWebhookSignature(rawBody, sigValue)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const event = JSON.parse(rawBody)
    const { type, data } = event.data.attributes

    const supabase = createAdminSupabaseClient()

    // source.chargeable — GCash / Maya
    if (type === 'source.chargeable') {
      const sourceId = data.id
      const amount = data.attributes.amount
      const orderId = data.attributes.metadata?.order_id

      if (!orderId) {
        return NextResponse.json(
          { error: 'Missing order_id in metadata' },
          { status: 400 }
        )
      }

      await createPayment(sourceId, amount, orderId)

      const { data: order } = await supabase
        .from('orders')
        .update({ payment_status: 'Paid', status: 'Confirmed' })
        .eq('id', orderId)
        .select()
        .single()

      if (order) {
        await sendStatusUpdate(order as Order)
      }
    }

    // payment.paid — card success
    if (type === 'payment.paid') {
      const orderId = data.attributes.metadata?.order_id
      if (!orderId) return NextResponse.json({ ok: true })

      const { data: order } = await supabase
        .from('orders')
        .update({ payment_status: 'Paid', status: 'Confirmed' })
        .eq('id', orderId)
        .select()
        .single()

      if (order) {
        await sendStatusUpdate(order as Order)
      }
    }

    // payment.failed
    if (type === 'payment.failed') {
      const orderId = data.attributes.metadata?.order_id

      if (orderId) {
        await supabase
          .from('orders')
          .update({ payment_status: 'Failed' })
          .eq('id', orderId)
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
