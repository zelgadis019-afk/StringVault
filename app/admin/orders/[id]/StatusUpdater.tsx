'use client'

import { useState } from 'react'
import { Order } from '@/types'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { toast } from '@/components/ui/Toast'

const STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Delivered'] as const

export default function StatusUpdater({ order }: { order: Order }) {
  const [status, setStatus] = useState(order.status)
  const [loading, setLoading] = useState(false)

  const handleUpdate = async () => {
    if (status === order.status) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      toast('Order status updated & email sent to customer', 'success')
    } catch {
      toast('Failed to update status', 'error')
    } finally {
      setLoading(false)
    }
  }

  const variantMap: Record<string, 'warning' | 'gold' | 'info' | 'success'> = {
    Pending: 'warning', Confirmed: 'gold', Shipped: 'info', Delivered: 'success',
  }

  return (
    <div className="bg-dark-100 border border-dark-300 rounded-xl p-5 space-y-4">
      <h2 className="text-white font-semibold">Order Status</h2>

      <div className="flex items-center gap-3">
        <span className="text-gray-400 text-sm">Current:</span>
        <Badge variant={variantMap[status] ?? 'default'}>{status}</Badge>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-300 block mb-2">Update Status</label>
        <div className="space-y-2">
          {STATUSES.map((s) => (
            <label
              key={s}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                status === s ? 'border-gold bg-gold/10' : 'border-dark-400 hover:border-dark-300'
              }`}
            >
              <input
                type="radio"
                name="status"
                value={s}
                checked={status === s}
                onChange={() => setStatus(s)}
                className="sr-only"
              />
              <div className={`w-3 h-3 rounded-full border-2 transition-all ${status === s ? 'border-gold bg-gold' : 'border-dark-400'}`} />
              <span className={status === s ? 'text-gold font-medium text-sm' : 'text-gray-300 text-sm'}>{s}</span>
            </label>
          ))}
        </div>
      </div>

      <Button
        onClick={handleUpdate}
        loading={loading}
        disabled={status === order.status}
        className="w-full"
      >
        Update & Notify Customer
      </Button>
      {status !== order.status && (
        <p className="text-xs text-gray-500 text-center">
          A status update email will be sent to {order.customer_email}
        </p>
      )}
    </div>
  )
}
