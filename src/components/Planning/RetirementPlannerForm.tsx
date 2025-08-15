import React from 'react'
import { RetirementInput, RetirementIncome, RetirementPortfolio } from '../../utils/retirementCalculations'
import { 
  User, 
  Calendar, 
  Globe, 
  DollarSign, 
  Percent,
  Plus,
  Trash2,
  Building,
  PiggyBank
} from 'lucide-react'

interface RetirementPlannerFormProps {
  formData: RetirementInput
  onChange: (field: keyof RetirementInput, value: any) => void
  onIncomeChange: (index: number, income: RetirementIncome) => void
  onPortfolioChange: (index: number, portfolio: RetirementPortfolio) => void
  errors: string[]
}

const COUNTRIES = [
  { code: 'PT', name: 'Portugal', currency: 'EUR' },
  { code: 'ES', name: 'Espanha', currency: 'EUR' },
  { code: 'US', name: 'Estados Unidos', currency: 'USD' },
  { code: 'CA', name: 'Canadá', currency: 'CAD' },
  { code: 'AU', name: 'Austrália', currency: 'AUD' },
  { code: 'NZ', name: 'Nova Zelândia', currency: 'NZD' },
  { code: 'CH', name: 'Suíça', currency: 'CHF' },
  { code: 'BR', name: 'Brasil', currency: 'BRL' }
]

const CURRENCIES = ['BRL', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'CHF']

const INCOME_TYPES = [
  { value: 'pension', label: 'Previdência Privada' },
  { value: 'social_security', label: 'INSS/Seguridade Social' },
  { value: 'rental', label: 'Renda de Aluguel' },
  { value: 'business', label: 'Negócio/Empresa' },
  { value: 'other', label: 'Outros' }
]

const ASSET_CLASSES = [
  { value: 'equity', label: 'Ações' },
  { value: 'bonds', label: 'Títulos/Bonds' },
  { value: 'real_estate', label: 'Imóveis/REITs' },
  { value: 'cash', label: 'Caixa/CDB' },
  { value: 'alternatives', label: 'Alternativos' }
]

