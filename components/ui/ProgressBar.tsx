const STEPS = ['Pending', 'Confirmed', 'Shipped', 'Delivered'] as const

interface ProgressBarProps {
  status: string
}

export default function ProgressBar({ status }: ProgressBarProps) {
  const currentIndex = STEPS.indexOf(status as typeof STEPS[number])

  return (
    <div className="w-full py-6">
      <div className="relative flex items-center justify-between">
        {/* connector line */}
        <div className="absolute left-0 right-0 top-4 h-1 bg-dark-400 -z-10" />
        <div
          className="absolute left-0 top-4 h-1 bg-gold transition-all duration-700 -z-10"
          style={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((step, i) => {
          const done = i <= currentIndex
          return (
            <div key={step} className="flex flex-col items-center gap-2 z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                  done
                    ? 'bg-gold text-dark-DEFAULT'
                    : 'bg-dark-400 text-gray-500'
                }`}
              >
                {i < currentIndex ? '✓' : i + 1}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  done ? 'text-gold' : 'text-gray-500'
                }`}
              >
                {step}
              </span>
            </div>
          )
        })}
      </div>

      {/* mobile labels */}
      <div className="flex justify-between sm:hidden mt-2">
        {STEPS.map((step, i) => (
          <span
            key={step}
            className={`text-xs font-medium ${
              i <= currentIndex ? 'text-gold' : 'text-gray-500'
            }`}
          >
            {step}
          </span>
        ))}
      </div>
    </div>
  )
}
