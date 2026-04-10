'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useCartStore } from '@/lib/cart-store'
import { toast } from '@/components/ui/Toast'

type PaymentMethod = 'gcash' | 'maya' | 'card'

export default function OrderForm() {
  const { items, totalPrice, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gcash')

  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address: '',
  })

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) {
      toast('Your cart is empty', 'warning')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          payment_method: paymentMethod,
          items: items.map((i) => ({
            product_id: i.product.id,
            quantity: i.quantity,
            unit_price: i.product.price,
          })),
          total_amount: totalPrice(),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Order failed')

      clearCart()

      // Redirect to PayMongo checkout URL
      if (data.checkout_url) {
        window.location.href = data.checkout_url
      } else {
        window.location.href = `/checkout/success?order=${data.order_id}`
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      toast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const paymentOptions: { id: PaymentMethod; label: string; icon: string; desc: string }[] = [
    { id: 'gcash', label: 'GCash', icon: '📱', desc: 'Pay via GCash e-wallet' },
    { id: 'maya', label: 'Maya', icon: '💳', desc: 'Pay via Maya e-wallet' },
    { id: 'card', label: 'Credit / Debit Card', icon: '🏦', desc: 'Visa, Mastercard, JCB' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Info */}
      <div className="bg-dark-100 border border-dark-300 rounded-xl p-6 space-y-4">
        <h2 className="text-white font-bold text-lg">Customer Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Full Name" required value={form.customer_name} onChange={update('customer_name')} placeholder="Juan dela Cruz" />
          <Input label="Email Address" type="email" required value={form.customer_email} onChange={update('customer_email')} placeholder="juan@email.com" />
        </div>
        <Input label="Phone Number" type="tel" value={form.customer_phone} onChange={update('customer_phone')} placeholder="+63 900 000 0000" />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-300">
            Shipping Address <span className="text-gold">*</span>
          </label>
          <textarea
            required
            value={form.shipping_address}
            onChange={update('shipping_address')}
            placeholder="Unit/Block, Street, Barangay, City, Province, ZIP"
            rows={3}
            className="bg-dark-200 border border-dark-400 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent resize-none"
          />
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-dark-100 border border-dark-300 rounded-xl p-6 space-y-3">
        <h2 className="text-white font-bold text-lg">Payment Method</h2>
        <div className="space-y-2">
          {paymentOptions.map((opt) => (
            <label
              key={opt.id}
              className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                paymentMethod === opt.id
                  ? 'border-gold bg-gold/10'
                  : 'border-dark-400 hover:border-dark-300 bg-dark-200'
              }`}
            >
              <input
                type="radio"
                name="payment"
                value={opt.id}
                checked={paymentMethod === opt.id}
                onChange={() => setPaymentMethod(opt.id)}
                className="sr-only"
              />
              <span className="text-2xl">{opt.icon}</span>
              <div className="flex-1">
                <p className={`font-semibold text-sm ${paymentMethod === opt.id ? 'text-gold' : 'text-white'}`}>
                  {opt.label}
                </p>
                <p className="text-gray-500 text-xs">{opt.desc}</p>
              </div>
              <div
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  paymentMethod === opt.id ? 'border-gold bg-gold' : 'border-dark-400'
                }`}
              />
            </label>
          ))}
        </div>
      </div>

      <Button type="submit" size="lg" loading={loading} className="w-full">
        {loading ? 'Processing…' : 'Place Order & Pay'}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        By placing your order you agree to our terms. Payments are processed securely via PayMongo.
      </p>
    </form>
  )
}
