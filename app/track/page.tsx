'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Order, OrderItem, Product } from '@/types'
import ProgressBar from '@/components/ui/ProgressBar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

type OrderWithItems = Order & { order_items: (OrderItem & { product: Product })[] }

export default function TrackPage() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('order') ?? '')
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [error, setError] = useState('')

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError('')
    setOrder(null)
    try {
      const res = await fetch(`/api/orders/track?q=${encodeURIComponent(query.trim())}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Order not found')
      setOrder(data.order)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Order not found')
    } finally {
      setLoading(false)
    }
  }

  // Auto-search if order param is present
  useEffect(() => {
    if (searchParams.get('order')) {
      handleSearch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const statusVariant = (s: string) => {
    const map: Record<string, 'warning' | 'gold' | 'info' | 'success'> = {
      Pending: 'warning', Confirmed: 'gold', Shipped: 'info', Delivered: 'success',
    }
    return map[s] ?? 'default'
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Track Your Order</h1>
        <p className="text-gray-400">Enter your Order ID or email address to check your order status.</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <div className="flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Order ID or email address…"
          />
        </div>
        <Button type="submit" loading={loading}>
          Track
        </Button>
      </form>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center text-red-400 mb-6">
          <p className="font-semibold">Order not found</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {order && (
        <div className="space-y-6 animate-in">
          {/* Header */}
          <div className="bg-dark-100 border border-dark-300 rounded-xl p-6">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <p className="text-gray-400 text-sm">Order ID</p>
                <p className="text-white font-mono font-bold text-lg">
                  #{order.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <Badge variant={statusVariant(order.status) as 'warning' | 'gold' | 'info' | 'success'}>
                {order.status}
              </Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs">Customer</p>
                <p className="text-white">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Order Date</p>
                <p className="text-white">
                  {new Date(order.created_at).toLocaleDateString('en-PH', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Payment</p>
                <p className="text-white uppercase">{order.payment_method}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Payment Status</p>
                <p className={order.payment_status === 'Paid' ? 'text-green-400' : order.payment_status === 'Failed' ? 'text-red-400' : 'text-yellow-400'}>
                  {order.payment_status}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500 text-xs">Total Amount</p>
                <p className="text-gold font-bold text-lg">₱{order.total_amount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-dark-100 border border-dark-300 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Order Progress</h3>
            <ProgressBar status={order.status} />
          </div>

          {/* Items */}
          {order.order_items && order.order_items.length > 0 && (
            <div className="bg-dark-100 border border-dark-300 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Items Ordered</h3>
              <div className="space-y-3">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm py-2 border-b border-dark-300 last:border-0">
                    <div>
                      <p className="text-white font-medium">{item.product?.name ?? 'Product'}</p>
                      <p className="text-gray-500 text-xs">Qty: {item.quantity} × ₱{item.unit_price.toLocaleString()}</p>
                    </div>
                    <span className="text-gold font-bold">
                      ₱{(item.unit_price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shipping */}
          <div className="bg-dark-100 border border-dark-300 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-2 text-sm">Shipping Address</h3>
            <p className="text-gray-400 text-sm">{order.shipping_address}</p>
          </div>
        </div>
      )}
    </div>
  )
}
