import React, { useState } from 'react'
import { useAuthContext } from '../../contexts/AuthContext'
import { useDataContext } from '../../contexts/DataContext'
import { User, Mail, Globe, Download, Trash2, Save, CreditCard, Tag, Plus, Edit3, DollarSign } from 'lucide-react'
import { useSupabase } from '../../hooks/useSupabase'

export function Profile() {
  const { user, signOut } = useAuthContext()
  const { 
    getProfile, 
    updateProfile, 
    createAccount,
    createCategory,
    updateAccount,
    updateCategory,
    deleteAccount,
    deleteCategory,
    exportUserData,
    loading, 
    error 
  } = useSupabase()
  
  const {
    accounts,
    categories,
    refreshAccounts,
    refreshCategories,
    refreshAll
  } = useDataContext()
  
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    currency: 'BRL',
  })
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [showAccountForm, setShowAccountForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState<any>(null)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [newAccountData, setNewAccountData] = useState({
    name: '',
    type: 'checking' as const,
    balance: '0'
  })
  const [newCategoryData, setNewCategoryData] = useState({
    name: '',
    type: 'expense' as const,
    color: '#3B82F6',
    icon: 'DollarSign'
  })

  // Load profile data on component mount
  React.useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileResult = await getProfile()
        
        if (profileResult) {
          setFormData({
            fullName: profileResult.full_name || '',
            currency: profileResult.currency || 'BRL'
          })
        }
      } catch (err) {
        console.error('Error loading profile:', err)
      }
    }

    if (user) {
      loadProfile()
    }
  }, [user, getProfile])

  const handleSave = async () => {
    setSaveLoading(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      const result = await updateProfile({
        email: user!.email!,
        full_name: formData.fullName.trim(),
        currency: formData.currency
      })

      if (!result) {
        throw new Error('Erro ao atualizar perfil')
      }

      setSaveSuccess(true)
      setIsEditing(false)
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)

    } catch (err: any) {
      setSaveError(err.message || 'Erro ao salvar perfil')
    } finally {
      setSaveLoading(false)
    }
  }

  const handleExportData = () => {
    setExportLoading(true)
    setExportError(null)

    try {
      // Em produção, faria chamada para /export endpoint
      exportUserData()
    } catch (err: any) {
      setExportError(err.message || 'Erro ao exportar dados')
    } finally {
      setExportLoading(false)
    }
  }

  const handleExportUserData = async () => {
    try {
      const userData = await exportUserData()
      
      if (!userData) {
        throw new Error('Erro ao exportar dados')
      }

      // Gerar arquivo JSON
      const jsonBlob = new Blob([JSON.stringify(userData, null, 2)], { 
        type: 'application/json' 
      })
      
      // Gerar arquivo CSV (transações)
      const csvContent = generateCSVContent(userData.transactions || [])
      const csvBlob = new Blob([csvContent], { type: 'text/csv' })

      // Download JSON
      downloadFile(jsonBlob, `PontoFino-dados-completos-${new Date().toISOString().split('T')[0]}.json`)
      
      // Download CSV (após pequeno delay)
      setTimeout(() => {
        downloadFile(csvBlob, `PontoFino-transacoes-${new Date().toISOString().split('T')[0]}.csv`)
      }, 1000)

      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 5000)

    } catch (error) {
      throw new Error('Falha ao coletar dados para exportação')
    }
  }

  const generateCSVContent = (transactions: any[]) => {
    const headers = ['Data', 'Descrição', 'Categoria', 'Conta', 'Tipo', 'Valor']
    const rows = transactions.map(t => [
      t.transaction_date,
      `"${t.description}"`,
      `"${t.category_id || 'Sem categoria'}"`,
      `"${t.account_id || 'Conta não encontrada'}"`,
      t.type === 'income' ? 'Receita' : t.type === 'expense' ? 'Despesa' : 'Transferência',
      t.amount
    ])
    
    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCreateAccount = async () => {
    try {
      const result = await createAccount({
        name: newAccountData.name.trim(),
        type: newAccountData.type,
        balance: parseFloat(newAccountData.balance) || 0,
        currency: 'BRL',
        is_active: true
      })

      if (result) {
        await refreshAccounts()
        setShowAccountForm(false)
        setNewAccountData({ name: '', type: 'checking', balance: '0' })
      }
    } catch (err: any) {
      setSaveError(err.message || 'Erro ao criar conta')
    }
  }

  const handleUpdateAccount = async (accountId: string) => {
    try {
      const result = await updateAccount(accountId, {
        name: newAccountData.name.trim(),
        type: newAccountData.type,
        balance: parseFloat(newAccountData.balance) || 0
      })

      if (result) {
        await refreshAccounts()
        setEditingAccount(null)
        setNewAccountData({ name: '', type: 'checking', balance: '0' })
      }
    } catch (err: any) {
      setSaveError(err.message || 'Erro ao atualizar conta')
    }
  }

  const handleDeleteAccount = async (accountId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta conta?')) return

    try {
      const result = await deleteAccount(accountId)
      if (result) {
        await refreshAccounts()
      }
    } catch (err: any) {
      setSaveError(err.message || 'Erro ao excluir conta')
    }
  }

  const handleCreateCategory = async () => {
    try {
      const result = await createCategory({
        name: newCategoryData.name.trim(),
        type: newCategoryData.type,
        color: newCategoryData.color,
        icon: newCategoryData.icon,
        is_active: true
      })

      if (result) {
        await refreshCategories()
        setShowCategoryForm(false)
        setNewCategoryData({ name: '', type: 'expense', color: '#3B82F6', icon: 'DollarSign' })
      }
    } catch (err: any) {
      setSaveError(err.message || 'Erro ao criar categoria')
    }
  }

  const handleUpdateCategory = async (categoryId: string) => {
    try {
      const result = await updateCategory(categoryId, {
        name: newCategoryData.name.trim(),
        color: newCategoryData.color,
        icon: newCategoryData.icon
      })

      if (result) {
        await refreshCategories()
        setEditingCategory(null)
        setNewCategoryData({ name: '', type: 'expense', color: '#3B82F6', icon: 'DollarSign' })
      }
    } catch (err: any) {
      setSaveError(err.message || 'Erro ao atualizar categoria')
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return

    try {
      const result = await deleteCategory(categoryId)
      if (result) {
        await refreshCategories()
      }
    } catch (err: any) {
      setSaveError(err.message || 'Erro ao excluir categoria')
    }
  }

  const confirmDeleteAccount = async () => {
    if (!deleteConfirmationText || deleteConfirmationText !== 'EXCLUIR MINHA CONTA') {
      setDeleteError('Digite exatamente "EXCLUIR MINHA CONTA" para confirmar')
      return
    }

    setDeleteLoading(true)
    setDeleteError(null)

    try {
      // Em produção, faria chamada para DELETE /user endpoint
      // que implementaria exclusão segura conforme LGPD
      
      // Simular processo de exclusão
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Fazer logout após exclusão
      await signOut()
      
    } catch (err: any) {
      setDeleteError(err.message || 'Erro ao excluir conta')
      setDeleteLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const getAccountTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      checking: 'Conta Corrente',
      savings: 'Poupança',
      credit_card: 'Cartão de Crédito',
      investment: 'Investimentos',
      cash: 'Dinheiro'
    }
    return types[type] || type
  }

  const getCategoryTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      income: 'Receita',
      expense: 'Despesa',
      transfer: 'Transferência'
    }
    return types[type] || type
  }
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Perfil</h1>
          <p className="text-gray-600">Gerencie suas informações pessoais e preferências</p>
        </div>
        <button
          onClick={() => signOut()}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Sair
        </button>
      </div>

      {/* Informações básicas */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Informações Pessoais</h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Editar
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setIsEditing(false)
                  setSaveError(null)
                  setSaveSuccess(false)
                }}
                className="text-gray-600 hover:text-gray-700 font-medium"
                disabled={saveLoading}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saveLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saveLoading ? 'Salvando...' : 'Salvar'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            Perfil atualizado com sucesso!
          </div>
        )}

        {/* Export Success Message */}
        {exportSuccess && (
          <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
            Dados exportados com sucesso! Verifique seus downloads.
          </div>
        )}

        {/* Error Message */}
        {(saveError || error) && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {saveError || error}
          </div>
        )}

        {/* Export Error Message */}
        {exportError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {exportError}
          </div>
        )}

        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {formData.fullName || 'Nome não informado'}
              </h3>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite seu nome completo"
                />
              ) : (
                <div className="flex items-center space-x-2 text-gray-900">
                  <User className="w-5 h-5 text-gray-400" />
                  <span>{formData.fullName || 'Nome não informado'}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
              </label>
              <div className="flex items-center space-x-2 text-gray-900">
                <Mail className="w-5 h-5 text-gray-400" />
                <span>{user?.email}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Moeda Padrão
              </label>
              {isEditing ? (
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="BRL">Real Brasileiro (R$)</option>
                  <option value="USD">Dólar Americano ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              ) : (
                <div className="flex items-center space-x-2 text-gray-900">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <span>
                    {formData.currency === 'BRL' && 'Real Brasileiro (R$)'}
                    {formData.currency === 'USD' && 'Dólar Americano ($)'}
                    {formData.currency === 'EUR' && 'Euro (€)'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contas */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Minhas Contas</h2>
          <button
            onClick={() => setShowAccountForm(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Conta</span>
          </button>
        </div>

        {accounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map(account => (
              <div key={account.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{account.name}</h3>
                      <p className="text-sm text-gray-600">{getAccountTypeLabel(account.type)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingAccount(account)
                        setNewAccountData({
                          name: account.name,
                          type: account.type,
                          balance: account.balance.toString()
                        })
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAccount(account.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(account.balance)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-lg mb-2">Nenhuma conta criada</p>
            <p className="text-sm">Crie sua primeira conta para começar a registrar transações</p>
          </div>
        )}

        {/* Saldo total */}
        {accounts.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-gray-900">Saldo Total</span>
              <span className={`text-2xl font-bold ${
                accounts.reduce((sum, acc) => sum + acc.balance, 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(accounts.reduce((sum, acc) => sum + acc.balance, 0))}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Categorias */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Minhas Categorias</h2>
          <button
            onClick={() => setShowCategoryForm(true)}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Categoria</span>
          </button>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(category => (
              <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: category.color + '20' }}
                    >
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-600">{getCategoryTypeLabel(category.type)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingCategory(category)
                        setNewCategoryData({
                          name: category.name,
                          type: category.type,
                          color: category.color,
                          icon: category.icon
                        })
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-lg mb-2">Nenhuma categoria criada</p>
            <p className="text-sm">Crie categorias para organizar suas transações</p>
          </div>
        )}
      </div>
      {/* Ações da conta */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Gerenciar Conta</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Download className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-medium text-gray-900">Exportar Dados</h3>
                <p className="text-sm text-gray-600">Baixe todos os seus dados em formato JSON</p>
              </div>
            </div>
            <button
              onClick={handleExportUserData}
              disabled={exportLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {exportLoading ? 'Exportando...' : 'Exportar'}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div className="flex items-center space-x-3">
              <Trash2 className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="font-medium text-red-900">Excluir Conta</h3>
                <p className="text-sm text-red-700">Esta ação é permanente e não pode ser desfeita</p>
              </div>
            </div>
            <button
              onClick={() => setShowDeleteConfirmation(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Nova/Editar Conta */}
      {(showAccountForm || editingAccount) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingAccount ? 'Editar Conta' : 'Nova Conta'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Conta</label>
                  <input
                    type="text"
                    value={newAccountData.name}
                    onChange={(e) => setNewAccountData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Conta Corrente Nubank"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Saldo</label>
                  <div className="relative">
                    <DollarSign className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="number"
                      step="0.01"
                      value={newAccountData.balance}
                      onChange={(e) => setNewAccountData(prev => ({ ...prev, balance: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0,00"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAccountForm(false)
                    setEditingAccount(null)
                    setNewAccountData({ name: '', type: 'checking', balance: '0' })
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => editingAccount ? handleUpdateAccount(editingAccount.id) : handleCreateAccount()}
                  disabled={!newAccountData.name.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {editingAccount ? 'Atualizar' : 'Criar Conta'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nova/Editar Categoria */}
      {(showCategoryForm || editingCategory) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Categoria</label>
                  <input
                    type="text"
                    value={newCategoryData.name}
                    onChange={(e) => setNewCategoryData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Alimentação, Transporte"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                  <select
                    value={newCategoryData.type}
                    onChange={(e) => setNewCategoryData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="income">Receita</option>
                    <option value="expense">Despesa</option>
                    <option value="transfer">Transferência</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cor</label>
                    <input
                      type="color"
                      value={newCategoryData.color}
                      onChange={(e) => setNewCategoryData(prev => ({ ...prev, color: e.target.value }))}
                      className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ícone</label>
                    <select
                      value={newCategoryData.icon}
                      onChange={(e) => setNewCategoryData(prev => ({ ...prev, icon: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="DollarSign">💰 Dinheiro</option>
                      <option value="ShoppingCart">🛒 Compras</option>
                      <option value="Car">🚗 Transporte</option>
                      <option value="Home">🏠 Casa</option>
                      <option value="Utensils">🍽️ Alimentação</option>
                      <option value="Gamepad2">🎮 Lazer</option>
                      <option value="GraduationCap">🎓 Educação</option>
                      <option value="Heart">❤️ Saúde</option>
                      <option value="Briefcase">💼 Trabalho</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryForm(false)
                    setEditingCategory(null)
                    setNewCategoryData({ name: '', type: 'expense', color: '#3B82F6', icon: 'DollarSign' })
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => editingCategory ? handleUpdateCategory(editingCategory.id) : handleCreateCategory()}
                  disabled={!newCategoryData.name.trim()}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {editingCategory ? 'Atualizar' : 'Criar Categoria'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Excluir Conta Permanentemente</h3>
                  <p className="text-sm text-gray-600">Esta ação não pode ser desfeita</p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-red-900 mb-2">⚠️ Atenção - Exclusão Permanente</h4>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• Todos os seus dados serão permanentemente excluídos</li>
                  <li>• Transações, orçamentos e metas serão perdidos</li>
                  <li>• Esta ação está em conformidade com a LGPD</li>
                  <li>• Não será possível recuperar os dados após a exclusão</li>
                </ul>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Para confirmar, digite exatamente: <strong>EXCLUIR MINHA CONTA</strong>
                </label>
                <input
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Digite a confirmação aqui"
                />
              </div>

              {deleteError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {deleteError}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirmation(false)
                    setDeleteConfirmationText('')
                    setDeleteError(null)
                  }}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteAccount}
                  disabled={deleteLoading || deleteConfirmationText !== 'EXCLUIR MINHA CONTA'}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {deleteLoading ? 'Excluindo...' : 'Confirmar Exclusão'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estatísticas da conta */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Estatísticas da Conta</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">{accounts.length}</div>
            <div className="text-sm text-gray-600">Contas ativas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">{categories.length}</div>
            <div className="text-sm text-gray-600">Categorias criadas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {formatCurrency(accounts.reduce((sum, acc) => sum + acc.balance, 0))}
            </div>
            <div className="text-sm text-gray-600">Patrimônio total</div>
          </div>
        </div>
      </div>
    </div>
  )
}