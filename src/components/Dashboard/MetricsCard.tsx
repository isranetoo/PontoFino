import React from 'react'
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
    icon: 'text-blue-500',
    ring: 'ring-blue-100',
  },
  green: {
    icon: 'text-emerald-500',
    ring: 'ring-emerald-100',
  },
  yellow: {
    icon: 'text-yellow-500',
    ring: 'ring-yellow-100',
  },
  red: {
    icon: 'text-red-500',
    ring: 'ring-red-100',
  },
  purple: {
    icon: 'text-purple-500',
    ring: 'ring-purple-100',
  }
}

export function MetricsCard({ title, value, change, icon: Icon, color }: MetricsCardProps) {
  const colors = colorClasses[color];
  return (
    <div className="bg-white border border-white/10 rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow flex flex-col gap-2">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-11 h-11 rounded-lg bg-white ring-2 ${colors.ring} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
        {change && (
          <div className={`text-xs font-semibold ${change.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>{change.isPositive ? '+' : ''}{change.value}% {change.period}</div>
        )}
      </div>
      <div className="flex-1">
        <div className="text-xs text-blue-400 font-medium mb-1">{title}</div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      </div>
    </div>
  );
}