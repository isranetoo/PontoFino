import React from 'react'
import { TrendingUp, TrendingDown, Star, StarOff } from 'lucide-react'

interface Fund {
  id: string
  ticker: string
  name: string
  category: string
  adminFee: number
  performanceFee?: number
  benchmark: string
  riskLevel: number
  returns: {
    recent: number
    ytd: number
    '12m': number
    '36m': number
  }
  isWatchlisted?: boolean
}

interface FundCardProps {
  fund: Fund
  onToggleWatchlist: (fundId: string) => void
  onViewDetails: (fundId: string) => void
}

export function FundCard({ fund, onToggleWatchlist, onViewDetails }: FundCardProps) {
  const getRiskColor = (level: number) => {
    if (level <= 2) return 'text-green-600 bg-green-50'
    if (level <= 4) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getRiskLabel = (level: number) => {
    if (level <= 2) return 'Baixo'
    if (level <= 4) return 'Médio'
    return 'Alto'
  }

  const formatReturn = (value: number) => {
    const isPositive = value >= 0
    return (
      <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
        {isPositive && '+'}{value.toFixed(2)}%
      </span>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg mb-1">{fund.ticker}</h3>
          <p className="text-gray-600 text-sm line-clamp-2">{fund.name}</p>
          <div className="flex items-center space-x-2 mt-2">
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              {fund.category}
            </span>
            <span className={`text-xs px-2 py-1 rounded ${getRiskColor(fund.riskLevel)}`}>
              Risco {getRiskLabel(fund.riskLevel)}
            </span>
          </div>
        </div>
        
        <button
          onClick={() => onToggleWatchlist(fund.id)}
          className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
        >
          {fund.isWatchlisted ? (
            <Star className="w-5 h-5 text-yellow-500 fill-current" />
          ) : (
            <StarOff className="w-5 h-5 text-gray-400" />
          )}
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Rentabilidade Recente</span>
          <div className="flex items-center space-x-1">
            {fund.returns.recent >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
            {formatReturn(fund.returns.recent)}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">YTD</span>
          {formatReturn(fund.returns.ytd)}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">12 meses</span>
          {formatReturn(fund.returns['12m'])}
        </div>


        <div className="border-t pt-3 mt-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Taxa de Administração</span>
            <span className="text-gray-900">{fund.adminFee.toFixed(2)}% a.a.</span>
          </div>
          {fund.performanceFee && (
            <div className="flex justify-between items-center text-sm mt-1">
              <span className="text-gray-600">Taxa Performance</span>
              <span className="text-gray-900">{fund.performanceFee.toFixed(2)}%</span>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => onViewDetails(fund.id)}
        className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Ver Detalhes
      </button>
    </div>
  )
}