export function RetirementPlannerForm({ 
  formData, 
  onChange, 
  onIncomeChange, 
  onPortfolioChange, 
  errors 
}: RetirementPlannerFormProps) {

  const handleCountryChange = (country: string) => {
    const countryData = COUNTRIES.find(c => c.name === country)
    onChange('targetCountry', country)
    if (countryData) {
      onChange('spendCurrency', countryData.currency)
    }
  }

  const addIncome = () => {
    const newIncome: RetirementIncome = {
      name: 'Nova Renda',
      currency: formData.baseCurrency,
      monthlyAmount: 1000,
      startAge: formData.retirementAge,
      inflationRate: 0.04,
      type: 'other'
    }
    onChange('incomes', [...formData.incomes, newIncome])
  }

  const removeIncome = (index: number) => {
    const newIncomes = formData.incomes.filter((_, i) => i !== index)
    onChange('incomes', newIncomes)
  }

  const addPortfolio = () => {
    const newPortfolio: RetirementPortfolio = {
      currency: formData.baseCurrency,
      amount: 50000,
      expectedRealReturn: 0.06,
      assetClass: 'equity'
    }
    onChange('portfolio', [...formData.portfolio, newPortfolio])
  }

  const removePortfolio = (index: number) => {
    const newPortfolio = formData.portfolio.filter((_, i) => i !== index)
    onChange('portfolio', newPortfolio)
  }

  return (
    <div className="space-y-8">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Idade Atual
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="number"
                min="18"
                max="100"
                value={formData.currentAge}
                onChange={(e) => onChange('currentAge', parseInt(e.target.value) || 0)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Idade de Aposentadoria
            </label>
            <div className="relative">
              <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="number"
                min="50"
                max="100"
                value={formData.retirementAge}
                onChange={(e) => onChange('retirementAge', parseInt(e.target.value) || 0)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expectativa de Vida
            </label>
            <div className="relative">
              <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="number"
                min="60"
                max="120"
                value={formData.lifeExpectancy}
                onChange={(e) => onChange('lifeExpectancy', parseInt(e.target.value) || 0)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              País de Destino
            </label>
            <div className="relative">
              <Globe className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <select
                value={formData.targetCountry || ''}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="">Selecione um país</option>
                {COUNTRIES.map(country => (
                  <option key={country.code} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Currencies and Expenses */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Moedas e Gastos</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moeda Base (Investimentos)
            </label>
            <select
              value={formData.baseCurrency}
              onChange={(e) => onChange('baseCurrency', e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {CURRENCIES.map(currency => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moeda de Consumo
            </label>
            <select
              value={formData.spendCurrency}
              onChange={(e) => onChange('spendCurrency', e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {CURRENCIES.map(currency => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gastos Mensais ({formData.spendCurrency})
            </label>
            <div className="relative">
              <DollarSign className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="number"
                step="100"
                min="0"
                value={formData.monthlyExpenses}
                onChange={(e) => onChange('monthlyExpenses', parseFloat(e.target.value) || 0)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inflação dos Gastos (% a.a.)
            </label>
            <div className="relative">
              <Percent className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="number"
                step="0.1"
                min="0"
                max="50"
                value={formData.expenseInflationRate * 100}
                onChange={(e) => onChange('expenseInflationRate', (parseFloat(e.target.value) || 0) / 100)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Taxa de Retirada Segura (% a.a.)
          </label>
          <div className="relative max-w-xs">
            <Percent className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            <input
              type="number"
              step="0.1"
              min="0"
              max="20"
              value={formData.safeWithdrawalRate * 100}
              onChange={(e) => onChange('safeWithdrawalRate', (parseFloat(e.target.value) || 0) / 100)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Recomendado: 3,5% - 4,0% para maior segurança
          </p>
        </div>
      </div>

      {/* Income Sources */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Fontes de Renda</h3>
          <button
            type="button"
            onClick={addIncome}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Renda</span>
          </button>
        </div>

        <div className="space-y-4">
          {formData.incomes.map((income, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Renda {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeIncome(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={income.name}
                    onChange={(e) => onIncomeChange(index, { ...income, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo
                  </label>
                  <select
                    value={income.type}
                    onChange={(e) => onIncomeChange(index, { ...income, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {INCOME_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Moeda
                  </label>
                  <select
                    value={income.currency}
                    onChange={(e) => onIncomeChange(index, { ...income, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {CURRENCIES.map(currency => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor Mensal
                  </label>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    value={income.monthlyAmount}
                    onChange={(e) => onIncomeChange(index, { ...income, monthlyAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Idade de Início
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={income.startAge}
                    onChange={(e) => onIncomeChange(index, { ...income, startAge: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inflação (% a.a.)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="50"
                    value={income.inflationRate * 100}
                    onChange={(e) => onIncomeChange(index, { ...income, inflationRate: (parseFloat(e.target.value) || 0) / 100 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Portfolio */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Carteira de Investimentos</h3>
          <button
            type="button"
            onClick={addPortfolio}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Ativo</span>
          </button>
        </div>

        <div className="space-y-4">
          {formData.portfolio.map((portfolio, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Ativo {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removePortfolio(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Classe de Ativo
                  </label>
                  <select
                    value={portfolio.assetClass}
                    onChange={(e) => onPortfolioChange(index, { ...portfolio, assetClass: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {ASSET_CLASSES.map(asset => (
                      <option key={asset.value} value={asset.value}>{asset.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Moeda
                  </label>
                  <select
                    value={portfolio.currency}
                    onChange={(e) => onPortfolioChange(index, { ...portfolio, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {CURRENCIES.map(currency => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor Atual
                  </label>
                  <div className="relative">
                    <PiggyBank className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="number"
                      step="1000"
                      min="0"
                      value={portfolio.amount}
                      onChange={(e) => onPortfolioChange(index, { ...portfolio, amount: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Retorno Real (% a.a.)
                  </label>
                  <div className="relative">
                    <Percent className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="50"
                      value={portfolio.expectedRealReturn * 100}
                      onChange={(e) => onPortfolioChange(index, { ...portfolio, expectedRealReturn: (parseFloat(e.target.value) || 0) / 100 })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preset Scenarios */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Cenários Pré-definidos</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              onChange('targetCountry', 'Portugal')
              onChange('spendCurrency', 'EUR')
              onChange('monthlyExpenses', 2500)
              onChange('expenseInflationRate', 0.03)
              onChange('safeWithdrawalRate', 0.04)
            }}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <div className="font-medium text-gray-900">Portugal Conservador</div>
            <div className="text-sm text-gray-600">€2.500/mês, 3% inflação, 4% SWR</div>
          </button>
          
          <button
            type="button"
            onClick={() => {
              onChange('targetCountry', 'Estados Unidos')
              onChange('spendCurrency', 'USD')
              onChange('monthlyExpenses', 4000)
              onChange('expenseInflationRate', 0.035)
              onChange('safeWithdrawalRate', 0.04)
            }}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <div className="font-medium text-gray-900">EUA Moderado</div>
            <div className="text-sm text-gray-600">$4.000/mês, 3,5% inflação, 4% SWR</div>
          </button>
        </div>
      </div>
    </div>
  )
}