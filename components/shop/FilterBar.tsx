'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

const CATEGORIES = ['all', 'electric', 'acoustic', 'bass', 'accessory']
const PRICE_RANGES = [
  { label: 'All Prices', min: 0, max: 999999 },
  { label: 'Under ₱5,000', min: 0, max: 5000 },
  { label: '₱5,000–₱15,000', min: 5000, max: 15000 },
  { label: '₱15,000–₱50,000', min: 15000, max: 50000 },
  { label: 'Over ₱50,000', min: 50000, max: 999999 },
]

export default function FilterBar() {
  const router = useRouter()
  const params = useSearchParams()

  const category = params.get('category') ?? 'all'
  const brand = params.get('brand') ?? ''
  const priceRange = params.get('price') ?? '0'

  const updateParam = useCallback(
    (key: string, value: string) => {
      const p = new URLSearchParams(params.toString())
      if (value === '' || value === 'all' || value === '0') {
        p.delete(key)
      } else {
        p.set(key, value)
      }
      router.push(`/shop?${p.toString()}`)
    },
    [params, router]
  )

  return (
    <div className="bg-dark-100 border border-dark-300 rounded-xl p-4 flex flex-wrap gap-4 items-end">
      {/* Category */}
      <div className="flex flex-col gap-1.5 min-w-[140px]">
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Category</label>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => updateParam('category', cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                category === cat
                  ? 'bg-gold text-dark-DEFAULT'
                  : 'bg-dark-200 text-gray-400 hover:text-white hover:bg-dark-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Brand search */}
      <div className="flex flex-col gap-1.5 min-w-[180px]">
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Brand</label>
        <input
          type="text"
          value={brand}
          onChange={(e) => updateParam('brand', e.target.value)}
          placeholder="Search by brand…"
          className="bg-dark-200 border border-dark-400 text-white placeholder-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
        />
      </div>

      {/* Price range */}
      <div className="flex flex-col gap-1.5 min-w-[180px]">
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Price Range</label>
        <select
          value={priceRange}
          onChange={(e) => updateParam('price', e.target.value)}
          className="bg-dark-200 border border-dark-400 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
        >
          {PRICE_RANGES.map((r, i) => (
            <option key={i} value={i}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {/* Clear */}
      {(category !== 'all' || brand || priceRange !== '0') && (
        <button
          onClick={() => router.push('/shop')}
          className="text-xs text-gray-400 hover:text-gold underline transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}

export { PRICE_RANGES }
