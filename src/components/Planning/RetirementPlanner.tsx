import { useEffect, useMemo, useRef, useState } from 'react'
import { useSupabase } from '../../hooks/useSupabase'
import { RetirementPlannerForm } from './RetirementPlannerForm'
// Se o Chart existir e você quiser usar, mantenha a importação:
import { RetirementPlannerChart } from './RetirementPlannerChart'
import { RetirementPlannerResults } from './RetirementPlannerResults'
import { AICopilotWidget } from '../AI/AICopilotWidget'
import { calculateRetirementPlan, validateRetirementInput, FxService } from '../../utils/retirementCalculations'
import { Calendar, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react'

type AnyRecord = Record<string, any>

export function RetirementPlanner() {
  // HOOKS E LÓGICA PRINCIPAL
  useSupabase()

  const [formData, setFormData] = useState<AnyRecord>({ incomes: [], portfolio: [] })
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [calculating, setCalculating] = useState(false)
  const [retirementResult, setRetirementResult] = useState<any>(null)

  // useState completos (com setters) para permitir atualização futura
  const [savedPlans, setSavedPlans] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Handlers
  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleIncomeChange = (index: number, income: any) => {
    setFormData((prev) => {
      const incomes = Array.isArray(prev.incomes) ? [...prev.incomes] : []
      incomes[index] = income
      return { ...prev, incomes }
    })
  }

  const handlePortfolioChange = (index: number, portfolio: any) => {
    setFormData((prev) => {
      const portfolioArr = Array.isArray(prev.portfolio) ? [...prev.portfolio] : []
      portfolioArr[index] = portfolio
      return { ...prev, portfolio: portfolioArr }
    })
  }

  // Câmbio padrão (memoizado) e serviço de FX (memoizado)
  const defaultRates = useMemo(
    () => ({
      BRL: { USD: 0.2, EUR: 0.18, GBP: 0.15, CHF: 0.16, CAD: 0.27, AUD: 0.29 },
      USD: { BRL: 5.0, EUR: 0.9, GBP: 0.8,  CHF: 0.88, CAD: 1.35, AUD: 1.45 },
      EUR: { BRL: 5.5, USD: 1.1, GBP: 0.88, CHF: 0.98, CAD: 1.5,  AUD: 1.6  },
      GBP: { BRL: 6.5, USD: 1.25, EUR: 1.13, CHF: 1.12, CAD: 1.7,  AUD: 1.8  },
      CHF: { BRL: 6.2, USD: 1.14, EUR: 1.02, GBP: 0.89, CAD: 1.55, AUD: 1.65 },
      CAD: { BRL: 3.7, USD: 0.74, EUR: 0.67, GBP: 0.59, CHF: 0.65, AUD: 1.07 },
      AUD: { BRL: 3.4, USD: 0.69, EUR: 0.62, GBP: 0.56, CHF: 0.61, CAD: 0.93 },
    }),
    []
  )

  const fxService = useMemo(() => new FxService(defaultRates), [defaultRates])

  // Debounce do cálculo para evitar rodar a cada tecla
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!formData || Object.keys(formData).length === 0) return

    setCalculating(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      try {
        const errors = validateRetirementInput(formData)
        setValidationErrors(errors)

        if (errors.length === 0) {
          const result = calculateRetirementPlan(formData, fxService)
          setRetirementResult(result)
          setError(null)
        } else {
          setRetirementResult(null)
        }
      } catch (e: any) {
        setError(e?.message ?? 'Erro inesperado ao calcular o plano.')
        setRetirementResult(null)
      } finally {
        setCalculating(false)
      }
    }, 500)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [formData, fxService])

  // Renderização principal
  return (
    <>
      <div className="space-y-10">
        <div className="bg-gradient-to-br from-blue-50 to-purple-100 rounded-3xl p-8 border border-blue-200 shadow-xl text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-2 tracking-tight">
            Planejador de Aposentadoria
          </h1>
          <p className="text-lg text-blue-800 max-w-2xl mx-auto">
            Projete sua aposentadoria internacional, simule diferentes cenários e visualize sua segurança financeira no futuro.
          </p>
        </div>

        {saveSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 shadow flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <span className="font-semibold">Plano salvo com sucesso!</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 shadow flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <span className="font-semibold">Erro: {error}</span>
          </div>
        )}

        {validationErrors.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4 shadow flex flex-col gap-2">
            <span className="font-semibold">Corrija os seguintes campos:</span>
            <ul className="list-disc pl-5">
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
                <Calendar className="w-7 h-7 text-purple-600" />
                Parâmetros do Plano
              </h2>

              <RetirementPlannerForm
                formData={formData}
                onChange={handleFormChange}
                onIncomeChange={handleIncomeChange}
                onPortfolioChange={handlePortfolioChange}
                errors={validationErrors}
              />
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-7 h-7 text-green-600" />
                Resultados & Simulação
              </h2>

              {calculating && <div className="text-blue-700">Calculando...</div>}

              {retirementResult && (
                <>
                  <RetirementPlannerResults result={retirementResult} input={formData} />
                  {/* Se quiser exibir o gráfico, ajuste a prop conforme seu componente */}
                  <div className="mt-6">
                    <RetirementPlannerChart data={retirementResult} />
                  </div>
                </>
              )}

              {!retirementResult && !calculating && (
                <div className="text-gray-500">Preencha os dados para ver a simulação.</div>
              )}
            </div>
          </div>
        </div>

        <AICopilotWidget
          page="retirement"
          contextData={{
            formData,
            retirementResult,
            savedPlans,
          }}
        />
      </div>
    </>
  )
}
