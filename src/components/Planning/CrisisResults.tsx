import React from 'react'
import { SimulationResult, formatCurrency } from '../../utils/crisisSimulation'
import { TrendingDown, TrendingUp, Target, DollarSign, AlertTriangle } from 'lucide-react'

interface CrisisResultsProps {
  result: SimulationResult
}

export function CrisisResults({ result }: CrisisResultsProps) {
  const getImpactColor = (change: number) => {
    if (change >= 0) return 'text-green-600'
    if (change >= -0.1) return 'text-yellow-600'
    if (change >= -0.2) return 'text-orange-600'
    return 'text-red-600'
  }

  const getImpactIcon = (change: number) => {
    if (change >= 0) return <TrendingUp className="w-5 h-5 text-green-600" />
    return <TrendingDown className="w-5 h-5 text-red-600" />
  }

  return (
    <div className="space-y-10">
      {/* Main Impact Summary */}
      <div className={`text-center p-8 rounded-2xl shadow bg-gradient-to-br ${result.drop < 0 ? 'from-red-50 to-orange-50 border border-red-200' : 'from-green-50 to-blue-50 border border-green-200'}`}>
        {result.drop < 0 ? (
          <>
            <TrendingDown className="w-14 h-14 text-red-600 mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-red-900 mb-2 tracking-tight">Perda Estimada</h3>
            <div className="text-5xl font-extrabold text-red-700 mb-2">{formatCurrency(Math.abs(result.drop * result.valueBefore))}</div>
            <p className="text-red-800 text-lg">Perda de {Math.abs(result.drop * 100).toFixed(1)}% na carteira</p>
          </>
        ) : (
          <>
            <TrendingUp className="w-14 h-14 text-green-600 mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-green-900 mb-2 tracking-tight">Ganho Estimado</h3>
            <div className="text-5xl font-extrabold text-green-700 mb-2">{formatCurrency(Math.abs(result.drop * result.valueBefore))}</div>
            <p className="text-green-800 text-lg">Ganho de {Math.abs(result.drop * 100).toFixed(1)}% na carteira</p>
          </>
        )}
      </div>

      {/* Before/After Values */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-6 h-6 text-blue-600" />
            <span className="font-semibold text-gray-900">Valor Atual</span>
          </div>
          <div className="text-3xl font-bold text-blue-600">{formatCurrency(result.valueBefore)}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-6 h-6 text-red-600" />
            <span className="font-semibold text-gray-900">Valor Após Crise</span>
          </div>
          <div className="text-3xl font-bold text-red-600">{formatCurrency(result.valueAfter)}</div>
        </div>
      </div>

      {/* Impact by Asset Class */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-4 text-lg flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
          Impacto por Classe de Ativo
        </h4>
        <div className="space-y-3">
          {result.byClass.map((classResult, index) => (
            <div key={index} className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2">
                {getImpactIcon(classResult.change)}
                <span className="font-medium text-gray-800">{classResult.class}</span>
              </div>
              <span className={`text-lg font-bold ${getImpactColor(classResult.change)}`}>{(classResult.change * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Losers */}
      {result.topLosers.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-4 text-lg flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2"></span>
            Maiores Perdas Individuais
          </h4>
          <div className="space-y-2">
            {result.topLosers.map((position, index) => (
              <div key={index} className="flex items-center justify-between bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <span className="font-medium text-gray-800">{position.asset.ticker} - {position.asset.name}</span>
                <span className="text-red-600 font-bold">{(position.relChange * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sensitivity Breakdown */}
      {result.sensitivities.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-4 text-lg flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
            Análise de Sensibilidade
          </h4>
          <div className="space-y-2">
            {result.sensitivities.map((sensitivity, index) => (
              <div key={index} className={`flex items-center justify-between rounded-xl p-4 border shadow-sm ${sensitivity.impact >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                <span className="font-medium text-gray-800">{sensitivity.factor}</span>
                <span className={sensitivity.impact >= 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{(sensitivity.impact * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Assessment */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 mt-2 flex items-start gap-3 shadow">
        <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1" />
        <div className="text-sm text-yellow-700">
          {Math.abs(result.drop) < 0.1 && (
            <span>O impacto da crise simulada é relativamente baixo. Sua carteira está bem diversificada para este cenário.</span>
          )}
          {Math.abs(result.drop) >= 0.1 && Math.abs(result.drop) < 0.2 && (
            <span>O impacto é moderado. Considere revisar a exposição a ativos mais voláteis.</span>
          )}
          {Math.abs(result.drop) >= 0.2 && Math.abs(result.drop) < 0.4 && (
            <span>O impacto é significativo. Avalie estratégias de proteção e diversificação.</span>
          )}
          {Math.abs(result.drop) >= 0.4 && (
            <span>O impacto é severo. Sua carteira está muito exposta a riscos sistêmicos. Reavalie urgentemente sua alocação.</span>
          )}
        </div>
      </div>
    </div>
  )
}
