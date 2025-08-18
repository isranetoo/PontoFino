import React from 'react'
import { FireInput, formatPercentage } from '../../utils/fireCalculations'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Percent,
  PiggyBank,
  Wallet
} from 'lucide-react'

interface FirePlannerFormProps {
  formData: FireInput
  onChange: (field: keyof FireInput, value: number | string) => void
  errors: string[]
}

export function FirePlannerForm({ formData, onChange, errors }: FirePlannerFormProps) {
  const handleNumberChange = (field: keyof FireInput, value: string) => {
    const numValue = parseFloat(value) || 0
    onChange(field, numValue)
  }

  const handlePercentageChange = (field: keyof FireInput, value: string) => {
    const numValue = (parseFloat(value) || 0) / 100
    onChange(field, numValue)
  }

  return (
    <div className="space-y-6">
      {/* Current Financial Situation */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Situação Atual</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gastos Mensais Atuais
            </label>
            <div className="relative">
              <DollarSign className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="number"
                step="100"
                min="0"
                value={formData.monthlyExpenses}
                onChange={(e) => handleNumberChange('monthlyExpenses', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="5.000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Patrimônio Atual
            </label>
            <div className="relative">
              <Wallet className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="number"
                step="1000"
                min="0"
                value={formData.currentWealth}
                onChange={(e) => handleNumberChange('currentWealth', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="50.000"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Investment Plan */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Plano de Investimento</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contribuição Mensal
            </label>
            <div className="relative">
              <PiggyBank className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="number"
                step="100"
                min="0"
                value={formData.monthlyContribution}
                onChange={(e) => handleNumberChange('monthlyContribution', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="2.000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Taxa de Imposto (%)
            </label>
            <div className="relative">
              <Percent className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="number"
                step="0.1"
                min="0"
                max="50"
                value={(formData.taxRate || 0) * 100}
                onChange={(e) => handlePercentageChange('taxRate', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="15"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Market Assumptions */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Premissas de Mercado</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inflação Esperada (% a.a.)
            </label>
            <div className="relative">
              <TrendingDown className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="number"
                step="0.1"
                min="0"
                max="50"
                value={formData.expInflationAA * 100}
                onChange={(e) => handlePercentageChange('expInflationAA', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="4.0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Retorno Real Esperado (% a.a.)
            </label>
            <div className="relative">
              <TrendingUp className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="number"
                step="0.1"
                min="0"
                max="50"
                value={formData.expReturnRealAA * 100}
                onChange={(e) => handlePercentageChange('expReturnRealAA', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="6.0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* FIRE Strategy */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Estratégia FIRE</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Taxa de Retirada Segura (% a.a.)
          </label>
          <div className="relative">
            <Target className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            <input
              type="number"
              step="0.1"
              min="0"
              max="20"
              value={formData.swrAA * 100}
              onChange={(e) => handlePercentageChange('swrAA', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="4.0"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Recomendado: 3,5% - 4,0% para maior segurança
          </p>
        </div>
      </div>

      {/* Quick Presets */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Cenários Pré-definidos</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => {
              onChange('expReturnRealAA', 0.05)
              onChange('expInflationAA', 0.04)
              onChange('swrAA', 0.04)
              onChange('taxRate', 0.15)
            }}
            className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <div className="font-medium text-gray-900">Conservador</div>
            <div className="text-sm text-gray-600">5% real, 4% SWR</div>
          </button>
          
          <button
            type="button"
            onClick={() => {
              onChange('expReturnRealAA', 0.07)
              onChange('expInflationAA', 0.04)
              onChange('swrAA', 0.04)
              onChange('taxRate', 0.15)
            }}
            className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <div className="font-medium text-gray-900">Moderado</div>
            <div className="text-sm text-gray-600">7% real, 4% SWR</div>
          </button>
          
          <button
            type="button"
            onClick={() => {
              onChange('expReturnRealAA', 0.09)
              onChange('expInflationAA', 0.04)
              onChange('swrAA', 0.035)
              onChange('taxRate', 0.15)
            }}
            className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <div className="font-medium text-gray-900">Agressivo</div>
            <div className="text-sm text-gray-600">9% real, 3,5% SWR</div>
          </button>
        </div>
      </div>
    </div>
  )
}