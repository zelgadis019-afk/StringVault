'use client'

import Image from 'next/image'
import { CartItem as CartItemType } from '@/types'
import { useCartStore } from '@/lib/cart-store'

interface CartItemProps {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const { removeItem, updateQuantity } = useCartStore()

  return (
    <div className="flex items-center gap-4 bg-dark-100 border border-dark-300 rounded-xl p-4">
      {/* Image */}
      <div className="relative w-20 h-20 bg-dark-200 rounded-lg overflow-hidden shrink-0">
        {item.product.image_url ? (
          <Image src={item.product.image_url} alt={item.product.name} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-3xl opacity-30">🎸</div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm truncate">{item.product.name}</p>
        {item.product.brand && (
          <p className="text-gray-500 text-xs">{item.product.brand}</p>
        )}
        <p className="text-gold font-bold mt-1">₱{item.product.price.toLocaleString()}</p>
      </div>

      {/* Quantity + Remove */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center border border-dark-400 rounded-lg overflow-hidden">
          <button
            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
            className="px-3 py-2 text-gray-400 hover:text-white hover:bg-dark-300 transition-colors text-sm"
          >
            −
          </button>
          <span className="px-3 py-2 text-white text-sm font-medium min-w-[2rem] text-center bg-dark-200">
            {item.quantity}
          </span>
          <button
            onClick={() => updateQuantity(item.product.id, Math.min(item.quantity + 1, item.product.stock))}
            className="px-3 py-2 text-gray-400 hover:text-white hover:bg-dark-300 transition-colors text-sm"
          >
            +
          </button>
        </div>

        <button
          onClick={() => removeItem(item.product.id)}
          className="p-2 text-gray-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10"
          title="Remove item"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Subtotal */}
      <div className="hidden sm:block text-right shrink-0 min-w-[80px]">
        <p className="text-xs text-gray-500">Subtotal</p>
        <p className="text-white font-bold">₱{(item.product.price * item.quantity).toLocaleString()}</p>
      </div>
    </div>
  )
}
