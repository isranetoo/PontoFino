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
  icon: LucideIcon
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    text: 'text-blue-600'
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    text: 'text-green-600'
  },
  yellow: {
    bg: 'bg-yellow-50',
    icon: 'text-yellow-600',
    text: 'text-yellow-600'
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    text: 'text-red-600'
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    text: 'text-purple-600'
  }
}

export function MetricsCard({ title, value, change, icon: Icon, color }: MetricsCardProps) {
  const colors = colorClasses[color]

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
        {change && (
          <div className={`text-sm ${change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {change.isPositive ? '+' : ''}{change.value}% {change.period}
          </div>
        )}
      </div>

      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}