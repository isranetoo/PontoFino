import React, { useState, useEffect } from 'react'
import { useSupabase } from '../../hooks/useSupabase'
import { RetirementPlannerForm } from './RetirementPlannerForm'
import { RetirementPlannerChart } from './RetirementPlannerChart'
import { RetirementPlannerResults } from './RetirementPlannerResults'
import { AICopilotWidget } from '../AI/AICopilotWidget'
import { AIInsightCard } from '../AI/AIInsightCard'
import { 
  calculateRetirementPlan, 
  validateRetirementInput, 
  FxService,
  RetirementInput, 
  RetirementResult 
} from '../../utils/retirementCalculations'
import { 
  Plane, 
  Globe, 
  Calculator, 
  Save, 
  AlertCircle,
  TrendingUp
} from 'lucide-react'

export function RetirementPlanner() {
  const { 
    createRetirementPlan,
    updateRetirementPlan,
    getRetirementPlans,
    getFxRates,
    loading, 
    error 
  } = useSupabase()

  // Form state
  const [formData, setFormData] = useState<RetirementInput>({
    baseCurrency: 'BRL',
    spendCurrency: 'EUR',
    targetCountry: 'Portugal',
    currentAge: 35,
    retirementAge: 60,
    lifeExpectancy: 85,
    monthlyExpenses: 3000, // EUR
    expenseInflationRate: 0.03, // 3%
    safeWithdrawalRate: 0.04, // 4%
    incomes: [
      {
        name: 'INSS',
        currency: 'BRL',
        monthlyAmount: 2500,
        startAge: 65,
        inflationRate: 0.04,
        type: 'social_security'
      }
    ],
    portfolio: [
      {
        currency: 'BRL',
        amount: 200000,
        expectedRealReturn: 0.06,
        assetClass: 'equity'
      },
      {
        currency: 'USD',
        amount: 50000,
        expectedRealReturn: 0.07,
        assetClass: 'equity'
      }
    ]
  })

  // Results state
  const [retirementResult, setRetirementResult] = useState<RetirementResult | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [calculating, setCalculating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // FX Service
  const [fxService, setFxService] = useState<FxService | null>(null)

  // Saved plans
  const [savedPlans, setSavedPlans] = useState<any[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState<string>('')

  // Load initial data
  useEffect(() => {
    loadInitialData()
  }, [])

  // Calculate retirement plan when form data changes
  useEffect(() => {
    const errors = validateRetirementInput(formData)
    setValidationErrors(errors)

    if (errors.length === 0 && fxService) {
      setCalculating(true)
      const timer = setTimeout(() => {
        try {
          const result = calculateRetirementPlan(formData, fxService)
          setRetirementResult(result)
        } catch (err) {
          console.error('Error calculating retirement plan:', err)
          setRetirementResult(null)
        } finally {
          setCalculating(false)
        }
      }, 300)

      return () => clearTimeout(timer)
    } else {
      setRetirementResult(null)
    }
  }, [formData, fxService])

  const loadInitialData = async () => {
    try {
      // Load FX rates
      const fxRatesResult = await getFxRates()
      if (fxRatesResult.data) {
        const currentRates: Record<string, Record<string, number>> = {}
        
        fxRatesResult.data.forEach((rate: any) => {
          if (!currentRates[rate.base_currency]) {
            currentRates[rate.base_currency] = {}
          }
          currentRates[rate.base_currency][rate.quote_currency] = rate.rate
        })
        
        setFxService(new FxService(currentRates))
      }

      // Load saved plans
      const plansResult = await getRetirementPlans()
      if (plansResult.data) {
        setSavedPlans(plansResult.data)
      }
    } catch (err) {
      console.error('Error loading initial data:', err)
    }
  }

  const handleFormChange = (field: keyof RetirementInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setSaveSuccess(false)
  }

  const handleIncomeChange = (index: number, income: any) => {
    const newIncomes = [...formData.incomes]
    newIncomes[index] = income
    setFormData(prev => ({ ...prev, incomes: newIncomes }))
  }

  const handlePortfolioChange = (index: number, portfolio: any) => {
    const newPortfolio = [...formData.portfolio]
    newPortfolio[index] = portfolio
    setFormData(prev => ({ ...prev, portfolio: newPortfolio }))
  }

  const handleLoadPlan = (planId: string) => {
    const plan = savedPlans.find(p => p.id === planId)
    if (plan) {
      setFormData({
        baseCurrency: plan.base_currency,
        spendCurrency: plan.spend_currency,
        targetCountry: plan.target_country,
        currentAge: plan.current_age,
        retirementAge: plan.retirement_age,
        lifeExpectancy: plan.life_expectancy,
        monthlyExpenses: Number(plan.monthly_expenses),
        expenseInflationRate: Number(plan.expense_inflation_rate),
        safeWithdrawalRate: Number(plan.safe_withdrawal_rate),
        incomes: plan.incomes || [],
        portfolio: plan.portfolio || []
      })
      setSelectedPlanId(planId)
    }
  }

  const handleSavePlan = async () => {
    if (validationErrors.length > 0) return

    setSaving(true)
    try {
      const planData = {
        name: `Aposentadoria ${formData.targetCountry} - ${new Date().toLocaleDateString('pt-BR')}`,
        base_currency: formData.baseCurrency,
        spend_currency: formData.spendCurrency,
        target_country: formData.targetCountry,
        current_age: formData.currentAge,
        retirement_age: formData.retirementAge,
        life_expectancy: formData.lifeExpectancy,
        monthly_expenses: formData.monthlyExpenses,
        expense_inflation_rate: formData.expenseInflationRate,
        safe_withdrawal_rate: formData.safeWithdrawalRate,
        incomes: formData.incomes,
        portfolio: formData.portfolio
      }

      let planResult
      if (selectedPlanId) {
        planResult = await updateRetirementPlan(selectedPlanId, planData)
      } else {
        planResult = await createRetirementPlan(planData)
      }

      if (planResult.error) {
        throw new Error(planResult.error)
      }

      setSaveSuccess(true)
      await loadInitialData()
      
      setTimeout(() => setSaveSuccess(false), 3000)

    } catch (err: any) {
      console.error('Error saving plan:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Aposentadoria Multi-Moeda</h1>
          <p className="text-gray-600">
            Planeje sua aposentadoria internacional com múltiplas moedas
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {savedPlans.length > 0 && (
            <select
              value={selectedPlanId}
              onChange={(e) => handleLoadPlan(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Novo plano</option>
              {savedPlans.map(plan => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
          )}
          
          <button
            onClick={handleSavePlan}
            disabled={saving || validationErrors.length > 0}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Salvando...' : 'Salvar Plano'}</span>
          </button>
        </div>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          Plano de aposentadoria salvo com sucesso!
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Erro: {error}
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <h3 className="font-medium text-yellow-800">Corrija os seguintes erros:</h3>
          </div>
          <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Plane className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Configuração do Plano</h2>
            </div>
            
            <RetirementPlannerForm
              formData={formData}
              onChange={handleFormChange}
              onIncomeChange={handleIncomeChange}
              onPortfolioChange={handlePortfolioChange}
              errors={validationErrors}
            />
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          {/* Results Summary */}
          {retirementResult && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Globe className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Resultados</h2>
              </div>
              
              <RetirementPlannerResults result={retirementResult} input={formData} />
              
              <div className="mt-6">
                <AIInsightCard
                  type="fire"
                  title="Otimizar Aposentadoria"
                  description="Estratégias para aposentadoria internacional"
                  data={{ formData, retirementResult }}
                  compact
                />
              </div>
            </div>
          )}

          {/* Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Projeção de Patrimônio</h2>
            </div>
            
            {calculating ? (
              <div className="flex items-center justify-center h-80">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Calculando projeção...</p>
                </div>
              </div>
            ) : retirementResult ? (
              <RetirementPlannerChart result={retirementResult} input={formData} />
            ) : (
              <div className="flex items-center justify-center h-80 text-gray-500">
                <div className="text-center">
                  <Calculator className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p>Preencha os parâmetros para ver a projeção</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Copilot Widget */}
      <AICopilotWidget 
        page="retirement" 
        contextData={{ 
          formData,
          retirementResult,
          savedPlans
        }} 
      />
    </div>
  )
}