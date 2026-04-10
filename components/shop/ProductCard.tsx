'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/types'
import StarRating from '@/components/ui/StarRating'
import Button from '@/components/ui/Button'
import { useCartStore } from '@/lib/cart-store'
import { toast } from '@/components/ui/Toast'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    if (product.stock === 0) return
    addItem(product)
    toast(`${product.name} added to cart!`, 'success')
  }

  const categoryColors: Record<string, string> = {
    electric: 'text-blue-400 bg-blue-400/10',
    acoustic: 'text-green-400 bg-green-400/10',
    bass: 'text-purple-400 bg-purple-400/10',
    accessory: 'text-gold bg-gold/10',
  }

  return (
    <Link href={`/shop/${product.id}`} className="group block">
      <div className="bg-dark-100 rounded-xl border border-dark-300 overflow-hidden hover:border-gold/50 transition-all duration-300 hover:shadow-lg hover:shadow-gold/10">
        {/* Image */}
        <div className="relative aspect-square bg-dark-200 overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl opacity-20">🎸</span>
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-dark-DEFAULT/70 flex items-center justify-center">
              <span className="text-red-400 font-bold text-sm bg-dark-100/80 px-3 py-1 rounded-full">
                Out of Stock
              </span>
            </div>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <div className="absolute top-2 right-2">
              <span className="bg-gold/90 text-dark-DEFAULT text-xs font-bold px-2 py-0.5 rounded-full">
                Only {product.stock} left
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2 group-hover:text-gold transition-colors">
              {product.name}
            </h3>
            <span
              className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                categoryColors[product.category] ?? 'text-gray-400 bg-dark-300'
              }`}
            >
              {product.category}
            </span>
          </div>

          {product.brand && (
            <p className="text-gray-500 text-xs mb-2">{product.brand}</p>
          )}

          <div className="flex items-center gap-2 mb-3">
            <StarRating rating={product.avg_rating ?? 0} size="sm" />
            <span className="text-gray-500 text-xs">
              {product.avg_rating ? product.avg_rating.toFixed(1) : 'No reviews'}
              {product.review_count ? ` (${product.review_count})` : ''}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-gold font-bold text-lg">₱{product.price.toLocaleString()}</span>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="shrink-0"
            >
              {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  )
}
