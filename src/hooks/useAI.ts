import { useState, useCallback } from 'react'
import { useAuthContext } from '../contexts/AuthContext'
import { useSubscription } from './useSubscription'
import { useDataContext } from '../contexts/DataContext'
import { aiCopilot, AIAnalysisRequest, AIResponse } from '../lib/openai'

export function useAI() {
  const { user } = useAuthContext()
  const { subscription, canUseFeature, incrementUsage } = useSubscription()
  const { 
    accounts, 
    transactions, 
    budgets, 
    goals,
    totalBalance,
    monthlyIncome,
    monthlyExpenses 
  } = useDataContext()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getUserContext = useCallback(() => {
    return {
      plan: subscription?.plan || 'free',
      currency: 'BRL',
      monthlyIncome,
      monthlyExpenses,
      totalBalance
    }
  }, [subscription, monthlyIncome, monthlyExpenses, totalBalance])

  const analyzeSpending = useCallback(async (query?: string): Promise<AIResponse | null> => {
    const canUse = canUseFeature('ai_interactions')
    if (typeof canUse === 'object' && !canUse.allowed) {
      throw new Error(canUse.reason || 'Acesso negado ao AI Copilot')
    }

    setLoading(true)
    setError(null)

    try {
      const request: AIAnalysisRequest = {
        type: 'spending_analysis',
        data: {
          transactions: transactions.slice(0, 50), // Last 50 transactions
          monthlyExpenses,
          categories: transactions.reduce((acc, t) => {
            if (t.category && t.type === 'expense') {
              acc[t.category.name] = (acc[t.category.name] || 0) + Math.abs(t.amount)
            }
            return acc
          }, {} as Record<string, number>)
        },
        userContext: getUserContext(),
        query
      }

      const response = await aiCopilot.analyzeSpending(request)
      await incrementUsage('ai_interactions')
      
      return response
    } catch (err: any) {
      setError(err.message || 'Erro na análise de gastos')
      return null
    } finally {
      setLoading(false)
    }
  }, [canUseFeature, incrementUsage, transactions, monthlyExpenses, getUserContext])

  const optimizeBudget = useCallback(async (query?: string): Promise<AIResponse | null> => {
    const canUse = canUseFeature('ai_interactions')
    if (typeof canUse === 'object' && !canUse.allowed) {
      throw new Error(canUse.reason || 'Acesso negado ao AI Copilot')
    }

    setLoading(true)
    setError(null)

    try {
      const request: AIAnalysisRequest = {
        type: 'budget_optimization',
        data: {
          budgets,
          actualSpending: budgets.map(budget => ({
            category: budget.category?.name,
            budgeted: budget.amount,
            spent: budget.spent || 0,
            compliance: ((budget.spent || 0) / budget.amount) * 100
          }))
        },
        userContext: getUserContext(),
        query
      }

      const response = await aiCopilot.optimizeBudget(request)
      await incrementUsage('ai_interactions')
      
      return response
    } catch (err: any) {
      setError(err.message || 'Erro na otimização de orçamentos')
      return null
    } finally {
      setLoading(false)
    }
  }, [canUseFeature, incrementUsage, budgets, getUserContext])

  const analyzeInvestments = useCallback(async (portfolioData: any, query?: string): Promise<AIResponse | null> => {
    const canUse = canUseFeature('ai_interactions')
    if (typeof canUse === 'object' && !canUse.allowed) {
      throw new Error(canUse.reason || 'Acesso negado ao AI Copilot')
    }

    setLoading(true)
    setError(null)

    try {
      const request: AIAnalysisRequest = {
        type: 'investment_advice',
        data: portfolioData,
        userContext: getUserContext(),
        query
      }

      const response = await aiCopilot.analyzeInvestments(request)
      await incrementUsage('ai_interactions')
      
      return response
    } catch (err: any) {
      setError(err.message || 'Erro na análise de investimentos')
      return null
    } finally {
      setLoading(false)
    }
  }, [canUseFeature, incrementUsage, getUserContext])

  const planFIRE = useCallback(async (fireData: any, query?: string): Promise<AIResponse | null> => {
    const canUse = canUseFeature('ai_interactions')
    if (typeof canUse === 'object' && !canUse.allowed) {
      throw new Error(canUse.reason || 'Acesso negado ao AI Copilot')
    }

    setLoading(true)
    setError(null)

    try {
      const request: AIAnalysisRequest = {
        type: 'fire_planning',
        data: fireData,
        userContext: getUserContext(),
        query
      }

      const response = await aiCopilot.planFIRE(request)
      await incrementUsage('ai_interactions')
      
      return response
    } catch (err: any) {
      setError(err.message || 'Erro no planejamento FIRE')
      return null
    } finally {
      setLoading(false)
    }
  }, [canUseFeature, incrementUsage, getUserContext])

  const simulateCrisis = useCallback(async (crisisData: any, query?: string): Promise<AIResponse | null> => {
    const canUse = canUseFeature('ai_interactions')
    if (typeof canUse === 'object' && !canUse.allowed) {
      throw new Error(canUse.reason || 'Acesso negado ao AI Copilot')
    }

    setLoading(true)
    setError(null)

    try {
      const request: AIAnalysisRequest = {
        type: 'crisis_simulation',
        data: crisisData,
        userContext: getUserContext(),
        query
      }

      const response = await aiCopilot.simulateCrisis(request)
      await incrementUsage('ai_interactions')
      
      return response
    } catch (err: any) {
      setError(err.message || 'Erro na simulação de crise')
      return null
    } finally {
      setLoading(false)
    }
  }, [canUseFeature, incrementUsage, getUserContext])

  const askGeneral = useCallback(async (query: string): Promise<AIResponse | null> => {
    const canUse = canUseFeature('ai_interactions')
    if (typeof canUse === 'object' && !canUse.allowed) {
      throw new Error(canUse.reason || 'Acesso negado ao AI Copilot')
    }

    setLoading(true)
    setError(null)

    try {
      const request: AIAnalysisRequest = {
        type: 'general_query',
        data: {
          hasTransactions: transactions.length > 0,
          hasBudgets: budgets.length > 0,
          hasGoals: goals.length > 0,
          accountCount: accounts.length
        },
        userContext: getUserContext(),
        query
      }

      const response = await aiCopilot.generalQuery(request)
      await incrementUsage('ai_interactions')
      
      return response
    } catch (err: any) {
      setError(err.message || 'Erro na consulta geral')
      return null
    } finally {
      setLoading(false)
    }
  }, [canUseFeature, incrementUsage, transactions, budgets, goals, accounts, getUserContext])

  return {
    loading,
    error,
    analyzeSpending,
    optimizeBudget,
    analyzeInvestments,
    planFIRE,
    simulateCrisis,
    askGeneral,
    getUserContext
  }
}