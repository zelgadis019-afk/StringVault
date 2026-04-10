'use client'

import { useState, useEffect, useCallback } from 'react'
import { Product } from '@/types'
import ProductForm from '@/components/admin/ProductForm'
import LowStockBanner from '@/components/admin/LowStockBanner'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { toast } from '@/components/ui/Toast'
import Image from 'next/image'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/products')
    const data = await res.json()
    setProducts(data.products ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast('Product deleted', 'success')
      fetchProducts()
    } catch {
      toast('Failed to delete product', 'error')
    } finally {
      setDeleting(null)
    }
  }

  const lowStock = products.filter((p) => p.stock <= 5)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Products</h1>
        <Button onClick={() => { setEditing(null); setShowForm(true) }}>
          + Add Product
        </Button>
      </div>

      <LowStockBanner products={lowStock} />

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-dark-DEFAULT/80 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="bg-dark-100 border border-dark-300 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-white font-bold text-lg mb-6">
              {editing ? 'Edit Product' : 'Add New Product'}
            </h2>
            <ProductForm
              product={editing ?? undefined}
              onSuccess={() => { setShowForm(false); fetchProducts() }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading products…</div>
      ) : (
        <div className="bg-dark-100 border border-dark-300 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-300 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="text-left py-3 px-4">Product</th>
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-right py-3 px-4">Price</th>
                  <th className="text-center py-3 px-4">Stock</th>
                  <th className="text-center py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-300">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-dark-200/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-dark-300 rounded-lg overflow-hidden shrink-0">
                          {p.image_url ? (
                            <Image src={p.image_url} alt={p.name} width={40} height={40} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg opacity-30">🎸</div>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">{p.name}</p>
                          {p.brand && <p className="text-gray-500 text-xs">{p.brand}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 capitalize text-gray-300">{p.category}</td>
                    <td className="py-3 px-4 text-right text-gold font-bold">₱{p.price.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={p.stock === 0 ? 'error' : p.stock <= 5 ? 'warning' : 'success'}>
                        {p.stock}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setEditing(p); setShowForm(true) }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          loading={deleting === p.id}
                          onClick={() => handleDelete(p.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
