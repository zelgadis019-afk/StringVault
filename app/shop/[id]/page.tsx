import { notFound } from 'next/navigation'
import Image from 'next/image'
import { createAdminSupabaseClient } from '@/lib/supabase-server'
import { Product, Review } from '@/types'
import AddToCartSection from './AddToCartSection'
import StarRating from '@/components/ui/StarRating'
import ReviewForm from '@/components/shop/ReviewForm'
import ReviewList from '@/components/shop/ReviewList'

interface Props {
  params: { id: string }
}

export default async function ProductDetailPage({ params }: Props) {
  const supabase = createAdminSupabaseClient()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!product) notFound()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', params.id)
    .eq('approved', true)
    .order('created_at', { ascending: false })

  const reviewList = (reviews ?? []) as Review[]
  const avgRating =
    reviewList.length > 0
      ? reviewList.reduce((s, r) => s + r.rating, 0) / reviewList.length
      : 0

  const p = product as Product

  const categoryLabel: Record<string, string> = {
    electric: 'Electric Guitar',
    acoustic: 'Acoustic Guitar',
    bass: 'Bass Guitar',
    accessory: 'Accessory',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <a href="/shop" className="hover:text-gold transition-colors">Shop</a>
        <span className="mx-2">›</span>
        <span className="text-gray-300">{p.name}</span>
      </nav>

      {/* Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-dark-200">
          {p.image_url ? (
            <Image src={p.image_url} alt={p.name} fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-9xl opacity-10">🎸</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {p.brand && (
            <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-2">{p.brand}</p>
          )}
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3 leading-tight">{p.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={avgRating} size="md" />
            <span className="text-gray-400 text-sm">
              {reviewList.length > 0
                ? `${avgRating.toFixed(1)} (${reviewList.length} review${reviewList.length > 1 ? 's' : ''})`
                : 'No reviews yet'}
            </span>
          </div>

          <p className="text-4xl font-black text-gold mb-6">₱{p.price.toLocaleString()}</p>

          {p.description && (
            <p className="text-gray-300 leading-relaxed mb-6">{p.description}</p>
          )}

          {/* Specs */}
          <div className="bg-dark-100 border border-dark-300 rounded-xl p-4 mb-6">
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Specifications</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm py-1.5 border-b border-dark-300">
                <span className="text-gray-400">Category</span>
                <span className="text-white capitalize">{categoryLabel[p.category] ?? p.category}</span>
              </div>
              {p.brand && (
                <div className="flex justify-between text-sm py-1.5 border-b border-dark-300">
                  <span className="text-gray-400">Brand</span>
                  <span className="text-white">{p.brand}</span>
                </div>
              )}
              <div className="flex justify-between text-sm py-1.5">
                <span className="text-gray-400">Availability</span>
                <span className={p.stock > 0 ? 'text-green-400' : 'text-red-400'}>
                  {p.stock > 0
                    ? p.stock <= 5
                      ? `Only ${p.stock} left`
                      : 'In Stock'
                    : 'Out of Stock'}
                </span>
              </div>
            </div>
          </div>

          <AddToCartSection product={p} />
        </div>
      </div>

      {/* Reviews */}
      <div className="max-w-3xl">
        <h2 className="text-2xl font-bold text-white mb-6">
          Customer Reviews
          {reviewList.length > 0 && (
            <span className="text-gray-500 font-normal text-lg ml-2">({reviewList.length})</span>
          )}
        </h2>
        <div className="space-y-8">
          <ReviewForm productId={p.id} />
          <ReviewList reviews={reviewList} />
        </div>
      </div>
    </div>
  )
}
