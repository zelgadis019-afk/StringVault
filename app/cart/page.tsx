'use client'

import Link from 'next/link'
import { useCartStore } from '@/lib/cart-store'
import CartItem from '@/components/cart/CartItem'
import CartSummary from '@/components/cart/CartSummary'

export default function CartPage() {
  const { items, clearCart } = useCartStore()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Your Cart</h1>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-sm text-gray-500 hover:text-red-400 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-6xl mb-4">🛒</p>
          <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
          <p className="text-gray-400 mb-8">Looks like you haven't added anything yet.</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-gold text-dark-DEFAULT font-bold px-8 py-3 rounded-xl hover:bg-gold-light transition-all"
          >
            Browse Shop →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartItem key={item.product.id} item={item} />
            ))}
          </div>
          {/* Summary */}
          <div>
            <CartSummary />
          </div>
        </div>
      )}
    </div>
  )
}
