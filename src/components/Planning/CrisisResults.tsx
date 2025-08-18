import React from 'react'
import { SimulationResult, formatCurrency, formatPercentage } from '../../utils/crisisSimulation'
import { 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  DollarSign,
  TrendingUp
} from 'lucide-react'

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
    <div className="space-y-6">
      {/* Main Impact Summary */}
      <div className="text-center p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200">
        {result.drop < 0 ? (
          <>
            <TrendingDown className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-red-900 mb-2">
              Perda Estimada
            </h3>
            <div className="text-4xl font-bold text-red-700 mb-2">
              {formatPercentage(result.drop)}
            </div>
            <p className="text-red-800">
              Perda de {formatCurrency(result.totalLoss)} na carteira
            </p>
          </>
        ) : (
          <>
            <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-900 mb-2">
              Ganho Estimado
            </h3>
            <div className="text-4xl font-bold text-green-700 mb-2">
              {formatPercentage(result.drop)}
            </div>
            <p className="text-green-800">
              Ganho de {formatCurrency(-result.totalLoss)} na carteira
            </p>
          </>
        )}
      </div>

      {/* Before/After Values */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900">Valor Atual</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(result.valueBefore)}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="w-5 h-5 text-red-600" />
            <span className="font-medium text-gray-900">Valor Após Crise</span>
          </div>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(result.valueAfter)}
          </div>
        </div>
      </div>

      {/* Impact by Asset Class */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Impacto por Classe de Ativo</h4>
        <div className="space-y-3">
          {result.byClass.map((classResult, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {getImpactIcon(classResult.relChange)}
                  <span className="font-medium text-gray-900">{classResult.class}</span>
                </div>
                <span className="text-sm text-gray-600">
                  {formatCurrency(classResult.valueBefore)} → {formatCurrency(classResult.valueAfter)}
                </span>
              </div>
              <div className={`font-semibold ${getImpactColor(classResult.relChange)}`}>
                {formatPercentage(classResult.relChange)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Losers */}
      {result.topLosers.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Maiores Perdas Individuais</h4>
          <div className="space-y-2">
            {result.topLosers.map((position, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{position.asset.ticker}</div>
                  <div className="text-sm text-gray-600">{position.asset.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-red-600">
                    -{formatCurrency(position.absoluteLoss)}
                  </div>
                  <div className="text-sm text-red-500">
                    {formatPercentage(position.relChange)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sensitivity Breakdown */}
      {result.sensitivities.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Análise de Sensibilidade</h4>
          <div className="space-y-2">
            {result.sensitivities.map((sensitivity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{sensitivity.factor}</div>
                  <div className="text-sm text-gray-600">{sensitivity.description}</div>
                </div>
                <div className={`font-semibold ${
                  sensitivity.impact >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {sensitivity.impact >= 0 ? '+' : ''}{formatCurrency(sensitivity.impact)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Assessment */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <span className="font-medium text-yellow-800">Avaliação de Risco</span>
        </div>
        <div className="text-sm text-yellow-700">
          {Math.abs(result.drop) < 0.1 && (
            <p>✅ Carteira demonstra boa resistência ao cenário de crise simulado.</p>
          )}
          {Math.abs(result.drop) >= 0.1 && Math.abs(result.drop) < 0.2 && (
            <p>⚠️ Impacto moderado. Considere diversificar mais a carteira.</p>
          )}
          {Math.abs(result.drop) >= 0.2 && Math.abs(result.drop) < 0.4 && (
            <p>🔶 Impacto significativo. Revise a alocação de ativos de maior risco.</p>
          )}
          {Math.abs(result.drop) >= 0.4 && (
            <p>🔴 Impacto severo. Carteira muito exposta a riscos de mercado.</p>
          )}
        </div>
      </div>
    </div>
  )
}