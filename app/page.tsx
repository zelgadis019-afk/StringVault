import Link from 'next/link'
import { createAdminSupabaseClient } from '@/lib/supabase-server'
import ProductCard from '@/components/shop/ProductCard'
import { Product } from '@/types'

async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = createAdminSupabaseClient()
  const { data } = await supabase
    .from('products')
    .select(`
      *,
      reviews(rating)
    `)
    .limit(6)
    .order('created_at', { ascending: false })

  return (data ?? []).map((p: Product & { reviews?: { rating: number }[] }) => {
    const approved = (p.reviews ?? [])
    const avg = approved.length > 0
      ? approved.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / approved.length
      : 0
    return { ...p, avg_rating: avg, review_count: approved.length, reviews: undefined }
  })
}

export default async function HomePage() {
  const products = await getFeaturedProducts()

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-dark-DEFAULT">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 20px,
              #d4a017 20px,
              #d4a017 21px
            )`,
          }}
        />
        {/* Glow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="text-gold text-5xl">♦</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-black text-white mb-4 leading-tight tracking-tight">
            String<span className="text-gold">Vault</span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-400 italic mb-8 font-light">
            Every string tells a story.
          </p>
          <p className="text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Discover premium electric, acoustic, and bass guitars alongside top-quality accessories — curated for players who demand the best.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 bg-gold text-dark-DEFAULT font-bold px-8 py-4 rounded-xl text-base hover:bg-gold-light transition-all hover:scale-105 active:scale-95"
            >
              Shop Now →
            </Link>
            <Link
              href="/track"
              className="inline-flex items-center justify-center gap-2 border border-dark-400 text-gray-300 font-medium px-8 py-4 rounded-xl text-base hover:border-gold hover:text-gold transition-all"
            >
              Track Order
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-2">Featured</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">New Arrivals</h2>
          </div>
          <Link href="/shop" className="text-gold hover:text-gold-light text-sm font-medium transition-colors">
            View all →
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <p className="text-5xl mb-4">🎸</p>
            <p>No products yet. Check back soon!</p>
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="bg-dark-100 border-y border-dark-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-2">Browse By</p>
            <h2 className="text-3xl font-bold text-white">Categories</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Electric', icon: '⚡', cat: 'electric', desc: 'From classics to modern shredders' },
              { label: 'Acoustic', icon: '🌿', cat: 'acoustic', desc: 'Natural tone, timeless feel' },
              { label: 'Bass', icon: '🎵', cat: 'bass', desc: 'Hold down the low end' },
              { label: 'Accessories', icon: '🎛️', cat: 'accessory', desc: 'Strings, picks, straps & more' },
            ].map((c) => (
              <Link
                key={c.cat}
                href={`/shop?category=${c.cat}`}
                className="group bg-dark-200 border border-dark-400 hover:border-gold/50 rounded-xl p-5 text-center transition-all hover:bg-dark-300 hover:shadow-lg hover:shadow-gold/10"
              >
                <span className="text-4xl mb-3 block">{c.icon}</span>
                <h3 className="text-white font-bold mb-1 group-hover:text-gold transition-colors">{c.label}</h3>
                <p className="text-gray-500 text-xs">{c.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-3">About StringVault</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5 leading-tight">
              Born from a love of music
            </h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              StringVault was founded by musicians, for musicians. We know that the right instrument doesn't just sound good — it inspires you to play differently, to push further, and to find your voice.
            </p>
            <p className="text-gray-400 leading-relaxed mb-6">
              We carefully source every guitar and accessory in our collection, from entry-level instruments for beginners to boutique pieces for seasoned professionals. Every string really does tell a story — what's yours?
            </p>
            <Link href="/shop" className="inline-flex items-center gap-2 text-gold font-semibold hover:text-gold-light transition-colors">
              Explore our collection →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { num: '500+', label: 'Products in Stock' },
              { num: '10K+', label: 'Happy Musicians' },
              { num: '5★', label: 'Average Rating' },
              { num: 'PH', label: 'Nationwide Delivery' },
            ].map((s) => (
              <div key={s.label} className="bg-dark-100 border border-dark-300 rounded-xl p-5 text-center">
                <p className="text-3xl font-black text-gold">{s.num}</p>
                <p className="text-gray-400 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
