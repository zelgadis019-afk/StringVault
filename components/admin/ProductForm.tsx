'use client'

import { useState } from 'react'
import { Product } from '@/types'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'

interface ProductFormProps {
  product?: Product
  onSuccess: () => void
  onCancel: () => void
}

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: product?.name ?? '',
    brand: product?.brand ?? '',
    category: product?.category ?? 'electric',
    description: product?.description ?? '',
    price: product?.price?.toString() ?? '',
    stock: product?.stock?.toString() ?? '0',
    image_url: product?.image_url ?? '',
  })

  const update = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = product ? `/api/admin/products/${product.id}` : '/api/admin/products'
      const method = product ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          stock: parseInt(form.stock),
        }),
      })
      if (!res.ok) throw new Error('Failed to save product')
      toast(product ? 'Product updated!' : 'Product created!', 'success')
      onSuccess()
    } catch {
      toast('Failed to save product', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Product Name" required value={form.name} onChange={update('name')} placeholder="Gibson Les Paul Standard" />
        <Input label="Brand" value={form.brand} onChange={update('brand')} placeholder="Gibson" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-300">Category <span className="text-gold">*</span></label>
          <select
            value={form.category}
            onChange={update('category')}
            className="bg-dark-200 border border-dark-400 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
          >
            <option value="electric">Electric</option>
            <option value="acoustic">Acoustic</option>
            <option value="bass">Bass</option>
            <option value="accessory">Accessory</option>
          </select>
        </div>
        <Input label="Price (₱)" type="number" required min="0" step="0.01" value={form.price} onChange={update('price')} placeholder="15000" />
        <Input label="Stock" type="number" required min="0" value={form.stock} onChange={update('stock')} placeholder="10" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-300">Description</label>
        <textarea
          value={form.description}
          onChange={update('description')}
          rows={3}
          placeholder="Product description…"
          className="bg-dark-200 border border-dark-400 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent resize-none"
        />
      </div>

      <Input label="Image URL" type="url" value={form.image_url} onChange={update('image_url')} placeholder="https://example.com/guitar.jpg" />

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>{product ? 'Update Product' : 'Create Product'}</Button>
      </div>
    </form>
  )
}
