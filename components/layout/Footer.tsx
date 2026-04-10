import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-dark-100 border-t border-dark-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-gold text-xl">♦</span>
              <span className="font-bold text-white text-lg">StringVault</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Every string tells a story. Premium guitars and accessories for musicians of all levels.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/shop', label: 'Shop' },
                { href: '/track', label: 'Track Order' },
                { href: '/cart', label: 'Cart' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-gray-400 hover:text-gold text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>orders@stringvault.ph</li>
              <li>+63 900 000 0000</li>
              <li>Metro Manila, Philippines</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-dark-300 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-gray-500 text-xs">© {new Date().getFullYear()} StringVault. All rights reserved.</p>
          <p className="text-gray-600 text-xs italic">Every string tells a story.</p>
        </div>
      </div>
    </footer>
  )
}
