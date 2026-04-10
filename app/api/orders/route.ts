import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-server'
import { createSource, createPaymentIntent } from '@/lib/paymongo'
import { sendOrderConfirmation, sendAdminNotification, sendLowStockAlert } from '@/lib/email'
import { OrderItem, Product } from '@/types'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      payment_method,
      items,
      total_amount,
    } = body

    if (!customer_name || !customer_email || !shipping_address || !items?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createAdminSupabaseClient()

    // Insert order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        customer_name,
        customer_email,
        customer_phone,
        shipping_address,
        payment_method,
        total_amount,
        status: 'Pending',
        payment_status: 'Unpaid',
      })
      .select()
      .single()

    if (orderErr || !order) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Insert order items
    const orderItems = items.map((i: { product_id: string; quantity: number; unit_price: number }) => ({
      order_id: order.id,
      product_id: i.product_id,
      quantity: i.quantity,
      unit_price: i.unit_price,
    }))

    await supabase.from('order_items').insert(orderItems)

    // Decrement stock
    for (const item of items) {
      await supabase.rpc('decrement_stock', {
        p_product_id: item.product_id,
        p_quantity: item.quantity,
      })
    }

    // Check for low stock and alert admin
    const { data: lowStockProducts } = await supabase
      .from('products')
      .select('name, stock')
      .lte('stock', 5)

    if (lowStockProducts && lowStockProducts.length > 0) {
      await sendLowStockAlert(lowStockProducts as { name: string; stock: number }[])
    }

    // Fetch items with product info for emails
    const { data: fullItems } = await supabase
      .from('order_items')
      .select('*, product:products(*)')
      .eq('order_id', order.id)

    const orderForEmail = {
      ...order,
      order_items: (fullItems ?? []) as (OrderItem & { product: Product })[],
    }

    // Send emails (non-blocking)
    Promise.all([
      sendOrderConfirmation(orderForEmail),
      sendAdminNotification(orderForEmail),
    ]).catch(console.error)

    // Create PayMongo payment
    const amountCentavos = Math.round(total_amount * 100)
    let checkoutUrl: string | null = null

    if (payment_method === 'gcash' || payment_method === 'maya') {
      const source = await createSource({
        amount: amountCentavos,
        type: payment_method === 'gcash' ? 'gcash' : 'paymaya',
        orderId: order.id,
        redirectSuccess: `${SITE_URL}/checkout/success?order=${order.id}`,
        redirectFailed: `${SITE_URL}/checkout?error=payment_failed`,
      })

      // Save source ID
      await supabase
        .from('orders')
        .update({ paymongo_payment_id: source.id })
        .eq('id', order.id)

      checkoutUrl = source.attributes.redirect.checkout_url
    } else if (payment_method === 'card') {
      const intent = await createPaymentIntent({ amount: amountCentavos, orderId: order.id })

      await supabase
        .from('orders')
        .update({ paymongo_payment_id: intent.id })
        .eq('id', order.id)

      // Card uses PayMongo's hosted page — use their checkout link
      checkoutUrl = `https://checkout.paymongo.com/payment_intents/${intent.id}/pay`
    }

    return NextResponse.json({ order_id: order.id, checkout_url: checkoutUrl })
  } catch (err: unknown) {
    console.error('Order creation error:', err)
    const msg = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
