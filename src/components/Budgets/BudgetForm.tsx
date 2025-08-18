import React, { useState, useEffect } from 'react'
import { useDataContext } from '../../contexts/DataContext'
import { 
  DollarSign, 
  Tag, 
  Calendar,
  Check,
  AlertCircle,
  Plus
} from 'lucide-react'
import { useSupabase } from '../../hooks/useSupabase'

interface BudgetFormProps {
  budget?: any // Para edição
  categories: any[]
  onSuccess: () => void
  onCancel: () => void
}

export function BudgetForm({ budget, categories, onSuccess, onCancel }: BudgetFormProps) {
  const { createBudget, updateBudget, createCategory, loading } = useSupabase()
  const { refreshCategories } = useDataContext()
  
  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    period: 'monthly',
    start_date: new Date().toISOString().split('T')[0]
  })
  
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [newCategoryData, setNewCategoryData] = useState({
    name: '',
    color: '#EF4444',
    icon: 'DollarSign'
  })

  // Preencher formulário se estiver editando
  useEffect(() => {
    if (budget) {
      setFormData({
        category_id: budget.category_id || '',
        amount: budget.amount?.toString() || '',
        period: budget.period || 'monthly',
        start_date: budget.start_date || new Date().toISOString().split('T')[0]
      })
    }
  }, [budget])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setSubmitError(null)
  }

  const calculateEndDate = (startDate: string, period: string) => {
    const start = new Date(startDate)
    let end = new Date(start)

    switch (period) {
      case 'weekly':
        end.setDate(start.getDate() + 6)
        break
      case 'yearly':
        end.setFullYear(start.getFullYear() + 1)
        end.setDate(end.getDate() - 1)
        break
      default: // monthly
        end.setMonth(start.getMonth() + 1)
        end.setDate(end.getDate() - 1)
    }

    return end.toISOString().split('T')[0]
  }

  const handleCreateCategory = async () => {
    try {
      const result = await createCategory({
        name: newCategoryData.name.trim(),
        type: 'expense',
        color: newCategoryData.color,
        icon: newCategoryData.icon,
        is_active: true
      })

      if (result) {
        await refreshCategories()
        // Selecionar a nova categoria
        setFormData(prev => ({ ...prev, category_id: result.id }))
        setShowCategoryForm(false)
        setNewCategoryData({ name: '', color: '#EF4444', icon: 'DollarSign' })
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Erro ao criar categoria')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitLoading(true)
    setSubmitError(null)

    try {
      // Validações
      if (!formData.category_id) {
        throw new Error('Selecione uma categoria')
      }
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        throw new Error('Valor deve ser maior que zero')
      }
      if (!formData.start_date) {
        throw new Error('Data de início é obrigatória')
      }

      // Preparar dados
      const budgetData = {
        category_id: formData.category_id,
        amount: parseFloat(formData.amount),
        period: formData.period,
        start_date: formData.start_date,
        end_date: calculateEndDate(formData.start_date, formData.period),
        spent: 0,
        is_active: true
      }

      // Criar ou atualizar
      const result = budget 
        ? await updateBudget(budget.id, budgetData)
        : await createBudget(budgetData)
      
      if (!result) {
        throw new Error('Erro ao salvar orçamento')
      }

      // Sucesso
      setSubmitSuccess(true)
      setTimeout(() => {
        onSuccess()
      }, 1500)

    } catch (err: any) {
      setSubmitError(err.message || 'Erro ao salvar orçamento')
    } finally {
      setSubmitLoading(false)
    }
  }

  // Mostrar sucesso
  if (submitSuccess) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Orçamento {budget ? 'atualizado' : 'criado'} com sucesso!
        </h3>
        <p className="text-gray-600">
          Seu orçamento foi {budget ? 'atualizado' : 'configurado'} e já está ativo.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Categoria */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categoria *
        </label>
        
        {categories.length > 0 ? (
          <div className="space-y-2">
            <div className="relative">
              <Tag className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <select
                value={formData.category_id}
                onChange={(e) => handleInputChange('category_id', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                required
              >
                <option value="">Selecione uma categoria</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => setShowCategoryForm(true)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Criar nova categoria</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-yellow-800">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Nenhuma categoria de despesa encontrada</span>
              </div>
              <p className="text-yellow-700 mt-1 text-sm">
                Você precisa criar pelo menos uma categoria de despesa para criar orçamentos.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCategoryForm(true)}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Criar Primeira Categoria</span>
            </button>
          </div>
        )}

        {/* Formulário de nova categoria */}
        {showCategoryForm && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Criar Nova Categoria de Despesa</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Categoria</label>
                <input
                  type="text"
                  value={newCategoryData.name}
                  onChange={(e) => setNewCategoryData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Alimentação, Transporte, Lazer"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
                  <input
                    type="color"
                    value={newCategoryData.color}
                    onChange={(e) => setNewCategoryData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ícone</label>
                  <select
                    value={newCategoryData.icon}
                    onChange={(e) => setNewCategoryData(prev => ({ ...prev, icon: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="DollarSign">💰 Geral</option>
                    <option value="ShoppingCart">🛒 Compras</option>
                    <option value="Car">🚗 Transporte</option>
                    <option value="Home">🏠 Casa</option>
                    <option value="Utensils">🍽️ Alimentação</option>
                    <option value="Gamepad2">🎮 Lazer</option>
                    <option value="GraduationCap">🎓 Educação</option>
                    <option value="Heart">❤️ Saúde</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryForm(false)}
                  className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={!newCategoryData.name.trim()}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Criar Categoria
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Valor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Valor do Orçamento *
        </label>
        <div className="relative">
          <DollarSign className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0,00"
            required
          />
        </div>
      </div>

      {/* Período */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Período
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'weekly', label: 'Semanal' },
            { value: 'monthly', label: 'Mensal' },
            { value: 'yearly', label: 'Anual' }
          ].map(period => (
            <button
              key={period.value}
              type="button"
              onClick={() => handleInputChange('period', period.value)}
              className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                formData.period === period.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Data de início */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Data de Início *
        </label>
        <div className="relative">
          <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
          <input
            type="date"
            value={formData.start_date}
            onChange={(e) => handleInputChange('start_date', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>

      {/* Informações do período */}
      {formData.start_date && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Resumo do Orçamento</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>
              <strong>Período:</strong> {
                formData.period === 'weekly' ? 'Semanal' :
                formData.period === 'monthly' ? 'Mensal' : 'Anual'
              }
            </p>
            <p>
              <strong>Início:</strong> {new Date(formData.start_date).toLocaleDateString('pt-BR')}
            </p>
            <p>
              <strong>Fim:</strong> {new Date(calculateEndDate(formData.start_date, formData.period)).toLocaleDateString('pt-BR')}
            </p>
            {formData.amount && (
              <p>
                <strong>Valor:</strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(formData.amount))}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Erro */}
      {submitError && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{submitError}</span>
        </div>
      )}

      {/* Botões */}
      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitLoading || loading}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {submitLoading ? 'Salvando...' : (budget ? 'Atualizar' : 'Criar Orçamento')}
        </button>
      </div>
    </form>
  )
}