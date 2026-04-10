import { redirect } from 'next/navigation'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server'
import StatCard from '@/components/admin/StatCard'
import LowStockBanner from '@/components/admin/LowStockBanner'
import OrdersTable from '@/components/admin/OrdersTable'
import { Order, Product } from '@/types'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin')

  const admin = createAdminSupabaseClient()

  const [ordersRes, productsRes, revenueRes] = await Promise.all([
    admin.from('orders').select('*').order('created_at', { ascending: false }),
    admin.from('products').select('*'),
    admin.from('orders').select('total_amount').eq('payment_status', 'Paid'),
  ])

  const orders = (ordersRes.data ?? []) as Order[]
  const products = (productsRes.data ?? []) as Product[]
  const revenue = (revenueRes.data ?? []).reduce((s: number, o: { total_amount: number }) => s + o.total_amount, 0)

  const lowStock = products.filter((p) => p.stock <= 5)
  const pendingCount = orders.filter((o) => o.status === 'Pending').length
  const recentOrders = orders.slice(0, 10)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm">Welcome back, {user.email}</p>
        </div>
        <AdminLogout />
      </div>

      {/* Low stock alert */}
      <LowStockBanner products={lowStock} />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Orders" value={orders.length} icon="📋" />
        <StatCard title="Total Revenue" value={`₱${revenue.toLocaleString()}`} icon="💰" accent />
        <StatCard title="Pending Orders" value={pendingCount} icon="⏳" />
        <StatCard title="Low Stock" value={lowStock.length} icon="⚠️" />
      </div>

      {/* Nav cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { href: '/admin/dashboard', label: 'Orders', icon: '📦', desc: 'Manage all orders' },
          { href: '/admin/products', label: 'Products', icon: '🎸', desc: 'Add & edit products' },
          { href: '/admin/reviews', label: 'Reviews', icon: '⭐', desc: 'Approve reviews' },
        ].map((nav) => (
          <Link
            key={nav.href}
            href={nav.href}
            className="bg-dark-100 border border-dark-300 hover:border-gold/50 rounded-xl p-4 transition-all hover:bg-dark-200 group"
          >
            <span className="text-2xl">{nav.icon}</span>
            <p className="text-white font-semibold mt-2 group-hover:text-gold transition-colors">{nav.label}</p>
            <p className="text-gray-500 text-xs">{nav.desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-dark-100 border border-dark-300 rounded-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-300">
          <h2 className="text-white font-bold">Recent Orders</h2>
          <Link href="/admin/dashboard" className="text-gold text-sm hover:text-gold-light transition-colors">
            View all →
          </Link>
        </div>
        <OrdersTable orders={recentOrders} />
      </div>
    </div>
  )
}

function AdminLogout() {
  return (
    <form action="/api/admin/logout" method="POST">
      <button
        type="submit"
        className="text-sm text-gray-400 hover:text-red-400 transition-colors px-4 py-2 border border-dark-400 rounded-lg hover:border-red-400/50"
      >
        Sign Out
      </button>
    </form>
  )
}
