'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCartStore } from '@/lib/cart-store'

export default function Navbar() {
  const pathname = usePathname()
  const totalItems = useCartStore((s) => s.totalItems())

  const links = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/track', label: 'Track Order' },
  ]

  return (
    <nav className="sticky top-0 z-40 bg-dark-DEFAULT/95 backdrop-blur border-b border-dark-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-gold text-2xl">♦</span>
          <div>
            <span className="font-bold text-white text-lg tracking-tight">StringVault</span>
            <span className="hidden sm:block text-xs text-gray-500 leading-none">Every string tells a story.</span>
          </div>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors ${
                pathname === l.href ? 'text-gold' : 'text-gray-400 hover:text-white'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Cart */}
        <Link
          href="/cart"
          className="relative flex items-center gap-2 text-gray-400 hover:text-gold transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
            />
          </svg>
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-gold text-dark-DEFAULT text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {totalItems > 9 ? '9+' : totalItems}
            </span>
          )}
          <span className="hidden sm:inline text-sm font-medium">Cart</span>
        </Link>

        {/* Mobile menu */}
        <div className="flex md:hidden gap-4 ml-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-xs font-medium transition-colors ${
                pathname === l.href ? 'text-gold' : 'text-gray-400'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
