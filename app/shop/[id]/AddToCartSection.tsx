'use client'

import { useState } from 'react'
import { Product } from '@/types'
import Button from '@/components/ui/Button'
import { useCartStore } from '@/lib/cart-store'
import { toast } from '@/components/ui/Toast'
import { useRouter } from 'next/navigation'

export default function AddToCartSection({ product }: { product: Product }) {
  const [qty, setQty] = useState(1)
  const addItem = useCartStore((s) => s.addItem)
  const router = useRouter()

  const handleAddToCart = () => {
    addItem(product, qty)
    toast(`${product.name} added to cart!`, 'success')
  }

  const handleOrderNow = () => {
    addItem(product, qty)
    router.push('/checkout')
  }

  if (product.stock === 0) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
        <p className="text-red-400 font-semibold">Out of Stock</p>
        <p className="text-gray-500 text-sm mt-1">Check back soon or browse other products.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Quantity selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-300">Quantity</label>
        <div className="flex items-center border border-dark-400 rounded-lg overflow-hidden">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-4 py-2.5 text-gray-400 hover:text-white hover:bg-dark-300 transition-colors"
          >
            −
          </button>
          <span className="px-5 py-2.5 text-white font-medium bg-dark-200 text-center min-w-[3rem]">
            {qty}
          </span>
          <button
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            className="px-4 py-2.5 text-gray-400 hover:text-white hover:bg-dark-300 transition-colors"
          >
            +
          </button>
        </div>
        <span className="text-gray-500 text-sm">{product.stock} available</span>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleAddToCart} variant="outline" size="lg" className="flex-1">
          Add to Cart
        </Button>
        <Button onClick={handleOrderNow} size="lg" className="flex-1">
          Order Now
        </Button>
      </div>
    </div>
  )
}
