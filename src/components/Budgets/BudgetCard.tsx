import React from 'react'
import { Edit3, Trash2, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'

interface BudgetCardProps {
  budget: {
    id: string
    category?: { name: string; color: string }
    amount: number
    spent: number
    percentage: number
    status: 'good' | 'caution' | 'warning' | 'exceeded'
    remaining: number
    period: string
  }
  onEdit: (budget: any) => void
  onDelete: (budgetId: string) => void
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-500'
      case 'caution':
        return 'bg-yellow-500'
      case 'warning':
        return 'bg-orange-500'
      case 'exceeded':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'caution':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      case 'warning':
      case 'exceeded':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      default:
        return <CheckCircle className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'good':
        return 'Dentro do orçamento'
      case 'caution':
        return 'Atenção aos gastos'
      case 'warning':
        return 'Limite quase atingido'
      case 'exceeded':
        return 'Orçamento excedido'
      default:
        return 'Status desconhecido'
    }
  }

  const getPeriodText = (period: string) => {
    switch (period) {
      case 'weekly':
        return 'Semanal'
      case 'monthly':
        return 'Mensal'
      case 'yearly':
        return 'Anual'
      default:
        return 'Mensal'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: budget.category?.color || '#3B82F6' }}
          />
          <div>
            <h3 className="font-semibold text-gray-900">
              {budget.category?.name || 'Categoria'}
            </h3>
            <p className="text-sm text-gray-600">{getPeriodText(budget.period)}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onEdit(budget)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Editar orçamento"
          >
            <Edit3 className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => onDelete(budget.id)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Excluir orçamento"
          >
            <Trash2 className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Valores */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Orçamento</span>
          <span className="font-semibold text-gray-900">{formatCurrency(budget.amount)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Gasto</span>
          <span className={`font-semibold ${
            budget.status === 'exceeded' ? 'text-red-600' : 'text-gray-900'
          }`}>
            {formatCurrency(budget.spent)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Disponível</span>
          <span className={`font-semibold ${
            budget.remaining <= 0 ? 'text-red-600' : 'text-green-600'
          }`}>
            {formatCurrency(budget.remaining)}
          </span>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Progresso</span>
          <span className="text-sm font-medium text-gray-900">
            {budget.percentage.toFixed(1)}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${getStatusColor(budget.status)}`}
            style={{ width: `${Math.min(budget.percentage, 100)}%` }}
          />
        </div>
        
        {budget.percentage > 100 && (
          <div className="mt-1 text-xs text-red-600">
            Excedido em {formatCurrency(budget.spent - budget.amount)}
          </div>
        )}
      </div>

      {/* Status */}
      <div className="flex items-center space-x-2 pt-3 border-t border-gray-200">
        {getStatusIcon(budget.status)}
        <span className={`text-sm font-medium ${
          budget.status === 'exceeded' ? 'text-red-600' :
          budget.status === 'warning' ? 'text-orange-600' :
          budget.status === 'caution' ? 'text-yellow-600' :
          'text-green-600'
        }`}>
          {getStatusText(budget.status)}
        </span>
      </div>
    </div>
  )
}