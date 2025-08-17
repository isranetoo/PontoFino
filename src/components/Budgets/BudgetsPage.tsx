import React, { useState, useEffect } from 'react'
import { useDataContext } from '../../contexts/DataContext'
import { usePaywall } from '../../hooks/usePaywall'
import { BudgetCard } from './BudgetCard'
import { BudgetForm } from './BudgetForm'
import { BudgetHistory } from './BudgetHistory'
import { AICopilotWidget } from '../AI/AICopilotWidget'
import { AIInsightCard } from '../AI/AIInsightCard'
import { useSupabase } from '../../hooks/useSupabase'
import { 
  Plus, 
  AlertTriangle, 
  TrendingUp, 
  Target,
  Calendar,
  X,
  Bot,
  Lightbulb
} from 'lucide-react'

export function BudgetsPage() {
  const { 
    getTransactions,
    loading
  } = useSupabase()
  
  const {
    budgets,
    categories,
    refreshBudgets,
    refreshAll,
    error
  } = useDataContext()

  // Estados principais
  const [budgetsWithSpending, setBudgetsWithSpending] = useState<any[]>([])
  
  // Estados de UI
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [editingBudget, setEditingBudget] = useState<any>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('monthly')
  
  // Estados de alertas
  const [alerts, setAlerts] = useState<any[]>([])
  const { executeWithPaywall } = usePaywall()

  // Calcular gastos quando budgets mudarem
  useEffect(() => {
    if (budgets.length > 0) {
      calculateSpending()
    }
  }, [budgets, selectedPeriod])

  const calculateSpending = async () => {
    try {
      const budgetsWithCalculatedSpending = await Promise.all(
        budgets.map(async (budget) => {
          // Calcular período baseado no tipo de orçamento
          const { startDate, endDate } = getBudgetPeriod(budget.period)
          
          // Buscar transações da categoria no período
          const transactionsResult = await getTransactions({
            category_id: budget.category_id,
            start_date: startDate,
            end_date: endDate
          })

          // Calcular total gasto (apenas despesas)
          const spent = transactionsResult.data
            ?.filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0

          const percentage = (spent / budget.amount) * 100
          const status = getSpendingStatus(percentage)

          return {
            ...budget,
            spent,
            percentage,
            status,
            remaining: Math.max(0, budget.amount - spent)
          }
        })
      )

      setBudgetsWithSpending(budgetsWithCalculatedSpending)
      
      // Calcular alertas
      const newAlerts = budgetsWithCalculatedSpending
        .filter(budget => budget.percentage >= 80)
        .map(budget => ({
          id: budget.id,
          category: budget.category?.name || 'Categoria',
          percentage: budget.percentage,
          amount: budget.amount,
          spent: budget.spent,
          type: budget.percentage >= 100 ? 'exceeded' : 'warning'
        }))
      
      setAlerts(newAlerts)

    } catch (err) {
      console.error('Erro ao calcular gastos:', err)
    }
  }

  const getBudgetPeriod = (period: string) => {
    const now = new Date()
    let startDate: string
    let endDate: string

    switch (period) {
      case 'weekly':
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - now.getDay())
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)
        startDate = startOfWeek.toISOString().split('T')[0]
        endDate = endOfWeek.toISOString().split('T')[0]
        break
      
      case 'yearly':
        startDate = `${now.getFullYear()}-01-01`
        endDate = `${now.getFullYear()}-12-31`
        break
      
      default: // monthly
        startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
        endDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${lastDay}`
    }

    return { startDate, endDate }
  }

  const getSpendingStatus = (percentage: number) => {
    if (percentage >= 100) return 'exceeded'
    if (percentage >= 80) return 'warning'
    if (percentage >= 60) return 'caution'
    return 'good'
  }

  const handleBudgetSuccess = () => {
    setShowBudgetModal(false)
    setEditingBudget(null)
    refreshAll()
  }

  const handleEditBudget = (budget: any) => {
    setEditingBudget(budget)
    setShowBudgetModal(true)
  }

  const handleDeleteBudget = async (budgetId: string) => {
    // TODO: Implementar deletar orçamento
    console.log('Delete budget:', budgetId)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const getTotalBudget = () => {
    return budgetsWithSpending.reduce((sum, budget) => sum + budget.amount, 0)
  }

  const getTotalSpent = () => {
    return budgetsWithSpending.reduce((sum, budget) => sum + budget.spent, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Orçamentos</h1>
          <p className="text-gray-600">Controle seus gastos por categoria</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span>Histórico</span>
          </button>
          
          <button
            onClick={() => setShowBudgetModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Orçamento</span>
          </button>
        </div>
      </div>

      {/* Resumo geral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow p-6 border border-blue-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-blue-900">Orçamento Total</h3>
              <p className="text-3xl font-bold text-blue-900">{formatCurrency(getTotalBudget())}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl shadow p-6 border border-red-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-red-900">Total Gasto</h3>
              <p className="text-3xl font-bold text-red-900">{formatCurrency(getTotalSpent())}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl shadow p-6 border border-green-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-green-900">Disponível</h3>
              <p className="text-3xl font-bold text-green-900">{formatCurrency(Math.max(0, getTotalBudget() - getTotalSpent()))}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtro de período */}
      <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 gap-2">
          <span className="text-sm font-semibold text-gray-700">Período:</span>
          <div className="flex space-x-2">
            {[
              { value: 'weekly', label: 'Semanal' },
              { value: 'monthly', label: 'Mensal' },
              { value: 'yearly', label: 'Anual' }
            ].map(period => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold shadow-sm border-2 transition-all duration-150
                  ${selectedPeriod === period.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-400'}
                `}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alertas */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl border shadow-sm flex flex-col gap-1 font-semibold text-base
                ${alert.type === 'exceeded'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-yellow-50 border-yellow-200 text-yellow-800'}
              `}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span>
                  {alert.type === 'exceeded' ? 'Orçamento Excedido!' : 'Atenção: Orçamento Quase Esgotado!'}
                </span>
              </div>
              <span className="text-sm font-normal">
                <strong>{alert.category}</strong>: {formatCurrency(alert.spent)} de {formatCurrency(alert.amount)} 
                ({alert.percentage.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      )}

      {/* AI Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AIInsightCard
          type="budget"
          title="Otimizar Orçamentos"
          description="Analise compliance e sugira melhorias"
          data={{ budgets: budgetsWithSpending, alerts }}
          compact
        />
        <AIInsightCard
          type="spending"
          title="Padrões de Gastos"
          description="Identifique tendências e anomalias"
          data={{ budgets: budgetsWithSpending }}
          compact
        />
      </div>

      {/* Lista de orçamentos */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-2">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : budgetsWithSpending.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgetsWithSpending.map(budget => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={handleEditBudget}
              onDelete={handleDeleteBudget}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum orçamento criado</h3>
          <p className="text-gray-600 mb-6">
            Crie seu primeiro orçamento para começar a controlar seus gastos por categoria
          </p>
          <button
            onClick={() => setShowBudgetModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Criar Primeiro Orçamento
          </button>
        </div>
      )}

      {/* Modal de Novo/Editar Orçamento */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingBudget ? 'Editar Orçamento' : 'Novo Orçamento'}
              </h2>
              <button
                onClick={() => {
                  setShowBudgetModal(false)
                  setEditingBudget(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <BudgetForm
                budget={editingBudget}
                categories={categories.filter(c => c.type === 'expense')}
                onSuccess={handleBudgetSuccess}
                onCancel={() => {
                  setShowBudgetModal(false)
                  setEditingBudget(null)
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Histórico */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Histórico de Orçamentos</h2>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <BudgetHistory budgets={budgetsWithSpending} />
            </div>
          </div>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Erro ao carregar orçamentos: {error}
        </div>
      )}

      {/* AI Copilot Widget */}
      <AICopilotWidget 
        page="budgets" 
        contextData={{ 
          budgets: budgetsWithSpending,
          alerts,
          totalBudget: getTotalBudget(),
          totalSpent: getTotalSpent()
        }} 
      />
    </div>
  )
}