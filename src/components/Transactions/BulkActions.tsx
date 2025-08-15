import React, { useState } from 'react'
import { useSupabase } from '../../hooks/useSupabase'
import { Edit3, Trash2, Tag, CreditCard, AlertCircle, Check } from 'lucide-react'

interface BulkActionsProps {
  selectedTransactions: string[]
  accounts: any[]
  categories: any[]
  onComplete: () => void
}

export function BulkActions({ 
  selectedTransactions, 
  accounts, 
  categories, 
  onComplete 
}: BulkActionsProps) {
  const { updateTransaction, deleteTransaction } = useSupabase()
  const [action, setAction] = useState<'category' | 'account' | 'delete' | null>(null)
  const [selectedValue, setSelectedValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleBulkUpdate = async () => {
    if (!action || (!selectedValue && action !== 'delete')) return

    setLoading(true)
    setError(null)

    try {
      if (action === 'delete') {
        // Confirmar exclusão
        if (!window.confirm(`Tem certeza que deseja excluir ${selectedTransactions.length} transação(ões)?`)) {
          setLoading(false)
          return
        }

        // Deletar todas as transações selecionadas
        await Promise.all(
          selectedTransactions.map(id => deleteTransaction(id))
        )
      } else {
        // Atualizar categoria ou conta
        const updateData = action === 'category' 
          ? { category_id: selectedValue }
          : { account_id: selectedValue }

        await Promise.all(
          selectedTransactions.map(id => updateTransaction(id, updateData))
        )
      }

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setAction(null)
        setSelectedValue('')
        onComplete()
      }, 2000)

    } catch (err: any) {
      setError(err.message || 'Erro ao executar ação em lote')
    } finally {
      setLoading(false)
    }
  }

  const cancel = () => {
    setAction(null)
    setSelectedValue('')
    setError(null)
  }

  if (success) {
    return (
      <div className="flex items-center space-x-2 text-green-600">
        <Check className="w-5 h-5" />
        <span>Ação executada com sucesso!</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">
          Ações em lote ({selectedTransactions.length} selecionadas)
        </h3>
      </div>

      {!action ? (
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAction('category')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Tag className="w-4 h-4" />
            <span>Alterar Categoria</span>
          </button>

          <button
            onClick={() => setAction('account')}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            <span>Alterar Conta</span>
          </button>

          <button
            onClick={() => setAction('delete')}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Excluir</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {action === 'category' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nova categoria para {selectedTransactions.length} transação(ões):
              </label>
              <select
                value={selectedValue}
                onChange={(e) => setSelectedValue(e.target.value)}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione uma categoria</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.type === 'income' ? 'Receita' : category.type === 'expense' ? 'Despesa' : 'Transferência'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {action === 'account' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nova conta para {selectedTransactions.length} transação(ões):
              </label>
              <select
                value={selectedValue}
                onChange={(e) => setSelectedValue(e.target.value)}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione uma conta</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {action === 'delete' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Atenção!</span>
              </div>
              <p className="text-red-700 mt-1">
                Você está prestes a excluir {selectedTransactions.length} transação(ões). 
                Esta ação não pode ser desfeita.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex items-center space-x-3">
            <button
              onClick={handleBulkUpdate}
              disabled={loading || (!selectedValue && action !== 'delete')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Executando...' : 'Confirmar'}
            </button>

            <button
              onClick={cancel}
              disabled={loading}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}