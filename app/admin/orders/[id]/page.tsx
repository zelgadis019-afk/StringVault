import { redirect, notFound } from 'next/navigation'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server'
import { Order, OrderItem, Product } from '@/types'
import Badge from '@/components/ui/Badge'
import StatusUpdater from './StatusUpdater'
import Link from 'next/link'

interface Props {
  params: { id: string }
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin')

  const admin = createAdminSupabaseClient()

  const { data: order } = await admin
    .from('orders')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!order) notFound()

  const { data: items } = await admin
    .from('order_items')
    .select('*, product:products(*)')
    .eq('order_id', params.id)

  const orderItems = (items ?? []) as (OrderItem & { product: Product })[]

  const o = order as Order

  const paymentVariant = (s: string) => {
    if (s === 'Paid') return 'success'
    if (s === 'Failed') return 'error'
    return 'warning'
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/dashboard" className="text-gray-400 hover:text-gold transition-colors text-sm">
          ← Back to Orders
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Order #{o.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Placed on {new Date(o.created_at).toLocaleDateString('en-PH', {
              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge variant={paymentVariant(o.payment_status) as 'success' | 'error' | 'warning'}>
            {o.payment_status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer info */}
        <div className="bg-dark-100 border border-dark-300 rounded-xl p-5 space-y-3">
          <h2 className="text-white font-semibold">Customer Information</h2>
          {[
            { label: 'Name', value: o.customer_name },
            { label: 'Email', value: o.customer_email },
            { label: 'Phone', value: o.customer_phone ?? 'N/A' },
            { label: 'Payment', value: o.payment_method.toUpperCase() },
          ].map((row) => (
            <div key={row.label} className="flex justify-between text-sm border-b border-dark-300 pb-2 last:border-0">
              <span className="text-gray-400">{row.label}</span>
              <span className="text-white">{row.value}</span>
            </div>
          ))}
          <div className="text-sm pt-1">
            <p className="text-gray-400 mb-1">Shipping Address</p>
            <p className="text-white">{o.shipping_address}</p>
          </div>
        </div>

        {/* Status updater */}
        <StatusUpdater order={o} />
      </div>

      {/* Order items */}
      <div className="bg-dark-100 border border-dark-300 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4">Order Items</h2>
        <div className="space-y-3">
          {orderItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center py-2 border-b border-dark-300 last:border-0 text-sm">
              <div>
                <p className="text-white font-medium">{item.product?.name ?? 'Deleted Product'}</p>
                <p className="text-gray-500 text-xs">Qty: {item.quantity} × ₱{item.unit_price.toLocaleString()}</p>
              </div>
              <span className="text-gold font-bold">₱{(item.unit_price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-base pt-2">
            <span className="text-white">Total</span>
            <span className="text-gold">₱{o.total_amount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
