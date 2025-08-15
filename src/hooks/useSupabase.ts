/**
 * Hook personalizado para interações com Supabase
 * 
 * Este hook centraliza todas as operações do Supabase e fornece:
 * - Métodos para CRUD de todas as entidades
 * - Tratamento de erros padronizado
 * - Loading states automáticos
 * - Feedback visual para o usuário
 * 
 * Como usar:
 * const { createTransaction, loading, error } = useSupabase()
 * 
 * Como personalizar:
 * - Altere os nomes das tabelas nas constantes TABLE_NAMES
 * - Modifique os campos nos tipos TypeScript
 * - Adicione novos métodos seguindo o padrão existente
 */

import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../contexts/AuthContext'

// Nomes das tabelas - altere aqui para personalizar
const TABLE_NAMES = {
  PROFILES: 'profiles',
  ACCOUNTS: 'accounts',
  CATEGORIES: 'categories',
  TRANSACTIONS: 'transactions',
  BUDGETS: 'budgets',
  GOALS: 'goals',
  FUNDS: 'funds',
  FUND_PRICES: 'fund_prices',
  WATCHLISTS: 'watchlists',
  PLANNING_PROFILES: 'planning_profiles',
  PLANNING_RESULTS: 'planning_results',
  PLANNING_SCENARIOS: 'planning_scenarios'
} as const

// Tipos TypeScript para as entidades - personalize os campos aqui
export interface Profile {
  id: string
  user_id: string
  email: string
  full_name?: string
  avatar_url?: string
  currency: string
  created_at: string
  updated_at: string
}

export interface Account {
  id: string
  user_id: string
  name: string
  type: 'checking' | 'savings' | 'credit_card' | 'investment' | 'cash'
  balance: number
  currency: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  type: 'income' | 'expense' | 'transfer'
  color: string
  icon: string
  is_active: boolean
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  account_id: string
  category_id?: string
  amount: number
  description: string
  transaction_date: string
  type: 'income' | 'expense' | 'transfer'
  transfer_account_id?: string
  created_at: string
  updated_at: string
  // Campos relacionados (joins)
  account?: Account
  category?: Category
  transfer_account?: Account
}

export interface Budget {
  id: string
  user_id: string
  category_id: string
  amount: number
  period: 'weekly' | 'monthly' | 'yearly'
  start_date: string
  end_date?: string
  spent: number
  is_active: boolean
  created_at: string
  updated_at: string
  // Campos relacionados
  category?: Category
}

export interface Goal {
  id: string
  user_id: string
  name: string
  description?: string
  target_amount: number
  current_amount: number
  target_date?: string
  category: string
  is_completed: boolean
  created_at: string
  updated_at: string
}

export interface Fund {
  id: string
  ticker: string
  name: string
  category: string
  admin_fee: number
  performance_fee?: number
  benchmark: string
  risk_level: number
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FundPrice {
  id: string
  fund_id: string
  price_date: string
  quota_value: number
  net_worth?: number
  created_at: string
}

export interface Watchlist {
  id: string
  user_id: string
  fund_id: string
  created_at: string
  // Campos relacionados
  fund?: Fund
}

// ==================== FIRE PLANNING ====================

/**
 * Planning profile interface
 */
export interface PlanningProfile {
  id: string
  user_id: string
  name: string
  base_currency: string
  monthly_expenses: number
  monthly_contribution: number
  current_wealth: number
  exp_inflation_aa: number
  exp_return_real_aa: number
  safe_withdrawal_rate: number
  tax_rate: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PlanningResult {
  id: string
  user_id: string
  profile_id: string
  horizon_months: number
  target_wealth_real: number
  target_wealth_nominal: number
  series: Array<{
    month: number
    wealth_nominal: number
    wealth_real: number
  }>
  created_at: string
}

export interface PlanningScenario {
  id: string
  user_id: string
  name: string
  description?: string
  input_json: any
  result_json: any
  created_at: string
}

// Hook principal para interações com Supabase
export function useSupabase() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthContext()

