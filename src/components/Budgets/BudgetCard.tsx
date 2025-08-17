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
        return 'bg-yellow-400'
      case 'warning':
        return 'bg-orange-400'
      case 'exceeded':
        return 'bg-red-500'
      default:
        return 'bg-gray-300'
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
    <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl shadow-lg p-6 group hover:shadow-2xl transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-5 h-5 rounded-full border-2 border-white shadow"
            style={{ backgroundColor: budget.category?.color || '#3B82F6' }}
          />
          <div>
            <h3 className="font-semibold text-lg text-gray-900 tracking-tight">
              {budget.category?.name || 'Categoria'}
            </h3>
            <span className="inline-block text-xs text-gray-500 font-medium mt-0.5 px-2 py-0.5 rounded bg-gray-100">
              {getPeriodText(budget.period)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(budget)}
            className="p-2 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200"
            title="Editar orçamento"
          >
            <Edit3 className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={() => onDelete(budget.id)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-200"
            title="Excluir orçamento"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>

      {/* Valores */}
      <div className="space-y-2 mb-5">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Orçamento</span>
          <span className="font-bold text-gray-900 text-base">{formatCurrency(budget.amount)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Gasto</span>
          <span className={`font-bold text-base ${
            budget.status === 'exceeded' ? 'text-red-600' : 'text-gray-900'
          }`}>
            {formatCurrency(budget.spent)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Disponível</span>
          <span className={`font-bold text-base ${
            budget.remaining <= 0 ? 'text-red-600' : 'text-green-600'
          }`}>
            {formatCurrency(budget.remaining)}
          </span>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">Progresso</span>
          <span className="text-xs font-semibold text-gray-700">
            {budget.percentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${getStatusColor(budget.status)}`}
            style={{ width: `${Math.min(budget.percentage, 100)}%` }}
          />
          {budget.percentage > 100 && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-red-600 font-semibold animate-pulse">
              +{formatCurrency(budget.spent - budget.amount)}
            </div>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold shadow-sm
          ${
            budget.status === 'exceeded' ? 'bg-red-100 text-red-700' :
            budget.status === 'warning' ? 'bg-orange-100 text-orange-700' :
            budget.status === 'caution' ? 'bg-yellow-100 text-yellow-700' :
            'bg-green-100 text-green-700'
          }
        `}>
          {getStatusIcon(budget.status)}
          {getStatusText(budget.status)}
        </span>
      </div>
    </div>
  )
}