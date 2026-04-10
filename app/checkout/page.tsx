'use client'

import { useCartStore } from '@/lib/cart-store'
import OrderForm from '@/components/checkout/OrderForm'
import Link from 'next/link'

export default function CheckoutPage() {
  const { items, totalPrice } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h2 className="text-2xl font-bold text-white mb-2">Nothing to checkout</h2>
        <p className="text-gray-400 mb-6">Add some items to your cart first.</p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-gold text-dark-DEFAULT font-bold px-8 py-3 rounded-xl hover:bg-gold-light transition-all"
        >
          Go to Shop →
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Checkout</h1>
        <p className="text-gray-400">
          {items.length} item{items.length > 1 ? 's' : ''} · Total:{' '}
          <span className="text-gold font-bold">₱{totalPrice().toLocaleString()}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <OrderForm />
        </div>

        {/* Order summary sidebar */}
        <div className="bg-dark-100 border border-dark-300 rounded-xl p-6 self-start sticky top-24">
          <h2 className="text-white font-bold mb-4">Order Summary</h2>
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between text-sm gap-2">
                <span className="text-gray-400 truncate">
                  {item.product.name} × {item.quantity}
                </span>
                <span className="text-white shrink-0">
                  ₱{(item.product.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-dark-300 pt-3 flex justify-between font-bold">
            <span className="text-white">Total</span>
            <span className="text-gold text-lg">₱{totalPrice().toLocaleString()}</span>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>🔒</span>
              <span>Payments secured by PayMongo</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>📧</span>
              <span>Confirmation sent to your email</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