  // Função auxiliar para tratamento de erros
  const handleError = useCallback((error: any, operation: string) => {
    console.error(`Error in ${operation}:`, error)
    const message = error?.message || `Erro ao ${operation}`
    setError(message)
    return null
  }, [])

  // Função auxiliar para operações assíncronas
  const executeOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T | null> => {
    if (!user) {
      setError('Usuário não autenticado')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const result = await operation()
      return result
    } catch (err) {
      return handleError(err, operationName)
    } finally {
      setLoading(false)
    }
  }, [user, handleError])

  // ==================== PROFILES ====================
  const getProfile = useCallback(async (): Promise<Profile | null> => {
    return executeOperation(async () => {
      const { data, error } = await supabase
        .from(TABLE_NAMES.PROFILES)
        .select('*')
        .eq('user_id', user!.id)
        .single()

      if (error) throw error
      return data
    }, 'buscar perfil')
  }, [executeOperation, user])

  const updateProfile = useCallback(async (updates: Partial<Profile>): Promise<Profile | null> => {
    return executeOperation(async () => {
      const { data, error } = await supabase
        .from(TABLE_NAMES.PROFILES)
        .update(updates)
        .eq('user_id', user!.id)
        .select()
        .single()

      if (error) throw error
      return data
    }, 'atualizar perfil')
  }, [executeOperation, user])

  // ==================== ACCOUNTS ====================
  const getAccounts = useCallback(async (): Promise<Account[]> => {
    const result = await executeOperation(async () => {
      const { data, error } = await supabase
        .from(TABLE_NAMES.ACCOUNTS)
        .select('*')
        .eq('user_id', user!.id)
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data || []
    }, 'buscar contas')

    return result || []
  }, [executeOperation, user])

  const createAccount = useCallback(async (account: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Account | null> => {
    return executeOperation(async () => {
      const { data, error } = await supabase
        .from(TABLE_NAMES.ACCOUNTS)
        .insert({ ...account, user_id: user!.id })
        .select()
        .single()

      if (error) throw error
      return data
    }, 'criar conta')
  }, [executeOperation, user])

  const updateAccount = useCallback(async (id: string, updates: Partial<Account>): Promise<Account | null> => {
    return executeOperation(async () => {
      const { data, error } = await supabase
        .from(TABLE_NAMES.ACCOUNTS)
        .update(updates)
        .eq('id', id)
        .eq('user_id', user!.id)
        .select()
        .single()

      if (error) throw error
      return data
    }, 'atualizar conta')
  }, [executeOperation, user])

  const deleteAccount = useCallback(async (id: string): Promise<boolean> => {
    const result = await executeOperation(async () => {
      const { error } = await supabase
        .from(TABLE_NAMES.ACCOUNTS)
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id)

      if (error) throw error
      return true
    }, 'deletar conta')

    return result || false
  }, [executeOperation, user])

  // ==================== CATEGORIES ====================
  const getCategories = useCallback(async (): Promise<Category[]> => {
    const result = await executeOperation(async () => {
      const { data, error } = await supabase
        .from(TABLE_NAMES.CATEGORIES)
        .select('*')
        .eq('user_id', user!.id)
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data || []
    }, 'buscar categorias')

    return result || []
  }, [executeOperation, user])

  const createCategory = useCallback(async (category: Omit<Category, 'id' | 'user_id' | 'created_at'>): Promise<Category | null> => {
    return executeOperation(async () => {
      const { data, error } = await supabase
        .from(TABLE_NAMES.CATEGORIES)
        .insert({ ...category, user_id: user!.id })
        .select()
        .single()

      if (error) throw error
      return data
    }, 'criar categoria')
  }, [executeOperation, user])

  const updateCategory = useCallback(async (id: string, updates: Partial<Category>): Promise<Category | null> => {
    return executeOperation(async () => {
      const { data, error } = await supabase
        .from(TABLE_NAMES.CATEGORIES)
        .update(updates)
        .eq('id', id)
        .eq('user_id', user!.id)
        .select()
        .single()

      if (error) throw error
      return data
    }, 'atualizar categoria')
  }, [executeOperation, user])

