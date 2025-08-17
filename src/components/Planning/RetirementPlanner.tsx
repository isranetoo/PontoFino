import React, { useState, useEffect } from 'react'
import { useSupabase } from '../../hooks/useSupabase'
import { RetirementPlannerForm } from './RetirementPlannerForm'
import { RetirementPlannerChart } from './RetirementPlannerChart'
import { RetirementPlannerResults } from './RetirementPlannerResults'
import { AICopilotWidget } from '../AI/AICopilotWidget'
import { AIInsightCard } from '../AI/AIInsightCard'
import { calculateRetirementPlan, validateRetirementInput } from '../../utils/retirementCalculations'
import { Calendar, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react'

export function RetirementPlanner() {
  // HOOKS E LÓGICA PRINCIPAL
  const { supabase } = useSupabase();
  const [formData, setFormData] = useState<any>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [calculating, setCalculating] = useState(false);
  const [retirementResult, setRetirementResult] = useState<any>(null);
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Funções de manipulação (exemplo)
  const handleFormChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };
  const handleIncomeChange = (index: number, income: any) => {
    setFormData((prev: any) => {
      const incomes = [...(prev.incomes || [])];
      incomes[index] = income;
      return { ...prev, incomes };
    });
  };
  const handlePortfolioChange = (index: number, portfolio: any) => {
    setFormData((prev: any) => {
      const portfolioArr = [...(prev.portfolio || [])];
      portfolioArr[index] = portfolio;
      return { ...prev, portfolio: portfolioArr };
    });
  };

  // Exemplo de cálculo (ajuste conforme sua lógica real)
  useEffect(() => {
    if (Object.keys(formData).length === 0) return;
    setCalculating(true);
    setTimeout(() => {
      // Validação
      const errors = validateRetirementInput(formData);
      setValidationErrors(errors);
      if (errors.length === 0) {
        setRetirementResult(calculateRetirementPlan(formData));
      } else {
        setRetirementResult(null);
      }
      setCalculating(false);
    }, 500);
  }, [formData]);

  // Renderização principal
  return (
    <>
      <div className="space-y-10">
        <div className="bg-gradient-to-br from-blue-50 to-purple-100 rounded-3xl p-8 border border-blue-200 shadow-xl text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-2 tracking-tight">Planejador de Aposentadoria</h1>
          <p className="text-lg text-blue-800 max-w-2xl mx-auto">Projete sua aposentadoria internacional, simule diferentes cenários e visualize sua segurança financeira no futuro.</p>
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
            {calculating ? (
              <div className="flex items-center justify-center h-80">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Calculando projeção...</p>
                </div>
              </div>
            ) : retirementResult ? (
              <>
                <RetirementPlannerResults result={retirementResult} input={formData} />
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
                    <TrendingUp className="w-7 h-7 text-green-600" />
                    Projeção de Patrimônio
                  </h2>
                  <RetirementPlannerChart result={retirementResult} input={formData} />
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-80 text-gray-500">
                <div className="text-center">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p>Preencha os parâmetros para ver a projeção</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <AICopilotWidget 
          page="retirement" 
          contextData={{ 
            formData,
            retirementResult,
            savedPlans
          }} 
        />
      </div>
    </>
  );
}