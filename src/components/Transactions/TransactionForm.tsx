/**
 * Formulário para criar/editar transações
 * 
 * Funcionalidades integradas com Supabase:
 * - Carrega contas e categorias do usuário
 * - Cria nova transação com validação
 * - Feedback visual de sucesso/erro
 * - Suporte a diferentes tipos (receita/despesa/transferência)
 * 
 * Como personalizar:
 * - Adicione novos campos no formulário
 * - Modifique as validações conforme necessário
 * - Altere os tipos de transação disponíveis
 */

import React, { useState, useEffect } from 'react'
import { useSupabase, Account, Category } from '../../hooks/useSupabase'
import { useDataContext } from '../../contexts/DataContext'
import { 
  DollarSign, 
  Calendar, 
  FileText, 
  CreditCard, 
  Tag,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Check,
  AlertCircle,
  Plus,
  X
} from 'lucide-react'

interface TransactionFormProps {
  onSuccess: () => void
  onCancel: () => void
  editTransaction?: any // Para edição futura
}

export function TransactionForm({ onSuccess, onCancel, editTransaction }: TransactionFormProps) {
  const { 
    createTransaction, 
    createAccount,
    createCategory,
    loading, 
    error 
  } = useSupabase()
  const { 
    accounts, 
    categories, 
    loading: dataLoading,
    refreshAccounts, 
    refreshCategories, 
    refreshTransactions,
    refreshBudgets,
    refreshAll 
  } = useDataContext()

  // Estados do formulário
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense' | 'transfer',
    amount: '',
    description: '',
    account_id: '',
    category_id: '',
    transfer_account_id: '',
    transaction_date: new Date().toISOString().split('T')[0]
  })

  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [showAccountForm, setShowAccountForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [newAccountData, setNewAccountData] = useState({
    name: '',
    type: 'checking' as const,
    balance: '0'
  })
  const [newCategoryData, setNewCategoryData] = useState({
    name: '',
    type: formData.type,
    color: '#3B82F6',
    icon: 'DollarSign'
  })

  // Set default account when accounts are loaded
  useEffect(() => {
    if (accounts.length > 0 && !formData.account_id) {
      setFormData(prev => ({ ...prev, account_id: accounts[0].id }))
    }
  }, [accounts, formData.account_id])

  // Set default category when categories are loaded and type changes
  useEffect(() => {
    const filteredCats = categories.filter(cat => cat.type === formData.type)
    if (filteredCats.length > 0 && !formData.category_id) {
      setFormData(prev => ({ ...prev, category_id: filteredCats[0].id }))
    }
  }, [categories, formData.type, formData.category_id])

  const handleCreateAccount = async () => {
    try {
      const newAccount = await createAccount({
        name: newAccountData.name.trim(),
        type: newAccountData.type,
        balance: parseFloat(newAccountData.balance) || 0,
        currency: 'BRL',
        is_active: true
      })

      if (newAccount) {
        await refreshAccounts()
        setFormData(prev => ({ ...prev, account_id: newAccount.id }))
        setShowAccountForm(false)
        setNewAccountData({ name: '', type: 'checking', balance: '0' })
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Erro ao criar conta')
    }
  }

  const handleCreateCategory = async () => {
    try {
      const newCategory = await createCategory({
        name: newCategoryData.name.trim(),
        type: newCategoryData.type,
        color: newCategoryData.color,
        icon: newCategoryData.icon,
        is_active: true
      })

      if (newCategory) {
        await refreshCategories()
        setFormData(prev => ({ ...prev, category_id: newCategory.id }))
        setShowCategoryForm(false)
        setNewCategoryData({ name: '', type: formData.type, color: '#3B82F6', icon: 'DollarSign' })
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Erro ao criar categoria')
    }
  }

  // Filtrar categorias por tipo
  const filteredCategories = categories.filter(cat => cat.type === formData.type)

  // Handlers
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setSubmitError(null)
  }

  const handleTypeChange = (type: 'income' | 'expense' | 'transfer') => {
    setFormData(prev => ({ 
      ...prev, 
      type,
      category_id: '', // Reset categoria ao mudar tipo
      transfer_account_id: type === 'transfer' ? prev.transfer_account_id : ''
    }))
    setNewCategoryData(prev => ({ ...prev, type }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitLoading(true)
    setSubmitError(null)

    try {
      // Validações
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        throw new Error('Valor deve ser maior que zero')
      }
      if (!formData.description.trim()) {
        throw new Error('Descrição é obrigatória')
      }
      if (!formData.account_id) {
        throw new Error('Selecione uma conta')
      }
      if (formData.type !== 'transfer' && !formData.category_id) {
        throw new Error('Selecione uma categoria')
      }
      if (formData.type === 'transfer' && !formData.transfer_account_id) {
        throw new Error('Selecione a conta de destino')
      }
      if (formData.type === 'transfer' && formData.account_id === formData.transfer_account_id) {
        throw new Error('Conta de origem e destino devem ser diferentes')
      }

      // Preparar dados para envio
      const transactionData = {
        type: formData.type,
        amount: formData.type === 'expense' ? -Math.abs(parseFloat(formData.amount)) : parseFloat(formData.amount),
        description: formData.description.trim(),
        account_id: formData.account_id,
        category_id: formData.type !== 'transfer' ? formData.category_id : null,
        transfer_account_id: formData.type === 'transfer' ? formData.transfer_account_id : null,
        transaction_date: formData.transaction_date
      }

      // Criar transação
      const result = await createTransaction(transactionData)
      
      if (!result) {
        throw new Error('Erro ao criar transação')
      }

      // Sucesso
      setSubmitSuccess(true)
      
      // Refresh all data to update the entire platform
      await refreshAll()
      
      setTimeout(() => {
        onSuccess()
      }, 1500)

    } catch (err: any) {
      setSubmitError(err.message || 'Erro ao criar transação')
    } finally {
      setSubmitLoading(false)
    }
  }

  // Ícones por tipo
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'income': return <ArrowUpRight className="w-5 h-5" />
      case 'expense': return <ArrowDownLeft className="w-5 h-5" />
      case 'transfer': return <ArrowLeftRight className="w-5 h-5" />
      default: return <DollarSign className="w-5 h-5" />
    }
  }

  // Mostrar sucesso
  if (submitSuccess) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Transação criada com sucesso!</h3>
        <p className="text-gray-600">A transação foi registrada e seus dados foram atualizados.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Seletor de tipo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Tipo de Transação
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { type: 'income', label: 'Receita', color: 'text-green-600 border-green-200 bg-green-50' },
            { type: 'expense', label: 'Despesa', color: 'text-red-600 border-red-200 bg-red-50' },
            { type: 'transfer', label: 'Transferência', color: 'text-blue-600 border-blue-200 bg-blue-50' }
          ].map(({ type, label, color }) => (
            <button
              key={type}
              type="button"
              onClick={() => handleTypeChange(type as any)}
              className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                formData.type === type
                  ? color
                  : 'text-gray-600 border-gray-200 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                {getTypeIcon(type)}
                <span>{label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Valor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Valor
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

      {/* Descrição */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descrição
        </label>
        <div className="relative">
          <FileText className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: Supermercado, Salário, etc."
            required
          />
        </div>
      </div>

      {/* Conta */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {formData.type === 'transfer' ? 'Conta de Origem' : 'Conta'}
        </label>
        
        {dataLoading ? (
          <div className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
            Carregando contas...
          </div>
        ) : accounts.length > 0 ? (
          <div className="space-y-2">
            <div className="relative">
              <CreditCard className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <select
                value={formData.account_id}
                onChange={(e) => handleInputChange('account_id', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                required
              >
                <option value="">Selecione uma conta</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(account.balance)}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => setShowAccountForm(true)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Criar nova conta</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-yellow-800">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Nenhuma conta encontrada</span>
              </div>
              <p className="text-yellow-700 mt-1 text-sm">
                Você precisa criar pelo menos uma conta para registrar transações.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAccountForm(true)}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Criar Primeira Conta</span>
            </button>
          </div>
        )}

        {/* Formulário de nova conta */}
        {showAccountForm && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Criar Nova Conta</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Conta</label>
                <input
                  type="text"
                  value={newAccountData.name}
                  onChange={(e) => setNewAccountData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Conta Corrente Nubank"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={newAccountData.type}
                  onChange={(e) => setNewAccountData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="checking">Conta Corrente</option>
                  <option value="savings">Poupança</option>
                  <option value="credit_card">Cartão de Crédito</option>
                  <option value="investment">Investimentos</option>
                  <option value="cash">Dinheiro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Saldo Inicial</label>
                <input
                  type="number"
                  step="0.01"
                  value={newAccountData.balance}
                  onChange={(e) => setNewAccountData(prev => ({ ...prev, balance: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0,00"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAccountForm(false)}
                  className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreateAccount}
                  disabled={!newAccountData.name.trim()}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Criar Conta
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Conta de destino (apenas para transferências) */}
      {formData.type === 'transfer' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Conta de Destino
          </label>
          <div className="relative">
            <CreditCard className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            <select
              value={formData.transfer_account_id}
              onChange={(e) => handleInputChange('transfer_account_id', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              required
            >
              <option value="">Selecione a conta de destino</option>
              {accounts
                .filter(account => account.id !== formData.account_id)
                .map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(account.balance)}
                  </option>
                ))}
            </select>
          </div>
        </div>
      )}

      {/* Categoria (não para transferências) */}
      {formData.type !== 'transfer' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoria
          </label>
          
          {filteredCategories.length > 0 ? (
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
                  {filteredCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowCategoryForm(true)}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nova categoria</span>
                </button>
                <span className="text-xs text-gray-500">
                  {filteredCategories.length} categoria{filteredCategories.length !== 1 ? 's' : ''} disponível{filteredCategories.length !== 1 ? 'eis' : ''}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-yellow-800">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Nenhuma categoria de {formData.type === 'income' ? 'receita' : 'despesa'} encontrada</span>
                </div>
                <p className="text-yellow-700 mt-1 text-sm">
                  Você precisa criar pelo menos uma categoria para registrar {formData.type === 'income' ? 'receitas' : 'despesas'}.
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
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">
                  Nova Categoria de {formData.type === 'income' ? 'Receita' : formData.type === 'expense' ? 'Despesa' : 'Transferência'}
                </h4>
                <button
                  type="button"
                  onClick={() => setShowCategoryForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Categoria</label>
                  <input
                    type="text"
                    value={newCategoryData.name}
                    onChange={(e) => setNewCategoryData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Ex: ${formData.type === 'income' ? 'Salário, Freelance' : formData.type === 'expense' ? 'Alimentação, Transporte' : 'Transferência'}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ícone</label>
                    <select
                      value={newCategoryData.icon}
                      onChange={(e) => setNewCategoryData(prev => ({ ...prev, icon: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {formData.type === 'income' ? (
                        <>
                          <option value="DollarSign">💰 Salário</option>
                          <option value="Briefcase">💼 Freelance</option>
                          <option value="TrendingUp">📈 Investimentos</option>
                          <option value="Gift">🎁 Bônus</option>
                          <option value="Home">🏠 Aluguel</option>
                        </>
                      ) : (
                        <>
                          <option value="ShoppingCart">🛒 Compras</option>
                          <option value="Car">🚗 Transporte</option>
                          <option value="Home">🏠 Casa</option>
                          <option value="Utensils">🍽️ Alimentação</option>
                          <option value="Gamepad2">🎮 Lazer</option>
                          <option value="GraduationCap">🎓 Educação</option>
                          <option value="Heart">❤️ Saúde</option>
                          <option value="DollarSign">💰 Outros</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
                    <input
                      type="color"
                      value={newCategoryData.color}
                      onChange={(e) => setNewCategoryData(prev => ({ ...prev, color: e.target.value }))}
                      className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
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
      )}

      {/* Data */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Data
        </label>
        <div className="relative">
          <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
          <input
            type="date"
            value={formData.transaction_date}
            onChange={(e) => handleInputChange('transaction_date', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>

      {/* Erro */}
      {(error || submitError) && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{submitError || error}</span>
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
          {submitLoading ? 'Criando...' : 'Criar Transação'}
        </button>
      </div>
    </form>
  )
}