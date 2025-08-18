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
      // Get recent transactions for analysis
      const recentTransactions = transactions.slice(0, 100)
      
      // Calculate spending patterns
      const categorySpending = recentTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
          const categoryName = t.category?.name || 'Sem categoria'
          acc[categoryName] = (acc[categoryName] || 0) + Math.abs(t.amount)
          return acc
        }, {} as Record<string, number>)

      // Calculate monthly trends
      const last3Months = recentTransactions
        .filter(t => {
          const transactionDate = new Date(t.transaction_date)
          const threeMonthsAgo = new Date()
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
          return transactionDate >= threeMonthsAgo && t.type === 'expense'
        })
        .reduce((sum, t) => sum + Math.abs(t.amount), 0) / 3

      // Find unusual spending patterns
      const currentMonth = new Date().getMonth()
      const currentMonthSpending = recentTransactions
        .filter(t => {
          const transactionDate = new Date(t.transaction_date)
          return transactionDate.getMonth() === currentMonth && t.type === 'expense'
        })
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

      const request: AIAnalysisRequest = {
        type: 'spending_analysis',
        data: {
          transactions: recentTransactions,
          monthlyExpenses,
          categorySpending,
          monthlyTrend: {
            average3Months: last3Months,
            currentMonth: currentMonthSpending,
            variance: currentMonthSpending - last3Months
          },
          topCategories: Object.entries(categorySpending)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([name, amount]) => ({ name, amount, percentage: (amount / monthlyExpenses) * 100 })),
          accounts: accounts.map(acc => ({
            name: acc.name,
            type: acc.type,
            balance: acc.balance
          }))
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
      // Calculate budget compliance and spending patterns
      const budgetAnalysis = budgets.map(budget => {
        const categoryTransactions = transactions.filter(t => 
          t.category_id === budget.category_id && 
          t.type === 'expense' &&
          new Date(t.transaction_date) >= new Date(budget.start_date) &&
          new Date(t.transaction_date) <= new Date(budget.end_date || new Date())
        )
        
        const actualSpent = categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
        const compliance = (actualSpent / budget.amount) * 100
        
        return {
          category: budget.category?.name || 'Categoria',
          budgeted: budget.amount,
          spent: actualSpent,
          compliance,
          status: compliance > 100 ? 'exceeded' : compliance > 80 ? 'warning' : 'good',
          transactions: categoryTransactions.length,
          avgTransactionSize: categoryTransactions.length > 0 ? actualSpent / categoryTransactions.length : 0
        }
      })

      // Find categories without budgets but with significant spending
      const categoriesWithoutBudgets = Object.entries(
        transactions
          .filter(t => t.type === 'expense' && t.category)
          .reduce((acc, t) => {
            const categoryId = t.category_id
            const categoryName = t.category.name
            if (!budgets.find(b => b.category_id === categoryId)) {
              acc[categoryName] = (acc[categoryName] || 0) + Math.abs(t.amount)
            }
            return acc
          }, {} as Record<string, number>)
      )
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([name, amount]) => ({ name, amount }))

      const request: AIAnalysisRequest = {
        type: 'budget_optimization',
        data: {
          budgets,
          budgetAnalysis,
          categoriesWithoutBudgets,
          totalBudgeted: budgets.reduce((sum, b) => sum + b.amount, 0),
          totalSpent: budgetAnalysis.reduce((sum, b) => sum + b.spent, 0),
          overBudgetCategories: budgetAnalysis.filter(b => b.compliance > 100),
          underBudgetCategories: budgetAnalysis.filter(b => b.compliance < 50),
          monthlyIncome,
          monthlyExpenses
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