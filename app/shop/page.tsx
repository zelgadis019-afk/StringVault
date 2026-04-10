import { Suspense } from 'react'
import { createAdminSupabaseClient } from '@/lib/supabase-server'
import ProductCard from '@/components/shop/ProductCard'
import FilterBar, { PRICE_RANGES } from '@/components/shop/FilterBar'
import { Product } from '@/types'

interface ShopPageProps {
  searchParams: { category?: string; brand?: string; price?: string }
}

async function getProducts(filters: ShopPageProps['searchParams']): Promise<Product[]> {
  const supabase = createAdminSupabaseClient()

  let query = supabase.from('products').select(`*, reviews!inner(rating, approved)`).eq('reviews.approved', true)

  // Supabase doesn't support conditional joins easily, so fetch all with reviews separately
  const { data: products } = await supabase.from('products').select('*')
  const { data: reviews } = await supabase.from('reviews').select('product_id, rating').eq('approved', true)

  let filtered = (products ?? []) as Product[]

  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter((p) => p.category === filters.category)
  }
  if (filters.brand) {
    filtered = filtered.filter((p) =>
      p.brand?.toLowerCase().includes(filters.brand!.toLowerCase())
    )
  }
  if (filters.price && filters.price !== '0') {
    const range = PRICE_RANGES[parseInt(filters.price)]
    if (range) {
      filtered = filtered.filter((p) => p.price >= range.min && p.price <= range.max)
    }
  }

  return filtered.map((p) => {
    const productReviews = (reviews ?? []).filter((r) => r.product_id === p.id)
    const avg =
      productReviews.length > 0
        ? productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length
        : 0
    return { ...p, avg_rating: avg, review_count: productReviews.length }
  })
}

function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-20 col-span-full">
        <p className="text-5xl mb-4">🔍</p>
        <p className="text-gray-400 text-lg">No products match your filters.</p>
        <p className="text-gray-600 text-sm mt-1">Try adjusting or clearing your filters.</p>
      </div>
    )
  }
  return (
    <>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </>
  )
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const products = await getProducts(searchParams)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Shop</h1>
        <p className="text-gray-400">
          {products.length} product{products.length !== 1 ? 's' : ''} found
        </p>
      </div>

      <Suspense>
        <FilterBar />
      </Suspense>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
        <ProductGrid products={products} />
      </div>
    </div>
  )
}