  const deleteCategory = useCallback(async (id: string): Promise<boolean> => {
    const result = await executeOperation(async () => {
      const { error } = await supabase
        .from(TABLE_NAMES.CATEGORIES)
        .update({ is_active: false })
        .eq('id', id)
        .eq('user_id', user!.id)

      if (error) throw error
      return true
    }, 'deletar categoria')

    return result || false
  }, [executeOperation, user])

  // ==================== TRANSACTIONS ====================
  const getTransactions = useCallback(async (filters?: {
    account_id?: string
    category_id?: string
    type?: string
    start_date?: string
    end_date?: string
    limit?: number
  }): Promise<Transaction[]> => {
    const result = await executeOperation(async () => {
      let query = supabase
        .from(TABLE_NAMES.TRANSACTIONS)
        .select(`
          *,
          account:accounts!transactions_account_id_fkey(name, type),
          transfer_account:accounts!transactions_transfer_account_id_fkey(name, type),
          category:categories(name, color, icon)
        `)
        .eq('user_id', user!.id)
        .order('transaction_date', { ascending: false })

      if (filters) {
        if (filters.account_id) query = query.eq('account_id', filters.account_id)
        if (filters.category_id) query = query.eq('category_id', filters.category_id)
        if (filters.type) query = query.eq('type', filters.type)
        if (filters.start_date) query = query.gte('transaction_date', filters.start_date)
        if (filters.end_date) query = query.lte('transaction_date', filters.end_date)
        if (filters.limit) query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    }, 'buscar transações')

    return result || []
  }, [executeOperation, user])

  const createTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Transaction | null> => {
    return executeOperation(async () => {
      // First create the transaction
      const { data: transactionData, error: transactionError } = await supabase
        .from(TABLE_NAMES.TRANSACTIONS)
        .insert({ ...transaction, user_id: user!.id })
        .select()
        .single()

      if (transactionError) throw transactionError
      
      // Update account balances
      if (transaction.type === 'transfer') {
        // Handle transfer - update both accounts
        const { data: fromAccount } = await supabase
          .from(TABLE_NAMES.ACCOUNTS)
          .select('balance')
          .eq('id', transaction.account_id)
          .single()
        
        const { data: toAccount } = await supabase
          .from(TABLE_NAMES.ACCOUNTS)
          .select('balance')
          .eq('id', transaction.transfer_account_id!)
          .single()
        
        if (fromAccount && toAccount) {
          await Promise.all([
            supabase
              .from(TABLE_NAMES.ACCOUNTS)
              .update({ balance: Number(fromAccount.balance) - Math.abs(Number(transaction.amount)) })
              .eq('id', transaction.account_id),
            supabase
              .from(TABLE_NAMES.ACCOUNTS)
              .update({ balance: Number(toAccount.balance) + Math.abs(Number(transaction.amount)) })
              .eq('id', transaction.transfer_account_id!)
          ])
        }
      } else {
        // Handle income/expense - update single account
        const { data: accountData } = await supabase
          .from(TABLE_NAMES.ACCOUNTS)
          .select('balance')
          .eq('id', transaction.account_id)
          .single()
        
        if (accountData) {
          const balanceChange = transaction.type === 'income' 
            ? Number(transaction.amount) 
            : -Number(transaction.amount)
          
          await supabase
            .from(TABLE_NAMES.ACCOUNTS)
            .update({ balance: Number(accountData.balance) + balanceChange })
            .eq('id', transaction.account_id)
        }
      }
      
      return transactionData
    }, 'criar transação')
  }, [executeOperation, user])

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>): Promise<Transaction | null> => {
    return executeOperation(async () => {
      const { data, error } = await supabase
        .from(TABLE_NAMES.TRANSACTIONS)
        .update(updates)
        .eq('id', id)
        .eq('user_id', user!.id)
        .select()
        .single()

      if (error) throw error
      return data
    }, 'atualizar transação')
  }, [executeOperation, user])

  const deleteTransaction = useCallback(async (id: string): Promise<boolean> => {
    const result = await executeOperation(async () => {
      const { error } = await supabase
        .from(TABLE_NAMES.TRANSACTIONS)
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id)

      if (error) throw error
      return true
    }, 'deletar transação')

    return result || false
  }, [executeOperation, user])

  // ==================== BUDGETS ====================
  const getBudgets = useCallback(async (): Promise<Budget[]> => {
    const result = await executeOperation(async () => {
      const { data, error } = await supabase
        .from(TABLE_NAMES.BUDGETS)
        .select(`
          *,
          category:categories(name, color, icon)
        `)
        .eq('user_id', user!.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    }, 'buscar orçamentos')

    return result || []
  }, [executeOperation, user])

  const createBudget = useCallback(async (budget: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Budget | null> => {
    return executeOperation(async () => {
      const { data, error } = await supabase
        .from(TABLE_NAMES.BUDGETS)
        .insert({ ...budget, user_id: user!.id })
        .select()
        .single()

      if (error) throw error
      return data
    }, 'criar orçamento')
  }, [executeOperation, user])

  const updateBudget = useCallback(async (id: string, updates: Partial<Budget>): Promise<Budget | null> => {
    return executeOperation(async () => {
      const { data, error } = await supabase
        .from(TABLE_NAMES.BUDGETS)
        .update(updates)
        .eq('id', id)
        .eq('user_id', user!.id)
        .select()
        .single()

      if (error) throw error
      return data
    }, 'atualizar orçamento')
  }, [executeOperation, user])

  const deleteBudget = useCallback(async (id: string): Promise<boolean> => {
    const result = await executeOperation(async () => {
      const { error } = await supabase
        .from(TABLE_NAMES.BUDGETS)
        .update({ is_active: false })
        .eq('id', id)
        .eq('user_id', user!.id)

      if (error) throw error
      return true
    }, 'deletar orçamento')

    return result || false
  }, [executeOperation, user])

  // ==================== GOALS ====================
  const getGoals = useCallback(async (): Promise<Goal[]> => {
    const result = await executeOperation(async () => {
      const { data, error } = await supabase
        .from(TABLE_NAMES.GOALS)
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    }, 'buscar metas')

    return result || []
  }, [executeOperation, user])

  const createGoal = useCallback(async (goal: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Goal | null> => {
    return executeOperation(async () => {
      const { data, error } = await supabase
        .from(TABLE_NAMES.GOALS)
        .insert({ ...goal, user_id: user!.id })
        .select()
        .single()

      if (error) throw error
      return data
    }, 'criar meta')
  }, [executeOperation, user])

  const updateGoal = useCallback(async (id: string, updates: Partial<Goal>): Promise<Goal | null> => {
    return executeOperation(async () => {
      const { data, error } = await supabase
        .from(TABLE_NAMES.GOALS)
        .update(updates)
        .eq('id', id)
        .eq('user_id', user!.id)
        .select()
        .single()

      if (error) throw error
      return data
    }, 'atualizar meta')
  }, [executeOperation, user])

  // ==================== FUNDS ====================
  const getFunds = useCallback(async (): Promise<Fund[]> => {
    const result = await executeOperation(async () => {
      const { data, error } = await supabase
        .from(TABLE_NAMES.FUNDS)
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data || []
    }, 'buscar fundos')

    return result || []
  }, [executeOperation])

  const getFundPrices = useCallback(async (fundId: string, days?: number): Promise<FundPrice[]> => {
    const result = await executeOperation(async () => {
      let query = supabase
        .from(TABLE_NAMES.FUND_PRICES)
        .select('*')
        .eq('fund_id', fundId)
        .order('price_date', { ascending: false })

      if (days) {
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)
        query = query.gte('price_date', startDate.toISOString().split('T')[0])
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    }, 'buscar preços de fundos')

    return result || []
  }, [executeOperation])

  // ==================== WATCHLISTS ====================
  const getWatchlist = useCallback(async (): Promise<Watchlist[]> => {
    const result = await executeOperation(async () => {
      const { data, error } = await supabase
        .from(TABLE_NAMES.WATCHLISTS)
        .select(`
          *,
          fund:funds(*)
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    }, 'buscar watchlist')

    return result || []
  }, [executeOperation, user])

  const addToWatchlist = useCallback(async (fundId: string): Promise<Watchlist | null> => {
    return executeOperation(async () => {
      const { data, error } = await supabase
        .from(TABLE_NAMES.WATCHLISTS)
        .insert({ user_id: user!.id, fund_id: fundId })
        .select()
        .single()

      if (error) throw error
      return data
    }, 'adicionar à watchlist')
  }, [executeOperation, user])

  const removeFromWatchlist = useCallback(async (fundId: string): Promise<boolean> => {
    const result = await executeOperation(async () => {
      const { error } = await supabase
        .from(TABLE_NAMES.WATCHLISTS)
        .delete()
        .eq('user_id', user!.id)
        .eq('fund_id', fundId)

      if (error) throw error
      return true
    }, 'remover da watchlist')

    return result || false
  }, [executeOperation, user])

  // ==================== PLANNING PROFILES ====================
  const getPlanningProfiles = useCallback(async (): Promise<PlanningProfile[]> => {
    const result = await executeOperation(async () => {
      const { data, error } = await supabase
        .from(TABLE_NAMES.PLANNING_PROFILES)
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    }, 'buscar perfis de planejamento')

    return result || []
  }, [executeOperation, user])

  const createPlanningProfile = useCallback(async (profile: Omit<PlanningProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<PlanningProfile | null> => {
    return executeOperation(async () => {
      const { data, error } = await supabase
        .from(TABLE_NAMES.PLANNING_PROFILES)
        .insert({ ...profile, user_id: user!.id })
        .select()
        .single()

      if (error) throw error
      return data
    }, 'criar perfil de planejamento')
  }, [executeOperation, user])

  const updatePlanningProfile = useCallback(async (id: string, updates: Partial<PlanningProfile>): Promise<PlanningProfile | null> => {
    return executeOperation(async () => {
      const { data, error } = await supabase
        .from(TABLE_NAMES.PLANNING_PROFILES)
        .update(updates)
        .eq('id', id)
        .eq('user_id', user!.id)
        .select()
        .single()

      if (error) throw error
      return data
    }, 'atualizar perfil de planejamento')
  }, [executeOperation, user])

  // ==================== PLANNING RESULTS ====================
  const createPlanningResult = useCallback(async (result: Omit<PlanningResult, 'id' | 'user_id' | 'created_at'>): Promise<PlanningResult | null> => {
    return executeOperation(async () => {
      const { data, error } = await supabase
        .from(TABLE_NAMES.PLANNING_RESULTS)
        .insert({ ...result, user_id: user!.id })
        .select()
        .single()

      if (error) throw error
      return data
    }, 'salvar resultado de planejamento')
  }, [executeOperation, user])

  // ==================== PLANNING SCENARIOS ====================
  const getPlanningScenarios = useCallback(async (): Promise<PlanningScenario[]> => {
    const result = await executeOperation(async () => {
      const { data, error } = await supabase
        .from(TABLE_NAMES.PLANNING_SCENARIOS)
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    }, 'buscar cenários de planejamento')

    return result || []
  }, [executeOperation, user])

  const savePlanningScenario = useCallback(async (scenario: Omit<PlanningScenario, 'id' | 'user_id' | 'created_at'>): Promise<PlanningScenario | null> => {
    return executeOperation(async () => {
      const { data, error } = await supabase
        .from(TABLE_NAMES.PLANNING_SCENARIOS)
        .insert({ ...scenario, user_id: user!.id })
        .select()
        .single()

      if (error) throw error
      return data
    }, 'salvar cenário de planejamento')
  }, [executeOperation, user])

  // ==================== DATA EXPORT ====================
  const exportUserData = useCallback(async () => {
    return executeOperation(async () => {
      if (!user) throw new Error('Usuário não autenticado')

      // Buscar todos os dados do usuário
      const [
        profile,
        accounts,
        categories,
        transactions,
        budgets,
        goals,
        watchlist,
        planningProfiles,
        planningScenarios
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id),
        supabase.from('accounts').select('*').eq('user_id', user.id),
        supabase.from('categories').select('*').eq('user_id', user.id),
        supabase.from('transactions').select('*').eq('user_id', user.id),
        supabase.from('budgets').select('*').eq('user_id', user.id),
        supabase.from('goals').select('*').eq('user_id', user.id),
        supabase.from('watchlists').select('*').eq('user_id', user.id),
        supabase.from('planning_profiles').select('*').eq('user_id', user.id),
        supabase.from('planning_scenarios').select('*').eq('user_id', user.id)
      ])

      return {
        profile: profile.data || [],
        accounts: accounts.data || [],
        categories: categories.data || [],
        transactions: transactions.data || [],
        budgets: budgets.data || [],
        goals: goals.data || [],
        watchlist: watchlist.data || [],
        planningProfiles: planningProfiles.data || [],
        planningScenarios: planningScenarios.data || [],
        exportInfo: {
          exportDate: new Date().toISOString(),
          userId: user.id,
          userEmail: user.email
        }
      }
    }, 'exportar dados do usuário')
  }, [executeOperation, user])

  // ==================== ACCOUNT DELETION ====================
  const deleteUserAccount = useCallback(async (): Promise<boolean> => {
    const result = await executeOperation(async () => {
      if (!user) throw new Error('Usuário não autenticado')

      // Deletar dados do usuário (as foreign keys cuidarão da cascata)
      const { error } = await supabase.auth.admin.deleteUser(user.id)
      
      if (error) throw error
      return true
    }, 'deletar conta do usuário')

    return result || false
  }, [executeOperation, user])

  // ==================== FX RATES ====================
  const getFxRates = useCallback(async (): Promise<any[]> => {
    // FX rates table doesn't exist yet, return mock data
    return [
      { date: '2025-01-01', base: 'USD', quote: 'BRL', rate: 6.15 },
      { date: '2025-01-01', base: 'EUR', quote: 'BRL', rate: 6.45 },
      { date: '2025-01-01', base: 'USD', quote: 'EUR', rate: 0.95 }
    ]
  }, [])

  const getRetirementPlans = useCallback(async (): Promise<PlanningProfile[]> => {
    return getPlanningProfiles()
  }, [getPlanningProfiles])

  const createRetirementPlan = useCallback(async (plan: Omit<PlanningProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<PlanningProfile | null> => {
    return createPlanningProfile(plan)
  }, [createPlanningProfile])

  const updateRetirementPlan = useCallback(async (id: string, updates: Partial<PlanningProfile>): Promise<PlanningProfile | null> => {
    return executeOperation(async () => {
      const { data, error } = await supabase
        .from(TABLE_NAMES.PLANNING_PROFILES)
        .update(updates)
        .eq('id', id)
        .eq('user_id', user!.id)
        .select()
        .single()

      if (error) throw error
      return data
    }, 'atualizar perfil de planejamento')
  }, [executeOperation, user])

  return {
    // Estados
    loading,
    error,
    
    // Profiles
    getProfile,
    updateProfile,
    
    // Accounts
    getAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    
    // Categories
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    
    // Transactions
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    
    // Budgets
    getBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
    
    // Goals
    getGoals,
    createGoal,
    updateGoal,
    
    // Funds
    getFunds,
    getFundPrices,
    
    // Watchlist
    getWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    
    // Planning
    getPlanningProfiles,
    createPlanningProfile,
    updatePlanningProfile,
    createPlanningResult,
    getPlanningScenarios,
    savePlanningScenario,
    
    // Data management
    exportUserData,
    deleteUserAccount,
    
    // FX Rates
    getFxRates,
    
    // Retirement Planning
    getRetirementPlans,
    createRetirementPlan,
    updateRetirementPlan
  }
}