import Link from 'next/link'
import { Order } from '@/types'
import Badge from '@/components/ui/Badge'

interface OrdersTableProps {
  orders: Order[]
}

function statusVariant(status: string): 'default' | 'warning' | 'info' | 'success' | 'error' | 'gold' {
  switch (status) {
    case 'Pending': return 'warning'
    case 'Confirmed': return 'gold'
    case 'Shipped': return 'info'
    case 'Delivered': return 'success'
    default: return 'default'
  }
}

function paymentVariant(status: string): 'default' | 'warning' | 'info' | 'success' | 'error' | 'gold' {
  switch (status) {
    case 'Paid': return 'success'
    case 'Unpaid': return 'warning'
    case 'Failed': return 'error'
    default: return 'default'
  }
}

export default function OrdersTable({ orders }: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-4xl mb-2">📋</p>
        <p>No orders yet.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-dark-300 text-gray-400 text-xs uppercase tracking-wider">
            <th className="text-left py-3 px-4">Order ID</th>
            <th className="text-left py-3 px-4">Customer</th>
            <th className="text-left py-3 px-4">Date</th>
            <th className="text-right py-3 px-4">Total</th>
            <th className="text-center py-3 px-4">Payment</th>
            <th className="text-center py-3 px-4">Status</th>
            <th className="text-center py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-300">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-dark-200/50 transition-colors">
              <td className="py-3 px-4 font-mono text-xs text-gray-400">
                #{order.id.slice(0, 8).toUpperCase()}
              </td>
              <td className="py-3 px-4">
                <p className="text-white font-medium">{order.customer_name}</p>
                <p className="text-gray-500 text-xs">{order.customer_email}</p>
              </td>
              <td className="py-3 px-4 text-gray-400">
                {new Date(order.created_at).toLocaleDateString('en-PH')}
              </td>
              <td className="py-3 px-4 text-right text-gold font-bold">
                ₱{order.total_amount.toLocaleString()}
              </td>
              <td className="py-3 px-4 text-center">
                <Badge variant={paymentVariant(order.payment_status)}>{order.payment_status}</Badge>
              </td>
              <td className="py-3 px-4 text-center">
                <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
              </td>
              <td className="py-3 px-4 text-center">
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="text-gold hover:text-gold-light text-xs font-medium underline transition-colors"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
