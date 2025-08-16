import { DivideIcon as LucideIcon } from 'lucide-react'

interface MetricsCardProps {
  title: string
  value: string
  change?: {
    value: number
    isPositive: boolean
    period: string
  }
  icon: typeof LucideIcon
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
}

const colorClasses = {
  blue: {
    icon: 'text-blue-400',
    ring: 'ring-blue-500/20',
  },
  green: {
    icon: 'text-emerald-400',
    ring: 'ring-emerald-500/20',
  },
  yellow: {
    icon: 'text-yellow-400',
    ring: 'ring-yellow-500/20',
  },
  red: {
    icon: 'text-red-400',
    ring: 'ring-red-500/20',
  },
  purple: {
    icon: 'text-purple-400',
    ring: 'ring-purple-500/20',
  }
};

export function MetricsCard({ title, value, change, icon: Icon, color }: MetricsCardProps) {
  const colors = colorClasses[color];
  return (
    <div className="bg-white/10 border border-white/20 rounded-2xl shadow-md p-5 hover:shadow-lg transition-shadow flex flex-col gap-2">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-11 h-11 rounded-lg bg-gray-800 ring-2 ${colors.ring} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
        {change && (
          <div className={`text-xs font-semibold ${change.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>{change.isPositive ? '+' : ''}{change.value}% {change.period}</div>
        )}
      </div>
      <div className="flex-1">
        <div className="text-xs text-gray-400 font-medium mb-1">{title}</div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      </div>
    </div>
  );
}