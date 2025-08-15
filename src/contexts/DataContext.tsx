import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSupabase } from '../hooks/useSupabase'
import { useAuthContext } from './AuthContext'

interface DataContextType {
  // Data states
  accounts: any[]
  categories: any[]
  transactions: any[]
  budgets: any[]
  goals: any[]
  
  // Loading states
  loading: boolean
  error: string | null
  
  // Refresh methods
  refreshAccounts: () => Promise<void>
  refreshCategories: () => Promise<void>
  refreshTransactions: () => Promise<void>
  refreshBudgets: () => Promise<void>
  refreshGoals: () => Promise<void>
  refreshAll: () => Promise<void>
  
  // Computed values
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  budgetAlerts: number
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext()
  const { 
    getAccounts, 
    getCategories, 
    getTransactions, 
    getBudgets, 
    getGoals 
  } = useSupabase()
  
  // Data states
  const [accounts, setAccounts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [budgets, setBudgets] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])
  
  // Loading states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load all data when user changes
  useEffect(() => {
    if (user) {
      refreshAll()
    } else {
      // Clear data when user logs out
      setAccounts([])
      setCategories([])
      setTransactions([])
      setBudgets([])
      setGoals([])
    }
  }, [user])

  // Refresh methods
  const refreshAccounts = async () => {
    try {
      const result = await getAccounts()
      if (result) {
        setAccounts(result)
      }
    } catch (err) {
      console.error('Error refreshing accounts:', err)
    }
  }

  const refreshCategories = async () => {
    try {
      const result = await getCategories()
      if (result) {
        setCategories(result)
      }
    } catch (err) {
      console.error('Error refreshing categories:', err)
    }
  }

  const refreshTransactions = async () => {
    try {
      const result = await getTransactions(100) // Last 100 transactions
      if (result) {
        setTransactions(result)
      }
    } catch (err) {
      console.error('Error refreshing transactions:', err)
    }
  }

  const refreshBudgets = async () => {
    try {
      const result = await getBudgets()
      if (result) {
        setBudgets(result)
      }
    } catch (err) {
      console.error('Error refreshing budgets:', err)
    }
  }

  const refreshGoals = async () => {
    try {
      const result = await getGoals()
      if (result) {
        setGoals(result)
      }
    } catch (err) {
      console.error('Error refreshing goals:', err)
    }
  }

  const refreshAll = async () => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    try {
      await Promise.all([
        refreshAccounts(),
        refreshCategories(),
        refreshTransactions(),
        refreshBudgets(),
        refreshGoals()
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  // Computed values
  const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0)
  
  const monthlyIncome = transactions
    .filter(t => {
      const transactionDate = new Date(t.transaction_date)
      const now = new Date()
      return transactionDate.getMonth() === now.getMonth() && 
             transactionDate.getFullYear() === now.getFullYear() &&
             t.type === 'income'
    })
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const monthlyExpenses = transactions
    .filter(t => {
      const transactionDate = new Date(t.transaction_date)
      const now = new Date()
      return transactionDate.getMonth() === now.getMonth() && 
             transactionDate.getFullYear() === now.getFullYear() &&
             t.type === 'expense'
    })
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)

  const budgetAlerts = budgets.filter(budget => {
    const spentPercentage = (Number(budget.spent || 0) / Number(budget.amount || 1)) * 100
    return spentPercentage > 80
  }).length

  const value: DataContextType = {
    // Data states
    accounts,
    categories,
    transactions,
    budgets,
    goals,
    
    // Loading states
    loading,
    error,
    
    // Refresh methods
    refreshAccounts,
    refreshCategories,
    refreshTransactions,
    refreshBudgets,
    refreshGoals,
    refreshAll,
    
    // Computed values
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    budgetAlerts
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

export function useDataContext() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataProvider')
  }
  return context
}