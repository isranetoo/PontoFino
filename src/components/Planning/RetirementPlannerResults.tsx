import { RetirementResult, RetirementInput, formatCurrency, getCurrencySymbol } from '../../utils/retirementCalculations'

import { AlertTriangle } from 'lucide-react'

interface RetirementPlannerResultsProps {
  result: RetirementResult
  input: RetirementInput
}

export function RetirementPlannerResults({ result, input }: RetirementPlannerResultsProps) {
  return (
    <>
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
    </>
  )
}