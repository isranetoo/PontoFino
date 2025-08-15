import React, { useState, useEffect } from 'react'
import { useSupabase } from '../../hooks/useSupabase'
import { usePaywall } from '../../hooks/usePaywall'
import { FirePlannerForm } from './FirePlannerForm'
import { FirePlannerChart } from './FirePlannerChart'
import { FirePlannerResults } from './FirePlannerResults'
import { AICopilotWidget } from '../AI/AICopilotWidget'
import { AIInsightCard } from '../AI/AIInsightCard'
import { calcFirePlan, validateFireInput, FireInput, FireResult } from '../../utils/fireCalculations'
import { TrendingUp, Target, Calculator, Save, AlertCircle, Bot, Lightbulb, Zap } from 'lucide-react'

export function FirePlanner() {
  const { 
    createPlanningProfile, 
    updatePlanningProfile,
    createPlanningResult,
    getPlanningProfiles,
    loading, 
    error 
  } = useSupabase()

  // Form state
  const [formData, setFormData] = useState<FireInput>({
    baseCurrency: 'BRL',
    monthlyExpenses: 5000,
    monthlyContribution: 2000,
    currentWealth: 50000,
    expInflationAA: 0.04, // 4%
    expReturnRealAA: 0.06, // 6%
    swrAA: 0.04, // 4%
    taxRate: 0.15, // 15%
    maxMonths: 1200
  })

  // Results state
  const [fireResult, setFireResult] = useState<FireResult | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [calculating, setCalculating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Saved profiles
  const [savedProfiles, setSavedProfiles] = useState<any[]>([])
  const [selectedProfileId, setSelectedProfileId] = useState<string>('')
  const { executeWithPaywall } = usePaywall()

  // Load saved profiles on mount
  useEffect(() => {
    loadSavedProfiles()
  }, [])

  // Calculate FIRE plan when form data changes
  useEffect(() => {
    const errors = validateFireInput(formData)
    setValidationErrors(errors)

    if (errors.length === 0) {
      setCalculating(true)
      // Simulate calculation delay for better UX
      const timer = setTimeout(() => {
        try {
          const result = calcFirePlan(formData)
          setFireResult(result)
        } catch (err) {
          console.error('Error calculating FIRE plan:', err)
          setFireResult(null)
        } finally {
          setCalculating(false)
        }
      }, 300)

      return () => clearTimeout(timer)
    } else {
      setFireResult(null)
    }
  }, [formData])

  const loadSavedProfiles = async () => {
    try {
      const result = await getPlanningProfiles()
      if (result.data) {
        setSavedProfiles(result.data)
      }
    } catch (err) {
      console.error('Error loading saved profiles:', err)
    }
  }

  const handleFormChange = (field: keyof FireInput, value: number | string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setSaveSuccess(false)
  }

  const handleLoadProfile = (profileId: string) => {
    const profile = savedProfiles.find(p => p.id === profileId)
    if (profile) {
      setFormData({
        baseCurrency: profile.base_currency,
        monthlyExpenses: Number(profile.monthly_expenses),
        monthlyContribution: Number(profile.monthly_contribution),
        currentWealth: Number(profile.current_wealth),
        expInflationAA: Number(profile.exp_inflation_aa),
        expReturnRealAA: Number(profile.exp_return_real_aa),
        swrAA: Number(profile.safe_withdrawal_rate),
        taxRate: Number(profile.tax_rate),
        maxMonths: 1200
      })
      setSelectedProfileId(profileId)
    }
  }

  const handleSaveProfile = async () => {
    if (validationErrors.length > 0) return

    setSaving(true)
    try {
      const profileData = {
        name: `Plano FIRE - ${new Date().toLocaleDateString('pt-BR')}`,
        base_currency: formData.baseCurrency,
        monthly_expenses: formData.monthlyExpenses,
        monthly_contribution: formData.monthlyContribution,
        current_wealth: formData.currentWealth,
        exp_inflation_aa: formData.expInflationAA,
        exp_return_real_aa: formData.expReturnRealAA,
        safe_withdrawal_rate: formData.swrAA,
        tax_rate: formData.taxRate || 0
      }

      let profileResult
      if (selectedProfileId) {
        profileResult = await updatePlanningProfile(selectedProfileId, profileData)
      } else {
        profileResult = await createPlanningProfile(profileData)
      }

      if (profileResult.error) {
        throw new Error(profileResult.error)
      }

      // Save calculation results
      if (fireResult && profileResult.data) {
        await createPlanningResult({
          profile_id: profileResult.data.id,
          horizon_months: fireResult.horizonMonths,
          target_wealth_real: fireResult.targetWealthReal,
          target_wealth_nominal: fireResult.targetWealthNominal,
          series: fireResult.series
        })
      }

      setSaveSuccess(true)
      await loadSavedProfiles()
      
      setTimeout(() => setSaveSuccess(false), 3000)

    } catch (err: any) {
      console.error('Error saving profile:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Planejamento FIRE</h1>
          <p className="text-gray-600">
            Calcule quando você poderá viver da renda dos seus investimentos
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {savedProfiles.length > 0 && (
            <select
              value={selectedProfileId}
              onChange={(e) => handleLoadProfile(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Novo plano</option>
              {savedProfiles.map(profile => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
            </select>
          )}
          
          <button
            onClick={handleSaveProfile}
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
          Plano FIRE salvo com sucesso!
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

      {/* AI Optimizations */}
      {fireResult && (
        <AIInsightCard
          type="fire"
          title="Otimizar Estratégia FIRE"
          description="Acelere sua independência financeira"
          data={{ formData, fireResult }}
        />
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Calculator className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Parâmetros do Plano</h2>
            </div>
            
            <FirePlannerForm
              formData={formData}
              onChange={handleFormChange}
              errors={validationErrors}
            />
          </div>

          {/* Results Summary */}
          {fireResult && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Target className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Resumo dos Resultados</h2>
              </div>
              
              <FirePlannerResults result={fireResult} />
            </div>
          )}
        </div>

        {/* Right Column - Chart */}
        <div className="space-y-6">
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
            ) : fireResult ? (
              <FirePlannerChart result={fireResult} />
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
        page="fire" 
        contextData={{ 
          formData,
          fireResult,
          savedProfiles
        }} 
      />
    </div>
  )
}