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
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all group animate-fade-in">
      <div className="flex items-start justify-between mb-4 gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-gray-900 text-xl mb-1 tracking-tight truncate">{fund.ticker}</h3>
          <p className="text-gray-500 text-base font-medium line-clamp-2 mb-2">{fund.name}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded font-semibold uppercase tracking-wide">
              {fund.category}
            </span>
            <span className={`text-xs px-2 py-1 rounded font-semibold uppercase tracking-wide ${getRiskColor(fund.riskLevel)}`}>
              Risco {getRiskLabel(fund.riskLevel)}
            </span>
          </div>
        </div>
        <button
          onClick={() => onToggleWatchlist(fund.id)}
          className="p-2 rounded-full border border-gray-200 bg-white shadow-sm hover:bg-yellow-50 hover:border-yellow-300 transition-all"
          title={fund.isWatchlisted ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          {fund.isWatchlisted ? (
            <Star className="w-6 h-6 text-yellow-500 fill-current" />
          ) : (
            <StarOff className="w-6 h-6 text-gray-400" />
          )}
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 font-semibold">Rentabilidade Recente</span>
          <div className="flex items-center gap-1">
            {fund.returns.recent >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600" />
            )}
            {formatReturn(fund.returns.recent)}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 font-semibold">YTD</span>
          {formatReturn(fund.returns.ytd)}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 font-semibold">12 meses</span>
          {formatReturn(fund.returns['12m'])}
        </div>

        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-semibold">Taxa de Administração</span>
            <span className="text-gray-900 font-bold">{fund.adminFee.toFixed(2)}% a.a.</span>
          </div>
          {fund.performanceFee && (
            <div className="flex justify-between items-center text-sm mt-1">
              <span className="text-gray-500 font-semibold">Taxa Performance</span>
              <span className="text-gray-900 font-bold">{fund.performanceFee.toFixed(2)}%</span>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => onViewDetails(fund.id)}
        className="w-full mt-6 bg-blue-700 text-white py-2.5 rounded-xl font-bold shadow-sm hover:bg-blue-800 transition-all text-lg tracking-tight"
      >
        Ver Detalhes
      </button>
    </div>
  )
}