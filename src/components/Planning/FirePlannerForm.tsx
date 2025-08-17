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
    <div className="space-y-10">
      {/* Erros de Validação */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 shadow flex flex-col gap-2">
          <span className="font-semibold">Corrija os seguintes campos:</span>
          <ul className="list-disc pl-5">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Situação Atual */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 border border-blue-100 shadow">
        <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
          Situação Atual
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Gastos Mensais Atuais</label>
            <div className="relative">
              <DollarSign className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="number"
                step="100"
                min="0"
                value={formData.monthlyExpenses}
                onChange={(e) => handleNumberChange('monthlyExpenses', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg shadow-sm"
                placeholder="5.000"
              />
            </div>
          </div>
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Patrimônio Atual</label>
            <div className="relative">
              <Wallet className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="number"
                step="1000"
                min="0"
                value={formData.currentWealth}
                onChange={(e) => handleNumberChange('currentWealth', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg shadow-sm"
                placeholder="50.000"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Plano de Investimento */}
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow flex flex-col gap-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
          Plano de Investimento
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Aporte Mensal</label>
            <div className="relative">
              <PiggyBank className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="number"
                step="100"
                min="0"
                value={formData.monthlyContribution}
                onChange={(e) => handleNumberChange('monthlyContribution', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg shadow-sm"
                placeholder="2.000"
              />
            </div>
          </div>
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Imposto sobre Ganhos (%)</label>
            <div className="relative">
              <Percent className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={(formData.taxRate ?? 0) * 100}
                onChange={(e) => handlePercentageChange('taxRate', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg shadow-sm"
                placeholder="15"
              />
              <span className="absolute right-3 top-3 text-gray-400">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Premissas de Mercado */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 border border-blue-100 shadow flex flex-col gap-6">
        <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-sky-500 mr-2"></span>
          Premissas de Mercado
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Inflação Esperada (% a.a.)</label>
            <div className="relative">
              <TrendingDown className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.expInflationAA * 100}
                onChange={(e) => handlePercentageChange('expInflationAA', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg shadow-sm"
                placeholder="4.0"
              />
              <span className="absolute right-3 top-3 text-gray-400">%</span>
            </div>
          </div>
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Retorno Real Esperado (% a.a.)</label>
            <div className="relative">
              <TrendingUp className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.expReturnRealAA * 100}
                onChange={(e) => handlePercentageChange('expReturnRealAA', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg shadow-sm"
                placeholder="6.0"
              />
              <span className="absolute right-3 top-3 text-gray-400">%</span>
            </div>
          </div>
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">Prazo Máximo (meses)</label>
            <div className="relative">
              <input
                type="number"
                step="12"
                min="12"
                max="1200"
                value={formData.maxMonths}
                onChange={(e) => handleNumberChange('maxMonths', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg shadow-sm"
                placeholder="360"
              />
              <span className="absolute right-3 top-3 text-gray-400">meses</span>
            </div>
          </div>
        </div>
      </div>

      {/* Estratégia FIRE */}
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow flex flex-col gap-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-orange-500 mr-2"></span>
          Estratégia FIRE
        </h3>
        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">Taxa de Retirada Segura (% a.a.)</label>
          <div className="relative">
            <Target className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            <input
              type="number"
              step="0.1"
              min="0"
              max="20"
              value={formData.swrAA * 100}
              onChange={(e) => handlePercentageChange('swrAA', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg shadow-sm"
              placeholder="4.0"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">Recomendado: 3,5% - 4,0% para maior segurança</p>
        </div>
      </div>

      {/* Cenários Pré-definidos */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 border border-blue-100 shadow">
        <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
          Cenários Pré-definidos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => {
              onChange('expReturnRealAA', 0.05)
              onChange('expInflationAA', 0.04)
              onChange('swrAA', 0.04)
              onChange('taxRate', 0.15)
            }}
            className="p-4 border border-gray-200 rounded-xl bg-white hover:bg-blue-50 transition-colors shadow text-left font-semibold text-blue-900"
          >
            Conservador<br /><span className="text-xs font-normal text-gray-500">Inflação alta, retorno baixo</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onChange('expReturnRealAA', 0.07)
              onChange('expInflationAA', 0.04)
              onChange('swrAA', 0.04)
              onChange('taxRate', 0.15)
            }}
            className="p-4 border border-gray-200 rounded-xl bg-white hover:bg-blue-50 transition-colors shadow text-left font-semibold text-blue-900"
          >
            Moderado<br /><span className="text-xs font-normal text-gray-500">Inflação e retorno médios</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onChange('expReturnRealAA', 0.09)
              onChange('expInflationAA', 0.04)
              onChange('swrAA', 0.035)
              onChange('taxRate', 0.15)
            }}
            className="p-4 border border-gray-200 rounded-xl bg-white hover:bg-blue-50 transition-colors shadow text-left font-semibold text-blue-900"
          >
            Agressivo<br /><span className="text-xs font-normal text-gray-500">Inflação baixa, retorno alto</span>
          </button>
        </div>
      </div>
    </div>
  )
}