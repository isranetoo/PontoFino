import React from 'react'
import { RetirementResult, RetirementInput, formatCurrency, formatPercentage, getCurrencySymbol } from '../../utils/retirementCalculations'
import { 
  Target, 
  Calendar, 
  TrendingUp, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Globe,
  Plane
} from 'lucide-react'

interface RetirementPlannerResultsProps {
  result: RetirementResult
  input: RetirementInput
}

export function RetirementPlannerResults({ result, input }: RetirementPlannerResultsProps) {
  const retirementYear = new Date().getFullYear() + result.yearsToRetirement
  
  const getRiskColor = (risk: number) => {
    if (risk <= 0.1) return 'text-green-600'
    if (risk <= 0.3) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRiskIcon = (risk: number) => {
    if (risk <= 0.1) return <CheckCircle className="w-5 h-5 text-green-600" />
    if (risk <= 0.3) return <AlertTriangle className="w-5 h-5 text-yellow-600" />
    return <AlertTriangle className="w-5 h-5 text-red-600" />
  }

  const getRiskLabel = (risk: number) => {
    if (risk <= 0.1) return 'Baixo Risco'
    if (risk <= 0.3) return 'Risco Moderado'
    return 'Alto Risco'
  }

  return (
    <div className="space-y-6">
      {/* Main Result */}
      <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
        {result.successProbability >= 0.8 ? (
          <>
            <Plane className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-blue-900 mb-2">
              Aposentadoria Viável!
            </h3>
            <div className="text-4xl font-bold text-blue-700 mb-2">
              {result.yearsToRetirement} anos
            </div>
            <p className="text-blue-800">
              Você poderá se aposentar em <strong>{retirementYear}</strong> em {input.targetCountry}
            </p>
          </>
        ) : (
          <>
            <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-yellow-900 mb-2">
              Plano Precisa de Ajustes
            </h3>
            <p className="text-yellow-800">
              Com os parâmetros atuais, há risco de não conseguir manter o padrão de vida desejado.
              Considere aumentar os investimentos ou ajustar as expectativas.
            </p>
          </>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900">Patrimônio Necessário</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(result.requiredWealthBase, input.baseCurrency)}
          </div>
          <p className="text-sm text-gray-600">Em {input.baseCurrency} (moeda base)</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Globe className="w-5 h-5 text-green-600" />
            <span className="font-medium text-gray-900">Patrimônio em {input.spendCurrency}</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(result.requiredWealthSpend, input.spendCurrency)}
          </div>
          <p className="text-sm text-gray-600">Na moeda de consumo</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-gray-900">Anos até Aposentadoria</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {result.yearsToRetirement}
          </div>
          <p className="text-sm text-gray-600">Aposentadoria aos {input.retirementAge} anos</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            {getRiskIcon(result.ruinRisk)}
            <span className="font-medium text-gray-900">Risco de Ruína</span>
          </div>
          <div className={`text-2xl font-bold ${getRiskColor(result.ruinRisk)}`}>
            {formatPercentage(result.ruinRisk)}
          </div>
          <p className="text-sm text-gray-600">{getRiskLabel(result.ruinRisk)}</p>
        </div>
      </div>

      {/* Portfolio Gap Analysis */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-4">Análise da Carteira</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Patrimônio Atual:</span>
            <div className="font-medium text-gray-900">
              {formatCurrency(
                input.portfolio.reduce((sum, p) => sum + p.amount, 0), 
                input.baseCurrency
              )}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Gap a Cobrir:</span>
            <div className={`font-medium ${result.summary.portfolioGapBase > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(result.summary.portfolioGapBase, input.baseCurrency)}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Retirada Mensal:</span>
            <div className="font-medium text-gray-900">
              {formatCurrency(result.summary.monthlyWithdrawalNeeded, input.baseCurrency)}
            </div>
          </div>
        </div>
      </div>

      {/* Income vs Expenses Breakdown */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Projeção de Renda vs Gastos</h4>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded-lg">
            <div>
              <div className="font-medium text-red-900">Gastos Mensais na Aposentadoria</div>
              <div className="text-sm text-red-700">
                Em {input.spendCurrency}, ajustado pela inflação
              </div>
            </div>
            <div className="text-xl font-bold text-red-600">
              {getCurrencySymbol(input.spendCurrency)} {(
                input.monthlyExpenses * 
                Math.pow(1 + input.expenseInflationRate, result.yearsToRetirement)
              ).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </div>
          </div>

          {input.incomes.map((income, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <div className="font-medium text-green-900">{income.name}</div>
                <div className="text-sm text-green-700">
                  A partir dos {income.startAge} anos em {income.currency}
                </div>
              </div>
              <div className="text-lg font-bold text-green-600">
                {getCurrencySymbol(income.currency)} {income.monthlyAmount.toLocaleString('pt-BR')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Critical Ages */}
      {(result.summary.criticalAges.portfolioDepletion || result.summary.criticalAges.highRisk) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">Idades Críticas</span>
          </div>
          <div className="text-sm text-yellow-700 space-y-1">
            {result.summary.criticalAges.highRisk && (
              <p>⚠️ <strong>Risco elevado aos {result.summary.criticalAges.highRisk} anos</strong> - Patrimônio abaixo de 25% do necessário</p>
            )}
            {result.summary.criticalAges.portfolioDepletion && (
              <p>🔴 <strong>Esgotamento aos {result.summary.criticalAges.portfolioDepletion} anos</strong> - Patrimônio zerado</p>
            )}
          </div>
        </div>
      )}

      {/* Action Items */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-3">💡 Recomendações</h4>
        <ul className="text-sm text-blue-800 space-y-2">
          {result.summary.portfolioGapBase > 0 && (
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>
                Considere aumentar os investimentos mensais em {formatCurrency(result.summary.portfolioGapBase / (result.yearsToRetirement * 12), input.baseCurrency)} 
                para cobrir o gap
              </span>
            </li>
          )}
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Diversifique entre moedas para reduzir risco cambial</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Considere fontes de renda passiva no país de destino</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Revise o plano anualmente e ajuste conforme mudanças no câmbio</span>
          </li>
        </ul>
      </div>
    </div>
  )
}