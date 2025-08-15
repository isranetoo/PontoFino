import React from 'react'
import { FireResult, formatCurrency, formatTimeHorizon, formatPercentage } from '../../utils/fireCalculations'
import { 
  Target, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface FirePlannerResultsProps {
  result: FireResult
}

export function FirePlannerResults({ result }: FirePlannerResultsProps) {
  const currentYear = new Date().getFullYear()
  const fireYear = currentYear + Math.floor(result.horizonMonths / 12)
  
  // Calculate monthly withdrawal amount at FIRE
  const monthlyWithdrawal = result.targetWealthReal / 12 * 0.04 // Assuming 4% SWR

  return (
    <div className="space-y-6">
      {/* Main Result */}
      <div className="text-center p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-200">
        {result.isAchievable ? (
          <>
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-900 mb-2">
              Independência Financeira em
            </h3>
            <div className="text-4xl font-bold text-green-700 mb-2">
              {formatTimeHorizon(result.horizonMonths)}
            </div>
            <p className="text-green-800">
              Você atingirá a independência financeira em <strong>{fireYear}</strong>
            </p>
          </>
        ) : (
          <>
            <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-yellow-900 mb-2">
              Meta não atingível
            </h3>
            <p className="text-yellow-800">
              Com os parâmetros atuais, a meta não é atingível em 100 anos.
              Considere aumentar a contribuição ou ajustar as expectativas.
            </p>
          </>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900">Meta de Patrimônio</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(result.targetWealthReal)}
          </div>
          <p className="text-sm text-gray-600">Em poder de compra atual</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="font-medium text-gray-900">Renda Mensal FIRE</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(monthlyWithdrawal)}
          </div>
          <p className="text-sm text-gray-600">Retirada mensal segura</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-gray-900">Tempo para Meta</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {result.horizonYears} anos
          </div>
          <p className="text-sm text-gray-600">{result.horizonMonths} meses total</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <span className="font-medium text-gray-900">Patrimônio Final</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {formatCurrency(result.targetWealthNominal)}
          </div>
          <p className="text-sm text-gray-600">Valor nominal em {fireYear}</p>
        </div>
      </div>

      {/* Strategy Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">📋 Resumo da Estratégia</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Taxa de Retirada:</span>
            <span className="font-medium text-gray-900 ml-2">4,0% ao ano</span>
          </div>
          <div>
            <span className="text-gray-600">Retorno Real:</span>
            <span className="font-medium text-gray-900 ml-2">{formatPercentage(result.monthlyRealReturn * 12)} ao ano</span>
          </div>
          <div>
            <span className="text-gray-600">Múltiplo de Gastos:</span>
            <span className="font-medium text-gray-900 ml-2">25x gastos anuais</span>
          </div>
          <div>
            <span className="text-gray-600">Margem de Segurança:</span>
            <span className="font-medium text-gray-900 ml-2">Conservadora</span>
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-3">🎯 Próximos Passos</h4>
        <ul className="text-sm text-blue-800 space-y-2">
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Mantenha a disciplina de investir mensalmente</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Revise o plano anualmente e ajuste conforme necessário</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Considere aumentar a contribuição quando possível</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Diversifique seus investimentos para reduzir riscos</span>
          </li>
        </ul>
      </div>
    </div>
  )
}