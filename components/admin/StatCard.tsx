interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: string
  accent?: boolean
}

export default function StatCard({ title, value, subtitle, icon, accent }: StatCardProps) {
  return (
    <div
      className={`bg-dark-100 border rounded-xl p-5 ${
        accent ? 'border-gold/40 bg-gold/5' : 'border-dark-300'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{title}</p>
          <p className={`text-3xl font-bold mt-1 ${accent ? 'text-gold' : 'text-white'}`}>{value}</p>
          {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
        </div>
        <span className="text-3xl opacity-80">{icon}</span>
      </div>
    </div>
  )
}
