import Link from 'next/link'
import { Product } from '@/types'

interface LowStockBannerProps {
  products: Product[]
}

export default function LowStockBanner({ products }: LowStockBannerProps) {
  if (products.length === 0) return null

  return (
    <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <span className="text-red-400 text-xl mt-0.5">⚠️</span>
        <div className="flex-1">
          <p className="text-red-400 font-bold text-sm">
            Low Stock Alert — {products.length} product{products.length > 1 ? 's' : ''} running low
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {products.map((p) => (
              <span
                key={p.id}
                className="bg-red-500/20 text-red-300 text-xs px-2 py-1 rounded-full border border-red-500/30"
              >
                {p.name}: <strong>{p.stock}</strong> left
              </span>
            ))}
          </div>
          <Link
            href="/admin/products"
            className="inline-block mt-2 text-xs text-red-400 hover:text-red-300 underline transition-colors"
          >
            Manage inventory →
          </Link>
        </div>
      </div>
    </div>
  )
}
