import React, { useState, useEffect } from 'react'
import { useSupabase } from '../../hooks/useSupabase'
import { CrisisForm } from './CrisisForm'
import { CrisisResults } from './CrisisResults'
import { CrisisCharts } from './CrisisCharts'
import { AICopilotWidget } from '../AI/AICopilotWidget'
import { AIInsightCard } from '../AI/AIInsightCard'
import { simulateCrisis, Shock, MarketContext, Position, SimulationResult, validateShocks } from '../../utils/crisisSimulation'
import { AlertTriangle, TrendingDown, Shield, Save, AlertCircle } from 'lucide-react'

export function CrisisSimulator() {
  const { 
    getPortfolioPositions,
    savePlanningScenario,
    loading, 
    error 
  } = useSupabase()

  // Form state
  const [shocks, setShocks] = useState<Shock>({
    equityIdx: -0.4,    // -40% equity drop
    rateAbs: 0.15,      // 15% interest rate
    fxUSD: 0.25         // +25% USD/BRL
  })

  // Market context (current conditions)
  const [context] = useState<MarketContext>({
    currentRate: 0.1375,  // 13.75% Selic
    currentFxRate: 5.2,   // USD/BRL
    currentIndex: 100000  // Ibovespa level
  })

  // Data state
  const [positions, setPositions] = useState<Position[]>([])
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [calculating, setCalculating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Load portfolio positions on mount
  useEffect(() => {
    loadPortfolioData()
  }, [])

  // Run simulation when shocks change
  useEffect(() => {
    const errors = validateShocks(shocks)
    setValidationErrors(errors)

    if (errors.length === 0 && positions.length > 0) {
      runSimulation()
    } else {
      setSimulationResult(null)
    }
  }, [shocks, positions])

  const loadPortfolioData = async () => {
    try {
      // In a real implementation, this would load actual user positions
      // For now, we'll create sample positions
      const samplePositions: Position[] = [
        {
          id: '1',
          asset: {
            id: '1',
            ticker: 'PETR4',
            name: 'Petrobras PN',
            asset_class: 'Equity',
            currency: 'BRL',
            metadata: { beta: 1.2, sector: 'Energy' }
          },
          quantity: 100,
          price: 35.50,
          value: 3550
        },
        {
          id: '2',
          asset: {
            id: '2',
            ticker: 'XPML11',
            name: 'XP Malls FII',
            asset_class: 'FII',
            currency: 'BRL',
            metadata: { beta_ifix: 0.8, duration_like: 2.5 }
          },
          quantity: 50,
          price: 98.20,
          value: 4910
        },
        {
          id: '3',
          asset: {
            id: '3',
            ticker: 'NTNB-2035',
            name: 'Tesouro IPCA+ 2035',
            asset_class: 'Bond',
            currency: 'BRL',
            metadata: { duration_years: 8.5, duration_mod: 8.2 }
          },
          quantity: 10,
          price: 2850.00,
          value: 28500
        },
        {
          id: '4',
          asset: {
            id: '4',
            ticker: 'IVVB11',
            name: 'iShares S&P 500 FII',
            asset_class: 'Equity',
            currency: 'USD',
            metadata: { beta: 1.0, tracks: 'S&P 500' }
          },
          quantity: 20,
          price: 280.00,
          value: 5600
        }
      ]

      setPositions(samplePositions)
    } catch (err) {
      console.error('Error loading portfolio data:', err)
    }
  }

  const runSimulation = () => {
    setCalculating(true)
    
    // Simulate calculation delay for better UX
    setTimeout(() => {
      try {
        const result = simulateCrisis(positions, shocks, context)
        setSimulationResult(result)
      } catch (err) {
        console.error('Error running simulation:', err)
        setSimulationResult(null)
      } finally {
        setCalculating(false)
      }
    }, 300)
  }

  const handleShockChange = (field: keyof Shock, value: number) => {
    setShocks(prev => ({ ...prev, [field]: value }))
    setSaveSuccess(false)
  }

  const handleSaveScenario = async () => {
    if (!simulationResult) return

    setSaving(true)
    try {
      const scenarioData = {
        name: `Cenário de Crise - ${new Date().toLocaleDateString('pt-BR')}`,
        description: `Ações: ${(shocks.equityIdx! * 100).toFixed(1)}%, Juros: ${(shocks.rateAbs! * 100).toFixed(1)}%, USD: ${(shocks.fxUSD! * 100).toFixed(1)}%`,
        input_json: { shocks, context, positions: positions.length },
        result_json: {
          valueBefore: simulationResult.valueBefore,
          valueAfter: simulationResult.valueAfter,
          drop: simulationResult.drop,
          totalLoss: simulationResult.totalLoss,
          byClass: simulationResult.byClass,
          topLosers: simulationResult.topLosers.slice(0, 3)
        }
      }

      const result = await savePlanningScenario(scenarioData)
      
      if (result.error) {
        throw new Error(result.error)
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)

    } catch (err: any) {
      console.error('Error saving scenario:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Simulação de Crise</h1>
          <p className="text-gray-600">
            Teste como sua carteira reagiria a cenários de estresse do mercado
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSaveScenario}
            disabled={saving || !simulationResult}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Salvando...' : 'Salvar Cenário'}</span>
          </button>
        </div>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          Cenário de crise salvo com sucesso!
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

      {/* Portfolio Summary */}
      {positions.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Carteira Atual</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  positions.reduce((sum, p) => sum + p.value, 0)
                )}
              </div>
              <div className="text-sm text-gray-600">Valor Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{positions.length}</div>
              <div className="text-sm text-gray-600">Posições</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(positions.map(p => p.asset.asset_class)).size}
              </div>
              <div className="text-sm text-gray-600">Classes de Ativos</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Crisis Form */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-2 mb-6">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900">Cenário de Crise</h2>
            </div>
            
            <CrisisForm
              shocks={shocks}
              context={context}
              onChange={handleShockChange}
              errors={validationErrors}
            />
          </div>

          {/* Results Summary */}
          {simulationResult && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center space-x-2 mb-6">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <h2 className="text-xl font-semibold text-gray-900">Impacto Estimado</h2>
              </div>
              
              <CrisisResults result={simulationResult} />
              
              <div className="mt-6">
                <AIInsightCard
                  type="investment"
                  title="Interpretar Simulação"
                  description="Entenda os resultados e próximos passos"
                  data={{ simulationResult, shocks, context }}
                  compact
                />
              </div>
            </div>
          )}
        </div>


      {/* AI Copilot Widget */}
      <AICopilotWidget 
        page="crisis" 
        contextData={{ 
          positions,
          simulationResult,
          shocks,
          context
        }} 
      />
        {/* Right Column - Charts */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Análise Visual</h2>
            
            {calculating ? (
              <div className="flex items-center justify-center h-80">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Simulando cenário de crise...</p>
                </div>
              </div>
            ) : simulationResult ? (
              <CrisisCharts result={simulationResult} />
            ) : (
              <div className="flex items-center justify-center h-80 text-gray-500">
                <div className="text-center">
                  <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p>Configure o cenário de crise para ver a análise</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}