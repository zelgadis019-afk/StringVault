import Link from 'next/link'

interface Props {
  searchParams: { order?: string }
}

export default function CheckoutSuccessPage({ searchParams }: Props) {
  const orderId = searchParams.order

  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      {/* Success animation */}
      <div className="w-20 h-20 bg-gold/20 border-2 border-gold rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-3xl font-black text-white mb-2">Order Placed!</h1>
      <p className="text-gray-400 mb-6 leading-relaxed">
        Thank you for your purchase. We've received your order and sent a confirmation to your email.
      </p>

      {orderId && (
        <div className="bg-dark-100 border border-gold/30 rounded-xl p-5 mb-8">
          <p className="text-gray-400 text-sm mb-1">Your Order ID</p>
          <p className="text-gold font-mono font-bold text-xl tracking-wider">
            #{orderId.slice(0, 8).toUpperCase()}
          </p>
          <p className="text-gray-500 text-xs mt-2">Save this ID to track your order status.</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {orderId && (
          <Link
            href={`/track?order=${orderId}`}
            className="inline-flex items-center justify-center gap-2 bg-gold text-dark-DEFAULT font-bold px-8 py-3 rounded-xl hover:bg-gold-light transition-all"
          >
            Track Order →
          </Link>
        )}
        <Link
          href="/shop"
          className="inline-flex items-center justify-center gap-2 border border-dark-400 text-gray-300 font-medium px-8 py-3 rounded-xl hover:border-gold hover:text-gold transition-all"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
