'use client'

import Link from 'next/link'
import { useCartStore } from '@/lib/cart-store'
import Button from '@/components/ui/Button'

export default function CartSummary() {
  const { items, totalPrice } = useCartStore()
  const total = totalPrice()
  const subtotal = total

  return (
    <div className="bg-dark-100 border border-dark-300 rounded-xl p-6 sticky top-24">
      <h2 className="text-white font-bold text-lg mb-4">Order Summary</h2>

      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div key={item.product.id} className="flex justify-between text-sm">
            <span className="text-gray-400 truncate pr-2">
              {item.product.name} × {item.quantity}
            </span>
            <span className="text-white font-medium shrink-0">
              ₱{(item.product.price * item.quantity).toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-dark-300 pt-4 space-y-2 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Subtotal</span>
          <span className="text-white">₱{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Shipping</span>
          <span className="text-green-400">Calculated at checkout</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t border-dark-300 pt-2 mt-2">
          <span className="text-white">Total</span>
          <span className="text-gold">₱{total.toLocaleString()}</span>
        </div>
      </div>

      <Link href="/checkout">
        <Button className="w-full" size="lg">
          Proceed to Checkout
        </Button>
      </Link>

      <Link
        href="/shop"
        className="block text-center text-gray-400 hover:text-gold text-sm mt-3 transition-colors"
      >
        ← Continue Shopping
      </Link>
    </div>
  )
}
